import React, { Component } from 'react';
import { DropdownButton, Button, MenuItem } from 'react-bootstrap';
import SongPreview from '../components/SongPreview';
import qs from 'query-string';
import axios from 'axios';

import { getTokens } from '../services/authService.js';
import { PLAYLIST_METADATA } from '../constants.global.js';
import { URL_BACKEND_PLAYLIST } from '../constants.js';

const playlistTypeKeys = Object.keys(PLAYLIST_METADATA);

const AddPlaylistButton = ({ onClick }) => {
  return (
    <Button bsStyle="primary" bsSize="large" onClick={onClick}>
      +
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
      tracks: []
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

  render() {
    const { selectedPlaylist, tracks } = this.state;
    const title = selectedPlaylist && PLAYLIST_METADATA[selectedPlaylist].title;
    return (
      <div>
        <h2>some playlist here</h2>
        <div>
          <DropdownButton
            id="playlist-type-dropdown"
            bsStyle="default"
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
        {this.state.tracks.length > 0 && (
          <div>
            <AddPlaylistButton onClick={this.onAddPlaylist} />
            <SongPreview tracks={tracks} />
          </div>
        )}
      </div>
    );
  }
}

export default Home;
