# Songbird
Songbird is a tool that allows users to create smart playlists in Spotify. Smart playlists will automatically update themselves according to certain presets / configurations / listening habits, just continue adding new songs into your library and they'll be automatically synced to your playlists when Songbird runs.

Some examples of smart playlists:
- Top Tracks (based on what you have been listening recently)
- Tracks from the 90s
- Tracks from a certain artist
- Tracks belonging to a certain genre

Songbird was initially hosted at [https://getsongbird.io](https://getsongbird.io), but I took it down because it required some maintenance and costed ~$10 monthly for hosting, but couldn't become self-sustaining.

Unfortunately for me, the constant stream of emails from users guilt tripped me enough to extract out the important parts into this standalone version.

## Donations
### Donate [here](https://paypal.me/getsongbird)

Donations are very welcome and will incentivize me to actually work on improving this project. Here are some milestones I temporarily set as goals for this project. Send an email to getsongbird@gmail.com with a proof of donation and I'll include your logo / name / whatever.

- [X] $2 - Create standalone version of songbird and open source it
- [ ] $50 - Make me regain faith in humanity and working on side projects
- [ ] $100 - Guilt trip me enough to work on fixing bugs more frequently / adding some features (e.g. new filters)
- [ ] $500 - $500 is enough to cover the server costs for a few years. If we come to this I will polish the code enough and host it again
- [ ] $1000 - The servers will go online for at least 5 years! By then I probably already forgot about its existence and how it's eating into my bank account every month


## Prerequisites
Minimal programming experience is required to run this, just google around if you're having trouble with running this

1. Clone this awesome repo
```
git clone git@github.com:zweicoder/songbird.git
```

2. Install [Docker](https://docs.docker.com/install/) and [docker-compose](https://docs.docker.com/compose/install/)

3. Go to https://developer.spotify.com/dashboard/login, sign up and create a project

4. In Spotify's dashboard page, click on `Edit Settings` and add `localhost:8888/callback` to `Redirect URIs`
![redirect uris](images/redirect_uris.png)

5. Copy the client ID and client secret from the dashboard

![Dashboard](images/dashboard.png)

6. Paste the above into `/etc/songbird/secrets.env`, it should look like this:
```
CLIENT_ID=<copy this from the dashboard>
CLIENT_SECRET=<copy this from the dashboard>
```

7. Pat yourself on the back, you're all set! (and if not, I suggest you complain loudly!)

## Usage
### Start all services
```
./scripts/start_webserver.sh
```
_Note: If you get some permission error trying to run this script, run `chmod +x ./scripts/*`__

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
Contributions are very welcome and will make this tool more awesome for everyone!
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


## Feedback
Email your feedback to getsongbird@gmail.com :)
