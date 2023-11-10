const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const UserSchema = Schema(
  {
    name: String,
    email: String,
    password: String,
    dateOfBirth: Date,
    credits: { type: Number, required: true, default: 0 },
    creditHistory: { type: Array, required: false, default: [] }
  },
  {
    timestamps: {
      currentTime: () => {
        // return new Date().toLocaleString("en-US", { timeZone: "Asia/Kuala_Lumpur" });
        return new Date().toUTCString()
      },
    }
  }
);

const User = mongoose.model("User", UserSchema);

module.exports = User;
