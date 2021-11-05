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
router.post('/api/add/new/item/:id', (req, res) => {
  Storage.aggregate([
    {
      $lookup: {
        from: 'items',
        localField: '_id',
        foreignField: 'StorAt',
        as: 'item_in_storage'
      }
    }, {
      $unwind: {
        path: '$item_in_storage',
        preserveNullAndEmptyArrays: true
      }
    },
    {
      $group: {
        _id: '$_id',
        StorageTotalOccupancy: {
          $sum: {
            $multiply: ["$item_in_storage.Quantity", "$item_in_storage.ItemSize"]
          }
        }
      }
    }
  ]).exec(async (err, TotalCapacity) => {
    if (err) {
      console.log(err);
      res.status(500).send(err);
      return;
    }
    let TotalStorageCapacity = TotalCapacity.map(item => item.StorageTotalOccupancy).reduce((prev, curr) => prev + curr, 0)
    if (TotalCapacity[0].TotalStorageCapacity > 6000) {
      return res.status(406).send({
        success: false,
        message: "There Is No Enough Space"
      });
    }
    Storage.findById(req.params.id)
      .populate('Items', 'ItemName Quantity ItemSize')
      .exec(async (err, foundStorage) => {
        if (err) {
          res.status(500).send(err);
          return;
        }
        const { ItemName, ItemSize, Quantity } = req.body
        const item = {}
        let itemFound = null
        let isFound = false
        foundStorage.Items.map((item, index) => {
          if (item.ItemName === req.body.ItemName) {
            itemFound = item
            isFound = true
            return itemFound
          }
        })
        let savedItem
        if (isFound === true && itemFound !== null) {
          newQuantity = req.body.Quantity + itemFound.Quantity
          await itemFound.updateOne({ Quantity: newQuantity })
          savedItem = itemFound
        } else if (isFound === false && itemFound === null) {
          item.StorAt = req.params.id,
            item.ItemName = ItemName
          item.ItemSize = ItemSize
          item.Quantity = Quantity
          savedItem = new Items(item)
          foundStorage.Items.push(savedItem)
        }
        let TotalOccupancy
        let totalItemSize = savedItem.ItemSize * Quantity
        let newCapacity = TotalCapacity + totalItemSize
        try {
          if (TotalStorageCapacity <= 6000) {
            TotalOccupancy = foundStorage.StorageArea + totalItemSize
            await foundStorage.updateOne({ StorageArea: TotalOccupancy });
          }

          const token = jwt.sign({
            type: "Storage data",
            data: {
              StorageArea: newCapacity
            }
          }, config.database.secret, {
            expiresIn: "5h"
          })
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
  })
})
// });
//===================== Patch ====================\\
router.patch('/api/update/item/:id', (req, res) => {
  Storage.aggregate([
    {
      $lookup: {
        from: 'items',
        localField: '_id',
        foreignField: 'StorAt',
        as: 'item_in_storage'
      }
    }, {
      $unwind: {
        path: '$item_in_storage',
        preserveNullAndEmptyArrays: true
      }
    },
    {
      $group: {
        _id: '$_id',
        StorageTotalOccupancy: {
          $sum: {
            $multiply: ["$item_in_storage.Quantity", "$item_in_storage.ItemSize"]
          }
        }
      }
    }
  ]).exec(async (err, TotalCapacity) => {
    if (err) {
      console.log(err);
      res.status(500).send(err);
      return;
    }
    let TotalStorageCapacity = TotalCapacity.map(item => item.StorageTotalOccupancy).reduce((prev, curr) => prev + curr, 0)
    if (TotalCapacity[0].TotalStorageCapacity > 6000) {
      return res.status(406).send({
        success: false,
        message: "There Is No Enough Space"
      });
    }
    Storage.findById(req.params.id)
      .populate('Items', 'ItemName Quantity ItemSize')
      .exec(async (err, foundStorage) => {
        if (err) {
          res.status(500).send(err);
          return;
        }
        const { ItemName, ItemSize, Quantity } = req.body
        const item = {}
        let itemFound = null
        let isFound = false
        foundStorage.Items.map((item, index) => {
          if (item.ItemName === req.body.ItemName) {
            itemFound = item
            isFound = true
            return itemFound
          }
        })
        let savedItem
        if (isFound === true && itemFound !== null) {
          item.Quantity = Quantity
          item.ItemName = ItemName
          item.ItemSize = ItemSize
          await itemFound.updateOne(item)
          savedItem = itemFound
        } else if (isFound === false && itemFound === null) {
          return res.status(406).send({
            success: false,
            message: "Item Not Found"
          });
        }
        let TotalOccupancy
        let totalItemSize = savedItem.ItemSize * Quantity
        let newCapacity = TotalCapacity + totalItemSize
        try {
          if (TotalStorageCapacity <= 6000) {
            TotalOccupancy = foundStorage.StorageArea + totalItemSize
            await foundStorage.updateOne({ StorageArea: TotalOccupancy });
          }
          const token = jwt.sign({
            type: "Storage data",
            data: {
              StorageArea: newCapacity
            }
          }, config.database.secret, {
            expiresIn: "5h"
          })
          savedItem.save()
          foundStorage.save()
          res.status(200).json({ success: true, token: token })
        }
        catch (error) {
          console.log(error);
          res.status(404).json(error);
        }
      });
  })
})
//=========================================================
router.delete('/api/delete/item/by/:id', (req, res) => {
  Items.findById(req.params.id, async (error, foundItem) => {
    try {
      await foundItem.remove();
      res.status(200).json(`Item Id:  ${req.params.id} has been deleted `);
    } catch (error) {
      res.status(404).json({
        error: {
          name: 'DocumentNotFound',
          massage: 'The provided ID dose not match any Document on Service'
        }
      });
    }
  });
});
//===================== get ====================\\
router.get('/api/get/GeneralCapacity', (req, res) => {
  Items.aggregate([
    {
      $project: {
        TotalArea_per_item: { $multiply: ["$Quantity", "$ItemSize"] },
      }
    },
    {
      $group: {
        _id: null,
        TotalCapacity: {
          $sum: "$TotalArea_per_item"
        }
      }
    }
  ]).exec(async (err, GeneralCapacity) => {
    if (err) {
      console.log(err);
      res.status(500).send(err);
      return;
    }
    res.status(200).json(GeneralCapacity);
  })
})

router.get('/api/get/storage/by/:id', (req, res) => {
  Items.aggregate([
    {
      $project: {
        TotalArea_per_item: { $multiply: ["$Quantity", "$ItemSize"] },
      }
    },
    {
      $group: {
        _id: null,
        TotalCapacity: {
          $sum: "$TotalArea_per_item"
        }
      }
    }
  ]).exec(async (err, GeneralCapacity) => {
    if (err) {
      console.log(err);
      res.status(500).send(err);
      return;
    }
    Storage.findById(req.params.id)
      .lean().populate('Items', 'ItemName ItemSize Quantity')
      .lean().populate('StorageCapacity', 'TotalCapacity -_id')
      .exec((err, Storage) => {
        if (err) {
          res.status(500).send(err);
          return;
        }
        res.status(200).json({ Storage, GeneralCapacity });
      })
  })
});
//=========================================================

module.exports = router;