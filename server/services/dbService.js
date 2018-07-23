const { Pool } = require('pg');
const {
  PLAYLIST_TYPE_DB_MAP,
  DB_CONNECTION_STRING,
} = require('../constants.js');

const pool = new Pool({
  connectionString: DB_CONNECTION_STRING,
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

async function getUserByToken(token) {
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
async function getUserById(id) {
  const client = await pool.connect();
  try {
    const res = await client.query('SELECT * FROM users WHERE id = $1', [id]);
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
  } catch (error) {
    console.error('Unable to putUser: ', error);
    return { error };
  } finally {
    client.release();
  }
}

async function addPlaylistSubscription(
  userId,
  spotifyPlaylistId,
  playlistType
) {
  const dbPlaylistType = PLAYLIST_TYPE_DB_MAP[playlistType];
  const client = await pool.connect();
  try {
    const res = await client.query(
      'INSERT INTO subscriptions (user_id, spotify_playlist_id, playlist_type) VALUES ($1, $2, $3)',
      [userId, spotifyPlaylistId, dbPlaylistType]
    );
    return {};
  } catch (err) {
    console.error('Unable to addPlaylistSubscription: ', err);
    throw new Error(err);
  } finally {
    client.release();
  }
}

// Get active subscriptions, joined on user_id for token
async function getActiveSubscriptions() {
  const client = await pool.connect();
  try {
    const res = await client.query(
      'SELECT s.*, spotify_username, token FROM subscriptions s INNER JOIN users u ON u.id = s.user_id WHERE s.deleted_at IS NULL'
    );
    return { result: res.rows };
  } catch (err) {
    console.error('Unable to getActiveSubscriptions: ', err);
    throw new Error(err);
  } finally {
    client.release();
  }
}

async function getSubscription(userId, playlistType) {
  const dbPlaylistType = PLAYLIST_TYPE_DB_MAP[playlistType];
  const client = await pool.connect();
  try {
    const res = await client.query(
      'SELECT * FROM subscriptions WHERE user_id = $1 AND playlist_type = $2',
      [userId, dbPlaylistType]
    );
    return { result: res.rows[0] };
  } catch (err) {
    console.error(
      `Unable to getSubscription for ${userId}, ${dbPlaylistType}: `,
      err
    );
    throw new Error(err);
  } finally {
    client.release();
  }
}

async function deleteSubscription(subscriptionId) {
  const client = await pool.connect();
  try {
    const res = await client.query(
      'UPDATE subscriptions SET deleted_at = NOW() WHERE id = $1',
      [subscriptionId]
    );
    return {};
  } catch (err) {
    console.error(
      `Unable to soft delete subscription ${subscriptionId}: `,
      err
    );
    throw new Error(err);
  } finally {
    client.release();
  }
}

async function deleteSubscriptionByUserId(userId) {
  const client = await pool.connect();
  try {
    const res = await client.query(
      'UPDATE subscriptions SET deleted_at = NOW() WHERE user_id = $1',
      [userId]
    );
    return {};
  } catch (err) {
    console.error(`Unable to soft delete subscriptions of ${userId}: `, err);
    throw new Error(err);
  } finally {
    client.release();
  }
}

async function updateSyncTime(subscriptionId) {
  const client = await pool.connect();
  try {
    const res = await client.query(
      'UPDATE subscriptions SET last_synced = NOW() WHERE id = $1',
      [subscriptionId]
    );
    return {};
  } catch (err) {
    console.error(
      `Unable to update sync time for subscriptions ${subscriptionId}: `,
      err
    );
    throw new Error(err);
  } finally {
    client.release();
  }
}

module.exports = {
  getUserByToken,
  putUser,
  addPlaylistSubscription,
  getActiveSubscriptions,
  getSubscription,
  deleteSubscription,
  deleteSubscriptionByUserId,
  updateSyncTime,
};
