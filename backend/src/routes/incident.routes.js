const express = require('express');
const { Incident, User } = require('../models');
const { authenticate, authorize } = require('../middleware/auth');

const router = express.Router();

// All routes require authentication
router.use(authenticate);

// Create Incident (Citizens can report)
router.post('/', async (req, res) => {
    try {
        const { type, severity, title, description, location, address } = req.body;

        if (!type || !title || !location) {
            return res.status(400).json({
                error: 'Validation Error',
                message: 'Type, title, and location are required'
            });
        }

        const incident = await Incident.create({
            reporterId: req.user.id,
            type,
            severity: severity || 'MEDIUM',
            title,
            description,
            location,
            address,
            status: 'REPORTED'
        });

        res.status(201).json({
            message: 'Incident reported successfully',
            incident
        });
    } catch (error) {
        console.error('Create incident error:', error);
        res.status(500).json({
            error: 'Server Error',
            message: error.message
        });
    }
});

// Get All Incidents (with filters)
router.get('/', authorize('DISPATCHER', 'ADMIN', 'RESPONDER'), async (req, res) => {
    try {
        const { status, type, severity } = req.query;

        const where = {};
        if (status) where.status = status;
        if (type) where.type = type;
        if (severity) where.severity = severity;

        const incidents = await Incident.findAll({
            where,
            include: [
                {
                    model: User,
                    as: 'reporter',
                    attributes: ['id', 'firstName', 'lastName', 'phone', 'email']
                },
                {
                    model: User,
                    as: 'assignedResponder',
                    attributes: ['id', 'firstName', 'lastName', 'phone']
                }
            ],
            order: [['createdAt', 'DESC']]
        });

        res.json({ incidents, count: incidents.length });
    } catch (error) {
        console.error('Get incidents error:', error);
        res.status(500).json({
            error: 'Server Error',
            message: 'Failed to fetch incidents'
        });
    }
});

// Get Single Incident
router.get('/:id', async (req, res) => {
    try {
        const incident = await Incident.findByPk(req.params.id, {
            include: [
                {
                    model: User,
                    as: 'reporter',
                    attributes: ['id', 'firstName', 'lastName', 'phone', 'email']
                },
                {
                    model: User,
                    as: 'assignedResponder',
                    attributes: ['id', 'firstName', 'lastName', 'phone']
                }
            ]
        });

        if (!incident) {
            return res.status(404).json({ error: 'Incident not found' });
        }

        // Check permissions
        if (req.user.role === 'CITIZEN' && incident.reporterId !== req.user.id) {
            return res.status(403).json({ error: 'Access denied' });
        }

        res.json({ incident });
    } catch (error) {
        console.error('Get incident error:', error);
        res.status(500).json({
            error: 'Server Error',
            message: 'Failed to fetch incident'
        });
    }
});

// Update Incident Status
router.patch('/:id/status', authorize('DISPATCHER', 'ADMIN', 'RESPONDER'), async (req, res) => {
    try {
        const { status } = req.body;
        const incident = await Incident.findByPk(req.params.id);

        if (!incident) {
            return res.status(404).json({ error: 'Incident not found' });
        }

        incident.status = status;

        if (status === 'DISPATCHED') {
            incident.dispatchedAt = new Date();
        } else if (status === 'ON_SCENE') {
            incident.arrivedAt = new Date();
        } else if (status === 'RESOLVED') {
            incident.resolvedAt = new Date();
        }

        await incident.save();

        res.json({
            message: 'Incident status updated',
            incident
        });
    } catch (error) {
        console.error('Update status error:', error);
        res.status(500).json({
            error: 'Server Error',
            message: 'Failed to update incident status'
        });
    }
});

// Assign Responder
router.patch('/:id/assign', authorize('DISPATCHER', 'ADMIN'), async (req, res) => {
    try {
        const { responderId } = req.body;
        const incident = await Incident.findByPk(req.params.id);

        if (!incident) {
            return res.status(404).json({ error: 'Incident not found' });
        }

        // Verify responder exists
        const responder = await User.findByPk(responderId);
        if (!responder || responder.role !== 'RESPONDER') {
            return res.status(400).json({ error: 'Invalid responder' });
        }

        incident.assignedResponderId = responderId;
        incident.status = 'DISPATCHED';
        incident.dispatchedAt = new Date();
        await incident.save();

        res.json({
            message: 'Responder assigned successfully',
            incident
        });
    } catch (error) {
        console.error('Assign responder error:', error);
        res.status(500).json({
            error: 'Server Error',
            message: 'Failed to assign responder'
        });
    }
});

// Get My Incidents (for citizens)
router.get('/my/reported', async (req, res) => {
    try {
        const incidents = await Incident.findAll({
            where: { reporterId: req.user.id },
            include: [
                {
                    model: User,
                    as: 'assignedResponder',
                    attributes: ['id', 'firstName', 'lastName', 'phone']
                }
            ],
            order: [['createdAt', 'DESC']]
        });

        res.json({ incidents, count: incidents.length });
    } catch (error) {
        console.error('Get my incidents error:', error);
        res.status(500).json({
            error: 'Server Error',
            message: 'Failed to fetch incidents'
        });
    }
});

// Get Assigned Incidents (for responders)
router.get('/my/assigned', authorize('RESPONDER'), async (req, res) => {
    try {
        const incidents = await Incident.findAll({
            where: { assignedResponderId: req.user.id },
            include: [
                {
                    model: User,
                    as: 'reporter',
                    attributes: ['id', 'firstName', 'lastName', 'phone', 'email']
                }
            ],
            order: [['createdAt', 'DESC']]
        });

        res.json({ incidents, count: incidents.length });
    } catch (error) {
        console.error('Get assigned incidents error:', error);
        res.status(500).json({
            error: 'Server Error',
            message: 'Failed to fetch assigned incidents'
        });
    }
});

module.exports = router;
