const Particulars = require("../Models/particularsModel");
const {
  getAll,
  getOne,
  createOne,
  deleteOne,
  updateOne,
} = require("./handlerFactory");

const getAllParticulars = getAll(Particulars);
const getParticulars = getOne(Particulars);
const createParticulars = createOne(Particulars);
const deleteParticulars = deleteOne(Particulars);
const updateParticulars = updateOne(Particulars);

module.exports = {
  getAllParticulars,
  createParticulars,
  deleteParticulars,
  updateParticulars,
  getParticulars,
};
