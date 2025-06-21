const express = require('express');
const { addReview, getUserReviews, getSkillReviews, getSkillAverage, getAllSkillAverages } = require("../controllers/reviewController");

const { verifyToken } = require('../middleware/authMiddleware');

const router = express.Router();
router.get("/skill/:skillId", getSkillReviews);

// Route pour ajouter un avis
router.post('/add', verifyToken, addReview);

// Route pour récupérer les avis reçus par un utilisateur
router.get('/user/:userId', getUserReviews);

router.get("/skill/:skillId/average", getSkillAverage);

// ✅ Route pour récupérer toutes les moyennes des compétences
router.get("/average/all", getAllSkillAverages);

module.exports = router;
