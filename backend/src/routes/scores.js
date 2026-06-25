const express = require('express');
const router = express.Router();
const { getScores, addScore, updateScore, deleteScore } = require('../controllers/scoreController');
const { authenticate, requireSubscription } = require('../middleware/auth');

router.use(authenticate);
router.get('/', getScores);
router.post('/', requireSubscription, addScore);
router.put('/:id', requireSubscription, updateScore);
router.delete('/:id', requireSubscription, deleteScore);

module.exports = router;
