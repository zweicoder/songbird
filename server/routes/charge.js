const express = require('express');
const logger = require('../lib/logger.js')('routes/charge.js');
const stripe = require('stripe')('sk_test_9hqOcJ7PVeUl2UHSMXmbZ6Sq');

const router = express.Router();

router.post('/charge', async (req, res) => {
  try {
    const { tokenId } = req.body;
    logger.info('Creating charge...');
    let { status } = await stripe.charges.create({
      amount: 1,
      currency: 'usd',
      description: 'Songbird Premium Monthly',
      source: tokenId,
    });

    res.json({ status });
    logger.info(`Charge status: ${status}`);
  } catch (err) {
    logger.error(err);
    res.status(500).end();
  }
  res.sendStatus(200);
});

module.exports = router;
