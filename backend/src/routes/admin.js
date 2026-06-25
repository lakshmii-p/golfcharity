const express = require('express');
const router = express.Router();
const { getStats, getUsers, getUserDetail, updateUser, adminEditScore } = require('../controllers/adminController');
const { authenticate, requireAdmin } = require('../middleware/auth');

router.use(authenticate, requireAdmin);
router.get('/stats', getStats);
router.get('/users', getUsers);
router.get('/users/:id', getUserDetail);
router.put('/users/:id', updateUser);
router.put('/scores/:scoreId', adminEditScore);

module.exports = router;
