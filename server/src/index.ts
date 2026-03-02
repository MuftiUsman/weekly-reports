import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';
import timesheetRoutes from './routes/timesheet';

// Get __dirname equivalent in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables from the root .env file
dotenv.config({ path: resolve(__dirname, '../../.env') });

const app = express();
const PORT = process.env.BACKEND_PORT || 3001;
const FABRIC_API_URL = process.env.FABRIC_API_URL || 'http://localhost:8000';

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true
}));
app.use(express.json());

// Request logging middleware
app.use((req: Request, res: Response, next: NextFunction) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
  next();
});

// Health check endpoint
app.get('/health', (req: Request, res: Response) => {
  res.json({ status: 'ok', fabricApiUrl: FABRIC_API_URL });
});

// Mount routes
app.use('/api/timesheets', timesheetRoutes);

// Error handling middleware
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  console.error('Error:', err);
  res.status(500).json({
    error: 'Internal server error',
    message: err.message
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`\n✅ Backend server running on http://localhost:${PORT}`);
  console.log(`📡 Proxying to Fabric API at: ${FABRIC_API_URL}`);
  console.log(`🌐 Accepting requests from: ${process.env.FRONTEND_URL || 'http://localhost:5173'}`);
  console.log(`\n🔍 Environment check:`);
  console.log(`   FABRIC_API_URL: ${process.env.FABRIC_API_URL || 'NOT SET'}`);
  console.log(`   BACKEND_PORT: ${process.env.BACKEND_PORT || 'NOT SET'}`);
  console.log(`   FRONTEND_URL: ${process.env.FRONTEND_URL || 'NOT SET'}\n`);
});
