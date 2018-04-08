CREATE TABLE users (
        id SERIAL PRIMARY KEY,
        spotify_username TEXT UNIQUE NOT NULL,
        token TEXT UNIQUE NOT NULL,
        created_at TIMESTAMPTZ DEFAULT NOW()
        );


CREATE TABLE subscriptions (
        id SERIAL PRIMARY KEY,
        user_id INT NOT NULL REFERENCES users(id),
        spotify_playlist_id TEXT UNIQUE NOT NULL,
        playlist_type SMALLINT NOT NULL,
        created_at TIMESTAMPTZ DEFAULT NOW(),
        CONSTRAINT ak_user_id_playlist_type UNIQUE (user_id, playlist_type)
        );
