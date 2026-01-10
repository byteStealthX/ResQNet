const express = require('express');
const { authenticate, authorize } = require('../middleware/auth');

const router = express.Router();
router.use(authenticate);

// Placeholder for resource management
router.get('/', authorize('DISPATCHER', 'ADMIN'), async (req, res) => {
    res.json({
        message: 'Resource management endpoints',
        resources: []
    });
});

module.exports = router;
