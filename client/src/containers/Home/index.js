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
import { getPlaylistTracks } from 'spotify-service/playlistService';
// TODO analyze tracks before letting users filter, or do it asynchronously in the background (with progress bar)
import { getAllUserTracks, preprocessTracks } from 'spotify-service/trackService';

import './index.css';

const devlog = process.env.NODE_ENV === 'production' ? () => {} : console.log;
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

  componentDidMount() {
    this.getPreprocessedLibrary();
  }

  getPreprocessedLibrary = async () => {
    // TODO set interval, progress bar, stop early etc
    devlog('Getting preprocessed library...')
    this.setState({
      loading: true,
      tracks: [],
    });
    const { result: accessToken } = await getAccessToken();
    const { result: allTracks } = await getAllUserTracks(accessToken, 25);
    devlog('All user tracks: ', allTracks);
    const { result: processedTracks } = await preprocessTracks(accessToken, allTracks)
    devlog('Processed Tracks: ', processedTracks)
    /* this.setState({
     *   loading: false,
     *   tracks: processedTracks,
     * }) */
  };

  getTrackForPlaylist = async playlist => {
    const { result: accessToken } = await getAccessToken();
    const { result: tracks } = await getPlaylistTracks(accessToken, playlist);
    devlog('Got tracks: ', tracks);
    // Pluck out interesting attributes that we want here
    const pluckedTracks = tracks.map(track => ({
      name: track.name,
      album: track.album.name,
      artists: track.artists.map(artist => artist.name),
    }));
    this.setState({
      loading: false,
      tracks: pluckedTracks,
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
                eventKey={key}
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
