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
router.post('/api/make/order/:id', (req, res) => {
    Items.find({})
        .where('_id')
        .in(req.body.ids)
        .exec(async (err, foundItem) => {
            if (err) {
                console.log(err);
                res.status(500).send(err);
                return;
            }
            try {
                let promises = foundItem.map(async (item, index) => {
                    if (item._id) {
                        let product = {}
                        product.ItemId = item._id
                        product.Name = item.ItemName
                        product.Quantity = req.body.Quantity[index]
                        if (item.Quantity >= product.Quantity) {
                            let newQuantity = item.Quantity - product.Quantity
                            await item.updateOne({ Quantity: newQuantity })
                            item.save()
                            return product
                        }
                    }
                });
                let order = {}
                Promise.all(promises)
                    .then(results => {
                        order.CustomerName = req.body.CustomerName
                        order.OrderStatus = req.body.OrderStatus
                        order.ShippedBy = req.body.ShippedBy
                        order.HaveItems = results
                        let savedOrder = new Order(order)
                        savedOrder.save()
                        User.findById(req.params.id)
                            .exec(async (err, userFound) => {
                                if (err) {
                                    console.log(err);
                                    res.status(500).send(err);
                                    return;
                                }
                                userFound.OrderSend.push(savedOrder)
                                userFound.save()
                            })
                        res.status(200).json(savedOrder)
                    })
                    .catch(e => {
                        console.error(e);
                    })
            }
            catch (error) {
                console.log(error);
                res.status(404).json(error);
            }
        })
})
//===================== Patch ====================\\
//=========================================================

//===================== get ====================\\
router.get('/api/get/all/Order/by/:id', (req, res) => {
    User.findById(req.params.id)
    .lean().populate('OrderSend')
        .exec((err, Order) => {
            if (err) {
                res.status(500).send(err);
                return;
            }
            res.status(200).json(Order);
        })
});
//=========================================================

module.exports = router;