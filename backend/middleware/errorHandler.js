const logger = require('../config/logger'); // si tu as un logger, sinon remplace par console.error

module.exports = (err, req, res, next) => {
    logger.error(err.message, {
        timestamp: new Date().toISOString(),
        stack: err.stack
    });

    res.status(err.statusCode || 500).json({
        error: err.message || "Erreur interne du serveur"
    });
};
