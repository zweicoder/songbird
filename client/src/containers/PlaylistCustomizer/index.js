import React, { Component } from 'react';
import { DropdownButton, MenuItem } from 'react-bootstrap';
import { toast } from 'react-toastify';
import axios from 'axios';
import Select from 'react-select';

import { getRefreshToken, getAccessToken } from '../../services/authService.js';
import SongPreview from '../../components/SongPreview';
import { AddPlaylistButton, SubscribeButton } from './buttons.js';

import {
  URL_BACKEND_PLAYLIST,
  URL_BACKEND_PLAYLIST_SUBSCRIBE,
} from '../../constants.js';

import './index.css';

class PlaylistCustomizer extends Component {
  constructor(props) {
    super(props);
    const { tracks } = props;
    this.state = {
      _tracks: tracks, // As passed down from parent
      tracks: [], // Filtered
      filters: {},
      selectedOption: 'genre',
    };
  }
  notifySuccess = message => {
    toast.success(message, {
      position: toast.POSITION.BOTTOM_RIGHT,
      className: 'toast-success',
      progressClassName: 'toast-progress-success',
      autoClose: 1500,
    });
  };

  // TODO update these
  onAddPlaylist = async () => {
    const selectedPlaylist = this.state.selectedPlaylist;
    console.log('Adding playlist option: ', selectedPlaylist);
    const refreshToken = getRefreshToken();
    axios.post(URL_BACKEND_PLAYLIST, {
      refreshToken,
      playlistType: selectedPlaylist,
    });
    this.notifySuccess('Successfully added playlist to Spotify!');
    return;
  };

  onSubscribe = async () => {
    const selectedPlaylist = this.state.selectedPlaylist;
    const refreshToken = getRefreshToken();
    axios.post(URL_BACKEND_PLAYLIST_SUBSCRIBE, {
      refreshToken,
      playlistType: selectedPlaylist,
    });
    this.notifySuccess('Successfully added smart playlist to Spotify!');
    return;
  };

  onCustomizationTypeChange = selectedOption => {
    this.setState({ selectedOption });
  };
  render() {
    // TODO default to preset, change 'value' component for other types
    // value can be list (react-multiselect)
    const opts = [
      {
        value: 'preset',
        label: 'Preset',
      },
      { value: 'genre', label: 'Genre' },
    ];
    return (
      <div>
        <div>Customize playlist:</div>
        <div>
          <Select
            className='customization-select'
            placeholder='Select Customization'
            value={this.state.selectedOption}
            options={opts}
            onChange={this.onCustomizationTypeChange}
          />
        </div>

        {this.state.tracks.length > 0 && (
          <div className="preview-content">
            <AddPlaylistButton onClick={this.onAddPlaylist} />
            <SubscribeButton onClick={this.onSubscribe} />
            <SongPreview tracks={this.state.tracks} />
          </div>
        )}
      </div>
    );
  }
}

export default PlaylistCustomizer;
