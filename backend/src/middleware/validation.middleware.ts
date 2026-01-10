import { Request, Response, NextFunction } from 'express';
import Joi, { ObjectSchema } from 'joi';
import logger from '../utils/logger.util';

export const validate = (schema: ObjectSchema) => {
    return (req: Request, res: Response, next: NextFunction): void => {
        const { error, value } = schema.validate(req.body, {
            abortEarly: false,
            stripUnknown: true
        });

        if (error) {
            const errorMessage = error.details.map(detail => detail.message).join(', ');
            logger.warn(`Validation error: ${errorMessage}`);
            res.status(400).json({
                error: 'Validation Error',
                message: errorMessage,
                details: error.details
            });
            return;
        }

        req.body = value;
        next();
    };
};
