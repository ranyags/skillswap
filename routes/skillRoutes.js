const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");
const { verifyToken } = require("../middleware/authMiddleware");
const { createNotification } = require("../controllers/notificationController");
const pool = require("../config/db");

// 📁 Multer : config pour fichiers ZIP
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, "uploads/zips"),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `skill_${Date.now()}${ext}`);
  },
});
const upload = multer({ storage });

// ➕ Ajouter une compétence
router.post("/add", verifyToken, upload.single("zip_file"), async (req, res) => {
  const { name, description } = req.body;
  const zipPath = req.file ? `/uploads/zips/${req.file.filename}` : null;

  if (!name || !description) {
    return res.status(400).json({ error: "Le nom et la description sont requis." });
  }

  try {
    const [existing] = await pool.query(
      "SELECT * FROM skills WHERE user_id = ? AND name = ?",
      [req.user.id, name]
    );
    if (existing.length > 0) {
      return res.status(400).json({ error: "Cette compétence existe déjà." });
    }

    await pool.query(
      "INSERT INTO skills (user_id, name, description, zip_file) VALUES (?, ?, ?, ?)",
      [req.user.id, name, description, zipPath]
    );

    // Get user name for notification
    const [userInfo] = await pool.query(
      "SELECT name FROM users WHERE id = ?",
      [req.user.id]
    );

    const user_name = userInfo[0]?.name || "Un utilisateur";

    // Create notification for the user who added the skill
    await createNotification(
      req.user.id,
      `Votre compétence "${name}" a été ajoutée avec succès! 🎉`,
      'success'
    );

    res.status(201).json({ message: "✅ Compétence ajoutée avec succès." });
  } catch (error) {
    console.error("❌ Erreur ajout compétence :", error);
    res.status(500).json({ error: "Erreur serveur" });
  }
});

// 🔁 GET toutes les compétences
router.get("/", async (req, res) => {
  try {
    const [skills] = await pool.query(`
      SELECT 
        s.id, 
        s.name, 
        s.description, 
        s.zip_file, 
        s.created_at, 
        s.user_id,
        u.name as user_name
      FROM skills s 
      LEFT JOIN users u ON s.user_id = u.id 
      ORDER BY s.created_at DESC
    `);
    res.json(skills);
  } catch (err) {
    console.error("❌ Erreur récupération :", err);
    res.status(500).json({ error: "Erreur serveur" });
  }
});

// 🔁 GET compétences par utilisateur
router.get("/user/:id", verifyToken, async (req, res) => {
  try {
    const [skills] = await pool.query("SELECT * FROM skills WHERE user_id = ?", [req.params.id]);
    res.json(skills);
  } catch (err) {
    console.error("❌ Erreur récupération user skills :", err);
    res.status(500).json({ error: "Erreur serveur" });
  }
});

// ❌ Supprimer une compétence
router.delete("/:id", verifyToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const skillId = req.params.id;

    const [existingSkill] = await pool.query(
      "SELECT * FROM skills WHERE id = ? AND user_id = ?",
      [skillId, userId]
    );
    if (existingSkill.length === 0) {
      return res.status(404).json({ error: "Compétence non trouvée ou non autorisée" });
    }

    await pool.query("DELETE FROM skills WHERE id = ?", [skillId]);
    res.json({ message: "✅ Compétence supprimée." });
  } catch (err) {
    console.error("❌ Erreur suppression :", err);
    res.status(500).json({ error: "Erreur serveur" });
  }
});

module.exports = router;
