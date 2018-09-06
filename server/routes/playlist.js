const express = require('express');
const jsonParser = require('body-parser').json();
const moment = require('moment');
const { stripe, isSubcriptionActive } = require('../services/stripeService.js');

const {
  getPlaylistTracks,
  createEmptyPlaylist,
  putPlaylistSongs,
  getAllUserPlaylists,
  getStalePlaylists,
} = require('spotify-service').playlistService;
const { getUserProfile } = require('spotify-service').userService;
const { refreshAccessToken } = require('../lib/oauthClient.js');
const {
  addPlaylistSubscription,
  getUserByToken: getDbUserByToken,
  getSubscriptionsByUserId,
} = require('../services/dbService.js');
const {
  PLAYLIST_METADATA,
  PLAYLIST_LIMIT_HARD_CAP,
  PLAYLIST_LIMIT_BASIC,
} = require('../constants.global.js');
const { wrapRoute } = require('../lib/utils.js');
const logger = require('../lib/logger.js')('routes/playlist.js');

const router = express.Router();

async function createPlaylistWithTracks({
  refreshToken,
  accessToken,
  tracks,
  playlistOpts: _playlistOpts,
}) {
  if (!accessToken && !refreshToken) {
    logger.warn('No token passed to createPlaylistWithTracks');
    return { err: 'No Token' };
  }
  if (!accessToken) {
    const res = await refreshAccessToken(refreshToken);
    accessToken = res.result;
  }
  const { result: userProfile } = await getUserProfile(accessToken);
  const userId = userProfile.id;

  const playlistOpts = Object.assign(
    {
      name: 'My Awesome Playlist (Songbird)',
      description: 'Generated by Songbird',
    },
    _playlistOpts
  );
  logger.info(`Generating playlist '${playlistOpts.name}' for ${userId}`);
  const [{ result: playlistId }] = await Promise.all([
    createEmptyPlaylist(userId, accessToken, playlistOpts),
  ]);

  await putPlaylistSongs(userId, accessToken, playlistId, tracks);
  return { result: playlistId };
}

router.post(
  '/playlist',
  jsonParser,
  wrapRoute(async (req, res) => {
    const { refreshToken, tracks } = req.body;
    if (![refreshToken, tracks].every(e => e)) {
      logger.warn(
        'Unable to create playlist due to missing arguments. Body: ',
        req.body
      );
      res.sendStatus(400);
      return;
    }

    await createPlaylistWithTracks(req.body);
    res.sendStatus(200);
  })
);

router.post(
  '/playlist/subscribe',
  jsonParser,
  wrapRoute(async (req, res) => {
    const {
      playlistConfig,
      refreshToken,
      tracks,
      playlistOpts: _playlistOpts,
    } = req.body;
    if (![playlistConfig, refreshToken, tracks].every(e => e)) {
      logger.warn(
        'Missing param in request body. Keys in body: %o',
        Object.keys(req.body)
      );
      res.sendStatus(400);
      return;
    }

    const { result: dbUser } = await getDbUserByToken(refreshToken);
    if (!dbUser) {
      logger.warn('Could not find user with token: %o', refreshToken);
      res.sendStatus(400);
      return;
    }
    const [
      { result: accessToken },
      { result: subscriptions },
    ] = await Promise.all([
      refreshAccessToken(refreshToken),
      getSubscriptionsByUserId(dbUser.id),
    ]);
    if (dbUser.spotify_username !== 'heinekenchong') {
      // Not god user
      logger.info('Checking for existing subscriptions...');
      const {
        result: { active, stale },
      } = await getStalePlaylists(accessToken, subscriptions);

      function handleLimitExceeded() {
        logger.info(`User: ${dbUser.spotify_username} limit exceeded`);
        res.status(400).send({
          error: 'ERROR_PLAYLIST_LIMIT_REACHED',
          message: 'User has reached limit of playlists',
        });
      }

      logger.info(`User: ${dbUser.spotify_username} | active: ${active.length}`);
      // User exceeded basic user's limit
      if (active.length >= PLAYLIST_LIMIT_BASIC) {
        if (active.length >= PLAYLIST_LIMIT_HARD_CAP) {
          handleLimitExceeded();
          return;
        }
        // Check with stripe to see if subscription still pseudo-active
        const stillAlive = await isSubcriptionActive(dbUser.stripe_sub_id);
        if (!stillAlive) {
          handleLimitExceeded();
          return;
        }
      }
    }

    const playlistOpts = Object.assign(
      {
        name: 'My Awesome Playlist (Songbird)',
        description: `Generated by Songbird | Last synced: ${moment().format(
          'LL'
        )}`,
      },
      _playlistOpts
    );
    const { result: playlistId } = await createPlaylistWithTracks({
      accessToken,
      tracks,
      playlistOpts,
    });
    logger.info(
      'Adding subscription for user: %o with config %o',
      dbUser.spotify_username,
      playlistConfig
    );
    await addPlaylistSubscription(dbUser.id, playlistId, playlistConfig);
    logger.info(
      'Successfully added subscription for user: %o. Playlist: %o',
      dbUser.spotify_username,
      playlistId
    );
    res.sendStatus(200);
  })
);

module.exports = router;
