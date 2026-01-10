import { AuthRequest } from '../middleware/auth.middleware';
import { UserRole } from '../models/User';
import { Response, NextFunction } from 'express';

export const requireRole = (roles: UserRole[]) => {
    return (req: AuthRequest, res: Response, next: NextFunction): void => {
        if (!req.user) {
            res.status(401).json({ error: 'Authentication required' });
            return;
        }

        if (!roles.includes(req.user.role)) {
            res.status(403).json({
                error: 'Forbidden',
                message: `This action requires one of the following roles: ${roles.join(', ')}`
            });
            return;
        }

        next();
    };
};
