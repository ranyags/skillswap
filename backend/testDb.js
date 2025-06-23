const mysql = require('mysql2/promise');
require('dotenv').config();

async function testConnection() {
    try {
        console.log("🔄 Test de connexion MySQL...");
        const connection = await mysql.createConnection({
            host: process.env.DB_HOST,
            user: process.env.DB_USER,
            password: process.env.DB_PASSWORD,
            database: process.env.DB_NAME
        });

        console.log("✅ Connexion MySQL OK !");
        const [rows] = await connection.execute('SELECT 1 + 1 AS solution');
        console.log("Résultat MySQL :", rows[0].solution);
        await connection.end();
    } catch (error) {
        console.error("❌ Erreur de connexion MySQL :", error);
    }
}

testConnection();
