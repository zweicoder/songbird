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
   A playlsitConfig where:
   struct playlistConfig{
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
  ageRanges: [],
  yearRanges: [],
  artists: [],
  genres: [],
  // KIV, analyze song for this, eg. low energy = chill
  moods: [],
  limit: 25,
};
const PlaylistBuilder = (config = DEFAULT_CONFIG) => ({
  playlistConfig: config,
  withArtists(artists) {
    this.playlistConfig.artists = artists;
    return this;
  },
  withGenres(genres) {
    this.playlistConfig.genres = genres;
    return this;
  },
  withMoods(moods) {
    this.playlistConfig.moods = moods;
    return this;
  },
  withDecades(yearRanges) {
    this.playlistConfig.yearRanges = yearRanges;
    return this;
  },
  withDayRanges(ageRanges) {
    this.playlistConfig.ageRanges = ageRanges;
    return this;
  },
  withGenres(genres) {
    this.playlistConfig.genres = genres;
    return this;
  },
  withLimit(limit) {
    this.playlistConfig.limit = limit;
    return this;
  },
  // WARNING - this assumes the tracks have all the fields (not all endpoints return full track objects)
  build(tracks) {
    let playlistTracks = tracks;
    // Apply our filters
    const artists = this.playlistConfig.artists;
    if (isNonEmptyArray(artists)) {
      playlistTracks = playlistTracks.filter(track =>
        track.artists.some(e => e in artists)
      );
    }
    const genres = this.playlistConfig.genres;
    if (isNonEmptyArray(genres)) {
      playlistTracks = playlistTracks.filter(track =>
        track.genres.some(e => e in genres)
      );
    }

    // This is a list to prevent any unnecessary migrations but we only care about the first item now.
    // In the future we _might_ want to allow multiple age ranges, but they might intersect
    const ageRange = this.playlistConfig.ageRanges[0];
    if (!!ageRange) {
      const { low, high } = ageRange;
      playlistTracks = playlistTracks.filter(
        track => track.age <= high && track.age >= low
      );
    }

    // Same story as ageRange here
    const yearRange = this.playlistConfig.yearRanges[0];
    if (!!yearRange) {
      const { low, high } = yearRange;
      playlistTracks = playlistTracks.filter(
        track => track.year <= high && track.year >= low
      );
    }

    // Limit by 25. Change if we have premium features
    const limit = Math.min(
      this.playlistConfig.limit,
      DEFAULT_PLAYLIST_SIZE_LIMIT
    );
    playlistTracks = playlistTracks.slice(0, limit);
    return playlistTracks;
  },
});

function isNonEmptyArray(arr) {
  return !!arr && arr.length && arr.length > 0;
}

module.exports = PlaylistBuilder;
