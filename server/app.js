const express = require('express');
const morgan = require('morgan');
const request = require('request');
const qs = require('query-string');
const cookieParser = require('cookie-parser');
const cors = require('cors');
const axios = require('axios');

const loginRouter = require('./routes/login.js');
const playlistRouter = require('./routes/playlist.js');

const app = express();

app.use(cookieParser());
app.use(morgan('tiny'));
app.use(cors());

app.use(loginRouter, playlistRouter);



console.log('Listening on 8888');
app.listen(8888);
