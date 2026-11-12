require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const { connectDB, mongoose } = require('./config/db');

const workspacesRouter = require('./routes/workspaces');
const documentsRouter = require('./routes/documents');
const routerEndpoints = require('./routes/router');
const authRouter = require('./routes/auth');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Health Check Endpoint (TC-11 / Section 3.A API Contract)
const healthHandler = (req, res) => {
  const isDbConnected = mongoose.connection.readyState === 1;
  return res.status(200).json({
    success: true,
    message: 'NoteRoute Backend Engine is running',
    data: {
      status: 'healthy',
      database: isDbConnected ? 'connected' : 'standalone',
      timestamp: new Date().toISOString()
    }
  });
};

app.get('/health', healthHandler);
app.get('/api/health', healthHandler);

// API Root Index
app.get(['/', '/api'], (req, res) => {
  return res.status(200).json({
    success: true,
    message: 'NoteRoute Multi-LLM Gateway & Knowledge Agent API v1.0.0',
    documentation: 'https://github.com/CRootAgent/noteroute',
    endpoints: {
      health: '/api/health',
      workspaces: '/api/workspaces',
      documents: '/api/documents',
      chat: 'POST /api/router/chat',
      metrics: '/api/router/metrics'
    }
  });
});

// Mount routers under /api and root alias for contract compatibility
app.use('/api/workspaces', workspacesRouter);
app.use('/workspaces', workspacesRouter);

app.use('/api/documents', documentsRouter);
app.use('/documents', documentsRouter);

app.use('/api/router', routerEndpoints);
app.use('/router', routerEndpoints);

app.use('/api/auth', authRouter);
app.use('/auth', authRouter);

// Static uploads / landing serving
const landingPath = path.join(__dirname, '..', 'landing');
app.use(express.static(landingPath));

// Modern React Web Application Serving
const webDistPath = path.join(__dirname, '..', 'web', 'dist');
if (fs.existsSync(webDistPath)) {
  app.use('/app', express.static(webDistPath));
  app.get('/app/*', (req, res) => {
    res.sendFile(path.join(webDistPath, 'index.html'));
  });
}

// Test error trigger route for test suite
if (process.env.NODE_ENV === 'test') {
  app.get('/api/test-server-error', (req, res, next) => {
    const err = new Error('Simulated Internal Failure');
    err.status = 500;
    next(err);
  });
}

// 404 Handler for unmatched API routes
app.use('/api/*', (req, res) => {
  res.status(404).json({
    success: false,
    message: `Endpoint ${req.method} ${req.originalUrl} tidak ditemukan`,
    error_code: 'ENDPOINT_NOT_FOUND'
  });
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error('[ServerError]', err.stack || err.message);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Terjadi kesalahan internal pada server',
    error_code: 'INTERNAL_SERVER_ERROR'
  });
});

// Start server if run directly
if (require.main === module) {
  connectDB().then(() => {
    app.listen(PORT, '0.0.0.0', () => {
      console.log(`🚀 NoteRoute Backend Engine running on port ${PORT}`);
      console.log(`🌐 Base URL: http://localhost:${PORT}/api`);
    });
  });
}

module.exports = app;
