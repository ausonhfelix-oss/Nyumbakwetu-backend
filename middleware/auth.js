// middleware/auth.js
const jwt = require("jsonwebtoken");
const User = require("../models/User");

// ==========================================
// MIDDLEWARE: Kulinda Routes (Inahitaji Login)
// ==========================================
async function lindaRoute(req, res, next) {
  try {
    let token;

    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith("Bearer ")
    ) {
      token = req.headers.authorization.split(" ")[1];
    }

    if (!token) {
      return res.status(401).json({
        kosa: "Hakuna token - tafadhali ingia kwanza"
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id).select("-password");

    if (!user) {
      return res.status(401).json({
        kosa: "Mtumiaji haipatikani"
      });
    }

    req.mtumiaji = user;
    next();
  } catch (error) {
    return res.status(401).json({
      kosa: "Token si sahihi au imeisha muda",
      maelezo: error.message
    });
  }
}

// ==========================================
// MIDDLEWARE: Ruhusu Aina Fulani Tu
// ==========================================
function ruhusuAina(...ainaZinazoruhusiwa) {
  return function (req, res, next) {
    if (!req.mtumiaji) {
      return res.status(401).json({
        kosa: "Tafadhali ingia kwanza"
      });
    }

    if (!ainaZinazoruhusiwa.includes(req.mtumiaji.aina)) {
      return res.status(403).json({
        kosa: "Huna ruhusa kufanya hili",
        ainaYako: req.mtumiaji.aina,
        inahitajika: ainaZinazoruhusiwa
      });
    }

    next();
  };
}

module.exports = { lindaRoute, ruhusuAina };