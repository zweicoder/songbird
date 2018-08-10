import React, { Component } from 'react';
import SingleSelect from '../../../components/SingleSelect';
import PropTypes from 'prop-types';
import FaIcon from '@fortawesome/react-fontawesome';
import FaQuestionCircle from '@fortawesome/free-solid-svg-icons/faQuestionCircle';
import { Tooltip, OverlayTrigger } from 'react-bootstrap';

import { PLAYLIST_METADATA } from '../../../constants.global.js';

// TODO figure out tool tip for preset playlists
const PlaylistTypeTooltip = ({ selectedPlaylist }) => {
  const tooltip = (
    <Tooltip id="playlist-tooltip">
      {PLAYLIST_METADATA[selectedPlaylist].tooltip}
    </Tooltip>
  );
  return (
    <OverlayTrigger placement="right" delayShow={50} overlay={tooltip}>
      <FaIcon icon={FaQuestionCircle} id="playlist-type-tooltip" />
    </OverlayTrigger>
  );
};

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
