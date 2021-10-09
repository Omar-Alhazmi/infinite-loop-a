const jwt = require('jsonwebtoken');
const config = require('../config/db');
require("dotenv").config();

const auth = {
  checkStorageAdmin: async (req, res, next) => {
    try {
      const token = await req.headers.authorization.split(" ")[1];
      const decoded = jwt.verify(token, config.database.secret);
      const tokenData = req.Data = decoded;
      if (tokenData.data.Role !== "StorageAdmin") {
        next(err);
      } else {
        next();
      }
    } catch (err) {
      return res.status(401).json({
        message: 'Auth failed'
      })
    }
  },
  checkCustomer: (req, res, next) => {
    try {
      const token = req.headers.authorization.split(" ")[1];
      const decoded = jwt.verify(token, config.database.secret);
      const tokenData = req.Data = decoded;
      if (tokenData.data.Role !== "Customer") {
        next(err);
      } else {
        next();
      }
    } catch (err) {
      return res.status(401).json({
        message: 'Auth failed'
      })
    }
  },
}
module.exports = { auth };