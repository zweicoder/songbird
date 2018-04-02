const express = require('express');

const {
  getPlaylistTracks,
  createEmptyPlaylist,
  putPlaylistSongs,
} = require('../services/spotify/playlistService.js');
const { getUserProfile } = require('../services/spotify/userService.js');
const { refreshAccessToken } = require('../services/spotify/oauth2Service.js');
const {
  PLAYLIST_TYPE_TOP_SHORT_TERM,
  PLAYLIST_TYPE_TOP_MID_TERM,
  PLAYLIST_TYPE_TOP_LONG_TERM,
  PLAYLIST_TYPE_POPULAR,
} = require('../constants.global.js');

const router = express.Router();

router.get('/playlist', async (req, res) => {
  const { refreshToken, playlistType } = req.query;
  if (![refreshToken, playlistType].every(e => !!e)) {
    return res
      .status(400)
      .json({ error: 'Bad request - missing query params!' });
  }
  const { result: accessToken } = await refreshAccessToken(refreshToken);

  const { result: userId } = await getUserProfile(accessToken);
  const userOpts = {
    userId,
    accessToken,
  };
  const { result: tracks } = await getPlaylistTracks(userOpts, playlistType);

  return res.json({ tracks });
});

router.post('/playlist', async (req, res) => {
  const { playlistType, refreshToken } = req.body;

  const { result: accessToken } = await refreshAccessToken(refreshToken);
  const { result: userId } = await getUserProfile(accessToken);
  const userOpts = {
    userId,
    accessToken,
  };
  // TODO default names and description depending on playlist type
  const playlistOpts = {
    name: 'Songbird Playlist',
    description: 'blabla',
  };
  const [{ result: tracks }, { result: playlistId }] = await Promise.all([
    getPlaylistTracks(userOpts),
    createEmptyPlaylist(userOpts, playlistOpts),
  ]);

  await putPlaylistSongs(userOpts, playlistId, tracks);
  res.sendStatus(200);
});

module.exports = router;
