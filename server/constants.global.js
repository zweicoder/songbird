const PLAYLIST_TYPE_TOP_SHORT_TERM = 'PLAYLIST_TYPE_TOP_SHORT_TERM';
const PLAYLIST_TYPE_TOP_MID_TERM = 'PLAYLIST_TYPE_TOP_MID_TERM';
const PLAYLIST_TYPE_TOP_LONG_TERM = 'PLAYLIST_TYPE_TOP_LONG_TERM';
const PLAYLIST_TYPE_POPULAR = 'PLAYLIST_TYPE_POPULAR';
const PLAYLIST_TYPE_RECENT = 'PLAYLIST_TYPE_RECENT';

const PLAYLIST_METADATA = {
  PLAYLIST_TYPE_TOP_SHORT_TERM: {
    title: 'Top Tracks (Short Term)',
    tooltip: 'Your favorite tracks in the last 4 weeks'
  },
  PLAYLIST_TYPE_TOP_MID_TERM: {
    title: 'Top Tracks (Mid Term)',
    tooltip: 'Your favorite tracks in the last 6 months'
  },
  PLAYLIST_TYPE_TOP_LONG_TERM: {
    title: 'Top Tracks (Long Term)',
    tooltip: 'Your all time favorites'
  },
  PLAYLIST_TYPE_POPULAR: {
    title: 'Popular Tracks',
    tooltip: 'Your tracks that are popular amongst other Spotify users'
  },
  PLAYLIST_TYPE_RECENT: {
    title: 'Recently Added Tracks',
    tooltip: 'Your most recently added tracks'
  }
};

const PLAYLIST_LIMIT_BASIC = 4;
const PLAYLIST_LIMIT_HARD_CAP= 25;

// Keep create-react-app for now - This file has to be fully ES5
module.exports = {
  PLAYLIST_LIMIT_BASIC,
  PLAYLIST_LIMIT_HARD_CAP,
  PLAYLIST_METADATA: PLAYLIST_METADATA,
};
