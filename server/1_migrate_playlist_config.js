// JS script to migrate playlist_type column to the new config column
const { Pool } = require('pg');
const { DB_CONNECTION_STRING } = require('./constants.js');

const pool = new Pool({
  connectionString: DB_CONNECTION_STRING,
  max: 10,
  idleTimeoutMillis: 10000,
  connectionTimeoutMillis: 5000,
});

async function getAllSubscriptions() {
  const client = await pool.connect();
  try {
    const res = await client.query('SELECT * FROM subscriptions WHERE deleted_at is NULL');
    return res.rows;
  } catch (err) {
    throw new Error(err);
  } finally {
    client.release();
  }
}

async function migrateSubscriptions(
  id,
  playlistConfig
) {
  const client = await pool.connect();
  try {
    const res = await client.query(
      'UPDATE subscriptions SET playlist_config = $1 WHERE id = $2',
      [playlistConfig, id]
    );
    return {};
  } catch (err) {
    console.error('Unable to addPlaylistSubscription: ', err);
    throw new Error(err);
  } finally {
    client.release();
  }
}

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
async function main() {
  console.log('Executing migrations...');
  const allSubscriptions = await getAllSubscriptions();
  for (let subscription of allSubscriptions) {
    console.log(`Migrating ${subscription}...`);
    const {id, playlist_type} = subscription;
    const playlistConfig = Object.assign({}, DEFAULT_CONFIG, {preset: playlist_type});
    await migrateSubscriptions(id, playlistConfig);
  }

  console.log('Successfully migrated playlistConfig column!');
  return;
}

main();
