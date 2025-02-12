import { Request, Response } from 'express';
import Note from '../models/Note';

interface LocationInfo {
  il: string;
  ilce: string;
  mahalle: string;
  ada: string;
  parsel: string;
}

interface NoteBody {
  content: string;
  position: {
    lat: number;
    lng: number;
  };
  locationInfo: LocationInfo;
}

// Tüm notları getir
export const getNotes = async (_req: Request, res: Response): Promise<void> => {
  try {
    const notes = await Note.find();
    res.json({ success: true, data: notes });
  } catch (error) {
    console.error('Not getirme hatası:', error);
    res.status(500).json({ success: false, message: 'Notlar getirilirken bir hata oluştu' });
  }
};

// Yeni not ekle
export const createNote = async (req: Request<{}, {}, NoteBody>, res: Response): Promise<void> => {
  try {
    const note = new Note(req.body);
    await note.save();
    res.json({ success: true, data: note });
  } catch (error) {
    console.error('Not ekleme hatası:', error);
    res.status(500).json({ success: false, message: 'Not eklenirken bir hata oluştu' });
  }
};

// Not güncelle
export const updateNote = async (req: Request<{ id: string }, {}, NoteBody>, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const note = await Note.findByIdAndUpdate(
      id, 
      { ...req.body, updatedAt: new Date() },
      { new: true }
    );
    if (!note) {
      res.status(404).json({ success: false, message: 'Not bulunamadı' });
      return;
    }
    res.json({ success: true, data: note });
  } catch (error) {
    console.error('Not güncelleme hatası:', error);
    res.status(500).json({ success: false, message: 'Not güncellenirken bir hata oluştu' });
  }
};

// Not sil
export const deleteNote = async (req: Request<{ id: string }>, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const note = await Note.findByIdAndDelete(id);
    if (!note) {
      res.status(404).json({ success: false, message: 'Not bulunamadı' });
      return;
    }
    res.json({ success: true, message: 'Not başarıyla silindi' });
  } catch (error) {
    console.error('Not silme hatası:', error);
    res.status(500).json({ success: false, message: 'Not silinirken bir hata oluştu' });
  }
};
