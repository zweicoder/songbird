const STRIPE_KEY = process.env.STRIPE_KEY || 'sk_test_5H2syFmrwKcDYwa7QxCPW1mP';
const stripe = require('stripe')(STRIPE_KEY);

async function isSubscriptionActive(subId) {
  if (!subId) {
    return false;
  }
  const sub = await stripe.subscriptions.retrieve(subId);
  // Use retry rules to set how long something can remain in 'past_due'
  return sub.status !== 'cancelled' && sub.status !== 'unpaid';
}

module.exports = {
  stripe,
};
