const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const StorageSchema = mongoose.Schema({
        StorageType: {
            type: String,
            required: [true, 'User Type is required'],
            enum: {
                values: ["Daily","Primary","Premium"],
                message: '{VALUE} is not supported',
            },
        },
        SubscriptionStorageArea:{
            type:Number
        },
        StorageArea:{
            type:Number
        },
        SubscriptionDate: {
            type: Date, default: Date.now
        },
        EndOfSubscription: {
            type: Date
        },
        BelongTo: {
            type: Schema.Types.ObjectId,
            ref: 'User'
        },
        Logo: {
            type: String
        },
        StorageCapacity:{
            type: Schema.Types.ObjectId,
            ref: 'GeneralCapacity'
        },
        Items: [{
            type: Schema.Types.ObjectId,
            ref: 'Items',
            required: [true, "Order Must Have One Item Or More"]
        }],
    })
module.exports = new mongoose.model('Storage', StorageSchema)