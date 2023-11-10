require('dotenv').config();
const jwt = require("jsonwebtoken");

const jwt_secret = process.env.JWT_SECRET;

verifyToken = (req, res, next) => {
  let token = req.headers["authorization"];

  if (!token) {
    return res.status(403).send({
      message: "No token provided!"
    });
  }

  token = token.split(" ")[1];
  jwt.verify(token,
    jwt_secret,
    (err, decoded) => {
      if (err) {
        return res.status(401).send({
          message: "Unauthorized!",
        });
      }
      req.userId = decoded.adminId;
      next();
    });
};

module.exports = verifyToken;

