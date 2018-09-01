const express = require('express');
const logger = require('../lib/logger.js')('routes/charge.js');
const { stripe } = require('../services/stripeService.js');
const { makeUserPremiumByToken } = require('../services/dbService.js');

const router = express.Router();

const ONE_DOLLAR_PLAN = 'plan_DVACAMwAejoc4k';
router.post('/charge', async (req, res) => {
  try {
    const { tokenId, email, refreshToken } = req.body;
    logger.info('Creating charge for %o...', tokenId);
    const customer = await stripe.customers.create({
      source: tokenId,
      email,
    });
    logger.info(`Created customer: ${customer.email} - ${customer.id}`);

    const sub = await stripe.subscriptions.create({
      customer: customer.id,
      items: [{ plan: ONE_DOLLAR_PLAN }],
    });
    if (!sub.active) {
      logger.warn('Unable to charge card?');
      logger.warn('%o', sub.id);
      res.sendStatus(500);
      return;
    }
    logger.info(`Created subscription: ${sub.id}`);

    res.sendStatus(200);
    makeUserPremiumByToken(refreshToken, customer.id);
  } catch (err) {
    logger.error(err);
    res.sendStatus(500);
    return;
  }
});

module.exports = router;
