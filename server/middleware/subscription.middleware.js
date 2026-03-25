/**
 * Middleware: Require active subscription.
 * Must be used AFTER the protect middleware.
 */
const requireActiveSubscription = (req, res, next) => {
  if (req.user && req.user.subscriptionStatus === 'active') {
    return next();
  }
  return res.status(403).json({
    success: false,
    message: 'An active subscription is required to access this resource',
    code: 'SUBSCRIPTION_REQUIRED',
  });
};

module.exports = { requireActiveSubscription };
