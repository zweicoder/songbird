import React, { Component } from 'react';
import SingleSelect from '../../../components/SingleSelect';
import PropTypes from 'prop-types';

import { PLAYLIST_METADATA } from '../../../constants.global.js';

const options = Object.keys(PLAYLIST_METADATA).map(key => ({
  value: key,
  label: PLAYLIST_METADATA[key].title,
}));

class PresetValue extends Component {
  render() {
    const { onChange, ...restProps } = this.props;
    return (
      <SingleSelect options={options} onChange={onChange} {...restProps} />
    );
  }
}

PresetValue.propTypes = {
  onChange: PropTypes.func,
};

export default PresetValue;
