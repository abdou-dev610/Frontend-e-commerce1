import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import path from 'path';

// Get the directory of the current file
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Construct the path to the .env file
const envPath = path.join(__dirname, '.env');
console.log('📁 Looking for .env at:', envPath);

// Load environment variables FIRST, before any other imports
const result = dotenv.config({ path: envPath });

if (result.error) {
  console.warn('⚠️  .env file not found:', result.error.message);
} else {
  console.log('✅ .env file loaded successfully');
  console.log('🔑 ADMIN_EMAIL from .env:', process.env.ADMIN_EMAIL);
  console.log('🔑 ADMIN_PASSWORD from .env:', process.env.ADMIN_PASSWORD ? '***' : 'NOT SET');
}

import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';

// Import routes
import authRoutes from './routes/auth.js';
import productRoutes from './routes/products.js';
import orderRoutes from './routes/orders.js';
import paymentRoutes from './routes/payment.js';
import adminRoutes from './routes/admin.js';
import uploadRoutes from './routes/upload.js';
import favoriteRoutes from './routes/favorites.js';

const app = express();
const DEFAULT_PORT = Number(process.env.PORT) || 5000;
const MAX_PORT_ATTEMPTS = 10;

// Middleware
const DEV_ORIGINS = ['http://localhost:8080','http://localhost:8081','http://localhost:8082','http://localhost:5173','http://localhost:3000'];
const EXTRA_ORIGINS = process.env.ALLOWED_ORIGINS ? process.env.ALLOWED_ORIGINS.split(',').map(o => o.trim()) : [];

const isOriginAllowed = (origin) => {
  if (!origin) return true;
  if (DEV_ORIGINS.includes(origin)) return true;
  if (EXTRA_ORIGINS.includes(origin)) return true;
  // Autoriser tous les sous-domaines Vercel et Render
  if (/^https:\/\/[a-z0-9-]+\.vercel\.app$/.test(origin)) return true;
  if (/^https:\/\/[a-z0-9-]+\.onrender\.com$/.test(origin)) return true;
  return false;
};

app.use(cors({
  origin: (origin, callback) => {
    if (isOriginAllowed(origin)) return callback(null, true);
    console.warn(`⚠️  CORS bloqué pour: ${origin}`);
    callback(new Error(`CORS: origine non autorisée — ${origin}`));
  },
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// MongoDB Connection
mongoose.connect(process.env.MONGODB_URI)
  .then(() => {
    console.log('✅ MongoDB Connected');
  })
  .catch(err => {
    console.error('❌ MongoDB Error:', err.message);
    process.exit(1);
  });

// Health Check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Backend is running' });
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/payment', paymentRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/favorites', favoriteRoutes);
app.use('/api/uploads', express.static(path.join(__dirname, 'uploads')));
app.use('/api/upload', uploadRoutes);

// 404 Handler
app.use((req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

// Error Handler
app.use((err, req, res, next) => {
  console.error(err);
  res.status(err.status || 500).json({
    message: err.message || 'Internal Server Error'
  });
});

function startServer(port, attempt = 1) {
  const server = app.listen(port, () => {
    console.log(`🚀 Server running on http://localhost:${port}`);
  });

  server.on('error', (error) => {
    if (error.code === 'EADDRINUSE' && attempt < MAX_PORT_ATTEMPTS) {
      const nextPort = port + 1;
      console.warn(`⚠️  Port ${port} is already in use. Trying port ${nextPort}...`);
      startServer(nextPort, attempt + 1);
      return;
    }

    console.error('❌ Unable to start server:', error.message);
    process.exit(1);
  });
}

startServer(DEFAULT_PORT);
