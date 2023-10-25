const mongoose = require('mongoose');
require('mongoose-schema-jsonschema')(mongoose);

const template = new mongoose.Schema({
    htmlCode: {
        required: [true, "htmlCode is required"],
        type: String
    }
})

const jsonTemplateSchema = template.jsonSchema();
console.dir(jsonTemplateSchema, {depth : null});

const templateSchema = mongoose.model('Template', template);

const asset = new mongoose.Schema({
    assetType: {
        required: [true, "title is required"],
        type: String
    },
    title: {
        required: [true, "title is required"],
        type: String
    }
})

const jsonAssetSchema = asset.jsonSchema();
console.dir(jsonAssetSchema, {depth : null});

const assetSchema = mongoose.model('Asset', asset);

let overlay = new mongoose.Schema({
    assetId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'Asset'
    }
})

// syntax
overlay.static('findByAssetId',
    function (mAssetId) {
        console.log("searching for " + mAssetId)
        return this.find({ assetId: mAssetId });
    })

const jsonOverlaySchema = overlay.jsonSchema();
console.dir(jsonOverlaySchema, {depth : null});

const overlaySchema = mongoose.model('Overlay', overlay);

const moment = new mongoose.Schema({
    overlayId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'Overlay'
    },
    momentNumber: {
        required: [true, "position is required"],
        type: Number
    },
    isLive: {
        required: [true, "isLive is required"],
        type: String
    },
    subtitle: {
        required: false,
        type: String
    },
    status: {
        required: true,
        type: String,
        default: "PUBLISHED"
    },
    title: {
        required: [true, "title is required"],
        type: String
    },
    buttonText: {
        required: [true, "buttonText is required"],
        type: String
    },
    templateId: {
        type: mongoose.Schema.Types.ObjectId,

        required: true,
        ref: 'Template'
    },
})

// syntax
moment.static('findByOverlayId',
    function (mOverlayId) {
    console.log("!searching for " + mOverlayId)
        return this.find({ overlayId: mOverlayId });
    })

const jsonMomentSchema = moment.jsonSchema();
console.dir(jsonMomentSchema, {depth : null});

const momentSchema = mongoose.model('Moment', moment);

const execution = new mongoose.Schema({
    overlayId: {
        required: true,
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Overlay'
    },
    momentNumber: {
        required: [true, "momentNumber is required"],
        type: Number
    },
    status: {
        required: false,
        type: String
    },
    timecode: {
    required: [true, "timecode is required"],
        type: Number
    }
})

const jsonExecutionSchema = execution.jsonSchema();
console.dir(jsonExecutionSchema, {depth : null});

const executionSchema = mongoose.model('Execution', execution);

module.exports = { Template: templateSchema, Asset: assetSchema, Overlay: overlaySchema, Moment: momentSchema, Execution: executionSchema }
