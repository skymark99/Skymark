const Catagory = require("../Models/catagoryModel");
const multipleKeywords = [
  "Mult",
  "mult",
  "Multi",
  "multi",
  "Multy",
  "multy",
  "Multip",
  "multip",
  "Multipl",
  "multipl",
  "Multiple",
  "multiple",
];

class APIFeatures {
  constructor(model, query, queryStr) {
    this.model = model;
    this.query = query;
    this.queryStr = queryStr;
  }

  filter() {
    const queryObj = { ...this.queryStr };
    const excludedFields = [
      "page",
      "sort",
      "limit",
      "field",
      "branch",
      "startDate",
      "endDate",
      "catagory",
      "particular",
      "search",
    ];

    excludedFields.forEach((el) => delete queryObj[el]);

    this.query = this.query.find(queryObj);

    return this;
  }
  search() {
    if (this.queryStr.search === "") return this;
    if (
      this.queryStr.search &&
      typeof this.queryStr.search === "string" &&
      this.queryStr.search.trim() !== ""
    ) {
      if (multipleKeywords.includes(this.queryStr.search)) {
        // Find documents where the branches array length is greater than 1
        this.query = this.query.find({
          $expr: {
            $gt: [{ $size: "$branches" }, 1],
          },
        });
        return this; // Exit early since the search for "Multiple" is handled
      }
      const escapedSearch = this.queryStr.search.replace(
        /[.*+?^${}()|[\]\\]/g,
        "\\$&"
      );
      const searchRegex = new RegExp(this.queryStr.search, "i");
      const searchQuery = {
        $or: [
          { purpose: { $regex: searchRegex } },
          { remark: { $regex: searchRegex } },
          { bank: { $regex: searchRegex } },
          { branch: { $regex: searchRegex } },
          { branchName: { $regex: searchRegex } },
          { type: { $regex: searchRegex } },
          { agent: { $regex: searchRegex } },
          { counsillor: { $regex: searchRegex } },
          { currency: { $regex: searchRegex } },
          { student: { $regex: searchRegex } },
          { intakeMonth: { $regex: searchRegex } },
          { country: { $regex: searchRegex } },
          {
            status: {
              $regex: `^${escapedSearch.substring(0, 4)}`,
              $options: "i",
            },
          },
          { "branches.branchName": { $regex: searchRegex } },
          { "particular.name": { $regex: searchRegex } },
          {
            $expr: {
              $regexMatch: {
                input: { $toString: "$amount" },
                regex: this.queryStr.search,
                options: "i",
              },
            },
          },
          {
            $expr: {
              $regexMatch: {
                input: { $toString: "$receivable" },
                regex: this.queryStr.search,
                options: "i",
              },
            },
          },
          {
            $expr: {
              $regexMatch: {
                input: { $toString: "$courseFee" },
                regex: this.queryStr.search,
                options: "i",
              },
            },
          },
          {
            $expr: {
              $regexMatch: {
                input: { $toString: "$inr" },
                regex: this.queryStr.search,
                options: "i",
              },
            },
          },
          {
            $expr: {
              $regexMatch: {
                input: { $toString: "$commition" },
                regex: this.queryStr.search,
                options: "i",
              },
            },
          },
        ],
      };
      this.query = this.query.find(searchQuery);
    }
    return this;
  }
  sort() {
    if (this.queryStr.sort) {
      const sortingItems = this.queryStr.sort.split("%").join(" ");
      this.query = this.query.sort(sortingItems);
    } else {
      this.query = this.query.sort("-createdAt");
    }
    return this;
  }

  limitFields() {
    if (this.queryStr.field) {
      const fields = this.queryStr.field.split("%").join(" ");
      this.query = this.query.select(fields);
    } else {
      this.query = this.query.select("-__v");
    }
    return this;
  }

  paginate(count) {
    const page = this.queryStr.page * 1 || 1;
    const limit = this.queryStr.limit * 1 || 24;
    const skip = (page - 1) * limit;

    if (this.queryStr.page) {
      if (count <= skip) throw new Error("Page does not exist");
    }
    this.query = this.query.skip(skip).limit(limit);
    return this;
  }

  // New method to filter by branch
  filterByBranch() {
    if (this.queryStr.branch) {
      const branchName = this.queryStr.branch;
      this.query = this.query.find({
        branches: { $elemMatch: { branchName } },
      });
    }
    return this;
  }
  filterByDateRange() {
    if (this.queryStr.startDate || this.queryStr.endDate) {
      let dateFilter = {};

      // Convert strings to Date objects for proper MongoDB comparison
      if (this.queryStr.startDate) {
        dateFilter.$gte = new Date(this.queryStr.startDate);
      }
      if (this.queryStr.endDate) {
        let endDate = new Date(this.queryStr.endDate);
        endDate.setDate(endDate.getDate() + 1); // Add one extra day
        // endDate.setHours(23, 59, 59, 999); // Set time to the end of the next day
        dateFilter.$lte = endDate;
      }

      // Apply the date range filter to the query
      this.query = this.query.find({
        date: dateFilter,
      });
    }
    return this;
  }
}

module.exports = APIFeatures;
