import React, { Component } from 'react';
import Select from 'react-select';
import PropTypes from 'prop-types';

class SingleSelect extends Component {
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
    return (
      <Select
        value={this.state.selectedOption}
        options={this.props.options}
        onChange={this.handleChange}
      />
    );
  }
}

SingleSelect.propTypes = {
  onChange: PropTypes.func,
  options: PropTypes.array.isRequired,
};

export default SingleSelect;
