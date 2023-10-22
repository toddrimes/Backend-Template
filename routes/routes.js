const express = require('express');
const Asset = require('../models/asset');
const Moment = require('../models/moment');
const router = express.Router();

//Post a Moment with a specific timestamp
router.post('/dnoc/overlay/:overlayId/trigger', async (req, res) => {
    const data = new Moment({
        overlayId: req.params.overlayId,
        timestamp: req.body.timestamp
    })

    try {
        const triggerToSave = await data.save();
        res.status(200).json(triggerToSave)
    }
    catch (error) {
        res.status(400).json({ message: error.message })
    }
})

//Get all Asset/Events
router.get('/dnoc/assets', async (req, res) => {
    try {
        const data = await Asset.find();
        res.json(data)
    }
    catch (error) {
        res.status(500).json({ message: error.message })
    }
})

//Get all Moments by Asset/Event ID Method
router.get('/dnoc/asset/:assetId/overlay', async (req, res) => {
    try {
        const moments = await Moment.findByAssetId(req.params.assetId);
        res.json(moments)
    }
    catch (error) {
        res.status(500).json({ message: error.message })
    }
})

//Update by ID Method
router.get('/status/:triggerId', async (req, res) => {
    try {
        const id = req.params.triggerId;

        const result = await Asset.findByIdAndUpdate(
            id, updatedData, options
        )

        res.send(result)
    }
    catch (error) {
        res.status(500).json({ message: error.message })
    }
})

module.exports = router;
