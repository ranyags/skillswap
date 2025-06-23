exports.requireRole = (role) => {
  return (req, res, next) => {
      if (!req.user || req.user.role !== role) {
          return res.status(403).json({ error: "Accès interdit : rôle insuffisant." });
      }
      next();
  };
};

exports.isAdmin = (req, res, next) => {
  if (req.user.role !== 'admin') {
      return res.status(403).json({ error: "Accès refusé. Admin uniquement." });
  }
  next();
};

module.exports = { requireRole, isAdmin };