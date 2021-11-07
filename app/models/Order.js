const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const OrderSchema = mongoose.Schema({
    CustomerName: {
        type: String,
        required: [true, "Customer Name is required"]
    },
    HaveItems: [{
        ItemId: {
            type: Schema.Types.ObjectId,
            ref: 'Items',
            required: [true, "Stor At is required"]
        },
        Name: {
            type: String
        },
        Quantity: {
            type: Number,
            min: [1, "Quantity is required"],
            deafult: 1
        }
    }],
    OrderStatus: {
        type: String,
        required: [true, 'Order Status is required'],
        enum: {
            values: ["Shipping", "Arrived"],
            message: '{VALUE} is not supported',
            default:'Shipping'
        }
    },
    ShippedBy: {
        type: String,
        required: [true, 'Order Status is required'],
        enum: {
            values: ["SPL", "Aramex", "SMSA","DHL"],
            message: '{VALUE} is not supported',
        }
    },
    OrderDate: {
        type: Date, default: Date.now
    },
    ArrivedAt: {
        type: Date,
    }
},
    {
        timestamps: true,
    }
);

module.exports = new mongoose.model('Order', OrderSchema)