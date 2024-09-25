const PDFDocument = require("pdfkit");
const moment = require("moment");
const liabilityFields = ["Particulars", "Date", "Branch", "Type", "Amount"];

const liablityReport = (
  filteredLiability,
  res,
  startDate,
  endDate,
  text = "Liability"
) => {
  startDate = moment(startDate).format("YYYY-MM-DD");
  endDate = moment(endDate).format("YYYY-MM-DD");
  const doc = new PDFDocument();
  res.setHeader("Content-Type", "application/pdf");
  res.setHeader(
    "Content-Disposition",
    'attachment; filename="liability-report.pdf"'
  );

  doc.pipe(res);

  // Constants
  const TRANSACTIONS_PER_PAGE = 24;
  const pageWidth = doc.page.width;
  const margin = 50;
  const contentWidth = pageWidth - 2 * margin;
  const columnWidths = [150, 100, 80, 80, 100];
  const tableLeft = (pageWidth - columnWidths.reduce((a, b) => a + b)) / 2;
  const rowHeight = 20;
  const headerColor = "#e6f2ff";

  let overallTotalDebit = 0;

  const addPageWithHeaders = (isFirstPage = false) => {
    if (!isFirstPage) {
      doc.addPage();
    }

    doc.fontSize(20).text(text + " Report", { align: "center" });
    doc.moveDown();

    if (isFirstPage) {
      doc
        .fontSize(12)
        .text(`Date Range: ${startDate} to ${endDate}`, { align: "center" });
      doc.moveDown();
    }

    doc.fontSize(12);
    let headerLeft = tableLeft;
    let headerTop = 150;

    doc
      .save()
      .fill(headerColor)
      .rect(tableLeft, headerTop, contentWidth, rowHeight)
      .fill()
      .restore();

    liabilityFields.forEach((field, index) => {
      doc.text(field, headerLeft, headerTop + 4, {
        width: columnWidths[index],
        align: "left",
      });
      headerLeft += columnWidths[index];
    });

    doc
      .moveTo(tableLeft, headerTop + rowHeight)
      .lineTo(tableLeft + contentWidth, headerTop + rowHeight)
      .stroke();

    return headerTop + rowHeight + 10;
  };

  const addTransactionRow = (liability, yPosition) => {
    doc.fontSize(10);
    let xPosition = tableLeft;
    [
      liability.particular,
      liability.formattedDate,
      liability.branch,
      liability.type,
      liability.amount.toString(),
    ].forEach((value, index) => {
      doc.text(value, xPosition, yPosition, {
        width: columnWidths[index],
        align: "left",
      });
      xPosition += columnWidths[index];
    });
  };

  let currentPageHeight = addPageWithHeaders(true);
  let transactionCount = 0;

  filteredLiability.forEach((liability) => {
    if (transactionCount === TRANSACTIONS_PER_PAGE) {
      currentPageHeight = addPageWithHeaders();
      transactionCount = 0;
    }

    addTransactionRow(liability, currentPageHeight);
    currentPageHeight += rowHeight;
    transactionCount++;

    overallTotalDebit += liability.amount;
  });

  // Add overall totals at the bottom center of the last page
  const totalHeight = 100; // Estimated height for the totals section
  if (doc.page.height - doc.y < totalHeight) {
    doc.addPage();
  }

  doc.moveDown(6);
  // Set font style for totals
  doc.fontSize(14);

  // "Overall Totals" Title
  doc.text("Overall Totals", margin, doc.y, {
    align: "center",
    width: contentWidth, // Use the width between the margins
  });
  doc.moveDown();

  // Reset font size for the totals
  doc.fontSize(18).font("Helvetica-Bold");

  // Total Debit
  doc.text(`Total ${text}: ${overallTotalDebit.toFixed(2)}`, margin, doc.y, {
    align: "center",
    width: contentWidth,
  });
  doc.moveDown(0.5);
  doc.fontSize(12);
  // Date Range
  doc.text(`Date Range: ${startDate} to ${endDate}`, margin, doc.y, {
    align: "center",
    width: contentWidth,
  });

  doc.end();
};

module.exports = { liablityReport };
