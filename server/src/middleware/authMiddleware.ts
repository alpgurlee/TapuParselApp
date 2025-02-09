import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import User from '../models/User';

// JWT token'ından kullanıcı bilgilerini çıkarmak için interface
interface JwtPayload {
  id: string;
}

// Request tipini genişlet
declare global {
  namespace Express {
    interface Request {
      user?: any;
    }
  }
}

// Kullanıcı girişi kontrolü middleware'i
export const protect = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  let token: string | undefined;

  // Authorization header'ından token'ı al
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    try {
      // Token'ı ayır
      token = req.headers.authorization.split(' ')[1];

      // Token'ı doğrula
      const decoded = jwt.verify(
        token,
        process.env.JWT_SECRET || ''
      ) as JwtPayload;

      // Kullanıcıyı bul ve request'e ekle
      req.user = await User.findById(decoded.id).select('-password');

      next();
    } catch (error) {
      console.error('Auth middleware hatası:', error);
      res.status(401).json({
        success: false,
        message: 'Yetkilendirme başarısız',
      });
    }
  }

  if (!token) {
    res.status(401).json({
      success: false,
      message: 'Token bulunamadı',
    });
  }
};
