import { Request, Response, NextFunction } from 'express';
import { config } from '../config/environment';
import logger from '../utils/logger.util';

export const errorHandler = (
    err: any,
    req: Request,
    res: Response,
    next: NextFunction
): void => {
    logger.error('Error:', {
        message: err.message,
        stack: err.stack,
        path: req.path,
        method: req.method
    });

    const status = err.status || err.statusCode || 500;
    const message = err.message || 'Internal Server Error';

    res.status(status).json({
        error: config.nodeEnv === 'production' ? 'Server Error' : err.name,
        message,
        ...(config.nodeEnv === 'development' && { stack: err.stack }),
        timestamp: new Date().toISOString()
    });
};

export const notFoundHandler = (req: Request, res: Response): void => {
    res.status(404).json({
        error: 'Not Found',
        message: `Route ${req.method} ${req.url} not found`,
        timestamp: new Date().toISOString()
    });
};
