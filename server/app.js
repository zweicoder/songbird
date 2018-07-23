const express = require('express');
const morgan = require('morgan');
const request = require('request');
const qs = require('query-string');
const cookieParser = require('cookie-parser');
const cors = require('cors');
const axios = require('axios');
const bodyParser = require('body-parser');

const loginRouter = require('./routes/login.js');
const playlistRouter = require('./routes/playlist.js');

const logger = require('./lib/logger.js')('app.js');

const app = express();

app.use(bodyParser.json());
app.use(cookieParser());
app.use(morgan('common'));
app.use(cors());

app.use(loginRouter, playlistRouter);

process.on('unhandledRejection', function(reason, p) {
  logger.error("Unhandled Rejection: %o", reason.stack);
});

app.use((err, req, res, next) => {
  logger.error("Unhandled Rejection: %o", err);
  res.status(500).send('Oops! Looks like something broke :(');
});

logger.info('Listening on 8888');
app.listen(8888);
