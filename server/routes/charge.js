const express = require('express');
const logger = require('../lib/logger.js')('routes/charge.js');
const stripe = require('stripe')('sk_test_5H2syFmrwKcDYwa7QxCPW1mP');

const router = express.Router();

router.post('/charge', async (req, res) => {
  try {
    const { tokenId } = req.body;
    logger.info('Creating charge for %o...', tokenId);
    const customer = await stripe.customers.create({
      source: tokenId,
      email: 'asd@gmail.com',
    });
    logger.info('Created customer');
    logger.info(customer)

    const sub = await stripe.subscriptions.create({
      customer: customer.id,
      items: [{ plan: 'plan_DVACAMwAejoc4k' }],
    });
    logger.info('Created subscription');
    logger.info(sub)

    res.status(200);
    logger.info(`Created subscription: ${sub.id}`);
  } catch (err) {
    logger.error(err);
    res.sendStatus(500);
    return;
  }
});

module.exports = router;
