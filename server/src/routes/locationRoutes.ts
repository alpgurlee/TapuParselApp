import express from 'express';
import { getSehirler, getIlceler, getMahalleler } from '../controllers/locationController';

const router = express.Router();

// Şehir, ilçe ve mahalle route'ları
router.get('/sehirler', getSehirler);
router.get('/ilceler/:sehirId', getIlceler);
router.get('/mahalleler/:ilceId', getMahalleler);

export default router;
