import React, { Component } from 'react';
import { DropdownButton, Button, MenuItem } from 'react-bootstrap';
import SongPreview from '../components/SongPreview';
import qs from 'query-string';
import axios from 'axios';

import { getTokens } from '../services/authService.js';
import {
  PLAYLIST_TYPE_TOP_SHORT_TERM,
  PLAYLIST_TYPE_TOP_MID_TERM,
  PLAYLIST_TYPE_TOP_LONG_TERM,
  PLAYLIST_TYPE_POPULAR,
} from '../constants.global.js';
import CONSTANTS from '../constants.js';
const { URL_BACKEND_PLAYLIST } = CONSTANTS;

const dropdownItems = [
  {
    title: 'Top Tracks (Short Term)',
    key: PLAYLIST_TYPE_TOP_SHORT_TERM,
  },
  {
    title: 'Top Tracks (Mid Term)',
    key: PLAYLIST_TYPE_TOP_MID_TERM,
  },
  {
    title: 'Top Tracks (Long Term)',
    key: PLAYLIST_TYPE_TOP_LONG_TERM,
  },
  {
    title: 'Popular Tracks',
    key: PLAYLIST_TYPE_POPULAR,
  },
];

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
      selectedOption: null,
      tracks: [],
      refreshToken,
    };
  }

  onDropdownSelect = eventKey => {
    const selectedOption = dropdownItems[eventKey];
    this.setState({
      selectedOption,
      // TODO loading lul
      loading: true,
    });
    const { accessToken, refreshToken } = getTokens();
    const queryParams = qs.stringify({
      refreshToken,
      accessToken,
      playlistType: selectedOption.key,
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

  onAddPlaylist = () => {
    const selectedOption = this.state.selectedOption;
    console.log('Adding playlist option: ', selectedOption);
    // TODO get token and post with selection
    return;
  };

  render() {
    const { selectedOption, tracks } = this.state;
    const title = selectedOption && selectedOption.title;
    return (
      <div>
        <h2>some playlist here</h2>
        <div>
          <DropdownButton
            id="playlist-type-dropdown"
            bsStyle="default"
            title={title || 'Choose playlist type'}
          >
            {dropdownItems.map((e, idx) => (
              <MenuItem
                key={idx}
                eventKey={idx}
                onSelect={this.onDropdownSelect}
              >
                {e.title}
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
