const stripe = require('../config/stripe');
const Subscription = require('../models/Subscription');
const User = require('../models/User');

// Stripe Price IDs — replace with your actual Stripe Price IDs
const PRICE_IDS = {
  monthly: process.env.STRIPE_PRICE_MONTHLY || 'price_monthly_placeholder',
  yearly: process.env.STRIPE_PRICE_YEARLY || 'price_yearly_placeholder',
};

// Plan amounts in pence/cents (for prize pool calculation)
const PLAN_AMOUNTS = {
  monthly: 999,  // £9.99/month
  yearly: 9999,  // £99.99/year
};

/**
 * POST /api/subscriptions/create
 * Create a Stripe Checkout Session for monthly or yearly plan
 */
const createCheckoutSession = async (req, res) => {
  const { plan } = req.body;

  if (!['monthly', 'yearly'].includes(plan)) {
    return res.status(400).json({ success: false, message: 'Invalid plan. Choose monthly or yearly.' });
  }

  const user = await User.findById(req.user._id);
  if (user.subscriptionStatus === 'active') {
    return res.status(400).json({ success: false, message: 'You already have an active subscription' });
  }

  // Ensure Stripe customer exists
  let customerId = user.stripeCustomerId;
  if (!customerId) {
    const customer = await stripe.customers.create({
      email: user.email,
      name: user.name,
      metadata: { userId: user._id.toString() },
    });
    customerId = customer.id;
    user.stripeCustomerId = customerId;
    await user.save();
  }

  const session = await stripe.checkout.sessions.create({
    customer: customerId,
    payment_method_types: ['card'],
    line_items: [{ price: PRICE_IDS[plan], quantity: 1 }],
    mode: 'subscription',
    success_url: `${process.env.CLIENT_URL}/dashboard?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${process.env.CLIENT_URL}/subscribe?cancelled=true`,
    metadata: { userId: user._id.toString(), plan },
    subscription_data: { metadata: { userId: user._id.toString(), plan } },
  });

  return res.status(200).json({ success: true, sessionId: session.id, url: session.url });
};

/**
 * POST /api/subscriptions/cancel
 * Cancel subscription at end of current period
 */
const cancelSubscription = async (req, res) => {
  const sub = await Subscription.findOne({ userId: req.user._id });
  if (!sub || sub.status !== 'active') {
    return res.status(404).json({ success: false, message: 'No active subscription found' });
  }

  await stripe.subscriptions.update(sub.stripeSubscriptionId, {
    cancel_at_period_end: true,
  });

  sub.status = 'cancelled';
  sub.cancelledAt = new Date();
  await sub.save();

  await User.findByIdAndUpdate(req.user._id, { subscriptionStatus: 'cancelled' });

  return res.status(200).json({ success: true, message: 'Subscription cancelled at end of billing period' });
};

/**
 * GET /api/subscriptions/status
 */
const getStatus = async (req, res) => {
  const sub = await Subscription.findOne({ userId: req.user._id });
  return res.status(200).json({ success: true, subscription: sub });
};

module.exports = { createCheckoutSession, cancelSubscription, getStatus };
