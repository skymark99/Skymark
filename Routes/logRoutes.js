const express = require("express");
const { getAll, createOne } = require("../Controller/handlerFactory");
const Log = require("../Models/logModel");

const router = express.Router();

router.route("/").get(getAll(Log)).post(createOne(Log));

module.exports = router;
