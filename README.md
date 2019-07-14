# Songbird

## Installation
Install Docker and docker-compose

## Usage
### Start all services
```
./scripts/start_webserver.sh
```

This creates:
- web server at localhost:3000
- api server at localhost:8888
- postgres db at localhost:5444
- binds postgres_volume as a Docker volume for postgres db

After starting these services, go to http://localhost:3000 and save your smart playlists.

### Sync playlists
Once you have smart playlists in the database, you can sync it manually any time with:
```
./scripts/sync.sh
```

### Sync periodically with a Cron
Since we're all lazy people, we can create a cronjob that keeps running `./scripts/cron_entrypoint.sh`.

Edit crontab with:
```
crontab -e
```

For example, a crontab with:
```
# m h  dom mon dow   command
0 22 * * * (cd <path/to/songbird> && ./scripts/cron_entrypoint.sh)
```
will sync every day on 10:00pm. Make sure your computer is on at that time!


# Development
## Modules
This project contains of mainly these modules:
- Spotify Service
- Frontend
- Backend
- Playlist Manager / Syncer

## Spotify Service
Spotify service handles everything related to Spotify, as well as the creation of tracks, building of custom playlists.

Due to incompatibilities of ES6 modules with webpack uglify, we use Babel to to build the files for frontend consumption.

### Development
```
npm i
npm run watch
```

## Backend
The backend runs as a `docker-compose` service with a Postgres database and `express` server with an API for OAuth and a few endpoints for managing user playlists.

### Development
Make sure `.env` exists under `server/` folder and
```
npm i
npm start
```

Migrations is currently done via [migrate](https://github.com/golang-migrate/migrate), with additional data migration logic in `.js` files (e.g. inflate columns that need default values based on another column).

### Creating migrations
```
migrate create -ext sql -dir migrations/ <migration_name>
```
### Running migrations
```
migrate -path ./migrations -database 'postgres://postgres:postgres@localhost?sslmode=disable' up 1
```

## Frontend 
Frontend is pretty standard. 

### Development
```
npm start
```
