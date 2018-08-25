import React, { Component } from 'react';
import PropTypes from 'prop-types';
import moment from 'moment';

import SingleSelect from '../../../components/SingleSelect';

// [FEATURE] consider allowing custom ranges by parsing strings like '14-30'
const thisYear = moment().year();
const options = [
  {
    value: [{ low: thisYear, high: thisYear }],
    label: `This Year (${thisYear})`,
  },
  {
    value: [{ low: thisYear - 1, high: thisYear }],
    label: `Last 2 Years (${thisYear - 1}-${thisYear})`,
  },
  {
    value: [{ low: thisYear - 4, high: thisYear }],
    label: `Last 5 Years (${thisYear - 4}-${thisYear})`,
  },
  {
    value: [{ low: thisYear - 9, high: thisYear }],
    label: `Last Decade (${thisYear - 9}-${thisYear})`,
  },
  {
    value: [{ low: 0, high: 1950 }],
    label: 'Oldies (0-1950)',
  },
  {
    value: [{ low: 1950, high: 1959 }],
    label: '1950s (1950-1959)',
  },
  {
    value: [{ low: 1960, high: 1969 }],
    label: '1960s (1960-1969)',
  },
  {
    value: [{ low: 1970, high: 1979 }],
    label: '1970s (1970-1979)',
  },
  {
    value: [{ low: 1980, high: 1989 }],
    label: '1980s (1980-1989)',
  },
  {
    value: [{ low: 1990, high: 1999 }],
    label: '1990s (1990-1999)',
  },
  {
    value: [{ low: 2000, high: 2009 }],
    label: '2000s (2000-2009)',
  },
];

class YearRangeValue extends Component {
  render() {
    const { onChange, ...restProps } = this.props;
    return (
      <SingleSelect options={options} onChange={onChange} {...restProps} />
    );
  }
}

YearRangeValue.propTypes = {
  onChange: PropTypes.func,
};

export default YearRangeValue;
