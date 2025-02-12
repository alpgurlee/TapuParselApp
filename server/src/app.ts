import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import dotenv from 'dotenv';

// Routes will be imported here
import authRoutes from './routes/auth';
import parcelRoutes from './routes/parcelRoutes';
import locationRoutes from './routes/locationRoutes';
import noteRoutes from './routes/noteRoutes';

// Load environment variables
dotenv.config();

const app = express();

// Middleware
app.use(cors());  // Cross-Origin Resource Sharing
app.use(express.json());  // JSON body parser

// Database connection
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/tapu_parsel_db';

mongoose.connect(MONGODB_URI)
  .then(() => {
    console.log('MongoDB bağlantısı başarılı');
  })
  .catch((error) => {
    console.error('MongoDB bağlantı hatası:', error);
  });

// Routes will be registered here
app.use('/api/auth', authRoutes);  // Tüm auth route'ları /api/auth altında olacak
app.use('/api/parcels', parcelRoutes);
app.use('/api/locations', locationRoutes);
app.use('/api/notes', noteRoutes);

// Base route
app.get('/', (_req: Request, res: Response) => {
  res.json({ message: 'Tapu Parsel API aktif' });
});

// Error handling middleware
app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Bir hata oluştu!' });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server ${PORT} portunda çalışıyor`);
});

export default app;
