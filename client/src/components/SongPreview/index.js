import { Table, OverlayTrigger, Tooltip } from 'react-bootstrap';
import React from 'react';
import './index.css';

function truncate(str, limit) {
  if (str.length <= limit) {
    return str;
  }
  return str.substr(0, limit) + '...';
}

function GenreNames({ genres, idx }) {
  const genreNames = genres.join(', ');
  if (genreNames.length > 40) {
    const tooltip = <Tooltip id={idx}>{genreNames}</Tooltip>;
    return (
      <OverlayTrigger overlay={tooltip} placement="bottom">
        <td>{truncate(genreNames, 40)}</td>
      </OverlayTrigger>
    );
  }
  return <td>{genreNames}</td>;
}

function Track({ track, idx, columns }) {
  const { name, artists, album, features } = track;
  const artistNames = artists.map(artist => artist.name).join(', ');
  return (
    <tr>
      <td>{idx + 1}.</td>
      <td>{name}</td>
      <td>{artistNames}</td>
      <td>{album.name}</td>
      {columns.genres && <GenreNames genres={features.genres} idx={idx} />}
      {columns.year && <td>{features.year}</td>}
    </tr>
  );
}

class SongPreview extends React.Component {
  constructor(props) {
    super(props);
    const { pageSize } = props;
    this.state = { limit: pageSize };
  }
  increaseLimit = () => {
    this.setState({ limit: this.state.limit + this.props.pageSize });
  };
  render() {
    const { tracks, pageSize } = this.props;
    if (!tracks || tracks.length === 0) {
      return null;
    }

    const { limit } = this.state;
    const renderedTracks = limit ? tracks.slice(0, limit) : tracks;
    const canLoadMore = limit && limit + pageSize <= tracks.length;

    const columns = {
      genres: true,
      year: true,
    };
    const tracksWerePreprocessed = tracks.every(e => e.features);
    if (!tracksWerePreprocessed) {
      columns.genres = false;
      columns.year = false;
    }
    return (
      <div>
        <Table bsClass="table table-responsive song-preview">
          <thead>
            <tr>
              <th>#</th>
              <th>Title</th>
              <th>Artist</th>
              <th>Album</th>
              {columns.genres && <th>Genres</th>}
              {columns.year && <th>Year</th>}
            </tr>
          </thead>
          <tbody>
            {renderedTracks.map((track, idx) => (
              <Track key={idx} track={track} idx={idx} columns={columns} />
            ))}
          </tbody>
        </Table>
        {canLoadMore && (
          <button className="action-button" onClick={this.increaseLimit}>
            See More
          </button>
        )}
      </div>
    );
  }
}

export default SongPreview;
