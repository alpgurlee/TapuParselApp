import express from 'express';
import { searchParcel, getParcelDetails, addNote } from '../controllers/parcelController';
import { protect } from '../middleware/authMiddleware';

const router = express.Router();

// Tüm rotalar için auth middleware'i kullan
router.use(protect);

// Parsel arama
router.post('/search', searchParcel);

// Parsel detayları
router.get('/:id', getParcelDetails);

// Not ekleme
router.post('/:id/notes', addNote);

export default router;
