import React, { Component } from 'react';
import { CardElement, injectStripe } from 'react-stripe-elements';
import './CheckoutForm.css';

class CheckoutForm extends Component {
  constructor(props) {
    super(props);
    this.submit = this.submit.bind(this);
  }

  async submit(ev) {
    // User clicked submit
  }

  render() {
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
