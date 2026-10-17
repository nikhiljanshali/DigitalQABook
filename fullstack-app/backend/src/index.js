import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import chapterRoutes from './routes/chapterRoutes.js';
import qaRoutes from './routes/qaRoutes.js';
import authRoutes from './routes/authRoutes.js';
import pool from './config/db.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;
const CORS_ORIGIN = process.env.CORS_ORIGIN || 'http://localhost:4200';

// Middleware
app.use(cors({
  origin: CORS_ORIGIN,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
}));

app.use(express.json());

// Request logger
app.use((req, res, next) => {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] ${req.method} ${req.originalUrl}`);
  next();
});

// Health check endpoint
app.get('/api/v1/health', async (req, res) => {
  try {
    const dbRes = await pool.query('SELECT NOW() AS now, current_database() AS db;');
    res.json({
      status: 'healthy',
      timestamp: dbRes.rows[0].now,
      database: dbRes.rows[0].db,
      service: 'digital-qa-book-backend',
      version: '1.0.0',
    });
  } catch (err) {
    res.status(500).json({
      status: 'unhealthy',
      error: err.message,
    });
  }
});

// Mount Routes
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/chapters', chapterRoutes);
app.use('/api/v1/qa', qaRoutes);

// Fallback for unmatched routes
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Endpoint ${req.method} ${req.originalUrl} not found.`,
  });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('[Error Handler]', err);
  const status = err.status || 500;
  res.status(status).json({
    success: false,
    message: err.message || 'Internal Server Error',
  });
});

// Start Server
app.listen(PORT, () => {
  console.log(`===============================================`);
  console.log(`📖 Digital Q&A Book Backend Server`);
  console.log(`🚀 Running at: http://localhost:${PORT}`);
  console.log(`🌐 CORS allowed origin: ${CORS_ORIGIN}`);
  console.log(`📡 API Base: http://localhost:${PORT}/api/v1`);
  console.log(`===============================================`);
});

export default app;
