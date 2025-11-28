const mongoose = require("mongoose");

const RobotSchema = new mongoose.Schema(
  {
    _id: {
      type: String,          // Robot-ID will be given by client ("RBT001")
      required: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    type: {
      type: String,
      required: true,
      enum: ["AMR", "Drone", "Arm"],  // allowed robot types
    },
    status: {
      type: String,
      enum: ["idle", "active", "charging", "error"],
      default: "idle",
    },
    battery: {
      type: Number,
      min: 0,
      max: 100,
      default: null,
    },
    location: {
      type: Object,          
      default: null,
    },
  },
  {
    timestamps: true,         
  }
);

module.exports = mongoose.model("Robot", RobotSchema);
