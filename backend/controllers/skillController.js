const pool = require("../config/db");

// 🔧 Ajouter une compétence (via route dédiée si besoin plus tard)
exports.addSkill = async (req, res) => {
  const { name, description } = req.body;
  const zipPath = req.file ? `/uploads/zips/${req.file.filename}` : null;
  const user_id = req.user.id;

  try {
    await pool.query(
      "INSERT INTO skills (user_id, name, description, zip_file) VALUES (?, ?, ?, ?)",
      [user_id, name, description, zipPath]
    );
    res.status(201).json({ message: "✅ Compétence ajoutée avec succès." });
  } catch (error) {
    console.error("❌ Erreur ajout compétence :", error);
    res.status(500).json({ error: "Erreur serveur" });
  }
};

// 🎯 Obtenir toutes les compétences
exports.getAllSkills = async (req, res) => {
  try {
    const [skills] = await pool.query("SELECT * FROM skills ORDER BY created_at DESC");
    res.json(skills);
  } catch (error) {
    console.error("❌ Erreur récupération skills :", error);
    res.status(500).json({ error: "Erreur serveur" });
  }
};

// 👤 Obtenir les compétences d’un utilisateur
exports.getUserSkills = async (req, res) => {
  const userId = req.params.id;

  try {
    const [results] = await pool.query("SELECT * FROM skills WHERE user_id = ?", [userId]);
    res.json(results);
  } catch (error) {
    console.error("❌ Erreur récupération skills utilisateur :", error);
    res.status(500).json({ error: "Erreur serveur" });
  }
};
