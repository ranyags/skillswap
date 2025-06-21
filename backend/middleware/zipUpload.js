const multer = require("multer");
const path = require("path");

// 📦 Configuration du stockage pour les fichiers ZIP
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/zips/");
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const filename = `skill_${Date.now()}${ext}`;
    cb(null, filename);
  }
});

const fileFilter = (req, file, cb) => {
  const allowed = [".zip", ".rar", ".7z"];
  const ext = path.extname(file.originalname).toLowerCase();
  if (allowed.includes(ext)) {
    cb(null, true);
  } else {
    cb(new Error("Seuls les fichiers ZIP, RAR, ou 7z sont autorisés."), false);
  }
};

const upload = multer({ storage, fileFilter });

module.exports = upload;
