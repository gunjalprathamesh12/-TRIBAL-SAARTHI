import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import path from 'path';
import fs from 'fs';
import connectDB from './config/db.js';

// Route imports
import authRoutes from './routes/authRoutes.js';
import schemeRoutes from './routes/schemeRoutes.js';
import applicationRoutes from './routes/applicationRoutes.js';
import documentRoutes from './routes/documentRoutes.js';
import aiRoutes from './routes/aiRoutes.js';
import deficiencyRoutes from './routes/deficiencyRoutes.js';
import selectionRoutes from './routes/selectionRoutes.js';
import disbursementRoutes from './routes/disbursementRoutes.js';
import grievanceRoutes from './routes/grievanceRoutes.js';
import analyticsRoutes from './routes/analyticsRoutes.js';
import auditRoutes from './routes/auditRoutes.js';
import notificationRoutes from './routes/notificationRoutes.js';

import { notFound, errorHandler } from './middleware/errorMiddleware.js';

dotenv.config();

// Connect to MongoDB
connectDB();

const app = express();

// Security and middleware
app.use(
  helmet({
    crossOriginResourcePolicy: false,
  })
);

app.use(
  cors({
    origin: true,
    credentials: true,
  })
);

app.use(express.json({ limit: '15mb' }));
app.use(express.urlencoded({ extended: true, limit: '15mb' }));

if (process.env.NODE_ENV !== 'production') {
  app.use(morgan('dev'));
}

// Static directory for uploaded synthetic documents
const uploadDir = path.join(process.cwd(), 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}
app.use('/uploads', express.static(uploadDir));

// System Health & Diagnostics Check
app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    system: 'TRIBAL SAARTHI - MoTA Portal API',
    status: 'OPERATIONAL',
    timestamp: new Date(),
    environment: process.env.NODE_ENV || 'development',
    aiEngine: {
      mode: process.env.AI_MODE || 'demo',
      ocrMode: process.env.OCR_MODE || 'demo',
      ruleEngine: 'ACTIVE_DYNAMIC',
      fraudDetection: 'ACTIVE_SHA256',
    },
    version: '2.6.0-SIH2026',
  });
});

// Mount API Routes
app.use('/api/auth', authRoutes);
app.use('/api/schemes', schemeRoutes);
app.use('/api/applications', applicationRoutes);
app.use('/api/documents', documentRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/deficiencies', deficiencyRoutes);
app.use('/api/selection', selectionRoutes);
app.use('/api/disbursements', disbursementRoutes);
app.use('/api/grievances', grievanceRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/audit', auditRoutes);
app.use('/api/notifications', notificationRoutes);

// Error Handling
app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`================================================================`);
  console.log(`[TRIBAL SAARTHI] MoTA Scholarship & Fellowship Server running`);
  console.log(`[URL] http://localhost:${PORT}`);
  console.log(`[AI Mode] ${process.env.AI_MODE || 'demo'} | [OCR Mode] ${process.env.OCR_MODE || 'demo'}`);
  console.log(`================================================================`);
});

export default app;
