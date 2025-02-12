import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { User } from '../models/User';

// JWT secret key'i env'den al
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

// Kullanıcı kaydı
export const register = async (req: Request, res: Response): Promise<void> => {
  try {
    const { username, email, password } = req.body;

    // Email ve kullanıcı adı kontrolü
    const existingUser = await User.findOne({
      $or: [{ email }, { username }],
    });

    if (existingUser) {
      res.status(400).json({
        message: 'Bu email veya kullanıcı adı zaten kullanılıyor',
      });
      return;
    }

    // Yeni kullanıcı oluştur
    const user = new User({
      username,
      email,
      password, // Model pre-save hook'u şifreyi hashleyecek
    });

    // Kullanıcıyı kaydet
    await user.save();

    // JWT token oluştur
    const token = jwt.sign(
      { id: user._id },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    // Başarılı yanıt
    res.status(201).json({
      message: 'Kullanıcı başarıyla oluşturuldu',
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
      },
      token,
    });
  } catch (error) {
    console.error('Kayıt hatası:', error);
    res.status(500).json({
      message: 'Kayıt sırasında bir hata oluştu',
    });
  }
};

// Kullanıcı girişi
export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;

    // Email ile kullanıcıyı bul
    const user = await User.findOne({ email });

    if (!user) {
      res.status(401).json({
        message: 'Geçersiz email veya şifre',
      });
      return;
    }

    // Şifreyi kontrol et
    const isMatch = await user.comparePassword(password);

    if (!isMatch) {
      res.status(401).json({
        message: 'Geçersiz email veya şifre',
      });
      return;
    }

    // JWT token oluştur
    const token = jwt.sign(
      { id: user._id },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    // Başarılı yanıt
    res.json({
      message: 'Giriş başarılı',
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
      },
      token,
    });
  } catch (error) {
    console.error('Giriş hatası:', error);
    res.status(500).json({
      message: 'Giriş sırasında bir hata oluştu',
    });
  }
};
