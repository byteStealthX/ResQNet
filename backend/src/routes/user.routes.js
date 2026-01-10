const express = require('express');
const { User } = require('../models');
const { authenticate, authorize } = require('../middleware/auth');

const router = express.Router();
router.use(authenticate);

// Get All Users (Admin only)
router.get('/', authorize('ADMIN', 'DISPATCHER'), async (req, res) => {
    try {
        const { role } = req.query;
        const where = {};
        if (role) where.role = role;

        const users = await User.findAll({ where });
        res.json({ users, count: users.length });
    } catch (error) {
        console.error('Get users error:', error);
        res.status(500).json({ error: 'Failed to fetch users' });
    }
});

// Get User by ID
router.get('/:id', async (req, res) => {
    try {
        const user = await User.findByPk(req.params.id);

        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        res.json({ user: user.toJSON() });
    } catch (error) {
        console.error('Get user error:', error);
        res.status(500).json({ error: 'Failed to fetch user' });
    }
});

// Update User Profile
router.patch('/:id', async (req, res) => {
    try {
        const user = await User.findByPk(req.params.id);

        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        // Check permissions
        if (req.user.id !== user.id && req.user.role !== 'ADMIN') {
            return res.status(403).json({ error: 'Access denied' });
        }

        const { firstName, lastName, phone } = req.body;

        if (firstName) user.firstName = firstName;
        if (lastName) user.lastName = lastName;
        if (phone) user.phone = phone;

        await user.save();

        res.json({
            message: 'User updated successfully',
            user: user.toJSON()
        });
    } catch (error) {
        console.error('Update user error:', error);
        res.status(500).json({ error: 'Failed to update user' });
    }
});

module.exports = router;
