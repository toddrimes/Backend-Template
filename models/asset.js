const mongoose = require('mongoose');

const dataSchema = new mongoose.Schema({
    assetId: {
        required: true,
        type: String
    },
    title: {
        required: false,
        type: String
    }
})

module.exports = mongoose.model('Asset', dataSchema)
