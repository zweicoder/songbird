import React, { Component } from 'react';
import { Button } from 'react-bootstrap';
import 'react-toastify/dist/ReactToastify.css';
import { ToastContainer } from 'react-toastify';

import Loading from '../../components/Loading';
import PlaylistCustomizer from '../../containers/PlaylistCustomizer';

import { getAccessToken } from '../../services/authService.js';
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
    if (window.location.hash !== '#notracks') {
      this.getPreprocessedLibrary();
    }
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

  onStopLoading = () => {
    this.setState({ stopLoading: true });
  };

  render() {
    const { tracks, loading, progress } = this.state;
    return (
      <div className="home">
        <ToastContainer />
        {loading && progress.total && `Processing ${progress.num} / ${progress.total} tracks`}
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
