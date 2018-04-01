const { Pool } = require('pg');

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
    console.log(res.rows[0]);
    return { result: res.rows[0] };
  } catch (err) {
    return { err };
  } finally {
    client.release();
  }
}

async function putUser(userId, token) {
  const client = await pool.connect();
  try {
    const res = await client.query(
      'INSERT INTO users (user_id, token) VALUES ($1, $2) ON CONFLICT (user_id) DO UPDATE SET (token) = ($2)',
      [userId, token]
    );
    return { result: res.rows[0] };
  } catch (err) {
    return { err };
  } finally {
    client.release();
  }
}

module.exports = {
  getUser,
  putUser,
};
