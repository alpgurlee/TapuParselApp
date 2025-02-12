/**
 * Parsel İşlemleri Kontrolcüsü
 * 
 * Bu kontrolcü, parsel işlemleri için gerekli tüm fonksiyonları içerir:
 * - Parsel arama
 * - Parsel detaylarını görüntüleme
 * - Parsele not ekleme
 * 
 * @module controllers/parcelController
 */

import { Request, Response } from 'express';
import axios from 'axios';
import Parcel from '../models/Parcel';
import { AuthRequest } from '../middleware/authMiddleware';
import mongoose from 'mongoose';

/**
 * Verilen adres için Google Maps Geocoding API'sini kullanarak koordinatları alır
 * 
 * @param address - Koordinatları bulunacak adres (örn: "Mahalle, İlçe, İl")
 * @returns Promise<[number, number] | null> - [longitude, latitude] koordinat çifti veya hata durumunda null
 */
const getCoordinates = async (address: string): Promise<[number, number] | null> => {
  try {
    // Google Maps Geocoding API'sine istek gönder
    const response = await axios.get(
      `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(
        address
      )}&key=${process.env.GOOGLE_MAPS_API_KEY}`
    );

    // Sonuç varsa koordinatları döndür
    if (response.data.results && response.data.results.length > 0) {
      const location = response.data.results[0].geometry.location;
      return [location.lng, location.lat];
    }
    return null;
  } catch (error) {
    console.error('Geocoding hatası:', error);
    return null;
  }
};

/**
 * Parsel arama işlemini gerçekleştirir
 * 
 * Bu fonksiyon şu işlemleri yapar:
 * 1. Gelen parsel bilgilerinden adres oluşturur
 * 2. Google Maps API ile koordinatları alır
 * 3. Örnek parsel sınırları oluşturur (gerçek API entegrasyonu yapılana kadar)
 * 4. Parseli veritabanına kaydeder
 * 
 * @param req - Express Request nesnesi
 * @param res - Express Response nesnesi
 */
export const searchParcel = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { il, ilce, mahalle, ada } = req.body;

    // Adres oluştur
    const address = `${mahalle}, ${ilce}, ${il}`;

    // Koordinatları al
    const coordinates = await getCoordinates(address);

    if (!coordinates) {
      res.status(400).json({ message: 'Koordinatlar bulunamadı' });
      return;
    }

    // Örnek parsel sınırları oluştur (gerçek API entegrasyonu yapılana kadar)
    const [longitude, latitude] = coordinates;
    const boundaries = [
      [longitude - 0.001, latitude - 0.001],
      [longitude + 0.001, latitude - 0.001],
      [longitude + 0.001, latitude + 0.001],
      [longitude - 0.001, latitude + 0.001],
      [longitude - 0.001, latitude - 0.001],
    ];

    // Yeni parsel oluştur
    const parcel = new Parcel({
      il,
      ilce,
      mahalle,
      ada,
      coordinates: {
        type: 'Polygon',
        coordinates: [boundaries],
      },
      center: {
        type: 'Point',
        coordinates: [longitude, latitude],
      },
    });

    // Parseli kaydet
    await parcel.save();

    res.status(201).json({
      message: 'Parsel başarıyla oluşturuldu',
      parcel,
    });
  } catch (error) {
    console.error('Parsel arama hatası:', error);
    res.status(500).json({ message: 'Sunucu hatası' });
  }
};

/**
 * Belirli bir parselin detaylarını getirir
 * 
 * @param req - Express Request nesnesi (params.id: parsel ID'si)
 * @param res - Express Response nesnesi
 */
export const getParcelDetails = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const parcel = await Parcel.findById(req.params.id)
      .populate('notes.user', 'name email');

    if (!parcel) {
      res.status(404).json({ message: 'Parsel bulunamadı' });
      return;
    }

    res.json(parcel);
  } catch (error) {
    console.error('Parsel detay hatası:', error);
    res.status(500).json({ message: 'Sunucu hatası' });
  }
};

/**
 * Parsele yeni bir not ekler
 * 
 * @param req - Express Request nesnesi (params.id: parsel ID'si, body.note: eklenecek not)
 * @param res - Express Response nesnesi
 */
export const addNote = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { note } = req.body;
    const parcel = await Parcel.findById(req.params.id);

    if (!parcel) {
      res.status(404).json({ message: 'Parsel bulunamadı' });
      return;
    }

    if (!req.user) {
      res.status(401).json({ message: 'Not authorized' });
      return;
    }

    // Notu ekle
    parcel.notes.push({
      content: note,
      user: req.user._id,
      createdAt: new Date(),
    });

    // Parseli kaydet
    await parcel.save();

    // Güncel parseli kullanıcı bilgileriyle birlikte getir
    const updatedParcel = await Parcel.findById(req.params.id)
      .populate('notes.user', 'name email');

    res.json(updatedParcel);
  } catch (error) {
    console.error('Not ekleme hatası:', error);
    res.status(500).json({ message: 'Sunucu hatası' });
  }
};
