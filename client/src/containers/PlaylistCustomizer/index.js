import React, { Component } from 'react';
import { toast } from 'react-toastify';
import axios from 'axios';
import { FontAwesomeIcon as FaIcon } from '@fortawesome/react-fontawesome';
import { faPlus } from '@fortawesome/free-solid-svg-icons';

import { makePlaylistBuilder } from 'spotify-service/playlistService';
import { getRefreshToken, getAccessToken } from '../../services/authService.js';
import SongPreview from '../../components/SongPreview';
import { AddPlaylistButton, SubscribeButton } from './buttons.js';
import SingleSelect from '../../components/SingleSelect';
import CustomizerInfo from './CustomizerInfo';

import {
  URL_BACKEND_PLAYLIST,
  URL_BACKEND_PLAYLIST_SUBSCRIBE,
} from '../../constants.js';
import {
  CUSTOMIZER_SELECT_OPTIONS,
  CUSTOMIZER_COMPONENT_MAP,
} from './customizerOptions.js';

import './index.css';

const devlog = process.env.NODE_ENV === 'production' ? () => {} : console.log;

const SongPreviewContainer = ({ tracks, allTracks, builder }) => {
  if (tracks.length === 0) {
    if (builder.isEmpty()) {
      // Let users explore their library if they haven't created a playlist
      return (
        <div className="preview-content">
          <h2>Your Library</h2>
          <SongPreview tracks={allTracks} />
        </div>
      );
    } else {
      return (
        <h4 style={{ padding: '20px' }}>
          Oops! Looks like there's nothing here! Try again with different
          filters!
        </h4>
      );
    }
  }
  return (
    <div className="preview-content">
      <AddPlaylistButton onClick={this.onAddPlaylist} />
      <SubscribeButton onClick={this.onSubscribe} />
      <SongPreview tracks={tracks} />
    </div>
  );
};

class PlaylistCustomizer extends Component {
  constructor(props) {
    super(props);
    const { tracks } = props;
    this.state = {
      _tracks: tracks, // As passed down from parent
      tracks: [], // Filtered
      builder: makePlaylistBuilder(),
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

  onDeleteCustomization = key => {
    devlog('Deleting customization: ', key);
    const { builder, _tracks } = this.state;
    const newBuilder = builder.deleteKey(key);
    const tracks = newBuilder.isEmpty() ? [] : newBuilder.build(_tracks);
    this.setState({ builder: newBuilder, tracks });
    devlog('Deleted customization: ',this.state)
  };

  onAddCustomization = () => {
    const { selectedType, selectedValue, builder, _tracks } = this.state;
    devlog('Adding customization: ', selectedType, selectedValue);
    if (!selectedValue || !selectedType) {
      console.log('Unable to add incomplete customization');
      return;
    }
    // Update config & build new tracks from it
    // Value can be either an array or a single value (preset)
    const customizationValue = Array.isArray(selectedValue)
      ? selectedValue.map(e => e.value)
      : selectedValue.value;
    const newBuilder = builder.withKey(selectedType.value, customizationValue);
    const tracks = newBuilder.build(_tracks);
    this.setState({
      builder: newBuilder,
      tracks,
    });
    devlog('Added customization: ', this.state);
  };

  getTracks = () => this.state._tracks;

  render() {
    const { selectedType, builder, tracks, _tracks: allTracks } = this.state;
    const ValueComponent =
      selectedType && CUSTOMIZER_COMPONENT_MAP[selectedType.value];
    return (
      <div className="playlist-customizer">
        <CustomizerInfo
          builder={builder}
          onItemDelete={this.onDeleteCustomization}
        />
        <div className="playlist-customizer-container">
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
              <ValueComponent
                onChange={this.onValueChange}
                getTracks={this.getTracks}
              />
            </div>
          )}
          {ValueComponent && (
            <button className="icon-btn" onClick={this.onAddCustomization}>
              <FaIcon icon={faPlus} color="#CCC" size="1x" />
            </button>
          )}
        </div>
        <SongPreviewContainer
          tracks={tracks}
          allTracks={allTracks}
          builder={builder}
        />
      </div>
    );
  }
}

export default PlaylistCustomizer;
