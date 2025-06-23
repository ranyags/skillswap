const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const pool = require('../config/db');

exports.register = async (req, res) => {
    try {
        const { 
            name, 
            email, 
            password, 
            phone, 
            country, 
            city, 
            description, 
            sexe, 
            birthdate, 
            role = 'user' 
        } = req.body;

        // Vérifier si l'utilisateur existe déjà
        const [existingUser] = await pool.query('SELECT * FROM users WHERE email = ?', [email]);
        if (existingUser.length > 0) {
            return res.status(400).json({ error: "Cet email est déjà utilisé." });
        }

        // Hachage du mot de passe
        const hashedPassword = await bcrypt.hash(password, 10);

        // Insérer l'utilisateur dans la base de données avec tous les champs
        await pool.query(
            `INSERT INTO users (name, email, password, phone, country, city, description, sexe, birthdate, role) 
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [name, email, hashedPassword, phone || null, country || null, city || null, description || null, sexe || null, birthdate || null, role]
        );
        
        console.log("✅ Nouvel utilisateur créé:", { name, email, phone, country, city, sexe, birthdate });
        res.status(201).json({ message: "Utilisateur enregistré avec succès." });
    } catch (error) {
        console.error("❌ Erreur lors de l'inscription :", error);
        res.status(500).json({ error: "Erreur serveur." });
    }
};

exports.loginUser = async (req, res) => {
    try {
        const { email, password } = req.body;

        // Vérifier si l'utilisateur existe
        const [user] = await pool.query('SELECT * FROM users WHERE email = ?', [email]);

        if (user.length === 0) {
            return res.status(401).json({ error: "Identifiants invalides." });
        }

        // Vérifier le mot de passe
        const validPassword = await bcrypt.compare(password, user[0].password);
        if (!validPassword) {
            return res.status(401).json({ error: "Identifiants invalides." });
        }

        // Générer un token JWT avec les informations complètes
        const token = jwt.sign({ 
            id: user[0].id,
            role: user[0].role,
            email: user[0].email
        }, process.env.JWT_SECRET, { expiresIn: '1h' });

        // Retourner token ET informations utilisateur
        res.json({ 
            token,
            user: {
                id: user[0].id,
                name: user[0].name,
                email: user[0].email,
                role: user[0].role
            }
        });

    } catch (error) {
        console.error("❌ Erreur lors de la connexion :", error);
        res.status(500).json({ error: "Erreur serveur." });
    }
};
