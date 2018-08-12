import React, { Component } from 'react';
import PropTypes from 'prop-types';

import MultiSelect from '../../../components/MultiSelect';
import { capitalCase } from '../utils.js';


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
