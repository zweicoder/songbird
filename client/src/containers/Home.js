import React, { Component } from 'react';
import { DropdownButton, MenuItem } from 'react-bootstrap';

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
  state = {
    selectedOption: null,
  };

  onDropdownSelect = eventKey => {
    this.setState({ selectedOption: dropdownItems[eventKey] });
  };
  render() {
    const { token } = this.props;
    const { selectedOption } = this.state;
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
      </div>
    );
  }
}

export default Home;
