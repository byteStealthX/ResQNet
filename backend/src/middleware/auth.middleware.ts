import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import User, { IUser } from '../models/User';
import { config } from '../config/environment';
import logger from '../utils/logger.util';

export interface AuthRequest extends Request {
    user?: IUser;
}

export const authenticate = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        const token = req.headers.authorization?.split(' ')[1];

        if (!token) {
            res.status(401).json({ error: 'Authentication required' });
            return;
        }

        const decoded = jwt.verify(token, config.jwt.secret) as { userId: string };
        const user = await User.findById(decoded.userId);

        if (!user || !user.isActive) {
            res.status(401).json({ error: 'Invalid or inactive user' });
            return;
        }

        req.user = user;
        next();
    } catch (error) {
        if (error instanceof jwt.TokenExpiredError) {
            res.status(401).json({ error: 'Token expired' });
            return;
        }
        logger.error('Authentication error:', error);
        res.status(401).json({ error: 'Invalid token' });
    }
};

export const authorize = (...roles: string[]) => {
    return (req: AuthRequest, res: Response, next: NextFunction): void => {
        if (!req.user) {
            res.status(401).json({ error: 'Authentication required' });
            return;
        }

        if (!roles.includes(req.user.role)) {
            res.status(403).json({
                error: 'Forbidden',
                message: 'Insufficient permissions'
            });
            return;
        }

        next();
    };
};
