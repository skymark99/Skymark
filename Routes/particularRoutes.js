const express = require("express");
const router = express.Router();
const {
  getAllParticulars,
  createParticulars,
  deleteParticulars,
  updateParticulars,
  getParticulars,
} = require("../Controller/particularController");

router.route("/").get(getAllParticulars).post(createParticulars);
router
  .route("/:id")
  .get(getParticulars)
  .patch(updateParticulars)
  .delete(deleteParticulars);

module.exports = router;
