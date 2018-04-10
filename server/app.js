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

const app = express();

app.use(bodyParser.json());
app.use(cookieParser());
app.use(morgan('tiny'));
app.use(cors());

app.use(loginRouter, playlistRouter);

process.on('unhandledRejection', function(reason, p) {
  console.log("Unhandled Rejection:", reason.stack);
});

app.use((err, req, res, next) => {
  res.status(500).send('Oops! Looks like something broke :(');
});

console.log('Listening on 8888');
app.listen(8888);
