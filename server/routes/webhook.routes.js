const express = require('express');
const router = express.Router();
const stripe = require('../config/stripe');
const Subscription = require('../models/Subscription');
const User = require('../models/User');

// IMPORTANT: This route must receive the raw body — handled in server.js
const handleWebhook = async (req, res) => {
  const sig = req.headers['stripe-signature'];
  let event;

  try {
    event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    console.error('Webhook signature error:', err.message);
    return res.status(400).json({ error: `Webhook Error: ${err.message}` });
  }

  const data = event.data.object;

  switch (event.type) {
    // ── Subscription Created ──────────────────────────────────────────────────
    case 'customer.subscription.created': {
      const userId = data.metadata?.userId;
      if (!userId) break;

      const plan = data.metadata?.plan || 'monthly';
      const amount = data.items?.data?.[0]?.price?.unit_amount || 0;
      const charityPct = 10; // default; updated after user profile loads
      const prizePortion = Math.round(amount * ((100 - charityPct) / 100));

      await Subscription.findOneAndUpdate(
        { userId },
        {
          userId,
          plan,
          status: 'active',
          stripeSubscriptionId: data.id,
          stripeCustomerId: data.customer,
          currentPeriodStart: new Date(data.current_period_start * 1000),
          currentPeriodEnd: new Date(data.current_period_end * 1000),
          renewalDate: new Date(data.current_period_end * 1000),
          prizePortion,
        },
        { upsert: true, returnDocument: 'after' }
      );

      await User.findByIdAndUpdate(userId, { subscriptionStatus: 'active' });
      break;
    }

    // ── Subscription Updated ──────────────────────────────────────────────────
    case 'customer.subscription.updated': {
      const sub = await Subscription.findOne({ stripeSubscriptionId: data.id });
      if (!sub) break;

      sub.status = data.status === 'active' ? 'active' : data.status;
      sub.currentPeriodStart = new Date(data.current_period_start * 1000);
      sub.currentPeriodEnd = new Date(data.current_period_end * 1000);
      sub.renewalDate = new Date(data.current_period_end * 1000);
      await sub.save();

      await User.findByIdAndUpdate(sub.userId, {
        subscriptionStatus: sub.status === 'active' ? 'active' : sub.status,
      });
      break;
    }

    // ── Subscription Deleted ──────────────────────────────────────────────────
    case 'customer.subscription.deleted': {
      const sub = await Subscription.findOneAndUpdate(
        { stripeSubscriptionId: data.id },
        { status: 'cancelled', cancelledAt: new Date() },
        { returnDocument: 'after' }
      );
      if (sub) {
        await User.findByIdAndUpdate(sub.userId, { subscriptionStatus: 'cancelled' });
      }
      break;
    }

    // ── Payment Succeeded ─────────────────────────────────────────────────────
    case 'invoice.payment_succeeded': {
      const subId = data.subscription;
      if (subId) {
        await Subscription.findOneAndUpdate(
          { stripeSubscriptionId: subId },
          { status: 'active' }
        );
        const sub = await Subscription.findOne({ stripeSubscriptionId: subId });
        if (sub) {
          await User.findByIdAndUpdate(sub.userId, { subscriptionStatus: 'active' });
        }
      }
      break;
    }

    // ── Payment Failed ────────────────────────────────────────────────────────
    case 'invoice.payment_failed': {
      const subId = data.subscription;
      if (subId) {
        const sub = await Subscription.findOneAndUpdate(
          { stripeSubscriptionId: subId },
          { status: 'lapsed' },
          { returnDocument: 'after' }
        );
        if (sub) {
          await User.findByIdAndUpdate(sub.userId, { subscriptionStatus: 'lapsed' });
        }
      }
      break;
    }

    default:
      console.log(`Unhandled Stripe event: ${event.type}`);
  }

  return res.status(200).json({ received: true });
};

// POST /api/webhook/stripe — raw body parsing handled in server.js
router.post('/stripe', express.raw({ type: 'application/json' }), handleWebhook);

module.exports = router;
