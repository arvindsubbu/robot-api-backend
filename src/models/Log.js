const mongoose = require("mongoose");

const LogSchema = new mongoose.Schema(
  {
    robotId: {
      type: String,
      ref: "Robot",
      required: true,
      index: true, 
    },
    message: {
      type: String,
      required: true,
      trim: true,
    },
    level: {
      type: String,
      enum: ["info", "warn", "error"],
      default: "info",
    },
    meta: {
      type: Object, // optional extra data (eg:vision result)
      default: null,
    },
    source : {
      type : String,
      enum : ["robot", "manual", "system", "operator"],
      default : "robot",
    }
  },
  {
    timestamps: { createdAt: true, updatedAt: false } // we only need createdAt for logs
  }
);

module.exports = mongoose.model("Log", LogSchema);
