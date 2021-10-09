const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require('mongoose')
const cors = require("cors");
const path = require('path');


// require("dotenv/config");
// require database configuration logic
const db = require('./config/db');
const  user = require('./app/routes/user');
const  item = require('./app/routes/item');

// Define Ports
const reactPort = 3000
const expressPort = 5000

// establish database connection

// instantiate express application object
const app = express()

mongoose.Promise = global.Promise
const cdb = db.currentDB
mongoose.connect(cdb,
  {
   useNewUrlParser: true,
   useUnifiedTopology: true,
});
console.log("MongoDB Connected on "+cdb)
// set CORS headers on response from this API using the `cors` NPM package
// `CLIENT_ORIGIN` is an environment variable that will be set on Heroku

app.use(cors({ origin: process.env.CLIENT_ORIGIN || `http://localhost:${reactPort}`}))
app.use('/uploads',express.static('uploads'))
// define port for API to run on
const port = process.env.PORT || expressPort

// add `bodyParser` middleware which will parse JSON requests into
// JS objects before they reach the route files.
// The method `.use` sets up middleware for the Express applicationapp.use(bodyParser.json());
app.use(bodyParser.json())

// this parses requests sent by `$.ajax`, which use a different content type
app.use(bodyParser.urlencoded({ extended: true }))



app.use((req, res, next) => {
  console.log(`${new Date().toString()} => ${req.originalUrl}`, req.body);
  next();
});

// Handler for Error 500
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.sendFile(path.join(__dirname, "../public/500.html"));
});


app.use(user);
app.use(item);

// Handler for 404 - Resource Not Found
app.get('/*', function(req, res) {
  res.sendFile(path.join(__dirname, 'index.html'), function(err) {
    if (err) {
      res.status(404).send("We think you are lost!");
    }
  })
})


app.listen(port, () => {
  console.log(`("===== HERE WE END ====="LISTENING to http://localhost:${port}`);
});

// needed for testing
module.exports = app