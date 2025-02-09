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
 * @param req - Express Request nesnesi (body'de il, ilce, mahalle, ada, parsel bilgileri olmalı)
 * @param res - Express Response nesnesi
 */
export const searchParcel = async (req: Request, res: Response): Promise<void> => {
  try {
    const { il, ilce, mahalle, ada, parsel } = req.body;

    // Tam adresi oluştur
    const address = `${mahalle} Mahallesi, ${ilce}, ${il}, Türkiye`;
    
    // Koordinatları al
    const coordinates = await getCoordinates(address);
    
    if (!coordinates) {
      res.status(404).json({
        success: false,
        message: 'Konum bulunamadı',
      });
      return;
    }

    // Örnek parsel sınırları oluştur (0.001 derece yaklaşık 111 metre)
    const parcelBoundaries = [
      [
        [coordinates[0] - 0.001, coordinates[1] - 0.001],
        [coordinates[0] + 0.001, coordinates[1] - 0.001],
        [coordinates[0] + 0.001, coordinates[1] + 0.001],
        [coordinates[0] - 0.001, coordinates[1] + 0.001],
        [coordinates[0] - 0.001, coordinates[1] - 0.001],
      ],
    ];

    // Yeni parsel oluştur ve kaydet
    const newParcel = new Parcel({
      userId: req.user?._id,
      il,
      ilce,
      mahalle,
      ada,
      parsel,
      geometry: {
        type: 'Polygon',
        coordinates: parcelBoundaries,
      },
      notes: [],
    });

    await newParcel.save();

    res.status(200).json({
      success: true,
      data: {
        ...newParcel.toObject(),
        center: coordinates,
      },
    });
  } catch (error) {
    console.error('Parsel arama hatası:', error);
    res.status(500).json({
      success: false,
      message: 'Parsel arama sırasında bir hata oluştu',
    });
  }
};

/**
 * Belirli bir parselin detaylarını getirir
 * 
 * @param req - Express Request nesnesi (params.id: parsel ID'si)
 * @param res - Express Response nesnesi
 */
export const getParcelDetails = async (req: Request, res: Response): Promise<void> => {
  try {
    const parcel = await Parcel.findById(req.params.id);
    
    if (!parcel) {
      res.status(404).json({
        success: false,
        message: 'Parsel bulunamadı',
      });
      return;
    }

    res.status(200).json({
      success: true,
      data: parcel,
    });
  } catch (error) {
    console.error('Parsel detay hatası:', error);
    res.status(500).json({
      success: false,
      message: 'Parsel detayları alınırken bir hata oluştu',
    });
  }
};

/**
 * Parsele yeni bir not ekler
 * 
 * @param req - Express Request nesnesi (params.id: parsel ID'si, body.note: eklenecek not)
 * @param res - Express Response nesnesi
 */
export const addNote = async (req: Request, res: Response): Promise<void> => {
  try {
    const { note } = req.body;
    const parcel = await Parcel.findById(req.params.id);
    
    if (!parcel) {
      res.status(404).json({
        success: false,
        message: 'Parsel bulunamadı',
      });
      return;
    }

    // Yeni notu ekle
    parcel.notes.push({
      content: note,
      createdAt: new Date(),
      userId: req.user?._id,
    });

    await parcel.save();

    res.status(200).json({
      success: true,
      data: parcel,
    });
  } catch (error) {
    console.error('Not ekleme hatası:', error);
    res.status(500).json({
      success: false,
      message: 'Not eklenirken bir hata oluştu',
    });
  }
};
