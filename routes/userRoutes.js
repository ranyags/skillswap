const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");
const { verifyToken } = require("../middleware/authMiddleware");

const {
  updateUser,
  getProfile,
  getAllUsers,
  getUserById,
  adminOnly
} = require("../controllers/userController");

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, "uploads/"),
  filename: (req, file, cb) =>
    cb(null, "avatar_" + Date.now() + path.extname(file.originalname)),
});
const upload = multer({ storage });

router.get("/profile", verifyToken, getProfile);
router.get("/profile/:id", verifyToken, getUserById); // ✅ route pour récupérer utilisateur par ID
router.put("/profile", verifyToken, upload.single("avatar"), updateUser);
router.get("/all-users", verifyToken, getAllUsers);
router.get("/admin-only", verifyToken, adminOnly);

module.exports = router;
