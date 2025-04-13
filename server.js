require('rootpath')();
// using express
const express = require('express');
const app = express();
const cookieParser = require('cookie-parser');
const cors = require('cors');

// for parsing request bodies
const bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(cookieParser());

// allow cors requests from all origins and with creds
app.use(cors({ origin: (origin, callback) => callback(null, true), credentials: true }));

// routes
// app.use('/accounts', require('./accounts/accounts.controller'));
// app.use('/api-docs', require('./_helpers/swagger'));

// use error handler middleware
const errorHandler = require('./backend/_middleware/error-handler');
app.use(errorHandler)

// start server
const port = process.env.NODE_ENV === 'production' ? (process.env.PORT || 80) : 4000;
app.listen(port, () => console.log('Server listening on port', port));
