import React, { Component } from 'react';
import { toast } from 'react-toastify';
import axios from 'axios';
import FaIcon from '@fortawesome/react-fontawesome';
import {faPlus} from '@fortawesome/free-solid-svg-icons';

import makePlaylistBuilder from 'spotify-service/playlistService';
import { getRefreshToken, getAccessToken } from '../../services/authService.js';
import SongPreview from '../../components/SongPreview';
import { AddPlaylistButton, SubscribeButton } from './buttons.js';
import SingleSelect from '../../components/SingleSelect';

import {
  URL_BACKEND_PLAYLIST,
  URL_BACKEND_PLAYLIST_SUBSCRIBE,
} from '../../constants.js';
import {
  CUSTOMIZER_SELECT_OPTIONS,
  CUSTOMIZER_COMPONENT_MAP,
} from './customizerOptions.js';

import './index.css';

class PlaylistCustomizer extends Component {
  constructor(props) {
    super(props);
    const { tracks } = props;
    this.state = {
      _tracks: tracks, // As passed down from parent
      tracks: [], // Filtered
      builderConfig: {},
      selectedType: null,
      selectedValue: null,
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

  onTypeChange = selectedType => {
    this.setState({ selectedType });
  };
  onValueChange = selectedValue => {
    this.setState({ selectedValue });
  };

  onAddCustomization = () => {
    const { selectedType, selectedValue } = this.state;
    if (!selectedValue || !selectedType) {
      console.log('Unable to add incomplete customization');
      return;
    }
    // Update config & build new tracks from it
    const builderConfig = Object.assign({}, this.state.builderConfig, {
      [selectedType]: selectedValue,
    });
    const builder = makePlaylistBuilder(builderConfig);
    const tracks = builder.build(this.state._tracks);
    this.setState({
      selectedType: null,
      selectedValue: null,
      builderConfig,
      tracks,
    });
  };

  render() {
    const ValueComponent =
      this.state.selectedType &&
      CUSTOMIZER_COMPONENT_MAP[this.state.selectedType.value];
    return (
      <div className="playlist-customizer">
        <div>
          <SingleSelect
            className="customization-select"
            placeholder="Build your own Playlist"
            options={CUSTOMIZER_SELECT_OPTIONS}
            onChange={this.onTypeChange}
          />
        </div>
        {ValueComponent && (
          <div className="customization-select">
            <ValueComponent />
          </div>
        )}
        {ValueComponent && (
          <button className="icon-btn">
            <FaIcon icon={faPlus} color="#CCC" size="1x" />
          </button>
        )}
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
