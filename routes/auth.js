// routes/auth.js
const express = require("express");
const jwt = require("jsonwebtoken");
const User = require("../models/User");

const router = express.Router();

// ==========================================
// KAZI YA KUTENGENEZA JWT TOKEN
// ==========================================
function tengenezaToken(userId) {
  return jwt.sign(
    { id: userId },
    process.env.JWT_SECRET,
    { expiresIn: "30d" }
  );
}

// ==========================================
// POST /api/auth/register - Usajili
// ==========================================
router.post("/register", async function(req, res) {
  try {
    const { jina, email, password, simu, aina } = req.body;

    // Angalia kama mtumiaji yupo
    const existing = await User.findOne({ email: email.toLowerCase() });
    if (existing) {
      return res.status(400).json({
        kosa: "Email hii imetumika tayari"
      });
    }

    // Tengeneza mtumiaji mpya
    const user = new User({
      jina,
      email,
      password,
      simu,
      aina: aina || "tenant"
    });

    await user.save();

    // Tengeneza token
    const token = tengenezaToken(user._id);

    res.status(201).json({
      ujumbe: "Usajili umefanikiwa!",
      token,
      mtumiaji: {
        id: user._id,
        jina: user.jina,
        email: user.email,
        aina: user.aina
      }
    });
  } catch (error) {
    res.status(500).json({
      kosa: "Usajili umeshindikana",
      maelezo: error.message
    });
  }
});

// ==========================================
// POST /api/auth/login - Kuingia
// ==========================================
router.post("/login", async function(req, res) {
  try {
    const { email, password } = req.body;

    // Tafuta mtumiaji
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(401).json({
        kosa: "Email au password si sahihi"
      });
    }

    // Linganisha password
    const niSahihi = await user.linganishaPassword(password);
    if (!niSahihi) {
      return res.status(401).json({
        kosa: "Email au password si sahihi"
      });
    }

    // Tengeneza token
    const token = tengenezaToken(user._id);

    res.json({
      ujumbe: "Kuingia kumefanikiwa!",
      token,
      mtumiaji: {
        id: user._id,
        jina: user.jina,
        email: user.email,
        aina: user.aina
      }
    });
  } catch (error) {
    res.status(500).json({
      kosa: "Kuingia kumeshindikana",
      maelezo: error.message
    });
  }
});
// ==========================================
// GET /api/auth/mimi - Taarifa za mtumiaji aliyeingia
// ==========================================
const { lindaRoute } = require("../middleware/auth");

router.get("/mimi", lindaRoute, async function (req, res) {
  res.json({
    ujumbe: "Hii ni taarifa yako",
    mtumiaji: req.mtumiaji
  });
});
module.exports = router;