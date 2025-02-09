import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { IUser } from '../models/User';

interface AuthRequest extends Request {
  user?: IUser;
}

export const auth = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');

    if (!token) {
      throw new Error();
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'default_secret') as { _id: string };
    
    // You can add user fetching logic here if needed
    // const user = await User.findOne({ _id: decoded._id });
    
    req.user = decoded as any;
    next();
  } catch (error) {
    res.status(401).json({ message: 'Please authenticate.' });
  }
};
