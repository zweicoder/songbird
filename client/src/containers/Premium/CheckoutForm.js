import React, { Component } from 'react';
import { CardElement, injectStripe } from 'react-stripe-elements';
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
    let { token } = await stripe.createToken({ name: 'Name' });
    let response = await axios.post(URL_BACKEND_CHARGE, {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain' },
      body: token.id,
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
    // TODO add email in case we need to track something (payment or wtv)
    return (
      <div className="checkout-container">
        <p>Pay with Credit Card</p>
        <div className="checkout">
          <CardElement />
          <button onClick={this.submit}>Checkout with Stripe</button>
        </div>
      </div>
    );
  }
}

export default injectStripe(CheckoutForm);
