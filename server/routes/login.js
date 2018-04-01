const express = require('express');
const qs = require('query-string');
const axios = require('axios');
const uuidv4 = require('uuid/v4');

const { exchangeAuthorizationCode } = require('../services/oauth2Service.js');
const {getOAuthHeader} = require('../lib/oauthUtils.js');
const {
  COOKIE_SONGBIRD_REFRESH_TOKEN,
  COOKIE_SONGBIRD_ACCESS_TOKEN,
} = require('../constants.global.js');
const {
  OAUTH_REDIRECT_URI,
  OAUTH_SCOPES,
  OAUTH_CLIENT_ID,
  URL_FRONTEND,
  URL_SPOTIFY_CURRENT_USER,
  URL_SPOTIFY_AUTHORIZATION_CODE,
  COOKIE_STATE_KEY,
} = require('../constants.js');

const router = express.Router();
router.get('/login', function(req, res) {
  const state = uuidv4();
  res.cookie(COOKIE_STATE_KEY, state);

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
  const storedState = req.cookies ? req.cookies[COOKIE_STATE_KEY] : null;

  if (state === null || state !== storedState) {
    res.redirect(
      '/#' +
        qs.stringify({
          error: 'state_mismatch',
        })
    );
    return;
  }
  res.clearCookie(COOKIE_STATE_KEY);

  // Got an authorization code, exchange it for the user's access and refresh token
  let resp = await exchangeAuthorizationCode(code);

  if (resp.err) {
    const urlParams = qs.stringify({ error: 'Bad authorization code' });
    res.redirect(`${URL_FRONTEND}/?${urlParams}`);
    return;
  }

  const { accessToken, refreshToken } = resp.result;
  console.log('===============================');
  console.log('Successfully obtained tokens: ');
  console.log('Access Token: ', accessToken);
  console.log('Refresh Token: ', refreshToken);
  console.log('===============================');
  // TODO store in DB or something, link to user ID. Must check spotify to get user ID?

  resp = await getUserProfile(accessToken);
  if (resp.err) {
    const urlParams = qs.stringify({error: 'Internal Server Error'});
    res.redirect(`${URL_FRONTEND}/?${urlParams}`);
    return;
  }
  console.log(resp);
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

async function getUserProfile(accessToken) {
  const opts = {
    headers: getOAuthHeader(accessToken),
  };
  try {
    let resp = await axios.get(URL_SPOTIFY_CURRENT_USER, opts);
    return { result: resp.data };
  } catch (err) {
    console.error('Error trying to get user profile');
    console.error(err.config);
    console.error(err.response.status);
    console.error(err.response.data);
    return { err };
  }
}

module.exports = router;
