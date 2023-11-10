const mongoose = require("mongoose");
const Schema = mongoose.Schema;

// 0 => active
// 1 => expired

const ReservationSchema = Schema(
  {
    datetime: { type: String, required: true },
    user_email: { type: String, required: true },
    court_no: { type: Number, required: true },
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

const Reservation = mongoose.model("Reservation", ReservationSchema);

module.exports = Reservation;