const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();

const rideRoutes = require("./routes/rideRoutes");

const app = express();

app.use(cors());
app.use(express.json());

mongoose.connect(process.env.MONGO_URI)
.then(() => console.log("MongoDB Connected ✅"))
.catch(err => console.log(err));

app.get("/", (req, res) => {
  res.send("Rapido Backend Running 🚀");
});

app.use("/api/rides", rideRoutes);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});