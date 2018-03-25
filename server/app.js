require('dotenv').config();
const express = require('express');
const morgan = require('morgan');
const request = require('request');
const qs = require('query-string');
const cookieParser = require('cookie-parser');
const uuidv4 = require('uuid/v4');
const cors = require('cors');
const { getBasicAuthHeader, getOAuthHeader } = require('./lib/oauthUtils.js');
const {
  getTopTracks,
  TIME_RANGE_OPTS,
} = require('./playlist_manager/trackService.js');
const {
  COOKIE_SONGBIRD_REFRESH_TOKEN,
  COOKIE_SONGBIRD_ACCESS_TOKEN,
  PLAYLIST_TYPE_TOP_SHORT_TERM,
  PLAYLIST_TYPE_TOP_MID_TERM,
  PLAYLIST_TYPE_TOP_LONG_TERM,
  PLAYLIST_TYPE_POPULAR,
} = require('./constants.js');

const REDIRECT_URI = 'http://localhost:8888/callback';
const COOKIE_STATE_KEY = 'spotify_auth_state';
const URL_FRONTEND = 'http://localhost:3000';
const app = express();

app.use(cookieParser());
app.use(morgan('tiny'));
app.use(cors());

app.get('/login', function(req, res) {
  const state = uuidv4();
  res.cookie(COOKIE_STATE_KEY, state);

  const scope =
    'user-read-private user-read-email playlist-read-private user-library-read playlist-modify-public playlist-modify-private user-top-read';
  res.redirect(
    'https://accounts.spotify.com/authorize?' +
      qs.stringify({
        response_type: 'code',
        client_id: process.env.CLIENT_ID,
        scope,
        redirect_uri: REDIRECT_URI,
        state,
      })
  );
});

app.get('/callback', function(req, res) {
  // your application requests refresh and access tokens
  // after checking the state parameter
  const code = req.query.code || null;
  const state = req.query.state || null;
  const storedState = req.cookies ? req.cookies[COOKIE_STATE_KEY] : null;

  if (state === null || state !== storedState) {
    res.redirect(
      '/#' +
        qs.stringify({
          error: 'state_mismatch',
        })
    );
  } else {
    res.clearCookie(COOKIE_STATE_KEY);
    // Got an authorization code, exchange it for the user's access and refresh token
    const authOptions = {
      url: 'https://accounts.spotify.com/api/token',
      form: {
        code,
        redirect_uri: REDIRECT_URI,
        grant_type: 'authorization_code',
      },
      headers: getBasicAuthHeader(),
      json: true,
    };

    request.post(authOptions, function(error, response, body) {
      if (!error && response.statusCode === 200) {
        const accessToken = body.access_token,
          refreshToken = body.refresh_token;

        console.log('===============================');
        console.log('Successfully obtained tokens: ');
        console.log('Access Token: ', accessToken);
        console.log('Refresh Token: ', refreshToken);
        console.log('===============================');
        // TODO store in DB or something, link to user ID. Must check spotify to get user ID?
        res.redirect(
          `${URL_FRONTEND}/?` +
            qs.stringify({
              result: 'success',
              accessToken,
              refreshToken,
            })
        );
      } else {
        console.log('Error getting oauth tokens: ', error);
        res.redirect(
          `${URL_FRONTEND}/?` +
            qs.stringify({
              error: 'invalid_token',
            })
        );
      }
    });
  }
});

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
