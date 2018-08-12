import React, { Component } from 'react';
import { Line } from 'rc-progress';
import './index.css'

class Loading extends Component {
  render() {
    if (this.props.loading) {
      return (
        <div className="loading">
          <Line
            percent={this.props.progress}
            strokeWidth="1"
            strokeColor="#07d159"
          />
        </div>
      );
    }

    return <div>{this.props.children}</div>;
  }
}

export default Loading;
