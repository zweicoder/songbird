CREATE TABLE users (
        id SERIAL PRIMARY KEY,
        spotify_username TEXT UNIQUE,
        token TEXT UNIQUE,
        );


CREATE TABLE subscriptions (
        id SERIAL PRIMARY KEY,
        user_id INT NOT NULL REFERENCES users(id),
        playlist_type SMALLINT NOT NULL,
        )
