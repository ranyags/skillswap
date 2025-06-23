const jwt = require("jsonwebtoken");

const verifyToken = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(401).json({ error: "Token manquant" });

  const token = authHeader.split(" ")[1];
  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ error: "Token invalide" });
    req.user = user;
    next();
  });
};

const verifyAdmin = (req, res, next) => {
  if (req.user.role !== "admin") return res.status(403).json({ error: "Accès réservé aux admins" });
  next();
};

module.exports = { verifyToken, verifyAdmin };
