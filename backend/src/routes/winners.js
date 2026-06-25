const express = require('express');
const router = express.Router();
const { getMyWinnings, uploadProof, getAllWinners, verifyWinner, markPaid } = require('../controllers/winnerController');
const { authenticate, requireAdmin } = require('../middleware/auth');

router.use(authenticate);
router.get('/my', getMyWinnings);
router.put('/:winnerId/proof', uploadProof);

// Admin
router.get('/', requireAdmin, getAllWinners);
router.put('/:winnerId/verify', requireAdmin, verifyWinner);
router.put('/:winnerId/pay', requireAdmin, markPaid);

module.exports = router;
