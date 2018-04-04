const express = require('express');
const jsonParser = require('body-parser').json();

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
  const { result } = await getPlaylistTracks(userOpts, playlistType);

  // Pluck tracks for response
  const tracks = result.map(track => ({
    name: track.name,
    album: track.album.name,
    artists: track.artists.map(artist => artist.name),
  }));
  return res.json({ tracks });
});

router.post('/playlist', jsonParser, async (req, res) => {
  if (!req.body) {
    console.error('No body for POST /playlist');
    res.sendStatus(400);
    return;
  }
  const { playlistType, refreshToken } = req.body;

  const { result: accessToken } = await refreshAccessToken(refreshToken);
  const { result: userProfile } = await getUserProfile(accessToken);
  const userId = userProfile.id;
  console.log(`Generating playlist for: `, userId);
  const userOpts = {
    userId,
    accessToken,
  };
  // TODO default names and description depending on playlist type
  const playlistOpts = {
    name: `${playlistType} by Songbird`,
    description: 'blabla',
  };
  const [{ result: tracks }, { result: playlistId }] = await Promise.all([
    getPlaylistTracks(userOpts, playlistType),
    createEmptyPlaylist(userOpts, playlistOpts),
  ]);

  await putPlaylistSongs(userOpts, playlistId, tracks);
  res.sendStatus(200);
});

module.exports = router;
