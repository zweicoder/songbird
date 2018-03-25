import { Table } from 'react-bootstrap';
import React from 'react';
import './index.css';

const SongPreview = ({ tracks }) => {
  if (!tracks || tracks.length === 0){
    return null
  }
  return (
    tracks &&
    tracks.length > 0 && (
      <Table bordered hover responsive>
        <thead>
          <tr>
            <th>#</th>
            <th>Title</th>
            <th>Artist</th>
            <th>Album</th>
          </tr>
        </thead>
        <tbody>
          {tracks.map((e, idx) => (
            <tr key={idx}>
              <td>{idx + 1}.</td>
              <td>{e.name}</td>
              <td>{e.artists.join(', ')}</td>
              <td>{e.album}</td>
            </tr>
          ))}
        </tbody>
      </Table>
    )
  );
};

export default SongPreview;
