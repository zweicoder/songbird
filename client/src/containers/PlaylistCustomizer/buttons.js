import React from 'react';
import FaIcon from '@fortawesome/react-fontawesome';
import FaQuestionCircle from '@fortawesome/fontawesome-free-regular/faQuestionCircle';
import { Tooltip, OverlayTrigger, Button } from 'react-bootstrap';

import { PLAYLIST_METADATA } from '../../constants.global.js';
import './buttons.css';

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

export const AddPlaylistButton = ({ onClick }) => {
  const tooltip = (
    <Tooltip id="add-tooltip">Add this playlist to Spotify.</Tooltip>
  );
  return (
    <OverlayTrigger placement="bottom" overlay={tooltip} delayShow={50}>
      <Button bsClass="btn action-button" id="add-button" onClick={onClick}>
        Save to Spotify
      </Button>
    </OverlayTrigger>
  );
};

export const SubscribeButton = ({ onClick }) => {
  const tooltip = (
    <Tooltip id="subscribe-tooltip">
      Playlist will update daily with your listening habits & song collection.
    </Tooltip>
  );
  return (
    <OverlayTrigger placement="bottom" overlay={tooltip} delayShow={50}>
      <Button
        bsClass="btn action-button"
        id="subscribe-button"
        onClick={onClick}
      >
        Save Smart Playlist
      </Button>
    </OverlayTrigger>
  );
};
