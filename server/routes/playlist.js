const express = require('express');
const jsonParser = require('body-parser').json();
const moment = require('moment');

const {
  getPlaylistTracks,
  createEmptyPlaylist,
  putPlaylistSongs,
  userHasPlaylist,
} = require('spotify-service/playlistService');
const { getUserProfile } = require('spotify-service/userService');
const { refreshAccessToken } = require('../lib/oauthClient.js');
const {
  addPlaylistSubscription,
  getUserByToken: getDbUserByToken,
  getSubscription,
} = require('../services/dbService.js');
const { PLAYLIST_METADATA } = require('../constants.global.js');
const { wrapRoute } = require('../lib/utils.js');
const logger = require('../lib/logger.js')('routes/playlist.js');

const router = express.Router();

async function createPlaylistWithTracks({
  refreshToken,
  tracks,
  playlistOpts,
}) {
  const { result: accessToken } = await refreshAccessToken(refreshToken);
  const { result: userProfile } = await getUserProfile(accessToken);
  const userId = userProfile.id;

  logger.info(`Generating playlist for ${userId}`);
  const _playlistOpts = Object.assign(
    {
      name: 'My Awesome Playlist (Songbird)',
      description: 'Generated by Songbird',
    },
    playlistOpts
  );
  const [{ result: playlistId }] = await Promise.all([
    createEmptyPlaylist(userId, accessToken, _playlistOpts),
  ]);

  console.log(userId, playlistId, tracks.length);
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
    const { playlistConfig, refreshToken, tracks, playlistOpts } = req.body;
    if (![playlistConfig, refreshToken, tracks].every(e => e)) {
      logger.warn('Missing param in request body! Body: %o', req.body);
      res.sendStatus(400);
      return;
    }

    const _playlistOpts = Object.assign(
      {
        name: 'My Awesome Playlist (Songbird)',
        description: `Generated by Songbird | Last synced: ${moment().format(
          'LL'
        )}`,
      },
      playlistOpts
    );
    const { result: dbUser } = await getDbUserByToken(refreshToken);
    if (!dbUser) {
      logger.warn('Could not find user with token: %o', refreshToken);
      res.sendStatus(400);
      return;
    }

    const { result: playlistId } = await createPlaylistWithTracks(
      refreshToken,
      playlistConfig,
      playlistOpts
    );
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
