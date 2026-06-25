const express = require('express');
const router = express.Router();
const { createCheckoutSession, demoActivate, createPortalSession, handleWebhook, getSubscriptionStatus } = require('../controllers/subscriptionController');
const { authenticate } = require('../middleware/auth');

// Stripe webhook must use raw body
router.post('/webhook', express.raw({ type: 'application/json' }), handleWebhook);

router.use(authenticate);
router.post('/checkout', createCheckoutSession);
router.post('/demo-activate', demoActivate);
router.post('/portal', createPortalSession);
router.get('/status', getSubscriptionStatus);

module.exports = router;