const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const path = require('path');
require('dotenv').config();

const authRoutes = require('./src/routes/authRoutes');
const menuRoutes = require('./src/routes/menuRoutes');
const orderRoutes = require('./src/routes/orderRoutes');
const queueRoutes = require('./src/routes/queueRoutes');
const verifyRoutes = require('./src/routes/verifyRoutes');
const analyticsRoutes = require('./src/routes/analyticsRoutes');
const adminRoutes = require('./src/routes/adminRoutes');
const errorHandler = require('./src/middleware/errorHandler');

const app = express();
let PORT = parseInt(process.env.PORT, 10) || 5000;

// Enable CORS & JSON parsing
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Serve static frontend test app from public/, images from images/, html from html/, and manager/stitch folders
app.use(express.static(path.join(__dirname, 'public')));
app.use('/images', express.static(path.join(__dirname, 'images')));
app.use('/html', express.static(path.join(__dirname, 'html')));
app.use('/manager', express.static(path.join(__dirname, 'manager')));
app.use('/stitch', express.static(path.join(__dirname, 'stitch_chez_gourmet_design_system')));

// Route alias for Manager Setup
app.get('/manager', (req, res) => {
  res.sendFile(path.join(__dirname, 'stitch_chez_gourmet_design_system', 'chez_gourmet_canteen_manager_dashboard', 'code.html'));
});

if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// System Health Check Endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'online',
    service: 'Chez Gourmet Pre-Order & Queue Management System API',
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  });
});

// Mount Feature API Routes
app.use('/api/auth', authRoutes);
app.use('/api/menu', menuRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/queue', queueRoutes);
app.use('/api/verify', verifyRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/admin', adminRoutes);

// Catch 404 Route
app.use((req, res) => {
  res.status(404).json({ success: false, message: `Route '${req.originalUrl}' not found.` });
});

// Global Error Handler
app.use(errorHandler);

// Start Server with port retry fallback if busy
function startServer(portToTry) {
  const server = app.listen(portToTry, () => {
    console.log(`=======================================================`);
    console.log(`🚀 Chez Gourmet Server running on http://localhost:${portToTry}`);
    console.log(`📊 Health Check: http://localhost:${portToTry}/api/health`);
    console.log(`=======================================================`);
  });

  server.on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
      console.warn(`⚠️ Port ${portToTry} is in use. Trying port ${portToTry + 1}...`);
      startServer(portToTry + 1);
    } else {
      console.error('Server error:', err);
    }
  });
}

if (require.main === module) {
  startServer(PORT);
}

module.exports = app;
