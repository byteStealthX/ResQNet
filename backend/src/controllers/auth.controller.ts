import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import User, { UserRole, IUser } from '../models/User';
import { config } from '../config/environment';
import logger from '../utils/logger.util';
import Joi from 'joi';

const signupSchema = Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().min(8).required(),
    firstName: Joi.string().required(),
    lastName: Joi.string().required(),
    phone: Joi.string().required(),
    role: Joi.string().valid(...Object.values(UserRole)).default(UserRole.PATIENT)
});

const loginSchema = Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().required()
});

class AuthController {
    async signup(req: Request, res: Response): Promise<void> {
        try {
            const { error } = signupSchema.validate(req.body);
            if (error) {
                res.status(400).json({ error: 'Validation Error', message: error.details[0].message });
                return;
            }

            const { email, password, firstName, lastName, phone, role } = req.body;

            const existingUser = await User.findOne({ email });
            if (existingUser) {
                res.status(409).json({ error: 'Conflict', message: 'User already exists' });
                return;
            }

            const user = await User.create({
                email,
                password,
                firstName,
                lastName,
                phone,
                role: role || UserRole.PATIENT
            });

            const token = jwt.sign(
                { userId: user._id, role: user.role },
                config.jwt.secret,
                { expiresIn: config.jwt.expiresIn }
            );

            logger.info(`User registered: ${email}`);

            res.status(201).json({
                message: 'User created successfully',
                user: user.toJSON(),
                token
            });
        } catch (error) {
            logger.error('Signup error:', error);
            res.status(500).json({ error: 'Server Error', message: 'Failed to create user' });
        }
    }

    async login(req: Request, res: Response): Promise<void> {
        try {
            const { error } = loginSchema.validate(req.body);
            if (error) {
                res.status(400).json({ error: 'Validation Error', message: error.details[0].message });
                return;
            }

            const { email, password } = req.body;

            const user = await User.findOne({ email });
            if (!user) {
                res.status(401).json({ error: 'Authentication Failed', message: 'Invalid credentials' });
                return;
            }

            const isPasswordValid = await user.comparePassword(password);
            if (!isPasswordValid) {
                res.status(401).json({ error: 'Authentication Failed', message: 'Invalid credentials' });
                return;
            }

            if (!user.isActive) {
                res.status(403).json({ error: 'Forbidden', message: 'Account is inactive' });
                return;
            }

            user.lastLogin = new Date();
            await user.save();

            const token = jwt.sign(
                { userId: user._id, role: user.role },
                config.jwt.secret,
                { expiresIn: config.jwt.expiresIn }
            );

            logger.info(`User logged in: ${email}`);

            res.json({
                message: 'Login successful',
                user: user.toJSON(),
                token
            });
        } catch (error) {
            logger.error('Login error:', error);
            res.status(500).json({ error: 'Server Error', message: 'Failed to login' });
        }
    }

    async getProfile(req: any, res: Response): Promise<void> {
        try {
            res.json({ user: req.user.toJSON() });
        } catch (error) {
            logger.error('Get profile error:', error);
            res.status(500).json({ error: 'Server Error' });
        }
    }
}

export default new AuthController();
