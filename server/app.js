const express = require('express');
const morgan = require('morgan');
const request = require('request');
const qs = require('query-string');
const cookieParser = require('cookie-parser');
const cors = require('cors');
const axios = require('axios');

const { getBasicAuthHeader, getOAuthHeader } = require('./lib/oauthUtils.js');
const { createUser, putUser } = require('./services/dbService.js');
const { getTopTracks, TIME_RANGE_OPTS } = require('./services/trackService.js');
const loginRouter = require('./routes/login.js');
const {
  PLAYLIST_TYPE_TOP_SHORT_TERM,
  PLAYLIST_TYPE_TOP_MID_TERM,
  PLAYLIST_TYPE_TOP_LONG_TERM,
  PLAYLIST_TYPE_POPULAR,
} = require('./constants.global.js');

const app = express();

app.use(cookieParser());
app.use(morgan('tiny'));
app.use(cors());

app.use(loginRouter);


const playlistTypeMapping = {
  [PLAYLIST_TYPE_TOP_LONG_TERM]: TIME_RANGE_OPTS.LONG_TERM,
  [PLAYLIST_TYPE_TOP_MID_TERM]: TIME_RANGE_OPTS.MEDIUM_TERM,
  [PLAYLIST_TYPE_TOP_SHORT_TERM]: TIME_RANGE_OPTS.SHORT_TERM,
};
async function getPreviewPlaylist(userOpts, playlistType) {
  switch (playlistType) {
    case PLAYLIST_TYPE_TOP_SHORT_TERM:
    case PLAYLIST_TYPE_TOP_MID_TERM:
    case PLAYLIST_TYPE_TOP_LONG_TERM:
      const timeRange = playlistTypeMapping[playlistType];
      let { result, err } = await getTopTracks(
        userOpts,
        timeRange,
        (limit = 25)
      );
      if (err) {
        return { err };
      }
      const pluckedTracks = result.map(track => ({
        name: track.name,
        album: track.album.name,
        artists: track.artists.map(artist => artist.name),
      }));
      return { result: pluckedTracks };
    default:
      return { err: 'No matching playlistType' };
  }
}

// TODO more fun endpoints for playlist management
app.get('/playlist', async (req, res) => {
  const { accessToken, playlistType } = req.query;
  if (![accessToken, playlistType].every(e => !!e)) {
    return res
      .status(400)
      .json({ error: 'Bad request - missing query params!' });
  }
  // TODO get userId, manage refreshtoken and store with the userId after logging in
  const userOpts = {
    userId: 'heinekenchong',
    accessToken,
  };
  let { result: tracks, err } = await getPreviewPlaylist(
    userOpts,
    playlistType
  );
  if (err) {
    console.error('Error while getting preview playlist: ', err);
    return res.status(500).json({ err });
  }

  return res.json({ tracks });
});

console.log('Listening on 8888');
app.listen(8888);
