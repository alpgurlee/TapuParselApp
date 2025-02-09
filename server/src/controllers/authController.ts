import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/User';

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
      { userId: user._id },
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
      message: 'Kayıt işlemi sırasında bir hata oluştu',
    });
  }
};

// Kullanıcı girişi
export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;

    console.log('Login attempt:', { email }); // Debug log

    // Kullanıcıyı bul
    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      console.log('User not found:', email); // Debug log
      res.status(401).json({
        message: 'Email veya şifre hatalı',
      });
      return;
    }

    // Şifreyi kontrol et
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      console.log('Password mismatch for user:', email); // Debug log
      res.status(401).json({
        message: 'Email veya şifre hatalı',
      });
      return;
    }

    console.log('Login successful:', email); // Debug log

    // JWT token oluştur
    const token = jwt.sign(
      { userId: user._id },
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
