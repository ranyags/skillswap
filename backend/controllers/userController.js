const pool = require("../config/db");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

// 🔐 Connexion
const login = async (req, res) => {
  const { email, password } = req.body;
  try {
    const [users] = await pool.query("SELECT * FROM users WHERE email = ?", [email]);
    if (users.length === 0) return res.status(404).json({ error: "Utilisateur non trouvé" });

    const user = users[0];
    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) return res.status(401).json({ error: "Mot de passe incorrect" });

    const token = jwt.sign({ id: user.id, role: user.role }, process.env.JWT_SECRET, { expiresIn: "1h" });

    res.json({
      message: "Connexion réussie.",
      token,
      user: { id: user.id }
    });
  } catch (error) {
    console.error("❌ Erreur login:", error);
    res.status(500).json({ error: "Erreur serveur" });
  }
};

// 📝 Inscription
const register = async (req, res) => {
  const { name, email, password, role = "user", country, city } = req.body;
  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    await pool.query(
      "INSERT INTO users (name, email, password, role, country, city) VALUES (?, ?, ?, ?, ?, ?)",
      [name, email, hashedPassword, role, country, city]
    );
    res.status(201).json({ message: "Utilisateur enregistré" });
  } catch (error) {
    console.error("❌ Erreur register:", error);
    res.status(500).json({ error: "Erreur serveur" });
  }
};

// 👤 Récupération du profil de l'utilisateur connecté
const getProfile = async (req, res) => {
  try {
    const [rows] = await pool.query(
      "SELECT id, name, email, country, city, phone, bio, description, birthdate, sexe, avatar, role FROM users WHERE id = ?",
      [req.user.id]
    );
    if (rows.length === 0) return res.status(404).json({ error: "Utilisateur non trouvé" });
    
    // Log the data being returned for debugging
    console.log("📋 Profile data returned:", {
      id: rows[0].id,
      name: rows[0].name,
      phone: rows[0].phone || 'NULL',
      country: rows[0].country || 'NULL',
      city: rows[0].city || 'NULL',
      sexe: rows[0].sexe || 'NULL',
      birthdate: rows[0].birthdate || 'NULL'
    });
    
    res.json(rows[0]);
  } catch (err) {
    console.error("Erreur getProfile :", err);
    res.status(500).json({ error: "Erreur serveur" });
  }
};

// 🔍 Récupération du profil d'un utilisateur par ID
const getUserById = async (req, res) => {
  const userId = req.params.id;
  try {
    const [rows] = await pool.query(
      "SELECT id, name, email, avatar FROM users WHERE id = ?",
      [userId]
    );
    if (rows.length === 0) return res.status(404).json({ error: "Utilisateur non trouvé" });
    res.json(rows[0]);
  } catch (error) {
    console.error("❌ Erreur getUserById :", error);
    res.status(500).json({ error: "Erreur serveur" });
  }
};

// ✏️ Mise à jour du profil
const updateUser = async (req, res) => {
  const userId = req.user.id;
  const { name, email, country, city, phone, bio, birthdate, sexe, avatar } = req.body;
  let finalAvatar = avatar;
  if (req.file) {
    finalAvatar = `/uploads/${req.file.filename}`;
  }

  try {
    await pool.query(
      `UPDATE users 
       SET name = ?, email = ?, country = ?, city = ?, phone = ?, bio = ?, birthdate = ?, sexe = ?, avatar = ?
       WHERE id = ?`,
      [name, email, country, city, phone, bio, birthdate, sexe, finalAvatar, userId]
    );
    
    // Fetch and return the complete updated user profile
    const [rows] = await pool.query(
      "SELECT id, name, email, country, city, phone, bio, description, birthdate, sexe, avatar, role FROM users WHERE id = ?",
      [userId]
    );
    
    if (rows.length === 0) return res.status(404).json({ error: "Utilisateur non trouvé après mise à jour" });
    
    res.json({
      message: "✅ Profil mis à jour avec succès.",
      ...rows[0] // Return the complete user profile data
    });
  } catch (error) {
    console.error("❌ Erreur mise à jour profil :", error);
    res.status(500).json({ error: "Erreur serveur" });
  }
};

// 📋 Obtenir tous les utilisateurs (hors mot de passe)
const getAllUsers = async (req, res) => {
  try {
    const [users] = await pool.query("SELECT id, name, email, avatar FROM users");
    res.json(users);
  } catch (error) {
    console.error("❌ Erreur lors de la récupération des utilisateurs :", error);
    res.status(500).json({ error: "Erreur serveur" });
  }
};

// 🔐 Admin uniquement
const adminOnly = (req, res) => {
  res.json({ message: "Bienvenue admin !" });
};

module.exports = {
  login,
  register,
  getProfile,
  updateUser,
  adminOnly,
  getAllUsers,
  getUserById
};
