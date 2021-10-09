const mongoose = require('mongoose');

const GeneralCapacitySchema = mongoose.Schema(
    {
        TotalCapacity: {
            type: Number,
            required: [true, "Item Size is required"]
        }
    }
);
module.exports = new mongoose.model('GeneralCapacity', GeneralCapacitySchema)