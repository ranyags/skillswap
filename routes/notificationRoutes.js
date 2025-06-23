/*const express = require('express');
const router = express.Router();
const notificationController = require('../controllers/notificationController');
const { verifyToken } = require('../middleware/authMiddleware');

// ✅ Route pour récupérer les notifications
router.get('/', verifyToken, notificationController.getNotifications);

// ✅ Route pour marquer une notification comme lue
router.put('/:id/read', verifyToken, notificationController.markAsRead);

module.exports = router;
*/
// backend/routes/notificationRoutes.js
const express = require('express');
const router = express.Router();
const notificationController = require('../controllers/notificationController');
const { verifyToken } = require('../middleware/authMiddleware');
const pool = require('../config/db');

// 🛡️ Route 1 : Récupérer toutes les notifications d'un utilisateur
router.get('/', verifyToken, notificationController.getNotifications);

// 🛡️ Route 2 : Marquer une notification comme lue
router.put('/:id/read', verifyToken, notificationController.markAsRead);

// 🛡️ Route 3 : Marquer toutes les notifications comme lues
router.put('/mark-all-read', verifyToken, notificationController.markAllAsRead);

// 🛡️ Route 4 : Supprimer une notification
router.delete('/:id', verifyToken, notificationController.deleteNotification);

// 🧪 Route pour créer des notifications de test (à supprimer en production)
router.post('/create-test', verifyToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const { createNotification } = require('../controllers/notificationController');
    
    const testNotifications = [
      {
        message: "🎉 Félicitations! Votre compétence 'React.js' a reçu un excellent avis de 5 étoiles!",
        type: 'success'
      },
      {
        message: "📝 Vous avez reçu un nouvel avis sur votre compétence 'Python'. Consultez votre profil pour plus de détails.",
        type: 'info'
      },
      {
        message: "⚠️ N'oubliez pas de mettre à jour votre profil avec vos dernières compétences.",
        type: 'warning'
      },
      {
        message: "✨ Votre compétence 'Design UI/UX' a été ajoutée avec succès à votre profil!",
        type: 'success'
      },
      {
        message: "💬 Un utilisateur souhaite échanger ses compétences avec vous. Consultez vos messages.",
        type: 'info'
      }
    ];
    
    for (const notif of testNotifications) {
      await createNotification(userId, notif.message, notif.type);
    }
    
    res.json({ message: "Notifications de test créées avec succès!" });
  } catch (error) {
    console.error('Erreur création notifications test:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

module.exports = router;
