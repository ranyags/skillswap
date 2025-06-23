const pool = require('../config/db');

// ✅ Function to create a notification
exports.createNotification = async (userId, message, type = 'info') => {
    try {
        await pool.query(
            "INSERT INTO notifications (user_id, message, type, is_read, created_at) VALUES (?, ?, ?, FALSE, NOW())",
            [userId, message, type]
        );
        console.log(`✅ Notification créée pour l'utilisateur ${userId}: ${message}`);
    } catch (error) {
        console.error("❌ Erreur lors de la création de la notification:", error);
    }
};

// Récupérer les notifications pour un utilisateur
exports.getNotifications = async (req, res) => {
    try {
        if (!req.user || !req.user.id) {
            return res.status(401).json({ error: "Utilisateur non authentifié." });
        }

        const userId = req.user.id;
        const [notifications] = await pool.query(
            "SELECT id, message, type, is_read, created_at FROM notifications WHERE user_id = ? ORDER BY created_at DESC",
            [userId]
        );

        res.json(notifications);
    } catch (error) {
        console.error("❌ Erreur lors de la récupération des notifications :", error);
        res.status(500).json({ error: "Erreur serveur" });
    }
};

// Marquer une notification comme lue
exports.markAsRead = async (req, res) => {
    const notificationId = req.params.id;
    
    try {
        // Vérifier si l'ID est un nombre valide
        if (isNaN(notificationId)) {
            return res.status(400).json({ error: "ID invalide" });
        }

        // Vérifier si la notification appartient à l'utilisateur
        const [notification] = await pool.query(
            'SELECT * FROM notifications WHERE id = ? AND user_id = ?', 
            [notificationId, req.user.id]
        );
        
        if (notification.length === 0) {
            return res.status(404).json({ error: "Notification introuvable." });
        }

        // Mettre à jour la notification en la marquant comme lue
        await pool.query('UPDATE notifications SET is_read = TRUE WHERE id = ?', [notificationId]);

        res.json({ message: "Notification marquée comme lue" });
    } catch (error) {
        console.error("Erreur lors de la mise à jour de la notification :", error);
        res.status(500).json({ error: "Erreur serveur" });
    }
};

// Marquer toutes les notifications comme lues
exports.markAllAsRead = async (req, res) => {
    try {
        await pool.query('UPDATE notifications SET is_read = TRUE WHERE user_id = ?', [req.user.id]);
        res.json({ message: "Toutes les notifications ont été marquées comme lues" });
    } catch (error) {
        console.error("Erreur lors de la mise à jour des notifications :", error);
        res.status(500).json({ error: "Erreur serveur" });
    }
};

// Supprimer une notification
exports.deleteNotification = async (req, res) => {
    const notificationId = req.params.id;
    
    try {
        // Vérifier si la notification appartient à l'utilisateur
        const [notification] = await pool.query(
            'SELECT * FROM notifications WHERE id = ? AND user_id = ?', 
            [notificationId, req.user.id]
        );
        
        if (notification.length === 0) {
            return res.status(404).json({ error: "Notification introuvable." });
        }

        await pool.query('DELETE FROM notifications WHERE id = ?', [notificationId]);
        res.json({ message: "Notification supprimée" });
    } catch (error) {
        console.error("Erreur lors de la suppression de la notification :", error);
        res.status(500).json({ error: "Erreur serveur" });
    }
};
