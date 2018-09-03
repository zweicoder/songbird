import React, { Component } from 'react';
import { CardElement, injectStripe } from 'react-stripe-elements';
import axios from 'axios';
import validator from 'validator';
import { FontAwesomeIcon as FaIcon } from '@fortawesome/react-fontawesome';
import { faSpinner, faCheckCircle } from '@fortawesome/free-solid-svg-icons';

import { getRefreshToken } from '../../services/authService.js';
import { URL_BACKEND_CHARGE } from '../../constants.js';

import './CheckoutForm.css';

const CheckoutButton = ({ complete, loading, onClick }) => {
  if (complete) {
    return (
      <button>
        <FaIcon icon={faCheckCircle} />
      </button>
    );
  }
  if (loading) {
    return (
      <button>
        <FaIcon icon={faSpinner} spin />
      </button>
    );
  }
  return <button onClick={onClick}>Checkout with Stripe</button>;
};

class CheckoutForm extends Component {
  constructor(props) {
    super(props);
    this.state = { complete: false };
    this.submit = this.submit.bind(this);
  }

  async submit(ev) {
    // User clicked submit
    this.setState({ loading: true });
    const { stripe, onCheckout } = this.props;
    const email = document.querySelector('input[type="email"]').value.trim();
    if (email.length === 0) {
      this.setState({ errorMsg: `Email is required!`, loading: false });
      return;
    }
    if (!validator.isEmail(email)) {
      this.setState({
        errorMsg: `${email} is not a valid email!`,
        loading: false,
      });
      return;
    }

    // TODO maybe get name and address
    let { token, error } = await stripe.createToken();
    if (error) {
      if (error.message) {
        this.setState({ errorMsg: error.message });
        return;
      }
      console.log('Failed to checkout with stripe!');
      throw error;
    }

    try {
      await axios.post(URL_BACKEND_CHARGE, {
        tokenId: token.id,
        email,
        refreshToken: getRefreshToken(),
      });
      this.setState({ complete: true });
      onCheckout(true);
    } catch (err) {
      this.setState({
        errorMsg:
          'Something went wrong! Please try again later & alert the developer!',
        loading: false,
      });
    }
  }

  render() {
    return (
      <div className="checkout-container">
        <p>Pay with Credit Card</p>
        <div className="checkout">
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
          {this.state.errorMsg && (
            <span className="errors">{this.state.errorMsg}</span>
          )}
          <CheckoutButton
            loading={this.state.loading}
            complete={this.state.complete}
            onClick={this.submit}
          />
        </div>
      </div>
    );
  }
}

export default injectStripe(CheckoutForm);
