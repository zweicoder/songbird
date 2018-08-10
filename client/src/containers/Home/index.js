import React, { Component } from 'react';
import { Button } from 'react-bootstrap';
import 'react-toastify/dist/ReactToastify.css';
import { ToastContainer } from 'react-toastify';

import Loading from '../../components/Loading';
import PlaylistCustomizer from '../../containers/PlaylistCustomizer';

import { getAccessToken } from '../../services/authService.js';
import { getPlaylistTracks } from 'spotify-service/playlistService';
// TODO analyze tracks before letting users filter, or do it asynchronously in the background (with progress bar)
import {
  getAllUserTracks,
  preprocessTracks,
} from 'spotify-service/trackService';

import './index.css';

const devlog = process.env.NODE_ENV === 'production' ? () => {} : console.log;

class Home extends Component {
  constructor(props) {
    super(props);
    this.state = {
      loading: false,
      progress: {},
      tracks: [],
      stopLoading: false,
    };
  }

  componentDidMount() {
    // TODO enable
    /* this.getPreprocessedLibrary(); */
  }

  getPreprocessedLibrary = async () => {
    const updateProgress = ({ numTracks, total }) => {
      devlog(`Loading ${numTracks} / ${total} tracks...`);
      this.setState({
        loading: true,
        progress: {
          percentage: (numTracks / total) * 100,
          num: numTracks,
          total,
        },
      });
      return !this.state.stopLoading;
    };

    devlog('Getting preprocessed library...');
    this.setState({
      loading: true,
      tracks: [],
      progress: {},
    });
    const { result: accessToken } = await getAccessToken();
    const { result: allTracks } = await getAllUserTracks(accessToken, {
      maxLimit: 300,
      callbackFn: updateProgress,
    });
    devlog('All user tracks: ', allTracks);
    const { result: processedTracks } = await preprocessTracks(
      accessToken,
      allTracks
    );
    devlog('Processed Tracks: ', processedTracks);
    this.setState({
      loading: false,
      tracks: processedTracks,
    });
  };

  // DEPRECATED
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

  // DEPRECATED
  onDropdownSelect = selectedPlaylist => {
    // Render loading spinner and empty tracks
    this.setState({
      selectedPlaylist,
      loading: true,
      tracks: [],
    });
    this.getTrackForPlaylist(selectedPlaylist);
  };

  onStopLoading = () => {
    this.setState({ stopLoading: true });
  };

  render() {
    const { tracks, loading, progress } = this.state;
    return (
      <div className="home">
        <ToastContainer />
        {loading && `Processing ${progress.num} / ${progress.total} tracks`}
        <Loading loading={loading} progress={progress.percentage}>
          <PlaylistCustomizer tracks={tracks}/>
        </Loading>
        {loading && (
          <Button bsClass="btn action-button" onClick={this.onStopLoading}>
            Stop
          </Button>
        )}
      </div>
    );
  }
}

export default Home;
