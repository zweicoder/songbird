CREATE TABLE users (
        id SERIAL PRIMARY KEY,
        spotify_username TEXT UNIQUE,
        token TEXT UNIQUE,
        created_at TIMESTAMPTZ DEFAULT NOW()
        );


CREATE TABLE subscriptions (
        id SERIAL PRIMARY KEY,
        user_id INT NOT NULL REFERENCES users(id),
        spotify_playlist_id TEXT UNIQUE,
        playlist_type SMALLINT NOT NULL,
        created_at TIMESTAMPTZ DEFAULT NOW()
        );
