const express = require("express");
const router = express.Router();

// Reservation model
const Reservation = require("../models/Reservation");

// Add Reservation
router.post("/", (req, res) => {
  try {
    let { datetime, email, court_no } = req.body;
    datetime = new Date(datetime).toUTCString();
    if (email == "") {
      res.json({
        status: 400,
        error: "Empty email supplied",
      });
    }
    if (!(court_no >= 1 && court_no <= 6)) {
      res.json({
        status: 400,
        error: `Invalid court number ${court_no}`,
      });
    }
    // save the reservation
    const newReservation = new Reservation({
      datetime: datetime,
      user_email: email,
      court_no: court_no,
    });
    newReservation.save().then((result) => {
      res.json({
        status: 200,
        message: "Reservation is added",
        data: result,
      });
    });
  } catch (error) {
    res.json({
      status: 400,
      error: `Invalid payload, exception: ${error}`,
    });
  }
});

// List Reservation
router.get("/:email", (req, res) => {
  try {
    let { email } = req.params;
    if (!email || email == "") {
      res.json({
        status: 400,
        error: `Invalid email ${email}`,
      });
    }
    // find and return the reservations
    Reservation.find({ user_email: email }).then((result) => {
      res.json({
        status: 200,
        data: result,
      });
    });
  } catch (error) {
    res.json({
      status: 400,
      error: `Invalid payload, exception: ${error}`,
    });
  }
});

// Check unavailable court numbers
router.post("/unavailble-court-no", (req, res) => {
  try {
    let unavailableCourts = [];
    let { datetime } = req.body;
    datetime = new Date(datetime).toUTCString();
    Reservation.find({ datetime }).then((reservations) => {
      reservations.forEach((res) => {
        unavailableCourts.push(res.court_no);
      });
      res.json({
        status: 200,
        unavailableCourts,
      });
    });
  } catch (error) {
    res.json({
      status: 400,
      error: `Invalid payload, exception: ${error}`,
    });
  }
});

// check available court numbers
router.get("/active", (req, res) => {
  try {
    let unavailableCourts = [];
    datetime = new Date().toUTCString();
    Reservation.find({ datetime }).then((reservations) => {
      reservations.forEach((res) => {
        unavailableCourts.push(res.court_no);
      });
      res.json({
        status: 200,
        data: unavailableCourts,
      });
    });
  } catch (error) {
    res.json({
      status: 400,
      error: `Invalid payload, exception: ${error}`,
    });
  }
});


module.exports = router;
