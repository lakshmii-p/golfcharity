const express = require('express');
const router = express.Router();
const { getCharities, getCharity, createCharity, updateCharity, deleteCharity } = require('../controllers/charityController');
const { authenticate, requireAdmin } = require('../middleware/auth');

router.get('/', getCharities);
router.get('/:id', getCharity);
router.use(authenticate, requireAdmin);
router.post('/', createCharity);
router.put('/:id', updateCharity);
router.delete('/:id', deleteCharity);

module.exports = router;
