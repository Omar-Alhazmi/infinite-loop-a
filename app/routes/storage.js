const express = require('express');
const router =express.Router();
const Storage = require('../models/Storage');
const Auth = require('../../config/auth');
require("dotenv");


//============================ Post routers ============================\/

  //============================  GET routers ============================\\
  //==============get all Storage ================\\
  router.get('/api/all/storage',Auth.auth.checkStorageAdmin ,(req, res) => {
    Storage.find({})
    .populate('BelongTo','CompanyName -_id')
    .populate('Items','ItemName -_id')
    .exec((err, storageFound) => {
      if (err) {
        res.status(500).send(err);
        return;
      }
      res.status(200).json(storageFound);
    })
})
module.exports = router;
