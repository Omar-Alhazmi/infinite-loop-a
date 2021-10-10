const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const OrderSchema = mongoose.Schema({
    CustomerName: {
        type: String,
        required: [true, "Customer Name is required"]
    },
    HaveItems: {
        type: Schema.Types.ObjectId,
        ref: 'Items',
        required: [true, "Order Must Have One Item Or More"]
    },
    OrderStatus: {
        type: String,
        required: [true, 'Order Status is required'],
        enum: {
            values: ["InProgress", "Shipping", "Arrived"],
            message: '{VALUE} is not supported',
        }
    },
    ShippedBy: {
        type: String,
        required: [true, 'Order Status is required'],
        enum: {
            values: ["SPL", "Aramex", "SMSA"],
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