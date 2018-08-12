import React, { Component } from 'react';
import MultiSelect from '../../../components/MultiSelect';
import PropTypes from 'prop-types';


// Converts every first character of words in a string to capital
function capitalCase(str) {
  const splitted = str.split(' ');
  return splitted.map(e=> e.charAt(0).toUpperCase() + e.substr(1)).join(' ');
}

class GenreValue extends Component {
  render() {
    const { onChange, getTracks, ...restProps } = this.props;
    const tracks = getTracks();
    // Such flatMap. So wow.
    const genres = [].concat(...tracks.map(track => track.features.genres))
    const uniqueGenres = Array.from(new Set(genres))
    const options = uniqueGenres.map(genre => ({
      value: genre,
      label: capitalCase(genre),
    }));
    return (
        <MultiSelect options={options} onChange={onChange} {...restProps} />
    );
  }
}

GenreValue.propTypes = {
  onChange: PropTypes.func,
  getTracks: PropTypes.func,
};

export default GenreValue;
