// models/Property.js
const mongoose = require("mongoose");

const propertySchema = new mongoose.Schema(
  {
    jina: {
      type: String,
      required: [true, "Jina la nyumba linahitajika"],
      trim: true
    },
    maelezo: {
      type: String,
      trim: true,
      default: ""
    },
    aina: {
      type: String,
      enum: ["Nyumba", "Apartment", "Studio", "Hostel", "Single Room", "Biashara"],
      required: true
    },
    lengo: {
      type: String,
      enum: ["kupanga", "kuuza"],
      default: "kupanga"
    },
    bei: {
      type: Number,
      required: [true, "Bei inahitajika"],
      min: 0
    },
    adaService: {
      type: Number,
      default: 0
    },
    amana: {
      type: Number,
      default: 0
    },
    mkoa: {
      type: String,
      required: true,
      trim: true
    },
    wilaya: {
      type: String,
      trim: true
    },
    eneo: {
      type: String,
      required: true,
      trim: true
    },
    nambaNyumba: {
      type: String,
      default: ""
    },
    vyumba: {
      type: Number,
      default: 1
    },
    sebule: {
      type: Number,
      default: 1
    },
    bafu: {
      type: Number,
      default: 1
    },
    jikoni: {
      type: Number,
      default: 1
    },
    balcony: {
      type: Number,
      default: 0
    },
    parking: {
      type: String,
      enum: ["Ndio", "Hapana"],
      default: "Hapana"
    },
    security: {
      type: String,
      enum: ["Ndio", "Hapana"],
      default: "Hapana"
    },
    picha: {
      type: [String],
      default: []
    },
    mmiliki: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    hali: {
      type: String,
      enum: ["Pending", "Live", "Draft", "Imezuiwa"],
      default: "Pending"
    },
    eneoRamani: {
      type: String,
      default: ""
    },
    imeidhinishwa: {
      type: Boolean,
      default: false
    },
    views: {
      type: Number,
      default: 0
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model("Property", propertySchema);