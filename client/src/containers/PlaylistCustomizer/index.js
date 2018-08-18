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

const SongPreviewContainer = ({
  tracks,
  allTracks,
  builder,
  onSubscribe,
  onAdd,
}) => {
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
      <AddPlaylistButton onClick={onAdd} />
      <SubscribeButton onClick={onSubscribe} />
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
      loading: false,
      builder: makePlaylistBuilder({}),
      selectedType: null,
      selectedValue: null,
    };
  }
  async componentDidMount() {
    // Set access token
    const { result: accessToken } = await getAccessToken();
    const builder = makePlaylistBuilder({
      accessToken,
    });
    this.setState({ builder });
  }
  notifySuccess = message => {
    toast.success(message, {
      position: toast.POSITION.BOTTOM_RIGHT,
      className: 'toast-success',
      progressClassName: 'toast-progress-success',
      autoClose: 1500,
    });
  };

  getPlaylistName() {
    return (
      document.querySelector('#playlist-name').textContent.trim() ||
      'My Awesome Playlist'
    );
  }
  onAdd = async () => {
    const { tracks } = this.state;
    const playlistName = this.getPlaylistName();
    const refreshToken = getRefreshToken();
    axios.post(URL_BACKEND_PLAYLIST, {
      refreshToken,
      tracks,
      playlistOpts: { name: playlistName },
    });
    this.notifySuccess(`Added normal playlist '${playlistName}' to Spotify!`);
    return;
  };

  onSubscribe = async () => {
    const { tracks, builder } = this.state;
    const playlistName = this.getPlaylistName();
    const refreshToken = getRefreshToken();
    axios.post(URL_BACKEND_PLAYLIST_SUBSCRIBE, {
      refreshToken,
      tracks,
      playlistConfig: builder.config,
      playlistOpts: { name: playlistName },
    });
    this.notifySuccess(`Added smart playlist '${playlistName}' to Spotify!`);
    return;
  };

  onTypeChange = selectedType => {
    this.setState({ selectedType });
  };

  onValueChange = selectedValue => {
    this.setState({ selectedValue });
  };

  buildPlaylist = async () => {
    devlog('Building playlist...');
    const { builder, _tracks } = this.state;
    if (!builder || builder.isEmpty()) {
      devlog('Builder is null or empty!');
      this.setState({ tracks: [] });
      return;
    }
    this.setState({ loading: true });
    const tracks = await builder.build(_tracks);
    this.setState({ tracks, loading: false });
  };

  onDeleteCustomization = key => {
    devlog('Deleting customization: ', key);
    const { builder } = this.state;
    this.setState({ builder: builder.deleteKey(key) }, this.buildPlaylist);
    devlog('Deleted customization: ', this.state);
  };

  onAddCustomization = () => {
    const { selectedType, selectedValue, builder } = this.state;
    if (!selectedValue || !selectedType) {
      console.log('Unable to add incomplete customization');
      return;
    }
    // Update config & build new tracks from it
    // Value can be either an array or a single value (preset)
    const customizationValue = Array.isArray(selectedValue)
      ? selectedValue.map(e => e.value)
      : selectedValue.value;
    const customizationType = selectedType.value;
    devlog('Adding customization: ', customizationType, customizationValue);
    const newBuilder = builder.withKey(customizationType, customizationValue);
    this.setState({ builder: newBuilder }, this.buildPlaylist);
    devlog('Added customization: ', this.state);
  };

  getTracks = () => this.state._tracks;

  render() {
    const {
      selectedType,
      builder,
      tracks,
      _tracks: allTracks,
      loading,
    } = this.state;
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
        {loading ? (
          <FaIcon icon="spinner" className="spinner" size="4x" spin />
        ) : (
          <SongPreviewContainer
            tracks={tracks}
            allTracks={allTracks}
            builder={builder}
            onSubscribe={this.onSubscribe}
            onAdd={this.onAdd}
          />
        )}
      </div>
    );
  }
}

export default PlaylistCustomizer;
