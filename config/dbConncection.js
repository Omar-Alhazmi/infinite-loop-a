const mongoose = require('mongoose');
const db = require('./db');
require('dotenv/config');

const cdb = db.currentDB
const connectDB = async () => {
  try {
    await mongoose.connect(cdb,
       {
        useNewUrlParser: true,
        useCreateIndex: true,
        useUnifiedTopology: true,
        useFindAndModify: false
    });
    console.log("MongoDB Connected on "+cdb)
} catch (err) {
    console.error(err.message);
    process.exit(1);
}
};
module.exports = connectDB;