const express = require('express');
const router =express.Router();
const Storage = require('../models/Storage');
const GeneralCapacity = require('../models/GeneralCapacity');
const User = require('../models/User');
// const {upload,fileUpload} = require('../../config/helperMethod');
const Auth = require('../../config/auth');
const fs = require('fs')
require("dotenv");


//============================ Post routers ============================\/

  //============================  GET routers ============================\\
  //==============get all Storage ================\\
//   router.get('/api/get/GeneralCapacity', (req, res) => {
//     GeneralCapacity.find({})
//     .exec((err, GeneralCapacity) => {
//       if (err) {
//         res.status(500).send(err);
//         return;
//       }
//       res.status(200).json(GeneralCapacity);
//     })
// })
module.exports = router;
