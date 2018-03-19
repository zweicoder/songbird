require('dotenv').config();
const express = require('express');
const morgan = require('morgan');
const request = require('request');
const querystring = require('querystring');
const cookieParser = require('cookie-parser');
const uuidv4 = require('uuid/v4');
const { getBasicAuthHeader, getOAuthHeader } = require('./lib/oauthUtils.js');

const redirect_uri = 'http://localhost:8888/callback'; // Your redirect uri
const COOKIE_STATE_KEY = 'spotify_auth_state';
const URL_FRONTEND = 'http://localhost:3000';
const app = express();

app.use(cookieParser());
app.use(morgan('tiny'));

app.get('/login', function(req, res) {
  const state = uuidv4();
  res.cookie(COOKIE_STATE_KEY, state);

  // your application requests authorization
  const scope =
    'user-read-private user-read-email playlist-read-private user-library-read playlist-modify-public playlist-modify-private user-top-read';
  res.redirect(
    'https://accounts.spotify.com/authorize?' +
      querystring.stringify({
        response_type: 'code',
        client_id: process.env.CLIENT_ID,
        scope,
        redirect_uri,
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
        querystring.stringify({
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
        redirect_uri,
        grant_type: 'authorization_code',
      },
      headers: getBasicAuthHeader(),
      json: true,
    };

    request.post(authOptions, function(error, response, body) {
      if (!error && response.statusCode === 200) {
        const accessToken = body.access_token,
          refreshToken = body.refresh_token;

        console.log('Successfully obtained tokens: ');
        console.log('Access Token: ', accessToken);
        console.log('Refresh Token: ', refreshToken);
        // TODO store in DB or something, link to user ID. Must check spotify to get user ID?
        // TODO let user keep userId and refreshToken for future requests
        res.redirect(`${URL_FRONTEND}/#` + querystring.stringify({
          result: 'success'
        }));
      } else {
        res.redirect(
          `${URL_FRONTEND}/#` +
            querystring.stringify({
              error: 'invalid_token',
            })
        );
      }
    });
  }
});

// TODO more fun endpoints for playlist management
console.log('Listening on 8888');
app.listen(8888);
