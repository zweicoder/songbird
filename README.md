# Songbird

## Usage
Start web server to customize playlist
TODO
`docker-compose`

Run manager to update playlist

cronjob

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

Migrations is currently done via `migrate`, with additional data migration logic in `.js` files (e.g. inflate columns that need default values based on another column).

### Creating migrations
```
migrate create -ext sql -dir migrations/ <migration_name>
```
### Running migrations
```
migrate -path ./migrations -database 'postgres://postgres:postgres@localhost/songbird?sslmode=disable' up 1
```

## Frontend 
Frontend is pretty standard. CD is setup on `pages` branch.

### Development
```
npm start
```
