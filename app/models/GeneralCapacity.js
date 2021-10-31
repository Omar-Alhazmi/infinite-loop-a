const mongoose = require('mongoose');

const GeneralCapacitySchema = mongoose.Schema(
    {
        TotalCapacity: {
            type: Number,
            required: [true, "Item Size is required"]
        }
    }
);
const GeneralCapacity = module.exports = new mongoose.model('GeneralCapacity', GeneralCapacitySchema)

GeneralCapacity.aggregate([
    { "$lookup": {
      "from": "Storage",
      "localField": "TotalCapacity",
      "foreignField": "StorageArea",
      "as": "SumTotal"
    }},
    { "$project": {
      "total": { "$sum": "$SumTotal.value" }
    }}
  ])