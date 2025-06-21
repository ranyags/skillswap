const express = require("express");
const router = express.Router();
const pool = require("../config/db"); // Connexion MySQL
const { verifyToken, verifyAdmin } = require("../middleware/authMiddleware");

// ✅ Route protégée pour récupérer les statistiques globales
router.get("/stats", verifyToken, verifyAdmin, async (req, res) => {
  try {
    // Récupérer le total des utilisateurs
    const [[{ totalUsers }]] = await pool.query("SELECT COUNT(*) as totalUsers FROM users");

    // Récupérer le total des compétences
    const [[{ totalSkills }]] = await pool.query("SELECT COUNT(*) as totalSkills FROM skills");

    // Récupérer le total des avis
    const [[{ totalReviews }]] = await pool.query("SELECT COUNT(*) as totalReviews FROM reviews");

    // Récupérer les utilisateurs récents (derniers 7 jours)
    const [[{ recentUsers }]] = await pool.query(
      "SELECT COUNT(*) as recentUsers FROM users WHERE DATE(created_at) >= DATE_SUB(CURDATE(), INTERVAL 7 DAY)"
    );

    // Réponse
    res.json({
      users: totalUsers,
      skills: totalSkills,
      reviews: totalReviews,
      recentUsers: recentUsers
    });

  } catch (error) {
    console.error("❌ Erreur stats admin :", error);
    res.status(500).json({ error: "Erreur serveur" });
  }
});

// ✅ Route pour récupérer tous les utilisateurs
router.get("/users", verifyToken, verifyAdmin, async (req, res) => {
  try {
    const [users] = await pool.query(
      "SELECT id, name, email, role, country, city, created_at FROM users ORDER BY created_at DESC"
    );
    res.json(users);
  } catch (error) {
    console.error("❌ Erreur récupération utilisateurs :", error);
    res.status(500).json({ error: "Erreur serveur" });
  }
});

// ✅ Route pour récupérer toutes les compétences
router.get("/skills", verifyToken, verifyAdmin, async (req, res) => {
  try {
    const [skills] = await pool.query(
      `SELECT s.id, s.name as title, s.description, s.created_at, u.name as user_name, u.email as user_email 
       FROM skills s 
       JOIN users u ON s.user_id = u.id 
       ORDER BY s.created_at DESC`
    );
    res.json(skills);
  } catch (error) {
    console.error("❌ Erreur récupération compétences :", error);
    res.status(500).json({ error: "Erreur serveur" });
  }
});

// ✅ Route pour récupérer tous les avis
router.get("/reviews", verifyToken, verifyAdmin, async (req, res) => {
  try {
    const [reviews] = await pool.query(
      `SELECT 
        r.id,
        r.rating,
        r.comment,
        r.created_at,
        u1.name as reviewer_name,
        s.name as skill_title,
        u2.name as reviewed_name
       FROM reviews r
       JOIN users u1 ON r.sender_id = u1.id
       LEFT JOIN skills s ON r.receiver_id = s.id
       LEFT JOIN users u2 ON s.user_id = u2.id
       ORDER BY r.created_at DESC`
    );
    res.json(reviews);
  } catch (error) {
    console.error("❌ Erreur récupération avis :", error);
    res.status(500).json({ error: "Erreur serveur" });
  }
});

// ✅ Route pour supprimer un utilisateur
router.delete("/users/:id", verifyToken, verifyAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    
    // Vérifier que l'admin ne peut pas se supprimer lui-même
    if (parseInt(id) === req.user.id) {
      return res.status(400).json({ error: "Vous ne pouvez pas supprimer votre propre compte" });
    }

    await pool.query("DELETE FROM users WHERE id = ?", [id]);
    res.json({ message: "Utilisateur supprimé avec succès" });
  } catch (error) {
    console.error("❌ Erreur suppression utilisateur :", error);
    res.status(500).json({ error: "Erreur serveur" });
  }
});

// ✅ Route pour supprimer une compétence
router.delete("/skills/:id", verifyToken, verifyAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    await pool.query("DELETE FROM skills WHERE id = ?", [id]);
    res.json({ message: "Compétence supprimée avec succès" });
  } catch (error) {
    console.error("❌ Erreur suppression compétence :", error);
    res.status(500).json({ error: "Erreur serveur" });
  }
});

// ✅ Route pour supprimer un avis
router.delete("/reviews/:id", verifyToken, verifyAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    await pool.query("DELETE FROM reviews WHERE id = ?", [id]);
    res.json({ message: "Avis supprimé avec succès" });
  } catch (error) {
    console.error("❌ Erreur suppression avis :", error);
    res.status(500).json({ error: "Erreur serveur" });
  }
});

module.exports = router;
