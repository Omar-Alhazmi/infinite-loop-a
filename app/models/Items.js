const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const ItemsSchema = mongoose.Schema(
    {
        ItemName: {
            type: String,
            required: [true, "Item Name is required"]
        },
        ItemSize: {
            type: Number,
            required: [true, "Item Size is required"]
        },
        Quantity: {
            type: Number,
            required: [true, "Item Quantity is required"]
        },
        StorAt: {
            type: Schema.Types.ObjectId,
            ref: 'Storage',
            required: [true, "Stor At is required"]
        },
    },
    {
        timestamps: true,
    },
);
module.exports = new mongoose.model('Items', ItemsSchema)