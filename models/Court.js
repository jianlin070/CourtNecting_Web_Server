const mongoose = require("mongoose");
const Schema = mongoose.Schema;

// 0 => active
// 1 => expired

const CourtSchema = Schema(
  {
    name: { type: String, required: true },
    number: { type: Number, required: true, unique: true },
    price: { type: Number, required: true },
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

const Court = mongoose.model("Court", CourtSchema);

module.exports = Court;