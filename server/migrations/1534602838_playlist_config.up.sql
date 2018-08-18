ALTER TABLE subscriptions ADD COLUMN playlist_config jsonb;
ALTER TABLE subscriptions ALTER COLUMN playlist_type DROP NOT NULL;
