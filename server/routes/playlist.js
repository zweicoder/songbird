const express = require('express');

const {
  getTopTracks,
  TIME_RANGE_OPTS,
} = require('../services/spotify/trackService.js');
const { getUserProfile } = require('../services/spotify/userService.js');
const { refreshAccessToken } = require('../services/spotify/oauth2Service.js');
const {
  PLAYLIST_TYPE_TOP_SHORT_TERM,
  PLAYLIST_TYPE_TOP_MID_TERM,
  PLAYLIST_TYPE_TOP_LONG_TERM,
  PLAYLIST_TYPE_POPULAR,
} = require('../constants.global.js');

const router = express.Router();
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

router.get('/playlist', async (req, res) => {
  const { refreshToken, playlistType } = req.query;
  if (![refreshToken, playlistType].every(e => !!e)) {
    return res
      .status(400)
      .json({ error: 'Bad request - missing query params!' });
  }
  let { result: accessToken } = await refreshAccessToken(refreshToken);

  let { result: userId } = await getUserProfile(accessToken);
  const userOpts = {
    userId,
    accessToken,
  };
  let { result: tracks } = await getPreviewPlaylist(userOpts, playlistType);

  return res.json({ tracks });
});

module.exports = router;
