// models/Favorite.js
const mongoose = require("mongoose");

const favoriteSchema = new mongoose.Schema(
  {
    mtumiaji: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    nyumba: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Property",
      required: true
    }
  },
  {
    timestamps: true
  }
);

// Zuia mtumiaji kuweka favorite mara mbili kwa nyumba moja
favoriteSchema.index({ mtumiaji: 1, nyumba: 1 }, { unique: true });

module.exports = mongoose.model("Favorite", favoriteSchema);