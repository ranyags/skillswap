const mysql = require("mysql2/promise");

const pool = mysql.createPool({
  host: process.env.DB_HOST || "localhost",
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASSWORD || "",
  database: process.env.DB_NAME || "skillswap",
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

console.log("📡 Pool MySQL initialisé depuis db.js");

module.exports = pool;
