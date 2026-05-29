const mongoose = require("mongoose");

const rideSchema = new mongoose.Schema({
  date: String,
  loginHours: Number,
  totalOrders: Number,
  earningWithoutIncentive: Number,
  incentive: Number,
  expenses: Number,
  totalKm: Number,
  netProfit: Number,
});

module.exports = mongoose.model("Ride", rideSchema);