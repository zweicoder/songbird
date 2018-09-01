import React, { Component } from 'react';
import {
  CardElement,
  PostalCodeElement,
  injectStripe,
} from 'react-stripe-elements';
import axios from 'axios';
import { URL_BACKEND_CHARGE } from '../../constants.js';

import './CheckoutForm.css';

class CheckoutForm extends Component {
  constructor(props) {
    super(props);
    this.state = { complete: false };
    this.submit = this.submit.bind(this);
  }

  async submit(ev) {
    // User clicked submit
    const { stripe, onCheckout } = this.props;
    const name = 'Test User plz ignore';
    let { token, error } = await stripe.createToken({ name });
    if (error) {
      console.log('Failed to checkout with stripe!');
      throw error;
    }

    let response = await axios.post(URL_BACKEND_CHARGE, {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain' },
      body: { tokenId: token.id },
    });

    if (response.status === 200) {
      this.setState({ complete: true });
      onCheckout(true);
    }
  }

  render() {
    if (this.state.complete) {
      return <h1>Thank you for your support!!!</h1>;
    }
    return (
      <div className="checkout-container">
        <p>Pay with Credit Card</p>
        <div className="checkout">
          <input
            autoComplete="false"
            name="name"
            type="text"
            placeholder="Name"
            required
          />
          <input
            autoComplete="false"
            name="email"
            type="email"
            placeholder="Email"
            required
          />
          <CardElement
            style={{
              base: {
                fontFamily: 'Source Code Pro, Consolas, Menlo, monospace',
                '::placeholder': {
                  color: '#CFD7DF',
                },
                ':-webkit-autofill': {
                  color: '#e39f48',
                },
              },
              invalid: {
                color: '#E25950',

                '::placeholder': {
                  color: '#FFCCA5',
                },
              },
            }}
          />
          <button onClick={this.submit}>Checkout with Stripe</button>
        </div>
      </div>
    );
  }
}

export default injectStripe(CheckoutForm);
