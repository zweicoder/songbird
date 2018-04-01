CREATE TABLE users (
        id SERIAL PRIMARY KEY,
        user_id TEXT UNIQUE,
        token TEXT
        );
