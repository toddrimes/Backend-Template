const mongoose = require('mongoose');

const dataSchema = new mongoose.Schema({
    assetId: {
        required: false,
        type: String
    },
    momentId: {
        required: true,
        type: String
    },
    position: {
        required: false,
        type: Number
    },
    isLive: {
        required: false,
        type: Boolean
    },
    subtitle: {
        required: false,
        type: String
    },
    title: {
        required: false,
        type: String
    },
    buttonText: {
        required: false,
        type: String
    }
})

// syntax
dataSchema.methods.findByAssetId = function(mAssetId) {
    const q = {
        ...query,
        assetId: mAssetId
    }
    return this.find(q, null, {}, next);
}

module.exports = mongoose.model('Moment', dataSchema)
