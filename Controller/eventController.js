const Events = require("../Models/eventModel");
const {
  getAll,
  getOne,
  createOne,
  updateOne,
  deleteOne,
} = require("./handlerFactory");

const getAllEvents = getAll(Events);
const getEvent = getOne(Events);
const createEvent = createOne(Events);
const updateEvent = updateOne(Events);
const deleteEvent = deleteOne(Events);

module.exports = {
  getAllEvents,
  getEvent,
  createEvent,
  updateEvent,
  deleteEvent,
};
