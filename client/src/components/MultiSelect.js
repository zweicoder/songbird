import React, { Component } from 'react';
import Select from 'react-select';
import PropTypes from 'prop-types';

class MultiSelect extends Component {
  constructor(props) {
    super(props);
    this.state = {
      selectedOption: null,
    };
  }
  handleChange = selectedOption => {
    this.setState({ selectedOption });
    this.props.onChange && this.props.onChange(selectedOption);
  };
  render() {
    const customStyles = {
      option: (base, state) => ({
        ...base,
        color: 'black',
      }),
      control: (base) => ({
        ...base,
        borderRadius: '0px',
        border: 'none',
        borderLeft: '#ccc solid 1px',
        // FIXME FIX THE OVERFLOW SOME DAY
        maxWidth: '500px',
      }),
      indicatorSeparator: (base) => ({
        ...base,
        display: 'none',
      }),
      input: (base) => ({
        ...base,
      }),
    };
    const {options, onChange, ...restProps} = this.props;
    return (
      <Select
        isMulti
        value={this.state.selectedOption}
        options={options}
        onChange={this.handleChange}
        styles={customStyles}
        {...restProps}
      />
    );
  }
}

MultiSelect.propTypes = {
  onChange: PropTypes.func,
  options: PropTypes.array.isRequired,
};

export default MultiSelect;
