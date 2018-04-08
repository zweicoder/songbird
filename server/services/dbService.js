const { Pool } = require('pg');
const {PLAYLIST_TYPE_DB_MAP} = require('../constants.js');

const pool = new Pool({
  connectionString: process.env.DB_CONNECTION_STRING,
  max: 10,
  idleTimeoutMillis: 10000,
  connectionTimeoutMillis: 5000,
});

// the pool with emit an error on behalf of any idle clients
// it contains if a backend error or network partition happens
pool.on('error', (err, client) => {
  console.error('Unexpected error on idle client', err);
  process.exit(-1);
});

async function getUser(token) {
  const client = await pool.connect();
  try {
    const res = await client.query('SELECT * FROM users WHERE token = $1', [
      token,
    ]);
    return { result: res.rows[0] };
  } catch (err) {
    console.error('Unable to getUser: ', err);
    throw new Error(err);
  } finally {
    client.release();
  }
}

async function putUser(userId, token) {
  const client = await pool.connect();
  try {
    const res = await client.query(
      'INSERT INTO users (spotify_username, token) VALUES ($1, $2) ON CONFLICT (spotify_username) DO UPDATE SET (token) = (EXCLUDED.token)',
      [userId, token]
    );
    return { result: res.rows[0] };
  } catch (err) {
    console.error('Unable to putUser: ', err);
    throw new Error(err);
  } finally {
    client.release();
  }
}

async function addPlaylistSubscription(token, spotifyUri, playlistType) {
  const { result: user } = await getUser(token);
  const dbPlaylistType = PLAYLIST_TYPE_DB_MAP[playlistType];
  if (!user) {
    return { err: 'Could not find user with token: ', token };
  }
  console.log('Inserting subscription for user: ',user);
  const client = await pool.connect();
  try {
    const res = await client.query(
      'INSERT INTO subscriptions (user_id, spotify_uri, playlist_type) VALUES ($1, $2, $3) on CONFLICT DO NOTHING',
      [user.id,spotifyUri, dbPlaylistType]
    );
    return {};
  } catch (err) {
    throw new Error(err);
  } finally {
    client.release();
  }
}

module.exports = {
  getUser,
  putUser,
  addPlaylistSubscription,
};
