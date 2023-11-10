const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const AdminSchema = Schema(
  {
    username: String,
    email: String,
    password: String,
  },
  {
    timestamps: {
      currentTime: () => {
        return new Date().toUTCString()
      },
    }
  }
);

const Admin = mongoose.model("Admin", AdminSchema);

module.exports = Admin;
