// server.js
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();

const app = express();

// Middleware
app.use(cors({
  origin: "*",
  methods: ["GET", "POST", "PUT", "DELETE"],
  allowedHeaders: ["Content-Type", "Authorization"]
}));
app.use(express.json());

// ==========================================
// ROUTES
// ==========================================
// Auth routs
const authRoutes = require("./routes/auth");
app.use("/api/auth", authRoutes);

//Property roots
const propertyRoutes = require("./routes/properties");
app.use("/api/properties", propertyRoutes);

// Viewing routes 
const viewingRoutes = require("./routes/Viewing");
app.use("/api/viewings", viewingRoutes);

// Favorite routes  
const favoriteRoutes = require("./routes/Favorite");
app.use("/api/favorites", favoriteRoutes);

// Route ya kwanza (test)
app.get("/", function(req, res) {
  res.json({
    ujumbe: "Karibu NyumbaKwetu API!",
    hali: "Inafanya kazi",
    muda: new Date()
  });
});

// Route ya kupima models (test)
app.get("/api/test", async function(req, res) {
  try {
    const User = require("./models/User");
    const Property = require("./models/Property");
    const Viewing = require("./models/Viewing");
    const Favorite = require("./models/Favorite");

    const userCount = await User.countDocuments();
    const propertyCount = await Property.countDocuments();
    const viewingCount = await Viewing.countDocuments();
    const favoriteCount = await Favorite.countDocuments();

    res.json({
      hali: "Models zinafanya kazi!",
      idadi: {
        users: userCount,
        properties: propertyCount,
        viewings: viewingCount,
        favorites: favoriteCount
      }
    });
  } catch (error) {
    res.status(500).json({
      kosa: "Kuna tatizo",
      maelezo: error.message
    });
  }
});

// ==========================================
// MONGODB
// ==========================================

mongoose
  .connect(process.env.MONGO_URI)
  .then(function() {
    console.log("OK - MongoDB imeunganishwa!");
  })
  .catch(function(err) {
    console.error("ERROR MongoDB:", err.message);
  });

// ==========================================
// SERVER
// ==========================================

const PORT = process.env.PORT || 5000;

// Kwa maendeleo ya kawaida
if (process.env.NODE_ENV !== "production") {
  app.listen(PORT, function() {
    console.log("Server inaendesha kwenye port " + PORT);
  });
}

// Kwa Vercel (serverless)
module.exports = app;