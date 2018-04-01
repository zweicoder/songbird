const express = require('express');
const qs = require('query-string');
const axios = require('axios');
const uuidv4 = require('uuid/v4');

const { exchangeAuthorizationCode } = require('../services/spotify/oauth2Service.js');
const { getUserProfile} = require('../services/spotify/userService.js');
const { putUser } = require('../services/dbService.js');
const {
  OAUTH_REDIRECT_URI,
  OAUTH_SCOPES,
  OAUTH_CLIENT_ID,
  URL_FRONTEND,
  URL_SPOTIFY_AUTHORIZATION_CODE,
  KEY_OAUTH2_STATE,
} = require('../constants.js');

const router = express.Router();
router.get('/login', function(req, res) {
  const state = uuidv4();
  res.cookie(KEY_OAUTH2_STATE, state);

  const queryParams = qs.stringify({
    response_type: 'code',
    client_id: OAUTH_CLIENT_ID,
    scope: OAUTH_SCOPES,
    redirect_uri: OAUTH_REDIRECT_URI,
    state,
  });
  res.redirect(`${URL_SPOTIFY_AUTHORIZATION_CODE}?${queryParams}`);
});

router.get('/callback', async function(req, res) {
  // your application requests refresh and access tokens
  // after checking the state parameter
  const code = req.query.code || null;
  const state = req.query.state || null;
  const storedState = req.cookies ? req.cookies[KEY_OAUTH2_STATE] : null;

  if (state === null || state !== storedState) {
    res.redirect(
      '/#' +
        qs.stringify({
          error: 'state_mismatch',
        })
    );
    redirectWithError('state_mismatch');
    return;
  }
  res.clearCookie(KEY_OAUTH2_STATE);

  // Got an authorization code, exchange it for the user's access and refresh token
  let resp = await exchangeAuthorizationCode(code);

  if (resp.err) {
    const urlParams = qs.stringify({ error: 'Bad authorization code' });
    res.redirect(`${URL_FRONTEND}/?${urlParams}`);
    return;
  }

  const { accessToken, refreshToken } = resp.result;

  resp = await getUserProfile(accessToken);
  if (resp.err) {
    const error = 'internal_server_error';
    redirectWithError(res, error);
    return;
  }
  const { id: userId } = resp.result;
  resp = await putUser(userId, refreshToken);
  if (resp.err) {
    console.error('Error inserting user to database: ', resp.err);
    const error = 'internal_server_error';
    redirectWithError(error);
    return;
  }

  res.redirect(
    `${URL_FRONTEND}/?` +
      qs.stringify({
        result: 'success',
        accessToken,
        refreshToken,
      })
  );
  return;
});

function redirectWithError(res, error = 'internal_server_error') {
  const urlParams = qs.stringify({ error });
  res.redirect(`${URL_FRONTEND}/?${urlParams}`);
}

module.exports = router;
