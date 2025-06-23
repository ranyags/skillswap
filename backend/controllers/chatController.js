const pool = require("../config/db");

// 1️⃣ ENVOYER UN MESSAGE
const sendMessage = async (req, res) => {
  const senderId = req.user.id;
  const { receiverId, text } = req.body;

  console.log(`📤 Sending message from ${senderId} to ${receiverId}: "${text}"`);

  try {
    await pool.query(
      "INSERT INTO messages (sender_id, receiver_id, message) VALUES (?, ?, ?)",
      [senderId, receiverId, text]
    );
    console.log("✅ Message sent successfully");
    res.status(201).json({ message: "Message envoyé." });
  } catch (error) {
    console.error("❌ Erreur envoi message :", error);
    res.status(500).json({ error: "Erreur serveur." });
  }
};

// 2️⃣ HISTORIQUE DE MESSAGES ENTRE DEUX UTILISATEURS
const getMessages = async (req, res) => {
  const userId = req.user.id;
  const receiverId = parseInt(req.params.receiver_id);

  console.log(`📥 Getting message history between ${userId} and ${receiverId}`);

  try {
    const [rows] = await pool.query(
      `SELECT * FROM messages 
       WHERE (sender_id = ? AND receiver_id = ?) 
          OR (sender_id = ? AND receiver_id = ?) 
       ORDER BY created_at ASC`,
      [userId, receiverId, receiverId, userId]
    );

    console.log(`📊 Found ${rows.length} messages in history`);
    res.json(rows);
  } catch (error) {
    console.error("❌ Erreur récupération historique :", error);
    res.status(500).json({ error: "Erreur serveur" });
  }
};

// 3️⃣ DERNIER MESSAGE PAR UTILISATEUR
const getLastMessagesForUser = async (req, res) => {
  const userId = req.user.id;

  console.log(`🔍 Getting last messages for user ${userId}`);

  try {
    // First check if there are any messages for this user
    const [allUserMessages] = await pool.query(
      'SELECT COUNT(*) as count FROM messages WHERE sender_id = ? OR receiver_id = ?',
      [userId, userId]
    );
    
    console.log(`📊 User ${userId} has ${allUserMessages[0].count} total messages`);

    if (allUserMessages[0].count === 0) {
      console.log(`⚠️ No messages found for user ${userId}`);
      return res.json([]);
    }

    const [rows] = await pool.query(
      `SELECT m.*
       FROM messages m
       INNER JOIN (
         SELECT 
           LEAST(sender_id, receiver_id) AS user1,
           GREATEST(sender_id, receiver_id) AS user2,
           MAX(id) AS max_id
         FROM messages
         WHERE sender_id = ? OR receiver_id = ?
         GROUP BY user1, user2
       ) latest ON m.id = latest.max_id
       ORDER BY m.created_at DESC`,
      [userId, userId]
    );

    console.log(`📊 Found ${rows.length} last messages for user ${userId}`);
    
    // Log each conversation found
    rows.forEach((msg, index) => {
      const otherUserId = msg.sender_id === userId ? msg.receiver_id : msg.sender_id;
      console.log(`${index + 1}. Conversation with user ${otherUserId}: "${msg.message}"`);
    });

    res.json(rows);
  } catch (error) {
    console.error("❌ Erreur dernier messages :", error);
    res.status(500).json({ error: "Erreur serveur" });
  }
};

module.exports = {
  sendMessage,
  getMessages,
  getLastMessagesForUser,
};