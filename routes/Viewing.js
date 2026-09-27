// routes/viewings.js
const express = require("express");
const Viewing = require("../models/Viewing");
const Property = require("../models/Property");
const { lindaRoute, ruhusuAina } = require("../middleware/auth");

const router = express.Router();

// POST /api/viewings - Omba kuona nyumba (TENANT)
router.post(
  "/",
  lindaRoute,
  async function (req, res) {
    try {
      const { nyumbaId, jina, simu, tarehe, muda } = req.body;

      // Angalia kama nyumba ipo
      const nyumba = await Property.findById(nyumbaId);
      if (!nyumba) {
        return res.status(404).json({ kosa: "Nyumba haipatikani" });
      }

      // Tengeneza ombi
      const ombi = new Viewing({
        nyumba: nyumbaId,
        mpangaji: req.mtumiaji._id,
        jina,
        simu,
        tarehe,
        muda,
        hali: "Pending"
      });

      await ombi.save();

      res.status(201).json({
        ujumbe: "Ombi lako limetumwa!",
        ombi
      });
    } catch (error) {
      res.status(500).json({
        kosa: "Imeshindikana kutuma ombi",
        maelezo: error.message
      });
    }
  }
);

// GET /api/viewings/zangu - Maombi yangu (TENANT)
router.get("/zangu", lindaRoute, async function (req, res) {
  try {
    const maombi = await Viewing.find({ mpangaji: req.mtumiaji._id })
      .populate("nyumba", "jina eneo bei picha")
      .sort({ createdAt: -1 });

    res.json({
      idadi: maombi.length,
      maombi
    });
  } catch (error) {
    res.status(500).json({
      kosa: "Imeshindikana kupata maombi",
      maelezo: error.message
    });
  }
});

// GET /api/viewings/nilizopokea - Maombi kwa nyumba zangu (LANDLORD)
router.get(
  "/nilizopokea",
  lindaRoute,
  ruhusuAina("landlord", "admin"),
  async function (req, res) {
    try {
      // Pata nyumba zangu
      const nyumbaZangu = await Property.find({ mmiliki: req.mtumiaji._id });
      const nyumbaIds = nyumbaZangu.map((n) => n._id);

      // Pata maombi yanayohusiana
      const maombi = await Viewing.find({ nyumba: { $in: nyumbaIds } })
        .populate("nyumba", "jina eneo")
        .populate("mpangaji", "jina email simu")
        .sort({ createdAt: -1 });

      res.json({
        idadi: maombi.length,
        maombi
      });
    } catch (error) {
      res.status(500).json({
        kosa: "Imeshindikana kupata maombi",
        maelezo: error.message
      });
    }
  }
);

// PUT /api/viewings/:id - Badilisha hali (LANDLORD/ADMIN)
router.put(
  "/:id",
  lindaRoute,
  ruhusuAina("landlord", "admin"),
  async function (req, res) {
    try {
      const { hali } = req.body;
      const ombi = await Viewing.findById(req.params.id);

      if (!ombi) {
        return res.status(404).json({ kosa: "Ombi halipatikani" });
      }

      ombi.hali = hali;
      await ombi.save();

      res.json({
        ujumbe: "Ombi limebadilishwa",
        ombi
      });
    } catch (error) {
      res.status(500).json({
        kosa: "Imeshindikana kubadilisha",
        maelezo: error.message
      });
    }
  }
);

module.exports = router;