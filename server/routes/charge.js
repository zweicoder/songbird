const express = require('express');
const logger = require('../lib/logger.js')('routes/charge.js');
const { stripe } = require('../services/stripeService.js');
const { makeUserPremiumByToken } = require('../services/dbService.js');

const router = express.Router();

const ONE_DOLLAR_PLAN = 'plan_DVACAMwAejoc4k';
async function createStripeSubscription(tokenId, email) {
  const customer = await stripe.customers.create({
    source: tokenId,
    email,
  });
  logger.info(`Created customer: ${customer.email} - ${customer.id}`);

  const sub = await stripe.subscriptions.create({
    customer: customer.id,
    items: [{ plan: ONE_DOLLAR_PLAN }],
  });
  return sub;
}

router.post('/charge', async (req, res) => {
  let sub;
  const { tokenId, email, refreshToken } = req.body;
  try {
    sub = await createStripeSubscription(tokenId, email);
    res.sendStatus(200);
  } catch (err) {
    logger.error(err);
    res.sendStatus(500);
    return;
  }

  if (sub.status !== 'active') {
    logger.info('Could not charge subscription?');
    res.sendStatus(500);
    return;
  }
  logger.info(`Created subscription: ${sub.id}`);
  try {
    makeUserPremiumByToken(refreshToken, sub.id);
  } catch (err) {
    // Might already have charged user, manually set user as premium if necessary!
    logger.error(err);
    logger.error('Failed to make user premium!!');
    logger.error('RefreshToken: %o | Subscription: %o', refreshToken, sub.id);
    return;
  }
});

module.exports = router;
