process.env.LANG = 'en_US.UTF-8';
require('dotenv').config();
const express = require('express');
const http = require('http');
const cors = require('cors');
const helmet = require('helmet');
const xss = require('xss-clean');
const rateLimit = require('express-rate-limit');
const socketIo = require('socket.io');
const path = require('path');

const pool = require('./config/db');
const logger = require('./config/logger');

const userRoutes = require('./routes/userRoutes');
const authRoutes = require('./routes/authRoutes');
const chatRoutes = require('./routes/chatRoutes');
const reviewRoutes = require('./routes/reviewRoutes');
const notificationRoutes = require('./routes/notificationRoutes');
const skillRoutes = require('./routes/skillRoutes');
const adminRoutes = require('./routes/adminRoutes');
const uploadRoutes = require('./routes/uploadRoutes');
const errorHandler = require('./middleware/errorHandler');

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: function (origin, callback) {
      // Allow localhost on any port for development and allow no origin
      if (!origin || origin.startsWith('http://localhost:') || origin.startsWith('http://127.0.0.1:')) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    },
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    credentials: true,
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept', 'Origin', 'Cache-Control', 'Pragma', 'Expires', 'If-Modified-Since', 'If-None-Match'],
  },
});


const PORT = process.env.PORT || 5000;

// 🛡️ Sécurité
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" }
}));
app.use(xss());

// More permissive rate limiting for development
app.use(rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 1000, // Increased from 100 to 1000 requests
  message: 'Trop de requêtes, veuillez réessayer plus tard.',
  standardHeaders: true,
  legacyHeaders: false,
}));

// More permissive CORS configuration
app.use(cors({
  origin: function (origin, callback) {
    // Allow localhost on any port for development and allow no origin (mobile apps, Postman, etc.)
    if (!origin || origin.startsWith('http://localhost:') || origin.startsWith('http://127.0.0.1:')) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept', 'Origin', 'Cache-Control', 'Pragma', 'Expires', 'If-Modified-Since', 'If-None-Match'],
}));

// Global CORS middleware for all requests
app.use((req, res, next) => {
  const origin = req.headers.origin;
  if (!origin || origin.startsWith('http://localhost:') || origin.startsWith('http://127.0.0.1:')) {
    res.header('Access-Control-Allow-Origin', origin || '*');
  }
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization, Cache-Control, Pragma, Expires, If-Modified-Since, If-None-Match');
  res.header('Access-Control-Allow-Credentials', 'true');
  
  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    res.sendStatus(200);
  } else {
    next();
  }
});

app.use(express.json());

// 📂 Servir les images (avatars, uploads) with CORS headers
app.use('/uploads', (req, res, next) => {
  // Set permissive CORS headers for static files
  const origin = req.headers.origin;
  if (!origin || origin.startsWith('http://localhost:') || origin.startsWith('http://127.0.0.1:')) {
    res.header('Access-Control-Allow-Origin', origin || '*');
  }
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization, Cache-Control, Pragma, Expires, If-Modified-Since, If-None-Match');
  res.header('Access-Control-Allow-Credentials', 'true');
  res.header('Cross-Origin-Resource-Policy', 'cross-origin');
  res.header('Cross-Origin-Embedder-Policy', 'unsafe-none');
  
  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    res.sendStatus(200);
  } else {
    next();
  }
}, express.static(path.join(__dirname, 'uploads'), {
  setHeaders: (res, path, stat) => {
    // Additional headers for static files
    res.set('Cross-Origin-Resource-Policy', 'cross-origin');
    res.set('Cache-Control', 'public, max-age=3600'); // Cache for 1 hour
    res.set('Access-Control-Allow-Origin', '*');
  }
}));

// 📋 Logger
app.use((req, res, next) => {
  logger.info(`📌 ${req.method} ${req.url}`);
  next();
});

// 🔗 Injecter io dans chaque requête
app.use((req, res, next) => {
  req.io = io;
  next();
});

// 🚀 Routes API
app.use('/api/users', userRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/skills', skillRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/upload', uploadRoutes);

// 🏥 Health check endpoint
app.get('/api/health', (req, res) => {
  const token = req.headers.authorization?.split(' ')[1];
  
  if (!token) {
    return res.status(401).json({ 
      status: 'unauthorized',
      message: 'Token manquant',
      timestamp: new Date().toISOString()
    });
  }

  try {
    const jwt = require('jsonwebtoken');
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    res.status(200).json({ 
      status: 'healthy',
      message: 'Serveur opérationnel et utilisateur authentifié',
      userId: decoded.id,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(401).json({ 
      status: 'unauthorized',
      message: 'Token invalide ou expiré',
      timestamp: new Date().toISOString()
    });
  }
});

app.get('/', (req, res) => {
  res.send('✅ SkillSwap API en ligne avec upload avatar 📸');
});

// 🛠️ Gestion des erreurs
app.use(errorHandler);
app.use((req, res) => {
  console.warn(`⚠️ Route non trouvée : ${req.method} ${req.originalUrl}`);
  res.status(404).json({ error: 'Route non trouvée' });
});

// 🔌 WebSocket (Socket.IO)
io.on('connection', (socket) => {
  console.log(`⚡ Connecté : ${socket.id}`);

  socket.on('join', ({ senderId, receiverId }) => {
    if (!senderId || !receiverId) {
      console.error("❌ Données manquantes pour join:", { senderId, receiverId });
      return;
    }
    const room = [senderId, receiverId].sort().join("-");
    socket.join(room);
    console.log(`👥 Room join: ${room}`);
  });

  socket.on('sendMessage', async ({ senderId, receiverId, text }) => {
    // Validation des données
    if (!senderId || !receiverId || !text) {
      console.error("❌ Données manquantes pour sendMessage:", { senderId, receiverId, text });
      socket.emit('error', { message: 'Données manquantes: senderId, receiverId et text sont requis' });
      return;
    }

    // Validation que senderId et receiverId sont des nombres
    const senderIdNum = parseInt(senderId);
    const receiverIdNum = parseInt(receiverId);
    
    if (isNaN(senderIdNum) || isNaN(receiverIdNum)) {
      console.error("❌ IDs invalides:", { senderId, receiverId });
      socket.emit('error', { message: 'IDs utilisateur invalides' });
      return;
    }

    // Créer le nom de la room
    const room = [senderIdNum, receiverIdNum].sort().join("-");
    
    // ✅ IMPORTANT: Envoyer le message SEULEMENT au destinataire, pas à l'expéditeur
    socket.to(room).emit("receiveMessage", { 
      senderId: senderIdNum, 
      receiverId: receiverIdNum,
      text, 
      timestamp: new Date(),
      sender: "other" // Pour indiquer que c'est un message reçu
    });

    try {
      await pool.query(
        'INSERT INTO messages (sender_id, receiver_id, message) VALUES (?, ?, ?)',
        [senderIdNum, receiverIdNum, text]
      );
      console.log(`✅ Message sauvegardé: ${senderIdNum} -> ${receiverIdNum}`);
      
      // Confirmer à l'expéditeur que le message a été envoyé
      socket.emit('messageSent', { 
        success: true, 
        message: 'Message envoyé avec succès',
        timestamp: new Date()
      });
      
    } catch (err) {
      console.error("❌ Erreur MySQL lors de l'enregistrement du message :", err);
      socket.emit('error', { message: 'Erreur lors de la sauvegarde du message' });
    }
  });

  socket.on('disconnect', () => {
    console.log(`❌ Déconnecté : ${socket.id}`);
  });
});

// 🧪 Connexion DB + lancement serveur
(async () => {
  try {
    console.log("🧪 Étape 4 : Tentative de SELECT 1 sur la base...");
    const [rows] = await pool.query('SELECT 1');
    console.log("✅ SELECT 1 OK :", rows);
    console.log('✅ Connexion à MySQL réussie.');

    server.listen(PORT, () => {
      console.log(`🚀 Serveur SkillSwap prêt sur http://localhost:${PORT}`);
    });
  } catch (err) {
    console.error('❌ Erreur de connexion à MySQL :', err.message);
  }
})();