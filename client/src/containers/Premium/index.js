import React, { Component } from 'react';
import { Elements, StripeProvider } from 'react-stripe-elements';
import { Modal } from 'react-bootstrap';

import CheckoutForm from './CheckoutForm.js';

import './index.css';

const Card = ({ heading, price, bodyItems, footer, onClick }) => {
  return (
    <div className="card">
      <div className="card-header">
        <h3>{heading}</h3>
        <div>
          <span className="price-tag">{price}</span>{' '}
          <span className="price-tag-sub">/month</span>
        </div>
      </div>
      <div className="card-body">
        {bodyItems.map((e, idx) => (
          <div key={idx}>
            <span className="fa-li">
              <i className="fas fa-check" />
            </span>
            {e}
          </div>
        ))}
      </div>
      <div className="card-footer" onClick={onClick}>
        {footer}
      </div>
    </div>
  );
};

class Premium extends Component {
  constructor(props) {
    super(props);
    this.state = {
      shouldShowModal: false,
    };
  }
  showModal = () => {
    this.setState({ shouldShowModal: true });
  };
  hideModal = () => {
    this.setState({ shouldShowModal: false });
  };

  onCheckout = success => {
    if (success) {
      setTimeout(() => {
        this.hideModal();
      }, 1000);
    }
  };

  render() {
    const apiKey =
      process.env.NODE_ENV === 'production'
        ? 'pk_live_6QviCai7CLcJot35YRGGBTBn'
        : 'pk_test_XTF9O5WYLUcjveThzxjuor6a';
    return (
      <StripeProvider apiKey={apiKey}>
        <div className="premium-container">
          <Modal show={this.state.shouldShowModal} onHide={this.hideModal}>
            <Elements>
              <CheckoutForm onCheckout={this.onCheckout} />
            </Elements>
          </Modal>
          <Card
            heading={'Songbird Free'}
            price={'$0'}
            footer={'Get Free'}
            bodyItems={[
              'Smart Playlists',
              'Playlist Customization',
              '4 Playlists',
              'Max 25 Tracks /playlist',
              'Causes Global Warming',
            ]}
          />

          <Card
            heading={'Songbird Premium'}
            price={'$1'}
            footer={'Get Premium'}
            bodyItems={[
              'Smart Playlists',
              'Playlist Customization',
              '25 Playlists',
              'Max 200 Tracks /playlist (TBC)',
              'Helps solve world hunger',
            ]}
            onClick={this.showModal}
          />
        </div>
      </StripeProvider>
    );
  }
}

export default Premium;
