const pool = require('./config/db');

async function verifyData() {
    try {
        console.log("🔍 Vérification des données importées...");
        
        // Check users table
        const [users] = await pool.execute('SELECT COUNT(*) as user_count FROM users');
        console.log(`👥 Nombre d'utilisateurs: ${users[0].user_count}`);
        
        // Check skills table
        const [skills] = await pool.execute('SELECT COUNT(*) as skill_count FROM skills');
        console.log(`🎯 Nombre de compétences: ${skills[0].skill_count}`);
        
        // Check messages table
        const [messages] = await pool.execute('SELECT COUNT(*) as message_count FROM messages');
        console.log(`💬 Nombre de messages: ${messages[0].message_count}`);
        
        // Show sample user
        const [sampleUsers] = await pool.execute('SELECT id, name, email FROM users LIMIT 3');
        console.log("📋 Exemples d'utilisateurs:");
        sampleUsers.forEach(user => {
            console.log(`  - ID: ${user.id}, Nom: ${user.name}, Email: ${user.email}`);
        });
        
        console.log("✅ Vérification terminée !");
        process.exit(0);
        
    } catch (error) {
        console.error("❌ Erreur lors de la vérification:", error.message);
        process.exit(1);
    }
}

verifyData(); 