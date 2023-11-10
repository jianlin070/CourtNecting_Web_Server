// MongoDB
require("./config/db");

// Express
const app = require("express")();
const port = 3000;

const UserRouter = require("./api/User");
const ReservationRouter = require("./api/Reservation");
const AdminRouter = require("./api/Admin");
const CourtRouter = require("./api/Court");

// For accepting post from dat
const bodyParser = require("express").json;
app.use(bodyParser());

var cors = require("cors");

app.use(cors());
app.use("/user", UserRouter);
app.use("/reservation", ReservationRouter);
app.use("/admin", AdminRouter);
app.use("/court", CourtRouter);

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});

