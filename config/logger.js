const { createLogger, format, transports } = require("winston");
const path = require("path");

const logger = createLogger({
    level: "info",  // Change "error" en "info" si tu veux TOUT logger
    format: format.combine(
        format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
        format.printf(({ timestamp, level, message, stack }) => {
            return stack
                ? `${timestamp} [${level.toUpperCase()}] ${message}\n${stack}\n`
                : `${timestamp} [${level.toUpperCase()}] ${message}`;
        })
    ),
    transports: [
        new transports.File({
            filename: path.join(__dirname, "../logs/errors.log"),
            handleExceptions: true,
            encoding: 'utf8' // ✅ Force l'encodage UTF-8
        })
    ]
});

module.exports = logger;
