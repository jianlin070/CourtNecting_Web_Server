const express = require("express");

const router = express.Router();

// middlewares
const verifyToken = require("../middleware/auth");
const Court = require("../models/Court");

router.get("/", (req, res) => {
  Court.find({}).then((courts) => {
    res.json({
      status: 200,
      data: courts
    });
  }).catch((err) => {
    res.status(400).json({
      status: 400,
      error: "Cannot list courts."
    });
  });
});

router.get("/:id", (req, res) => {
  let { id } = req.params;

  Court.findOne({ _id: id }).then((court) => {
    res.json({
      status: 200,
      data: court
    });
  }).catch((err) => {
    res.status(404).json({
      status: 404,
      error: "Court not found."
    });
  });
});

router.put("/:id", verifyToken, (req, res) => {
  let { id } = req.params;
  let { name, number, price } = req.body;

  let filter = { _id: id };
  let update = {};

  if (name) {
    update.name = name;
  }
  if (number) {
    update.number = number;
  }
  if (price) {
    update.price = price;
  }

  Court.updateOne(filter, update).then((court) => {
    Court.findOne(filter).then((court) => {
      res.json({
        status: 200,
        data: court
      });
    }).catch((err) => {
      res.status(404).json({
        status: 404,
        error: "Court not found."
      });
    });
  }).catch((err) => {
    res.status(404).json({
      status: 404,
      error: "Court not found."
    });
  });
});

module.exports = router;