const University = require("../Models/universityModel");
const {
  getAll,
  getOne,
  createOne,
  updateOne,
  deleteOne,
} = require("./handlerFactory");

const getAllUniv = getAll(University);
const getUniversity = getOne(University);
const updateUniversity = updateOne(University);
const createUniversity = createOne(University);
const deleteUniversity = deleteOne(University);

module.exports = {
  getAllUniv,
  getUniversity,
  updateUniversity,
  createUniversity,
  deleteUniversity,
};
