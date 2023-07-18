import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

interface AuthenticatedRequest extends Request {
  userId?: number;
}

export const authenticate = (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) {
    res.status(401).json({ error: 'Authentication required' });
    return;
  }
  try {
    const decodedToken = jwt.verify(token, 'secret');
    req.userId = (decodedToken as { userId: number }).userId;
    next();
  } catch (error) {
    res.status(401).json({ error: 'Invalid token' });
  }
};