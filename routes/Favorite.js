// routes/favorites.js
const express = require("express");
const Favorite = require("../models/Favorite");
const Property = require("../models/Property");
const { lindaRoute } = require("../middleware/auth");

const router = express.Router();

// POST /api/favorites/:nyumbaId - Weka favorite
router.post("/:nyumbaId", lindaRoute, async function (req, res) {
  try {
    const { nyumbaId } = req.params;

    // Angalia kama nyumba ipo
    const nyumba = await Property.findById(nyumbaId);
    if (!nyumba) {
      return res.status(404).json({ kosa: "Nyumba haipatikani" });
    }

    // Angalia kama favorite ipo tayari
    const existing = await Favorite.findOne({
      mtumiaji: req.mtumiaji._id,
      nyumba: nyumbaId
    });

    if (existing) {
      // Ondoa
      await existing.deleteOne();
      return res.json({
        ujumbe: "Imeondolewa kwenye favorites",
        hali: "imeondolewa"
      });
    }

    // Ongeza
    const favorite = new Favorite({
      mtumiaji: req.mtumiaji._id,
      nyumba: nyumbaId
    });

    await favorite.save();

    res.status(201).json({
      ujumbe: "Imeongezwa kwenye favorites",
      hali: "imeongezwa",
      favorite
    });
  } catch (error) {
    res.status(500).json({
      kosa: "Imeshindikana",
      maelezo: error.message
    });
  }
});

// GET /api/favorites/zangu - Favorites zangu
router.get("/zangu", lindaRoute, async function (req, res) {
  try {
    const favorites = await Favorite.find({ mtumiaji: req.mtumiaji._id })
      .populate("nyumba")
      .sort({ createdAt: -1 });

    res.json({
      idadi: favorites.length,
      favorites
    });
  } catch (error) {
    res.status(500).json({
      kosa: "Imeshindikana kupata favorites",
      maelezo: error.message
    });
  }
});

module.exports = router;