const mysql = require('mysql2/promise');

(async () => {
  console.log("🧪 Test simple de connexion MySQL...");
  try {
    const pool = mysql.createPool({
      host: "localhost",
      user: "root",
      password: "",
      database: "skillswap"
    });

    const [rows] = await pool.query("SELECT 1");
    console.log("✅ Connexion réussie :", rows);
  } catch (err) {
    console.error("❌ Erreur MySQL :", err.message);
  }
})();
