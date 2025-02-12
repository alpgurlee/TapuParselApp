import { Request, Response } from 'express';
import fs from 'fs/promises';
import path from 'path';

// Dosya okuma yardımcı fonksiyonu
const readJsonFile = async (filename: string) => {
  const filePath = path.join(__dirname, '..', 'data', filename);
  const data = await fs.readFile(filePath, 'utf-8');
  return JSON.parse(data);
};

// Tüm şehirleri getir
export const getSehirler = async (_req: Request, res: Response) => {
  try {
    const sehirler = await readJsonFile('sehirler.json');
    res.json({ success: true, data: sehirler });
  } catch (error) {
    console.error('Şehirler getirme hatası:', error);
    res.status(500).json({ success: false, message: 'Şehirler getirilirken bir hata oluştu' });
  }
};

// Şehre göre ilçeleri getir
export const getIlceler = async (req: Request, res: Response) => {
  try {
    const { sehirId } = req.params;
    const ilceler = await readJsonFile('ilceler.json');
    const filteredIlceler = ilceler.filter((ilce: any) => ilce.sehir_id === sehirId);
    res.json({ success: true, data: filteredIlceler });
  } catch (error) {
    console.error('İlçeler getirme hatası:', error);
    res.status(500).json({ success: false, message: 'İlçeler getirilirken bir hata oluştu' });
  }
};

// İlçeye göre mahalleleri getir
export const getMahalleler = async (req: Request, res: Response) => {
  try {
    const { ilceId } = req.params;
    const mahalleler = [];
    
    // Tüm mahalle dosyalarını oku
    for (let i = 1; i <= 4; i++) {
      try {
        const mahalleData = await readJsonFile(`mahalleler-${i}.json`);
        mahalleler.push(...mahalleData);
      } catch (error) {
        console.error(`mahalleler-${i}.json okuma hatası:`, error);
      }
    }

    const filteredMahalleler = mahalleler.filter((mahalle: any) => mahalle.ilce_id === ilceId);
    res.json({ success: true, data: filteredMahalleler });
  } catch (error) {
    console.error('Mahalleler getirme hatası:', error);
    res.status(500).json({ success: false, message: 'Mahalleler getirilirken bir hata oluştu' });
  }
};
