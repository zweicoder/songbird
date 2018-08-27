const express = require('express');
const logger = require('../lib/logger.js')('routes/charge.js');
const stripe = require("stripe")("sk_test_4eC39HqLyjWDarjtT1zdp7dc");

const router = express.Router();

router.post('/charge', async (req, res) => {
  try {
    const {tokenId, email} = req.body;
    let {status} = await stripe.charges.create({
      amount: 1,
      currency: "usd",
      description: "An example charge",
      source: tokenId
    });

    res.json({status});
  } catch (err) {
    res.status(500).end();
  }
  res.sendStatus(200);
});


module.exports = router;
