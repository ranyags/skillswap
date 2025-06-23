const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');
const userRoutes = require('./routes/userRoutes'); // Vérifie cet import
const helmet = require('helmet');
const app = express();
const rateLimit = require('express-rate-limit');
const compression = require('compression');
const errorHandler = require('./middleware/errorHandler');
const skillRoutes = require("./routes/skillRoutes");
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // Limite chaque IP à 100 requêtes
    message: "Trop de requêtes, veuillez réessayer plus tard."
});

app.use(limiter);

app.use(cors());
app.use(bodyParser.json());

// ✅ Serve static files from uploads directory with explicit CORS
app.use('/uploads', (req, res, next) => {
  // Set permissive CORS headers for static files
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  res.header('Access-Control-Allow-Credentials', 'true');
  
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
  }
}));

app.use('/api/users', userRoutes); // Vérifie que cette ligne est bien présente
app.use(helmet());
app.use(compression());
app.use(errorHandler);
app.use("/api/skills", skillRoutes);
module.exports = app;
