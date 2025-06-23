const pool = require("../config/db");
const { createNotification } = require('./notificationController');

// ✅ Ajouter un avis (proprement avec JWT)
exports.addReview = async (req, res) => {
  console.log("➡️ addReview appelé");

  const { skill_id, rating, comment } = req.body;
  const user_id = req.user.id;

  if (!skill_id || !rating || !comment) {
    console.log("❌ Erreur : Données invalides");
    return res.status(400).json({ error: "Champs requis manquants" });
  }

  try {
    console.log("📝 Données reçues :", req.body);

    // Get skill owner information
    const [skillInfo] = await pool.query(
      "SELECT user_id, name FROM skills WHERE id = ?",
      [skill_id]
    );

    if (skillInfo.length === 0) {
      return res.status(404).json({ error: "Compétence introuvable" });
    }

    const skill_owner_id = skillInfo[0].user_id;
    const skill_name = skillInfo[0].name;

    // Utilisation du skill_id comme receiver_id
    const receiver_id = skill_id;

    const [result] = await pool.query(
      "INSERT INTO reviews (sender_id, receiver_id, rating, comment) VALUES (?, ?, ?, ?)",
      [user_id, receiver_id, rating, comment]
    );

    // Get reviewer name for notification
    const [reviewerInfo] = await pool.query(
      "SELECT name FROM users WHERE id = ?",
      [user_id]
    );

    const reviewer_name = reviewerInfo[0]?.name || "Un utilisateur";

    // Create notification for skill owner
    if (skill_owner_id !== user_id) { // Don't notify if reviewing own skill
      await createNotification(
        skill_owner_id,
        `${reviewer_name} a laissé un avis ${rating}/5 ⭐ sur votre compétence "${skill_name}"`,
        'success'
      );
    }

    console.log("✅ Avis inséré avec succès !");
    res.status(201).json({ message: "Avis ajouté avec succès", review_id: result.insertId });

  } catch (error) {
    console.error("❌ Erreur lors de l'ajout de l'avis :", error);
    res.status(500).json({ error: "Erreur serveur" });
  }
};

exports.getSkillReviews = async (req, res) => {
  const { skillId } = req.params;

  try {
    const [reviews] = await pool.query(
      `SELECT r.rating, r.comment, r.created_at, u.name AS reviewer
       FROM reviews r
       JOIN users u ON r.sender_id = u.id
       WHERE r.receiver_id = ?
       ORDER BY r.created_at DESC`,
      [skillId]
    );

    res.status(200).json(reviews);
  } catch (error) {
    console.error("❌ Erreur lors de la récupération des avis :", error);
    res.status(500).json({ error: "Erreur serveur" });
  }
};

// ✅ Récupérer les avis d'un utilisateur (pour toutes ses compétences)
exports.getUserReviews = async (req, res) => {
  const { userId } = req.params;

  try {
    const [reviews] = await pool.query(
      `SELECT 
        r.rating, 
        r.comment, 
        u.name AS reviewer, 
        r.created_at,
        s.name AS skill_name
       FROM reviews r
       JOIN users u ON r.sender_id = u.id
       JOIN skills s ON r.receiver_id = s.id
       WHERE s.user_id = ? 
       ORDER BY r.created_at DESC`, 
      [userId]
    );

    res.status(200).json(reviews);

  } catch (error) {
    console.error("Erreur lors de la récupération des avis :", error);
    res.status(500).json({ error: "Erreur serveur" });
  }
};

exports.getSkillAverage = async (req, res) => {
  const { skillId } = req.params;

  try {
    const [result] = await pool.query(
      "SELECT ROUND(AVG(rating), 1) AS average FROM reviews WHERE receiver_id = ?",
      [skillId]
    );

    res.status(200).json(result[0]); // { average: 4.6 }
  } catch (error) {
    console.error("Erreur moyenne :", error);
    res.status(500).json({ error: "Erreur serveur" });
  }
};

// ✅ Get averages for all skills
exports.getAllSkillAverages = async (req, res) => {
  try {
    const [results] = await pool.query(
      `SELECT receiver_id as skill_id, ROUND(AVG(rating), 1) AS average 
       FROM reviews 
       GROUP BY receiver_id`
    );

    res.status(200).json(results); // [{ skill_id: 1, average: 4.6 }, ...]
  } catch (error) {
    console.error("Erreur moyennes globales :", error);
    res.status(500).json({ error: "Erreur serveur" });
  }
};
