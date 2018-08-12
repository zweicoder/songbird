import { Table, OverlayTrigger, Tooltip } from 'react-bootstrap';
import React from 'react';
import './index.css';

function truncate(str, limit) {
  if (str.length <= limit) {
    return str;
  }
  return str.substr(0, limit) + '...';
}

function Track({ track, idx }) {
  const { name, artists, album, features } = track;
  const artistNames = artists.map(artist => artist.name).join(', ');
  const genreNames = features.genres.join(', ');
  const tooltip = <Tooltip id={idx}>{genreNames}</Tooltip>;
  return (
    <tr>
      <td>{idx + 1}.</td>
      <td>{name}</td>
      <td>{artistNames}</td>
      <td>{album.name}</td>
      {genreNames.length > 40 ? (
        <OverlayTrigger overlay={tooltip} placement="bottom">
          <td>{truncate(genreNames, 40)}</td>
        </OverlayTrigger>
      ) : (
        <td>{genreNames}</td>
      )}
    </tr>
  );
}

const SongPreview = ({ tracks }) => {
  if (!tracks || tracks.length === 0) {
    return null;
  }
  return (
    tracks &&
    tracks.length > 0 && (
      <Table bsClass="table table-responsive song-preview">
        <thead>
          <tr>
            <th>#</th>
            <th>Title</th>
            <th>Artist</th>
            <th>Album</th>
            <th>Genres</th>
          </tr>
        </thead>
        <tbody>
          {tracks.map((track, idx) => <Track key={idx} track={track} idx={idx} />)}
        </tbody>
      </Table>
    )
  );
};

export default SongPreview;
