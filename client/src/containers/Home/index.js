import React, { Component } from 'react';
import {
  DropdownButton,
  Button,
  MenuItem,
  OverlayTrigger,
  Tooltip,
} from 'react-bootstrap';
import SongPreview from '../../components/SongPreview';
import axios from 'axios';
import FaIcon from '@fortawesome/react-fontawesome';
import FaQuestionCircle from '@fortawesome/fontawesome-free-regular/faQuestionCircle';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import { getRefreshToken, getAccessToken } from '../../services/authService.js';
import { PLAYLIST_METADATA } from '../../constants.global.js';
import { URL_BACKEND_PLAYLIST, URL_BACKEND_PLAYLIST_SUBSCRIBE } from '../../constants.js';
import './index.css';
import { getPlaylistTracks } from 'spotify-service/playlistService';

const playlistTypeKeys = Object.keys(PLAYLIST_METADATA);

const AddPlaylistButton = ({ onClick }) => {
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

const SubscribeButton = ({ onClick }) => {
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

class Home extends Component {
  constructor(props) {
    super(props);
    this.state = {
      selectedPlaylist: null,
      tracks: [],
    };
  }

  getTrackForPlaylist = async playlist => {
    const { result: accessToken } = await getAccessToken();
    const { result: tracks } = await getPlaylistTracks(accessToken, playlist);
    this.setState({
      loading: false,
      tracks,
    });
  };
  onDropdownSelect = selectedPlaylist => {
    // Render loading spinner and empty tracks
    this.setState({
      selectedPlaylist,
      loading: true,
      tracks: [],
    });
    this.getTrackForPlaylist(selectedPlaylist);
  };

  notifySuccess = message => {
    toast.success(message, {
      position: toast.POSITION.BOTTOM_RIGHT,
      className: 'toast-success',
      progressClassName: 'toast-progress-success',
      autoClose: 1500,
    });
  };

  onAddPlaylist = async () => {
    const selectedPlaylist = this.state.selectedPlaylist;
    console.log('Adding playlist option: ', selectedPlaylist);
    const  refreshToken  = getRefreshToken();
    axios.post(URL_BACKEND_PLAYLIST, {
      refreshToken,
      playlistType: selectedPlaylist,
    });
    this.notifySuccess('Successfully added playlist to Spotify!');
    return;
  };

  onSubscribe = async () => {
    const selectedPlaylist = this.state.selectedPlaylist;
    const refreshToken  = getRefreshToken();
    axios.post(URL_BACKEND_PLAYLIST_SUBSCRIBE, {
      refreshToken,
      playlistType: selectedPlaylist,
    });
    this.notifySuccess('Successfully added smart playlist to Spotify!');
    return;
  };

  render() {
    const { selectedPlaylist, tracks, loading } = this.state;
    const title = selectedPlaylist && PLAYLIST_METADATA[selectedPlaylist].title;
    return (
      <div className="home">
        <ToastContainer />
        <div>
          <DropdownButton
            id="playlist-type-dropdown"
            bsStyle="default"
            bsSize="large"
            title={title || 'Choose playlist type'}
          >
            {playlistTypeKeys.map((key, idx) => (
              <MenuItem
                key={key}
                selectedPlaylist={key}
                onSelect={this.onDropdownSelect}
              >
                {PLAYLIST_METADATA[key].title}
              </MenuItem>
            ))}
          </DropdownButton>
          {selectedPlaylist && (
            <PlaylistTypeTooltip selectedPlaylist={selectedPlaylist} />
          )}
        </div>
        {loading && (
          <FaIcon icon="spinner" className="spinner" size="6x" spin />
        )}
        {this.state.tracks.length > 0 && (
          <div className="preview-content">
            <AddPlaylistButton onClick={this.onAddPlaylist} />
            <SubscribeButton onClick={this.onSubscribe} />
            <SongPreview tracks={tracks} />
          </div>
        )}
      </div>
    );
  }
}

export default Home;
