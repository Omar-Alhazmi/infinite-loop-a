const express = require('express');
const router = express.Router();
const Items = require('../models/Items');
const Storage = require('../models/Storage');
const Order = require('../models/Order');
const User = require('../models/User');
const Auth = require('../../config/auth');
require("dotenv").config();
const fs = require('fs');
const jwt = require('jsonwebtoken');
const config = require('../../config/db');
require("dotenv");
//----------------------- All Post request ----------------------------\\
router.post('/api/make/order/:id', async (req, res) => {
    Storage.findById(req.params.id)
        .populate('BelongTo')
        .populate('Items')
        .exec(async (StorageError, storageFound) => {
            try {
                if (StorageError) {
                    console.log(StorageError);
                    res.status(500).send(StorageError);
                    return;
                }
                let totalArea = 0;
                let savedOrder, haveProduct
                try {
                    haveProduct = storageFound.Items.map((item, index) => {
                        if (item._id) {
                            let product = {}
                            product.ItemId = item._id
                            product.Name = item.ItemName
                            product.Quantity = req.body.Quantity[index]
                            if (item.Quantity >= product.Quantity) {
                                let newQuantity = item.Quantity - product.Quantity
                                let itemId = { _id: item._id }
                                totalArea += product.Quantity * item.ItemSize
                                Items.findOneAndUpdate(itemId, { $set: { Quantity: newQuantity } }, {
                                    useFindAndModify: false,
                                    returnNewDocument: true
                                }, function (error, result) {
                                });
                                return product
                            }
                        }
                    });
                } catch (error) {
                    console.log(error);
                    res.status(404).json(error);
                }
                try {
                    haveProduct = haveProduct.filter((el) =>{return el != null});
                    console.log(haveProduct);
                    let order = {
                        CustomerName: req.body.CustomerName,
                        OrderStatus: req.body.OrderStatus,
                        ShippedBy: req.body.ShippedBy,
                        HaveItems: haveProduct
                    }
                    savedOrder = new Order(order)
                    savedOrder.save()
                } catch (error) {
                    console.log(error);
                    res.status(404).json(error);
                }

                User.findById(storageFound.BelongTo._id, async (userError, foundUser) => {
                    try {
                        if (userError) {
                            console.log(userError);
                            res.status(500).send(userError);
                            return;
                        }
                        foundUser.OrderSend.push(savedOrder);
                        foundUser.save()
                    } catch (error) {
                        console.log(error);
                        res.status(404).json(error);
                    }
                    let newArea = storageFound.StorageArea - totalArea
                    await storageFound.updateOne({ StorageArea: newArea })
                    storageFound.save()
                    res.status(200).json(savedOrder)
                })
            } catch (error) {
                console.log(error);
                res.status(404).json(error);
            }
        })
})
//===================== Patch ====================\\
//=========================================================

//===================== get ====================\\
router.get('/api/get/Order/by/:id', (req, res) => {
    User.findById(req.params.id)
        .populate('OrderSend', '-_id')
        .populate('StorageId', 'StorageArea -_id')
        .exec((err, Order) => {
            if (err) {
                res.status(500).send(err);
                return;
            }
            res.status(200).json(Order);
        })
});
//===================    ======================\\

router.get('/api/get/all/Order', (req, res) => {
    User.find({})
        .populate('OrderSend', '-_id')
        .populate('StorageId', 'StorageArea -_id')
        .exec((err, Order) => {
            if (err) {
                res.status(500).send(err);
                return;
            }
            res.status(200).json(Order);
        })
});

//========================  ============================//
//=========================================================

module.exports = router;