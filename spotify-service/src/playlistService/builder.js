const { getPresetTracks } = require('../trackService');

const DEFAULT_PLAYLIST_SIZE_LIMIT = 25;

/**
   PlaylistBuilder takes in a config of the user's selected filters:
   A preset:
   {
      preset: 1
   }
   OR
   A playlistConfig where:
   struct config{
      // (low, high) days since song was added
      ageRanges: []int ,

      // Year denoting the yearRanges added
      yearRanges: []int,

      // List of artists included in this clause, resolved with boolean OR
      artist: []string,

      // List of genres included in this clause
      genres: []string,

      // List of moods included
      moods: []string,

      // THIS PROBABLY DOESN'T MAKE SENSE YET, DON'T ADD SORT
      orderBy: {
         type: 'desc',
         field: 'ageRanges',
      }
      // A user requested limit to the number of songs in the playlist.
      // Unless user is premium, we will respect the default global limit if limit > globalLimit.
      limit: 25,
   }

   Clauses cannot be combined with other clauses now for simplicity (unless enough demand + figured out frontend flow)
**/
const DEFAULT_CONFIG = {
  preset: null,
  ageRanges: [],
  yearRanges: [],
  artists: [],
  genres: [],
  // KIV, analyze song for this, eg. low energy = chill
  moods: [],
  limit: 25,
};
const ALLOWED_KEYS = Object.keys(DEFAULT_CONFIG);
// TODO make sure playlist manager works
// TODO make presets work again
const makePlaylistBuilder = ({
  config = DEFAULT_CONFIG,
  accessToken,
} = {}) => ({
  config,
  accessToken,
  _withKey(key, value) {
    if (ALLOWED_KEYS.indexOf(key) === -1) {
      console.warn('Attempted to add value for unknown key: ', key, value);
      return this;
    }
    const config = Object.assign({}, this.config, {
      [key]: value,
    });
    return makePlaylistBuilder({ config, accessToken });
  },
  withKey(key, value) {
    if (!value) {
      console.warn(
        `${value} passed in as value for withKey. To delete a value use deleteKey(key) instead to avoid bugs`
      );
      return this;
    }
    return this._withKey(key, value);
  },
  deleteKey(key) {
    return this._withKey(key, null);
  },
  isEmpty() {
    return (
      this.config.preset == null &&
      !isNonEmptyArray(this.config.ageRanges) &&
      !isNonEmptyArray(this.config.yearRanges) &&
      !isNonEmptyArray(this.config.artists) &&
      !isNonEmptyArray(this.config.genres) &&
      !isNonEmptyArray(this.config.moods)
    );
  },
  // WARNING - this assumes the tracks have all the fields (not all endpoints return full track objects)
  async build(_tracks) {
    if (this.config.preset) {
      const { result: tracks } = await getPresetTracks(
        accessToken,
        this.config.preset
      );
      return tracks;
    }

    let playlistTracks = _tracks || this.tracks;
    if (playlistTracks.length === 0) {
      console.warn('Attempted to build playlist with no tracks');
      return [];
    }

    // Apply our filters
    const artists = this.config.artists;
    if (isNonEmptyArray(artists)) {
      playlistTracks = playlistTracks.filter(track =>
        track.artists.some(e => artists.indexOf(e) !== -1)
      );
    }
    const genres = this.config.genres;
    if (isNonEmptyArray(genres)) {
      playlistTracks = playlistTracks.filter(track =>
        track.features.genres.some(e => genres.indexOf(e) !== -1)
      );
    }

    // This is a list to prevent any unnecessary migrations but we only care about the first item now.
    // In the future we _might_ want to allow multiple age ranges, but they might intersect
    const ageRange = this.config.ageRanges[0];
    if (!!ageRange) {
      const { low, high } = ageRange;
      playlistTracks = playlistTracks.filter(
        track => track.features.age <= high && track.features.age >= low
      );
    }

    // Same story as ageRange here
    const yearRange = this.config.yearRanges[0];
    if (!!yearRange) {
      const { low, high } = yearRange;
      playlistTracks = playlistTracks.filter(
        track => track.features.year <= high && track.features.year >= low
      );
    }

    // Limit by 25. Change if we have premium features
    const limit = Math.min(this.config.limit, DEFAULT_PLAYLIST_SIZE_LIMIT);
    playlistTracks = playlistTracks.slice(0, limit);
    return playlistTracks;
  },
});

function isNonEmptyArray(arr) {
  return !!arr && arr.length && arr.length > 0;
}

module.exports = makePlaylistBuilder;
