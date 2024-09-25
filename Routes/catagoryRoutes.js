const express = require("express");
const router = express.Router();
const {
  addParticular,
  getAllCatagory,
  getCatagory,
  createCatagory,
  updateCatagory,
  deleteCatagory,
  deleteParticular,
  updateParticular,
} = require("../Controller/catagoryController");

router.route("/addParticular").patch(addParticular);
router.route("/deleteParticular").patch(deleteParticular);
router.route("/updateParticular").patch(updateParticular);

router.route("/").get(getAllCatagory).post(createCatagory);
router.route("/:id").get(getCatagory);
router.route("/:id").patch(updateCatagory);
router.route("/:id").delete(deleteCatagory);

module.exports = router;
