const express = require("express");
const multer = require("multer");
const path = require("path");
const { verifyToken } = require("../middleware/authMiddleware");

const router = express.Router();

// ✅ Filtre MIME pour accepter uniquement les fichiers image
const fileFilter = (req, file, cb) => {
  const allowedTypes = ["image/jpeg", "image/png", "image/jpg", "image/webp"];
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error("❌ Seules les images (JPG, PNG, WEBP) sont autorisées"), false);
  }
};

// 📁 Configuration du stockage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/"); // Assurez-vous que ce dossier existe
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const filename = `avatar_${Date.now()}${ext}`;
    cb(null, filename);
  }
});

const upload = multer({ storage, fileFilter });

// ✅ Route d'upload
router.post("/avatar", verifyToken, upload.single("avatar"), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: "Aucun fichier valide reçu (image uniquement)" });
  }
  const avatarUrl = `/uploads/${req.file.filename}`;
  res.json({ avatar: avatarUrl });
});

module.exports = router;
