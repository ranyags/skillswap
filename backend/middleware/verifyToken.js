const jwt = require("jsonwebtoken");

const verifyToken = (req, res, next) => {
  const authHeader = req.headers.authorization;

  // ✅ Vérifie la présence du header
  if (!authHeader) {
    return res.status(401).json({ error: "Accès refusé. Token manquant." });
  }

  const token = authHeader.split(" ")[1];

  // ✅ Vérifie la validité du token
  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) {
      console.error("❌ Token invalide :", err.message);
      return res.status(403).json({ error: "Token invalide." });
    }

    // ✅ Injecte les infos utilisateur dans req.user
    req.user = decoded;
    next();
  });
};

module.exports = verifyToken;
