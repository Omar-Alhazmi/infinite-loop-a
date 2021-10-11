const express = require('express');
const router = express.Router();
const Items = require('../models/Items');
const Storage = require('../models/Storage');
const GeneralCapacity = require('../models/GeneralCapacity');
const Auth = require('../../config/auth');
require("dotenv").config();
const fs = require('fs');
const jwt = require('jsonwebtoken');
const config = require('../../config/db');
require("dotenv");
//----------------------- All Post request ----------------------------\\
//this route response to register a new Item to the Storage
// router.post('/api/add/Cp', Auth.auth.checkCustomer, (req, res) => {
//   let savedCP = new GeneralCapacity(req.body)
//   savedCP.save()
//   res.status(200).json({
//     success: true,
//     M: "success"
//   })
// })
// Auth.auth.checkCustomer,
router.post('/api/add/new/item/:id',  (req, res) => {
  let newCapacity
  const item = {
    StorAt: req.params.id,
    ItemName: req.body.ItemName,
    ItemSize: req.body.ItemSize
  }
  let savedItem = new Items(item)
  GeneralCapacity.find({}, (err, foundCapacity) => {
    Storage.findById(savedItem.StorAt, async (error, foundStorage) => {
      let RemainingSpace, TotalOccupancy
      try {
        if (foundCapacity[0].TotalCapacity > 0) {
          switch (true) {
            case ((foundStorage.StorageType === "Primary") && (foundStorage.SubscriptionStorageArea > savedItem.ItemSize)):
              newCapacity = foundStorage.SubscriptionStorageArea - savedItem.ItemSize
              await foundStorage.updateOne({ SubscriptionStorageArea: newCapacity });
              break;
            case ((foundStorage.StorageType === "Primary") && (foundStorage.SubscriptionStorageArea > 0)):
              RemainingSpace = savedItem.ItemSize - foundStorage.SubscriptionStorageArea
              await foundStorage.updateOne({ SubscriptionStorageArea: 0 })
              await foundStorage.updateOne({ StorageArea: RemainingSpace })
              break;
            case ((foundStorage.StorageType === "Primary")):
              TotalOccupancy = foundStorage.StorageArea + savedItem.ItemSize
              newCapacity = foundCapacity[0].TotalCapacity - savedItem.ItemSize
              await foundStorage.updateOne({ StorageArea: TotalOccupancy });
              await foundCapacity[0].updateOne({ TotalCapacity: newCapacity });
              break;
            case ((foundStorage.StorageType === "Premium") && (foundStorage.SubscriptionStorageArea > savedItem.ItemSize)):
              newCapacity = foundStorage.SubscriptionStorageArea - savedItem.ItemSize
              await foundStorage.updateOne({ SubscriptionStorageArea: newCapacity });
              break;
            case ((foundStorage.StorageType === "Premium") && (foundStorage.SubscriptionStorageArea > 0)):
              RemainingSpace = savedItem.ItemSize - foundStorage.SubscriptionStorageArea
              await foundStorage.updateOne({ SubscriptionStorageArea: 0 })
              await foundStorage.updateOne({ StorageArea: RemainingSpace })
              break;
            case ((foundStorage.StorageType === "Premium")):
              TotalOccupancy = foundStorage.StorageArea + savedItem.ItemSize
              newCapacity = foundCapacity[0].TotalCapacity - savedItem.ItemSize
              await foundStorage.updateOne({ StorageArea: TotalOccupancy })
              await foundCapacity[0].updateOne({ TotalCapacity: newCapacity });
              break;
            case ((foundStorage.StorageType === "Daily")):
              TotalOccupancy = foundStorage.StorageArea + savedItem.ItemSize
              newCapacity = foundCapacity[0].TotalCapacity - savedItem.ItemSize
              await foundStorage.updateOne({ StorageArea: TotalOccupancy });
              await foundCapacity[0].updateOne({ TotalCapacity: newCapacity });
              break;
            default:
              TotalOccupancy = foundStorage.StorageArea + savedItem.ItemSize
              newCapacity = foundCapacity[0].TotalCapacity - savedItem.ItemSize
              await foundStorage.updateOne({ StorageArea: TotalOccupancy });
              await foundCapacity[0].updateOne({ TotalCapacity: newCapacity });
              break;
          }
        }
        const token = jwt.sign({
          type: "Storage data",
          data: {
            StorageArea: newCapacity
          }
        }, config.database.secret, {
          expiresIn: "5h"
        })
        foundStorage.Items.push(savedItem)
        foundStorage.save()
        savedItem.save()
        foundStorage.save()
        res.status(200).json({
          success: true,
          token: token
        })
      }
      catch (error) {
        console.log(error);
        res.status(404).json(error);
      }
    });
  });
});
//===================== Patch ====================\\

//=========================================================

//===================== get ====================\\
router.get('/api/get/storage/by/:id', (req, res) => {
  Storage.findById(req.params.id)
  .lean().populate('Items', 'ItemName ItemSize')
    .lean().populate('StorageCapacity', 'TotalCapacity -_id')
    .exec((err, Storage) => {
      if (err) {
        res.status(500).send(err);
        return;
      }
      console.log(Storage);
      res.status(200).json(Storage);
    })
});
//=========================================================

module.exports = router;