/**
 Playlist builder to generate songs from various criteria.

 Basically go through all given tracks and apply functions sequentially to get the last playlist.

 Currently doesn't work with 'preset' playlists like top tracks
**/
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
const makePlaylistBuilder = (config = DEFAULT_CONFIG, tracks = []) => ({
  config,
  tracks,
  withKey(key, value) {
    if (ALLOWED_KEYS.indexOf(key) === -1) {
      console.warn('Attempted to add value for unknown key: ', key, value);
      return this;
    }
    const config = Object.assign({}, this.config, {
      [key]: value,
    });
    return makePlaylistBuilder(config);
  },
  deleteKey(key) {
    return this.withKey(key, null);
  },
  isEmpty() {
    return (
      this.config.preset == null &&
      !isNonEmptyArray(this.config.ageRanges.length) &&
      !isNonEmptyArray(this.config.yearRanges.length) &&
      !isNonEmptyArray(this.config.artists.length) &&
      !isNonEmptyArray(this.config.genres.length) &&
      !isNonEmptyArray(this.config.moods.length)
    );
  },
  withTracks(tracks) {
    return makePlaylistBuilder(this.config, tracks);
  },
  // WARNING - this assumes the tracks have all the fields (not all endpoints return full track objects)
  build(_tracks) {
    let playlistTracks = _tracks || this.tracks;
    if (playlistTracks.length === 0) {
      console.warn('Attempted to build playlist with no tracks');
      return [];
    }
    // Apply our filters
    const artists = this.config.artists;
    if (isNonEmptyArray(artists)) {
      playlistTracks = playlistTracks.filter(track =>
        track.artists.some(e => e in artists)
      );
    }
    const genres = this.config.genres;
    if (isNonEmptyArray(genres)) {
      playlistTracks = playlistTracks.filter(track =>
        track.genres.some(e => e in genres)
      );
    }

    // This is a list to prevent any unnecessary migrations but we only care about the first item now.
    // In the future we _might_ want to allow multiple age ranges, but they might intersect
    const ageRange = this.config.ageRanges[0];
    if (!!ageRange) {
      const { low, high } = ageRange;
      playlistTracks = playlistTracks.filter(
        track => track.age <= high && track.age >= low
      );
    }

    // Same story as ageRange here
    const yearRange = this.config.yearRanges[0];
    if (!!yearRange) {
      const { low, high } = yearRange;
      playlistTracks = playlistTracks.filter(
        track => track.year <= high && track.year >= low
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
