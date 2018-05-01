import React, { Component } from 'react';
import { DropdownButton, Button, MenuItem } from 'react-bootstrap';
import SongPreview from '../../components/SongPreview';
import qs from 'querystring';
import axios from 'axios';
import FaIcon from '@fortawesome/react-fontawesome';

import { getTokens } from '../../services/authService.js';
import { PLAYLIST_METADATA } from '../../constants.global.js';
import {
  URL_BACKEND_PLAYLIST,
  URL_BACKEND_PLAYLIST_SUBSCRIBE,
} from '../../constants.js';
import './index.css';

const playlistTypeKeys = Object.keys(PLAYLIST_METADATA);

const AddPlaylistButton = ({ onClick }) => {
  return (
    <Button bsClass="btn action-button" id="add-button" onClick={onClick}>
      Save to Spotify
    </Button>
  );
};

const SubscribeButton = ({ onClick }) => {
  return (
    <Button bsClass="btn action-button" id="subscribe-button" onClick={onClick}>
      Save & Subscribe
    </Button>
  );
};

class Home extends Component {
  constructor(props) {
    super(props);
    const { refreshToken } = this.props;
    this.state = {
      selectedPlaylist: null,
      tracks: [],
      refreshToken,
    };
  }

  onDropdownSelect = eventKey => {
    this.setState({
      selectedPlaylist: eventKey,
      // TODO loading lul
      loading: true,
      // Empty tracks
      tracks: [],
    });
    const { refreshToken } = getTokens();
    const queryParams = qs.stringify({
      refreshToken,
      playlistType: eventKey,
    });
    axios.get(`${URL_BACKEND_PLAYLIST}?${queryParams}`).then(res => {
      if (res.status !== 200) {
        console.error(res);
        return;
      }

      const { tracks } = res.data;
      this.setState({ tracks, loading: false });
    });
  };

  onAddPlaylist = async () => {
    const selectedPlaylist = this.state.selectedPlaylist;
    console.log('Adding playlist option: ', selectedPlaylist);
    const { refreshToken } = getTokens();
    axios.post(URL_BACKEND_PLAYLIST, {
      refreshToken,
      playlistType: selectedPlaylist,
    });
    return;
  };

  onSubscribe = async () => {
    const selectedPlaylist = this.state.selectedPlaylist;
    const { refreshToken } = getTokens();
    axios.post(URL_BACKEND_PLAYLIST_SUBSCRIBE, {
      refreshToken,
      playlistType: selectedPlaylist,
    });
    return;
  };

  render() {
    const { selectedPlaylist, tracks, loading } = this.state;
    const title = selectedPlaylist && PLAYLIST_METADATA[selectedPlaylist].title;
    return (
      <div className="home">
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
                eventKey={key}
                onSelect={this.onDropdownSelect}
              >
                {PLAYLIST_METADATA[key].title}
              </MenuItem>
            ))}
          </DropdownButton>
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
