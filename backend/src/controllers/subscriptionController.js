const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const supabase = require('../utils/supabase');

const createCheckoutSession = async (req, res) => {
  try {
    const { plan } = req.body;
    const priceId = plan === 'yearly'
      ? process.env.STRIPE_YEARLY_PRICE_ID
      : process.env.STRIPE_MONTHLY_PRICE_ID;

    if (!process.env.STRIPE_SECRET_KEY || process.env.STRIPE_SECRET_KEY === 'sk_test_placeholder') {
      return res.status(400).json({ error: 'Stripe not configured' });
    }

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      mode: 'subscription',
      customer_email: req.user.email,
      line_items: [{ price: priceId, quantity: 1 }],
      metadata: { userId: req.user.id, plan },
      success_url: `${process.env.FRONTEND_URL}/dashboard?subscribed=true`,
      cancel_url: `${process.env.FRONTEND_URL}/subscribe?cancelled=true`,
    });

    res.json({ url: session.url });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Stripe not available' });
  }
};

// Demo activate — bypasses Stripe for testing
const demoActivate = async (req, res) => {
  try {
    const { plan } = req.body;
    const renewalDate = new Date();
    if (plan === 'yearly') {
      renewalDate.setFullYear(renewalDate.getFullYear() + 1);
    } else {
      renewalDate.setMonth(renewalDate.getMonth() + 1);
    }

    const { data: user, error } = await supabase
      .from('users')
      .update({
        subscription_status: 'active',
        subscription_plan: plan || 'monthly',
        subscription_renewal_date: renewalDate.toISOString(),
        stripe_customer_id: 'demo_customer',
        stripe_subscription_id: 'demo_subscription',
      })
      .eq('id', req.user.id)
      .select()
      .single();

    if (error) throw error;

    // Add demo prize pool contribution
    await supabase.from('prize_pool_contributions').insert({
      user_id: req.user.id,
      amount: plan === 'yearly' ? 53.99 : 5.99,
      period_start: new Date().toISOString(),
      period_end: renewalDate.toISOString(),
    });

    const { password: _, ...userSafe } = user;
    res.json({ user: userSafe, message: 'Demo subscription activated' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to activate demo subscription' });
  }
};

const createPortalSession = async (req, res) => {
  try {
    const { data: user } = await supabase
      .from('users')
      .select('stripe_customer_id')
      .eq('id', req.user.id)
      .single();

    if (!user?.stripe_customer_id || user.stripe_customer_id === 'demo_customer') {
      return res.status(400).json({ error: 'Demo mode: billing portal not available' });
    }

    const session = await stripe.billingPortal.sessions.create({
      customer: user.stripe_customer_id,
      return_url: `${process.env.FRONTEND_URL}/dashboard`,
    });

    res.json({ url: session.url });
  } catch (err) {
    res.status(500).json({ error: 'Billing portal not available in demo mode' });
  }
};

const handleWebhook = async (req, res) => {
  const sig = req.headers['stripe-signature'];
  let event;

  try {
    event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    return res.status(400).json({ error: `Webhook error: ${err.message}` });
  }

  const session = event.data.object;

  switch (event.type) {
    case 'checkout.session.completed': {
      const userId = session.metadata.userId;
      const customerId = session.customer;
      const subscriptionId = session.subscription;
      const plan = session.metadata.plan;

      const subscription = await stripe.subscriptions.retrieve(subscriptionId);
      const renewalDate = new Date(subscription.current_period_end * 1000).toISOString();

      await supabase.from('users').update({
        stripe_customer_id: customerId,
        stripe_subscription_id: subscriptionId,
        subscription_status: 'active',
        subscription_plan: plan,
        subscription_renewal_date: renewalDate,
      }).eq('id', userId);

      const amount = subscription.items.data[0].price.unit_amount / 100;
      const prizeContribution = amount * 0.6;

      await supabase.from('prize_pool_contributions').insert({
        user_id: userId,
        amount: prizeContribution,
        period_start: new Date(subscription.current_period_start * 1000).toISOString(),
        period_end: renewalDate,
      });
      break;
    }
    case 'customer.subscription.updated': {
      const status = session.status === 'active' ? 'active' : session.status === 'canceled' ? 'cancelled' : 'lapsed';
      const renewalDate = new Date(session.current_period_end * 1000).toISOString();
      await supabase.from('users').update({ subscription_status: status, subscription_renewal_date: renewalDate }).eq('stripe_customer_id', session.customer);
      break;
    }
    case 'customer.subscription.deleted': {
      await supabase.from('users').update({ subscription_status: 'cancelled' }).eq('stripe_customer_id', session.customer);
      break;
    }
    case 'invoice.payment_failed': {
      await supabase.from('users').update({ subscription_status: 'lapsed' }).eq('stripe_customer_id', session.customer);
      break;
    }
  }

  res.json({ received: true });
};

const getSubscriptionStatus = async (req, res) => {
  const { subscription_status, subscription_plan, subscription_renewal_date } = req.user;
  res.json({ status: subscription_status, plan: subscription_plan, renewalDate: subscription_renewal_date });
};

module.exports = { createCheckoutSession, demoActivate, createPortalSession, handleWebhook, getSubscriptionStatus };
