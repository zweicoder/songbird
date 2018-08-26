import React, { Component } from 'react';
import CheckoutForm from './CheckoutForm.js';
import { Elements, StripeProvider } from 'react-stripe-elements';

import './index.css';

const Card = ({ heading, price, bodyItems, footer }) => {
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
            <span class="fa-li">
              <i class="fas fa-check" />
            </span>
            {e}
          </div>
        ))}
      </div>
      <div className="card-footer">{footer}</div>
    </div>
  );
};
class Premium extends Component {
  render() {
    return (
      <StripeProvider apiKey="pk_test_TYooMQauvdEDq54NiTphI7jx">
        <div className="premium-container">
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
          />
        </div>
      </StripeProvider>
    );
  }
}

export default Premium;
