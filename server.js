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
const authRoutes = require("./routes/auth");
app.use("/api/auth", authRoutes);

const propertyRoutes = require("./routes/properties");
app.use("/api/properties", propertyRoutes);

const viewingRoutes = require("./routes/Viewing");
app.use("/api/viewings", viewingRoutes);

const favoriteRoutes = require("./routes/Favorite");
app.use("/api/favorites", favoriteRoutes);

const uploadRoutes = require("./routes/upload");
app.use("/api/upload", uploadRoutes);

// ==========================================
// ROUTE: Karibu (test)
// ==========================================
app.get("/", function(req, res) {
  res.json({
    ujumbe: "Karibu NyumbaKwetu API!",
    hali: "Inafanya kazi",
    muda: new Date()
  });
});

// ==========================================
// ROUTE: Test (models)
// ==========================================
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
// ROUTE: Wakeup (cron job)
// ==========================================
app.get("/api/wakeup", async function(req, res) {
  try {
    if (mongoose.connection.readyState !== 1) {
      await mongoose.connect(process.env.MONGO_URI);
    }

    res.json({
      hali: "MongoDB ipo tayari",
      readyState: mongoose.connection.readyState
    });
  } catch (error) {
    res.status(500).json({
      kosa: "Imeshindwa kuamsha MongoDB",
      maelezo: error.message
    });
  }
});

// ==========================================
// MONGODB CONNECTION
// ==========================================
mongoose
  .connect(process.env.MONGO_URI, {
    serverSelectionTimeoutMS: 30000,
    socketTimeoutMS: 45000,
    connectTimeoutMS: 30000,
    bufferCommands: true,
    maxPoolSize: 10,
    autoIndex: false
  })
  .then(function() {
    console.log("OK - MongoDB imeunganishwa!");
  })
  .catch(function(err) {
    console.error("ERROR MongoDB:", err.message);
  });

mongoose.connection.on("connected", function() {
  console.log("MongoDB connected");
});

mongoose.connection.on("disconnected", function() {
  console.log("MongoDB disconnected - inajaribu kuunganisha tena...");
  setTimeout(function() {
    mongoose.connect(process.env.MONGO_URI).catch(console.error);
  }, 5000);
});

mongoose.connection.on("error", function(err) {
  console.log("MongoDB error:", err.message);
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