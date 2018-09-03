const express = require('express');
const logger = require('../lib/logger.js')('routes/charge.js');
const { stripe } = require('../services/stripeService.js');
const {
  registerPremiumUserByToken,
  getUserByToken,
} = require('../services/dbService.js');

const router = express.Router();

const ONE_DOLLAR_PLAN =
  process.env.NODE_ENV === 'production'
    ? 'plan_DXG3C9jMOD4TCZ'
    : 'plan_DVACAMwAejoc4k';

async function createStripeSubscription(customerId) {
  const sub = await stripe.subscriptions.create({
    customer: customerId,
    items: [{ plan: ONE_DOLLAR_PLAN }],
  });
  return sub;
}
async function createStripeCustomer(stripeTokenId, email) {
  const customer = await stripe.customers.create({
    source: stripeTokenId,
    email,
  });
  return customer;
}

router.post('/charge', async (req, res) => {
  let sub;
  let customer;
  const { tokenId: stripeTokenId, email, refreshToken } = req.body;
  if (![stripeTokenId, email, refreshToken].every(e => !!e)) {
    logger.info('Request body missing parameters!');
    res.sendStatus(400);
    return;
  }
  try {
    const {result: dbUser} = await getUserByToken(refreshToken);
    const {
      stripe_sub_id: stripeSubId,
      stripe_customer_id: stripeCustomerId,
    } = dbUser;
    // Be nice and don't double charge
    if (stripeSubId) {
      const existingSub = await stripe.subscriptions.retrieve(stripeSubId);
      if (existingSub.status === 'active') {
        logger.info('Found existing active subscription for user');
        logger.info('Aborting!');
        res
          .status(400)
          .json({ message: 'You already have an existing subscription!' });
        return;
      }
    }

    // Create user if not exists
    if (stripeCustomerId) {
      logger.info('Found existing stripe customer!');
      customer = await stripe.customers.retrieve(stripeCustomerId);
    } else {
      logger.info('Creating new stripe customer...');
      customer = await createStripeCustomer(stripeTokenId, email);
    }
    logger.info(`Customer: ${customer.email} - ${customer.id}`);

    sub = await createStripeSubscription(customer.id, email);
    // Confirm that we can charge user
    if (sub.status !== 'active') {
      logger.info('Could not charge subscription?');
      res.sendStatus(500);
      return;
    }
    res.sendStatus(200);
    logger.info(`Created subscription: ${sub.id}`);
  } catch (err) {
    if (err.message) {
      res.status(400).json(err);
      return;
    }
    logger.error(
      'Unexpected error while creating stripe subscription: %o',
      err
    );
    res.status(500).json(err);
    return;
  }

  try {
    registerPremiumUserByToken(refreshToken, sub.id, customer.id);
  } catch (err) {
    // Might already have charged user, manually set user as premium if necessary!
    logger.error(err);
    logger.error('Failed to make user premium!!');
    logger.error(
      'RefreshToken: %o | Subscription: %o | Customer: %o',
      refreshToken,
      sub.id,
      customer.id
    );
    res.status(500).json(err);
    return;
  }
});

module.exports = router;
