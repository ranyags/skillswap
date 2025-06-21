const pool = require('./config/db');

async function checkUserData() {
    try {
        console.log("🔍 Checking user data in database...");
        
        // Check azerty user
        const [users] = await pool.query('SELECT * FROM users WHERE email = ?', ['azerty@example.com']);
        
        if (users.length > 0) {
            console.log("👤 User 'azerty' data:", JSON.stringify(users[0], null, 2));
        } else {
            console.log("❌ User 'azerty' not found");
        }
        
        // Check all users to see which fields are populated
        const [allUsers] = await pool.query('SELECT id, name, email, phone, country, city, sexe, birthdate FROM users LIMIT 5');
        console.log("\n📋 Sample users data:");
        allUsers.forEach(user => {
            console.log(`ID: ${user.id}, Name: ${user.name}, Phone: ${user.phone || 'NULL'}, Country: ${user.country || 'NULL'}, Gender: ${user.sexe || 'NULL'}`);
        });
        
        process.exit(0);
    } catch (error) {
        console.error("❌ Error:", error);
        process.exit(1);
    }
}

checkUserData(); 