// routes/properties.js
const express = require("express");
const Property = require("../models/Property");
// ⭐ NIMEREKEBISHA HAPA: Aina -> ruhusuAina
const { lindaRoute, ruhusuAina } = require("../middleware/auth");

const router = express.Router();

// ==========================================
// GET /api/properties - Nyumba zote (PUBLIC)
// ==========================================
router.get("/", async function (req, res) {
  try {
    const { eneo, aina, beiMax, vyumba, lengo } = req.query;
    const filter = { hali: "Live" };

    if (eneo) filter.eneo = { $regex: eneo, $options: "i" };
    if (aina) filter.aina = aina;
    if (lengo) filter.lengo = lengo;
    if (beiMax) filter.bei = { $lte: parseInt(beiMax) };
    if (vyumba) filter.vyumba = { $gte: parseInt(vyumba) };

    const properties = await Property.find(filter)
      .populate("mmiliki", "jina email simu")
      .sort({ createdAt: -1 });

    res.json({
      idadi: properties.length,
      nyumba: properties
    });
  } catch (error) {
    res.status(500).json({
      kosa: "Imeshindikana kupata nyumba",
      maelezo: error.message
    });
  }
});

// ==========================================
// GET /api/properties/:id - Nyumba moja (PUBLIC)
// ==========================================
router.get("/:id", async function (req, res) {
  try {
    const property = await Property.findById(req.params.id)
      .populate("mmiliki", "jina email simu picha");

    if (!property) {
      return res.status(404).json({ kosa: "Nyumba haipatikani" });
    }

    property.views = (property.views || 0) + 1;
    await property.save();

    res.json({ ujumbe: "Nyumba imepatikana", nyumba: property });
  } catch (error) {
    res.status(500).json({ kosa: "Imeshindikana kupata nyumba", maelezo: error.message });
  }
});

// ==========================================
// POST /api/properties - Weka nyumba mpya (LANDLORD/DALALI pekee)
// ==========================================
router.post(
  "/",
  lindaRoute,
  ruhusuAina("landlord", "dalali", "admin"),
  async function (req, res) {
    try {
      console.log("========== POST /api/properties ==========");
      console.log("Aina ya mtumiaji:", req.mtumiaji ? req.mtumiaji.aina : "HAIPO");

      const nyumbaMpya = new Property({
        ...req.body,
        mmiliki: req.mtumiaji._id,
        mmilikiAina: req.mtumiaji.aina,
        hali: "Pending"
      });

      await nyumbaMpya.save();
      res.status(201).json({
        ujumbe: "Nyumba imetumwa kwa admin - inasubiri uthibitisho",
        nyumba: nyumbaMpya
      });
    } catch (error) {
      console.error("========== TATIZO LA WEKA NYUMBA ==========");
      console.error("Message:", error.message);
      res.status(500).json({
        kosa: "Imeshindikana kuweka nyumba",
        maelezo: error.message,
        aina: error.name
      });
    }
  }
);

// ==========================================
// GET /api/properties/zangu/mimi - Nyumba zangu (LANDLORD/DALALI)
// ==========================================
router.get(
  "/zangu/mimi",
  lindaRoute,
  ruhusuAina("landlord", "dalali", "admin"), // ⭐ Nimeongeza dalali
  async function (req, res) {
    try {
      const properties = await Property.find({ mmiliki: req.mtumiaji._id })
        .sort({ createdAt: -1 });

      res.json({ idadi: properties.length, nyumba: properties });
    } catch (error) {
      res.status(500).json({ kosa: "Imeshindikana kupata nyumba zako", maelezo: error.message });
    }
  }
);

// ==========================================
// PUT /api/properties/:id - Badilisha nyumba (MMILIKI pekee)
// ==========================================
router.put(
  "/:id",
  lindaRoute,
  ruhusuAina("landlord", "dalali", "admin"), // ⭐ Nimeongeza dalali
  async function (req, res) {
    try {
      const property = await Property.findById(req.params.id);

      if (!property) {
        return res.status(404).json({ kosa: "Nyumba haipatikani" });
      }

      if (
        property.mmiliki.toString() !== req.mtumiaji._id.toString() &&
        req.mtumiaji.aina !== "admin"
      ) {
        return res.status(403).json({ kosa: "Huna ruhusa kubadilisha nyumba hii" });
      }

      Object.assign(property, req.body);
      await property.save();

      res.json({ ujumbe: "Nyumba imebadilishwa", nyumba: property });
    } catch (error) {
      res.status(500).json({ kosa: "Imeshindikana kubadilisha nyumba", maelezo: error.message });
    }
  }
);

// ==========================================
// DELETE /api/properties/:id - Futa nyumba (MMILIKI pekee)
// ==========================================
router.delete(
  "/:id",
  lindaRoute,
  ruhusuAina("landlord", "dalali", "admin"), // ⭐ Nimeongeza dalali
  async function (req, res) {
    try {
      const property = await Property.findById(req.params.id);

      if (!property) {
        return res.status(404).json({ kosa: "Nyumba haipatikani" });
      }

      if (
        property.mmiliki.toString() !== req.mtumiaji._id.toString() &&
        req.mtumiaji.aina !== "admin"
      ) {
        return res.status(403).json({ kosa: "Huna ruhusa kufuta nyumba hii" });
      }

      await property.deleteOne();
      res.json({ ujumbe: "Nyumba imefutwa" });
    } catch (error) {
      res.status(500).json({ kosa: "Imeshindikana kufuta nyumba", maelezo: error.message });
    }
  }
);

// ==========================================
// GET /api/properties/admin/zote - Nyumba zote (ADMIN pekee)
// ==========================================
router.get(
  "/admin/zote",
  lindaRoute,
  ruhusuAina("admin"),
  async function (req, res) {
    try {
      const { hali } = req.query;
      var filter = {};
      if (hali) filter.hali = hali;

      const properties = await Property.find(filter)
        .populate("mmiliki", "jina email simu")
        .sort({ createdAt: -1 });

      res.json({ idadi: properties.length, nyumba: properties });
    } catch (error) {
      res.status(500).json({ kosa: "Imeshindikana kupata nyumba", maelezo: error.message });
    }
  }
);

// ==========================================
// PUT /api/properties/admin/thibitisha/:id - Thibitisha nyumba (ADMIN)
// ==========================================
router.put(
  "/admin/thibitisha/:id",
  lindaRoute,
  ruhusuAina("admin"),
  async function (req, res) {
    try {
      const property = await Property.findById(req.params.id);

      if (!property) {
        return res.status(404).json({ kosa: "Nyumba haipatikani" });
      }

      property.hali = "Live";
      property.imeidhinishwa = true;
      await property.save();

      res.json({ ujumbe: "Nyumba imethibitishwa!", nyumba: property });
    } catch (error) {
      res.status(500).json({ kosa: "Imeshindikana kuthibitisha", maelezo: error.message });
    }
  }
);

// ==========================================
// DELETE /api/properties/admin/futa/:id - Futa (ADMIN)
// ==========================================
router.delete(
  "/admin/futa/:id",
  lindaRoute,
  ruhusuAina("admin"),
  async function (req, res) {
    try {
      const property = await Property.findById(req.params.id);

      if (!property) {
        return res.status(404).json({ kosa: "Nyumba haipatikani" });
      }

      await property.deleteOne();
      res.json({ ujumbe: "Nyumba imefutwa" });
    } catch (error) {
      res.status(500).json({ kosa: "Imeshindikana kufuta", maelezo: error.message });
    }
  }
);

// ==========================================
// PUT /api/properties/:id/hali-nyumba
// ==========================================
router.put("/:id/hali-nyumba", lindaRoute, ruhusuAina("landlord", "dalali", "admin"), async function (req, res) {
  try {
    const { haliNyumba } = req.body;
    const nyumba = await Property.findById(req.params.id);

    if (!nyumba) {
      return res.status(404).json({ kosa: "Nyumba haipatikani" });
    }

    if (
      req.mtumiaji.aina !== "admin" &&
      String(nyumba.mmiliki) !== String(req.mtumiaji._id)
    ) {
      return res.status(403).json({ kosa: "Huna ruhusa" });
    }

    nyumba.haliNyumba = haliNyumba;
    await nyumba.save();

    res.json({ ujumbe: "Hali imebadilishwa", nyumba });
  } catch (error) {
    res.status(500).json({ kosa: "Imeshindikana kubadilisha", maelezo: error.message });
  }
});

module.exports = router;