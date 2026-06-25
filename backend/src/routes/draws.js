const express = require('express');
const router = express.Router();
const { simulateDraw, runDraw, publishDraw, getDraws, getLatestPublishedDraw } = require('../controllers/drawController');
const { authenticate, requireAdmin } = require('../middleware/auth');

router.get('/latest', getLatestPublishedDraw);
router.use(authenticate, requireAdmin);
router.get('/', getDraws);
router.post('/simulate', simulateDraw);
router.post('/run', runDraw);
router.put('/:drawId/publish', publishDraw);

module.exports = router;
