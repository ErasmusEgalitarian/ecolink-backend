const express = require('express');
const router = express.Router();
const verifyToken = require('../middlewares/authMiddleware');
const {
    getAllRoles,
    changeUserRole
} = require('../controllers/roleController');

// ==================== READ ====================
router.get('/', verifyToken, getAllRoles);

// ==================== UPDATE ====================
router.put('/edit/:userId', verifyToken, changeUserRole);

module.exports = router;
