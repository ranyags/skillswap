exports.errorHandler = (err, req, res, next) => {
    res.status(err.status || 500).json({ error: err.message || 'Server Error' });
  };
  module.exports = (err, req, res, next) => {
    console.error("❌ Erreur :", err);
    res.status(err.status || 500).json({
        error: err.message || "Erreur serveur"
    });
};
