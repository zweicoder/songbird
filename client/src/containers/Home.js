import React, { Component } from 'react';
import { DropdownButton, MenuItem } from 'react-bootstrap';
import SongPreview from '../components/SongPreview';
import qs from 'query-string';
import axios from 'axios';
import {
  COOKIE_SONGBIRD_REFRESH_TOKEN,
  COOKIE_SONGBIRD_ACCESS_TOKEN,
} from '../constants.js';

const dropdownItems = [
  {
    title: 'Top Tracks (Short Term)',
  },
  {
    title: 'Top Tracks (Mid Term)',
  },
  {
    title: 'Top Tracks (Long Term)',
  },
  {
    title: 'Popular Tracks',
  },
];

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
    this.setState({
      selectedOption: dropdownItems[eventKey],
      // TODO loading lul
      loading: true,
    });
    const accessToken = localStorage.getItem(COOKIE_SONGBIRD_ACCESS_TOKEN);
    const refreshToken = localStorage.getItem(COOKIE_SONGBIRD_REFRESH_TOKEN);
    // TODO pass in playlist option
    const queryParams = qs.stringify({ refreshToken, accessToken });
    axios.get(`http://localhost:8888/playlist?${queryParams}`).then(res => {
      if (res.status !== 200) {
        console.error(res);
        return;
      }

      const { tracks } = res.data;
      this.setState({ tracks, loading: false });
    });
  };

  componentDidMount() {}
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
        <SongPreview tracks={tracks} />
      </div>
    );
  }
}

export default Home;
