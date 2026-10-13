// routes/admin.js
const express = require("express");
const User = require("../models/User");
const Property = require("../models/Property");
const Viewing = require("../models/Viewing");
const { lindaRoute, ruhusuAina } = require("../middleware/auth");

const router = express.Router();

// ============================================
// 1. ORODHA YA WATUMIAJI WOTE (Admin pekee)
// GET /api/admin/users
// ============================================
router.get("/users", lindaRoute, ruhusuAina("admin"), async function (req, res) {
  try {
    const watumiaji = await User.find({})
      .select("-password")
      .sort({ createdAt: -1 });

    res.json({
      idadi: watumiaji.length,
      watumiaji: watumiaji
    });
  } catch (error) {
    console.error("Kosa:", error);
    res.status(500).json({ kosa: "Imeshindikana kupata watumiaji", maelezo: error.message });
  }
});

// ============================================
// 2. TAKWIMU ZA JUMLA
// GET /api/admin/stats
// ============================================
router.get("/stats", lindaRoute, ruhusuAina("admin"), async function (req, res) {
  try {
    const jumlaWatumiaji = await User.countDocuments();
    const wapangaji = await User.countDocuments({ aina: "tenant" });
    const wamiliki = await User.countDocuments({ aina: "landlord" });
    const jumlaNyumba = await Property.countDocuments();
    const jumlaMaombi = await Viewing.countDocuments();

    res.json({
      watumiaji: { jumla: jumlaWatumiaji, wapangaji: wapangaji, wamiliki: wamiliki },
      nyumba: jumlaNyumba,
      maombi: jumlaMaombi
    });
  } catch (error) {
    res.status(500).json({ kosa: "Imeshindikana kupata takwimu" });
  }
});

// ============================================
// 3. FUTA MTUMIAJI (Admin pekee)
// DELETE /api/admin/users/:id
// ============================================
router.delete("/users/:id", lindaRoute, ruhusuAina("admin"), async function (req, res) {
  try {
    const mtumiaji = await User.findById(req.params.id);

    if (!mtumiaji) {
      return res.status(404).json({ kosa: "Mtumiaji haipatikani" });
    }

    // Admin hawezi kujifuta mwenyewe
    if (String(mtumiaji._id) === String(req.mtumiaji._id)) {
      return res.status(400).json({ kosa: "Hauwezi kujifuta mwenyewe" });
    }

    // Futa nyumba zake kama ni landlord
    if (mtumiaji.aina === "landlord") {
      await Property.deleteMany({ mmiliki: mtumiaji._id });
      await Viewing.deleteMany({ landlordId: mtumiaji._id });
    }

    // Futa maombi yake kama ni tenant
    if (mtumiaji.aina === "tenant") {
      await Viewing.deleteMany({ mpangaji: mtumiaji._id });
    }

    await User.findByIdAndDelete(req.params.id);

    res.json({
      ujumbe: "Mtumiaji amefutwa",
      mtumiaji: { jina: mtumiaji.jina, email: mtumiaji.email }
    });
  } catch (error) {
    console.error("Kosa:", error);
    res.status(500).json({ kosa: "Imeshindikana kufuta", maelezo: error.message });
  }
});

module.exports = router;