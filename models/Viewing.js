// models/Viewing.js
const mongoose = require("mongoose");

const viewingSchema = new mongoose.Schema(
  {
    nyumba: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Property",
      required: true
    },
    mpangaji: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    jina: {
      type: String,
      required: true,
      trim: true
    },
    simu: {
      type: String,
      required: true,
      trim: true
    },
    tarehe: {
      type: String,
      required: true
    },
    muda: {
      type: String,
      required: true
    },
    hali: {
      type: String,
      enum: ["Pending", "Confirmed", "Cancelled", "Completed"],
      default: "Pending"
    },
    maelezo: {
      type: String,
      default: ""
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model("Viewing", viewingSchema);