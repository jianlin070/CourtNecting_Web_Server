const express = require("express");
const router = express.Router();

// mongodb user model
const User = require("../models/User");

// Password handler
const bcrypt = require("bcrypt");

//Signup
router.post("/signup", (req, res) => {
  let { name, email, password, dateOfBirth } = req.body;
  name = name.trim();
  email = email.trim();
  password = password.trim();
  dateOfBirth = dateOfBirth.trim();

  if (name == "" || email == "" || password == "" || dateOfBirth == "") {
    res.json({
      status: "FAILED",
      message: "Empty input fields!",
    });
  } else if (!/^[a-zA-z ]*$/.test(name)) {
    res.json({
      status: "FAILED",
      message: "Invalid name entered",
    });
  } else if (!/^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/.test(email)) {
    res.json({
      status: "FAILED",
      message: "Invalid email entered",
    });
  } else if (!new Date(dateOfBirth).getTime()) {
    res.json({
      status: "FAILED",
      message: "Invalid date of birth entered",
    });
  } else if (password.length < 8) {
    res.json({
      status: "FAILED",
      message: "Password is too short!",
    });
  } else {
    // Checking if user already exists
    User.find({ email })
      .then((result) => {
        // A user already exists
        if (result.length) {
          // A user already exists
          res.json({
            status: "FAILED",
            message: "User with the provided email already exists",
          });
        } else {
          // Try to create new user

          // Password handling
          const saltRounds = 10;
          bcrypt
            .hash(password, saltRounds)
            .then((hashedPassword) => {
              const newUser = new User({
                name,
                email,
                password: hashedPassword,
                dateOfBirth,
              });

              newUser.save().then((result) => {
                res.json({
                  status: "SUCCESS",
                  messsage: "Signup successful",
                  data: result,
                });
              });
            })
            .catch((err) => {
              console.log(err);
              res.json({
                status: "FAILED",
                message:
                  "An error occurred while saving user account password!",
              });
            });
        }
      })
      .catch((err) => {
        console.log(err);
        res.json({
          status: "FAILED",
          message: "An error occurred while chicking for existing user!",
        });
      });
  }
});

//Signin
router.post("/signin", (req, res) => {
  let { email, password } = req.body;
  email = email.trim();
  password = password.trim();

  if (email == "" || password == "") {
    res.json({
      status: "FAILED",
      message: "Empty credentials supplied",
    });
  } else {
    // Check if user exist
    User.find({ email })
      .then((data) => {
        if (data.length) {
          // User exists

          const hashedPassword = data[0].password;
          bcrypt
            .compare(password, hashedPassword)
            .then((result) => {
              if (result) {
                // Password match
                res.json({
                  status: "SUCCESS",
                  message: "Signin successful",
                  data: data,
                });
              } else {
                res.json({
                  status: "FAILED",
                  message: "Invalid password entered!",
                });
              }
            })
            .catch((err) => {
              res.json({
                status: "FAILED",
                message: "An error occurered while comparing passwords",
              });
            });
        } else {
          res.json({
            status: "FAILED",
            message: "Invalied credentials entered!",
          });
        }
      })
      .catch((err) => {
        console.log(err);
        res.json({
          status: "FAILED",
          message: "An error occurered while checking for existing user",
        });
      });
  }
});

// get user
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
    User.findOne({ email }).then((result) => {
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

// update user
router.put("/:email", (req, res) => {
  try {
    let { email } = req.params;
    let { new_email, password, currentPassword, name, credits } = req.body;
    if (!email || email == "") {
      res.json({
        status: 400,
        error: `Invalid email ${email}`,
      });
    }
    // update user and return
    filter = { email };
    update = {};
    if (
      password &&
      password.length > 1 &&
      currentPassword &&
      currentPassword.length > 1
    ) {
      console.log("new password", password);
      User.findOne(filter).then((user) => {
        let currentPasswordMatched =
          user && bcrypt.compareSync(currentPassword, user.password);
        if (!currentPasswordMatched) {
          res.json({
            status: 400,
            error: "Invalid Current Password",
          });
        } else {
          bcrypt.hash(password, 10).then((hash) => {
            User.findOneAndUpdate(filter, { password: hash }).then((user) => {
              User.findOne(filter).then((user) => {
                res.json({
                  status: 200,
                  data: user,
                });
              });
            });
          });
        }
      });
    } else {
      if (new_email && new_email.length > 1) {
        update.email = new_email;
      }
      if (name && name.length > 1) {
        update.name = name;
      }
      if (credits && credits > 0) {
        update.credits = parseInt(credits);
      }
      console.log({ update });
      User.findOneAndUpdate(filter, update).then((user) => {
        User.findOne(filter).then((user) => {
          res.json({
            status: 200,
            data: user,
          });
        });
      });
    }
  } catch (error) {
    res.json({
      status: 400,
      error: `Invalid payload, exception: ${error}`,
    });
  }
});

// add credit
router.post("/add-credit", (req, res) => {
  try {
    let { email, credits } = req.body;
    if (!email || email == "") {
      res.json({
        status: 400,
        error: `Invalid email ${email}`,
      });
    }
    if (!credits || credits <= 0) {
      res.json({
        status: 400,
        error: `Invalid credit ${credits}`,
      });
    }
    User.findOneAndUpdate(
      { email },
      {
        $inc: { credits: credits },
        $push: {
          creditHistory: `Added ${credits} at ${new Date().toUTCString()}`,
        },
      }
    ).then((user) => {
      User.findOne({ email }).then((user) => {
        res.json({
          status: 200,
          data: user,
        });
      });
    });
  } catch (error) {
    res.json({
      status: 400,
      error: `Invalid payload, exception: ${error}`,
    });
  }
});

// remove credit
router.post("/remove-credit", (req, res) => {
  try {
    let { email, court_no, credits } = req.body;
    if (!court_no){
      court_no = -1;
    }
    if (!email || email == "") {
      res.json({
        status: 400,
        error: `Invalid email ${email}`,
      });
    }
    if (!credits || credits <= 0) {
      res.json({
        status: 400,
        error: `Invalid credit ${credits}`,
      });
    }
    User.findOneAndUpdate(
      { email },
      {
        $inc: { credits: -1 * credits },
        $push: {
          creditHistory: `Removed ${credits} at ${new Date().toUTCString()}%${court_no}`,
        },
      }
    ).then((user) => {
      User.findOne({ email }).then((user) => {
        res.json({
          status: 200,
          data: user,
        });
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
