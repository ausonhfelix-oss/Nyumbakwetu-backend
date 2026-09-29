// routes/upload.js
const express = require("express");
const multer = require("multer");
const axios = require("axios");
const FormData = require("form-data");
const { lindaRoute } = require("../middleware/auth");

const router = express.Router();

// Multer: hifadhi kwenye memory (sio disk)
const storage = multer.memoryStorage();
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // Max 5MB
  },
  fileFilter: function (req, file, cb) {
    if (file.mimetype.startsWith("image/")) {
      cb(null, true);
    } else {
      cb(new Error("Faili si picha!"), false);
    }
  }
});

// ==========================================
// POST /api/upload - Pakia picha moja
// ==========================================
router.post("/", lindaRoute, upload.single("image"), async function (req, res) {
  try {
    if (!req.file) {
      return res.status(400).json({ kosa: "Hakuna picha iliyotumwa" });
    }

    // Convert picha kuwa base64
    const base64Image = req.file.buffer.toString("base64");

    // Tengeneza form data kwa ImgBB
    const formData = new FormData();
    formData.append("image", base64Image);
    formData.append("name", "nyumbakwetu_" + Date.now());

    // Tuma kwa ImgBB API
    const response = await axios.post(
      "https://api.imgbb.com/1/upload?key=" + process.env.IMGBB_API_KEY,
      formData,
      {
        headers: formData.getHeaders(),
        maxBodyLength: Infinity,
        maxContentLength: Infinity
      }
    );

    // Angalia response
    if (!response.data || !response.data.success) {
      throw new Error("ImgBB upload imeshindikana");
    }

    const imageUrl = response.data.data.url;
    const thumbUrl = response.data.data.thumb ? response.data.data.thumb.url : imageUrl;

    console.log("Picha imepakiwa:", imageUrl);

    res.status(201).json({
      ujumbe: "Picha imepakiwa!",
      picha: {
        url: imageUrl,
        thumb: thumbUrl,
        delete_url: response.data.data.delete_url,
        ukubwa: req.file.size,
        jina: req.file.originalname
      }
    });

  } catch (error) {
    console.error("Upload Error:", error.message);
    res.status(500).json({
      kosa: "Imeshindikana kupakia picha",
      maelezo: error.message
    });
  }
});

// ==========================================
// POST /api/upload/multiple - Pakia picha nyingi
// ==========================================
router.post("/multiple", lindaRoute, upload.array("images", 10), async function (req, res) {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ kosa: "Hakuna picha zilizotumwa" });
    }

    const pichaUrls = [];

    // Pakia kila picha moja kwa moja
    for (const file of req.files) {
      try {
        const base64Image = file.buffer.toString("base64");

        const formData = new FormData();
        formData.append("image", base64Image);
        formData.append("name", "nyumbakwetu_" + Date.now() + "_" + file.originalname);

        const response = await axios.post(
          "https://api.imgbb.com/1/upload?key=" + process.env.IMGBB_API_KEY,
          formData,
          {
            headers: formData.getHeaders(),
            maxBodyLength: Infinity,
            maxContentLength: Infinity
          }
        );

        if (response.data && response.data.success) {
          pichaUrls.push({
            url: response.data.data.url,
            thumb: response.data.data.thumb ? response.data.data.thumb.url : response.data.data.url,
            ukubwa: file.size,
            jina: file.originalname
          });
        }
      } catch (err) {
        console.error("Picha imeshindwa:", file.originalname, err.message);
      }
    }

    if (pichaUrls.length === 0) {
      return res.status(500).json({
        kosa: "Hakuna picha iliyopakiwa"
      });
    }

    res.status(201).json({
      ujumbe: "Picha " + pichaUrls.length + " zimepakiwa!",
      picha: pichaUrls
    });

  } catch (error) {
    console.error("Upload Error:", error.message);
    res.status(500).json({
      kosa: "Imeshindikana kupakia picha",
      maelezo: error.message
    });
  }
});

module.exports = router;