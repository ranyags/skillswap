// 📦 Importations
const express = require("express");
const router = express.Router();
const { verifyToken } = require("../middleware/authMiddleware");
const {
  sendMessage,
  getMessages,
  getLastMessagesForUser,
} = require("../controllers/chatController");

// ✉️ Envoyer un message
router.post("/send", verifyToken, sendMessage);

// 🕓 Récupérer l'historique des messages avec un utilisateur
router.get("/history/:receiver_id", verifyToken, getMessages);

// 🕵️‍♂️ Récupérer les derniers messages échangés avec chaque utilisateur
router.get("/last-message", verifyToken, getLastMessagesForUser);

module.exports = router;
