const express = require('express');
const {
  PLAYLIST_TYPE_TOP_SHORT_TERM,
  PLAYLIST_TYPE_TOP_MID_TERM,
  PLAYLIST_TYPE_TOP_LONG_TERM,
  PLAYLIST_TYPE_POPULAR,
} = require('../constants.global.js');
const { getTopTracks, TIME_RANGE_OPTS } = require('../services/trackService.js');

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

module.exports = router;
