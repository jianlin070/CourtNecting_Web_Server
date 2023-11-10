require("dotenv").config();
const express = require("express");
const jwt = require("jsonwebtoken");

const router = express.Router();

// mongodb models
const Admin = require("../models/Admin");
const User = require("../models/User");
const Reservation = require("../models/Reservation");

// Password handler
const bcrypt = require("bcrypt");

// middlewares
const verifyToken = require("../middleware/auth");
const paginator = require("../middleware/pagination");

const jwt_secret = process.env.JWT_SECRET;


// Login
router.post("/login", (req, res) => {
  const { username, password } = req.body;
  try {
    if (!username || !password) {
      throw "Invalid data";
    }
    Admin.findOne({ username })
      .then((admin) => {
        const passwordMatched = bcrypt.compareSync(password, admin.password);
        if (passwordMatched) {
          const token = jwt.sign(
            {
              adminId: admin.id,
              email: admin.email,
              username: admin.username,
            },
            jwt_secret,
            { expiresIn: "1d" }
          );
          res.status(201).json({
            status: 200,
            token: token,
          });
        } else {
          res.status(400).json({
            status: 400,
            error: "Invalid username or password.",
          });
        }
      })
      .catch((err) => {
        res.status(400).json({
          status: 400,
          error: "Invalid username or password.",
        });
      });
  } catch (error) {
    res.status(400).json({
      status: 400,
      error: "Invalid username or password.",
    });
  }
});

// Register
router.post("/register", (req, res) => {
  const { username, email, password } = req.body;
  try {
    if (!username || !email || !password) {
      throw "Invalid data";
    }
    const passwordHash = bcrypt.hashSync(password, 10);
    const newAdmin = new Admin({
      username,
      email,
      password: passwordHash,
    });

    newAdmin.save().then((admin) => {
      const token = jwt.sign(
        {
          adminId: newAdmin.id,
          email: newAdmin.email,
          username: newAdmin.username,
        },
        jwt_secret,
        { expiresIn: "1d" }
      );
      res.status(201).json({
        status: 200,
        token: token,
      });
    });
  } catch (error) {
    res.status(400).json({
      status: 400,
      error: "Cannot add admin.",
    });
  }
});

// List Users
router.get("/list-users", verifyToken, paginator, (req, res) => {
  const { context } = req;
  let filter = {};

  if (context.q) {
    filter = {
      $or: [
        { name: { $regex: context.q, $options: "i" } },
        { email: { $regex: context.q, $options: "i" } },
      ],
    };
  }
  User.find(filter).then((users) => {
    users = users.slice(context.skip, context.skip + context.limit);
    res.json({
      status: 200,
      page: context.page,
      limit: context.limit,
      skip: context.skip,
      q: context.q,
      data: users,
    });
  });
});


// List reservations
router.get("/list-reservations", verifyToken, (req, res) => {
  const { court_no, q } = req.query;
  let filter = {};

  if (q) {
    filter.user_email = q;
  }

  if (court_no) {
    filter.court_no = court_no;
  }

  Reservation.find(filter).then((reservation) => {
    // reservation = reservation.slice(context.skip, context.skip + context.limit);
    res.json({
      status: 200,
      // page: context.page,
      // limit: context.limit,
      // skip: context.skip,
      // q: context.q,
      data: reservation,
    });
  });
});


// Delete reservation
router.delete("/reservation/:id", verifyToken, (req, res) => {
  let { id } = req.params;
  Reservation.deleteOne({ _id: id })
    .then(() => {
      res.status(200).json({
        status: 200,
        message: "Reservation is deleted.",
      });
    })
    .catch((err) => {
      res.status(404).json({
        status: 404,
        error: "Reservation not found",
      });
    });
});

module.exports = router;
