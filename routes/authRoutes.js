const express = require('express');
const { register, loginUser } = require('../controllers/authController'); // ✅ Import correct des fonctions

const router = express.Router();

router.post('/register', register); // ✅ Vérifie que `register` est bien défini
router.post('/login', loginUser);   // ✅ Vérifie que `loginUser` est bien défini

module.exports = router;

