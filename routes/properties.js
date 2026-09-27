// routes/properties.js
const express = require("express");
const Property = require("../models/Property");
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
      return res.status(404).json({
        kosa: "Nyumba haipatikani"
      });
    }

    property.views = (property.views || 0) + 1;
    await property.save();

    res.json({
      ujumbe: "Nyumba imepatikana",
      nyumba: property
    });
  } catch (error) {
    res.status(500).json({
      kosa: "Imeshindikana kupata nyumba",
      maelezo: error.message
    });
  }
});

// ==========================================
// POST /api/properties - Weka nyumba mpya (LANDLORD pekee)
// ==========================================
router.post(
  "/",
  lindaRoute,
  ruhusuAina("landlord", "admin"),
  async function (req, res) {
    try {
      console.log("========== POST /api/properties ==========");
      console.log("Body:", JSON.stringify(req.body, null, 2));
      console.log("Mtumiaji:", req.mtumiaji ? req.mtumiaji._id : "HAIPO");
      console.log("Aina ya mtumiaji:", req.mtumiaji ? req.mtumiaji.aina : "HAIPO");

      const nyumbaMpya = new Property({
        ...req.body,
        mmiliki: req.mtumiaji._id,
        hali: "Pending"
      });

      await nyumbaMpya.save();

      console.log("Nyumba imehifadhiwa:", nyumbaMpya._id);

      res.status(201).json({
        ujumbe: "Nyumba imetumwa kwa admin - inasubiri uthibitisho",
        nyumba: nyumbaMpya
      });
    } catch (error) {
      console.error("========== TATIZO LA WEKA NYUMBA ==========");
      console.error("Error Name:", error.name);
      console.error("Message:", error.message);
      console.error("Full Error:", JSON.stringify(error, null, 2));
      console.error("============================");

      res.status(500).json({
        kosa: "Imeshindikana kuweka nyumba",
        maelezo: error.message,
        aina: error.name
      });
    }
  }
);

// ==========================================
// GET /api/properties/zangu/mimi - Nyumba zangu (LANDLORD)
// ==========================================
router.get(
  "/zangu/mimi",
  lindaRoute,
  ruhusuAina("landlord", "admin"),
  async function (req, res) {
    try {
      const properties = await Property.find({ mmiliki: req.mtumiaji._id })
        .sort({ createdAt: -1 });

      res.json({
        idadi: properties.length,
        nyumba: properties
      });
    } catch (error) {
      res.status(500).json({
        kosa: "Imeshindikana kupata nyumba zako",
        maelezo: error.message
      });
    }
  }
);

// ==========================================
// PUT /api/properties/:id - Badilisha nyumba (MMILIKI pekee)
// ==========================================
router.put(
  "/:id",
  lindaRoute,
  ruhusuAina("landlord", "admin"),
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
        return res.status(403).json({
          kosa: "Huna ruhusa kubadilisha nyumba hii"
        });
      }

      Object.assign(property, req.body);
      await property.save();

      res.json({
        ujumbe: "Nyumba imebadilishwa",
        nyumba: property
      });
    } catch (error) {
      res.status(500).json({
        kosa: "Imeshindikana kubadilisha nyumba",
        maelezo: error.message
      });
    }
  }
);

// ==========================================
// DELETE /api/properties/:id - Futa nyumba (MMILIKI pekee)
// ==========================================
router.delete(
  "/:id",
  lindaRoute,
  ruhusuAina("landlord", "admin"),
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
        return res.status(403).json({
          kosa: "Huna ruhusa kufuta nyumba hii"
        });
      }

      await property.deleteOne();

      res.json({
        ujumbe: "Nyumba imefutwa"
      });
    } catch (error) {
      res.status(500).json({
        kosa: "Imeshindikana kufuta nyumba",
        maelezo: error.message
      });
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

      res.json({
        idadi: properties.length,
        nyumba: properties
      });
    } catch (error) {
      console.error("ERROR Admin GET:", error.message);
      res.status(500).json({
        kosa: "Imeshindikana kupata nyumba",
        maelezo: error.message
      });
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

      console.log("Nyumba imethibitishwa:", property._id, property.jina);

      res.json({
        ujumbe: "Nyumba imethibitishwa! Sasa inaonekana kwa watumiaji.",
        nyumba: property
      });
    } catch (error) {
      console.error("ERROR Admin PUT:", error.message);
      res.status(500).json({
        kosa: "Imeshindikana kuthibitisha",
        maelezo: error.message
      });
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

      res.json({
        ujumbe: "Nyumba imefutwa"
      });
    } catch (error) {
      console.error("ERROR Admin DELETE:", error.message);
      res.status(500).json({
        kosa: "Imeshindikana kufuta",
        maelezo: error.message
      });
    }
  }
);
module.exports = router;