import React, { Component } from 'react';
import PropTypes from 'prop-types';

import SingleSelect from '../../../components/SingleSelect';

// [FEATURE] consider allowing custom ranges by parsing strings like '14-30'
const options = [
  {
    value: [{ low: 0, high: 14 }],
    label: 'In the last week (< 14 days)',
  },
  {
    value: [{ low: 0, high: 31 }],
    label: 'In the last month (< 31 days)',
  },
  {
    value: [{ low: 90, high: Infinity }],
    label: '3 months ago (> 90 days)',
  },
  {
    value: [{ low: 180, high: Infinity }],
    label: '6 months ago (> 180 days)',
  },
  {
    value: [{ low: 365, high: Infinity }],
    label: '1 year ago (> 365 days)',
  },
];

class AgeRangeValue extends Component {
  render() {
    const { onChange, ...restProps } = this.props;
    return (
      <SingleSelect options={options} onChange={onChange} {...restProps} />
    );
  }
}

AgeRangeValue.propTypes = {
  onChange: PropTypes.func,
};

export default AgeRangeValue;
