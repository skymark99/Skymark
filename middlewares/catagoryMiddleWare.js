const Catagory = require("../Models/catagoryModel"); // Adjust the path as necessary

export default async function categoryFilterMiddleware(req, res, next) {
  const { catagory } = req.query;

  if (!catagory) return next();

  const catagoryDoc = await Catagory.find({ name: catagory });

  if (!catagoryDoc) req.query.catagory = null;

  req.catagory = catagoryDoc;

  next();
}

module.exports = categoryFilterMiddleware;
