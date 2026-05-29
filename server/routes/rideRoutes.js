const express = require("express");
const router = express.Router();
const Ride = require("../models/Ride");

router.post("/", async (req, res) => {
  try {
    const ride = new Ride(req.body);
    await ride.save();
    res.json(ride);
  } catch (err) {
    res.status(500).json(err);
  }
});

router.get("/", async (req, res) => {
  try {
    const rides = await Ride.find();
    res.json(rides);
  } catch (err) {
    res.status(500).json(err);
  }
});

module.exports = router;