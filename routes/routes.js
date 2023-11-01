const express = require('express');

const {Template, Asset, Overlay, Moment, Execution, AppState } = require('../models/model');
const router = express.Router();

//Update an Overlay with a specific timestamp
router.post('/dnoc/overlays/:overlayId/trigger', async (req, res) => {
    const triggers = req.body.triggers;
    let result = {"momentExecutions": []};
    let theseExecutions = [];
    for (const moment of triggers) {
        let data = new Execution({
            overlayId : req.params.overlayId,
            momentNumber : moment.momentNumber,
            status: "SUCCESS",
            timecode : moment.timecode
        })
        try {
            let moment = await data.save();
            delete moment.overlayId;
            theseExecutions.push(moment);
        }
        catch (error) {
            res.status(400).json({ message: error.message })
        }
    }
    result.momentExecutions = theseExecutions;
    res.status(200).json(result);
})

//Update by ID Method
router.get('/dnoc/overlays/:overlayId/executions/:executionId/status', async (req, res) => {
    try {
        const executionId = req.params.executionId;
        const result = await Execution.findById(
            executionId
        )
        for (let i = 0; i < result.length; i++) {
            delete result[i].overlayId;
        }
        res.status(200).send(result);
    }
    catch (error) {
        res.status(500).json({ message: error.message })
    }
})

//Get all Asset/Events
router.get('/dnoc/assets', async (req, res) => {
    let result = {
        "totalItems": 0,
        "totalPages": 1,
        "currentPage": 1,
        "items":[]
    }
    try {
        const assetsToSave = await Asset.find();
        result.items = assetsToSave;
        result.totalItems = result.items.length;
        res.status(200).json(result);
    }
    catch (error) {
        res.status(500).json({ message: error.message })
    }
})

//GET all Overlays by assetId
router.get('/dnoc/assets/:assetId/overlay', async (req, res) => {
    let momentsToSave;
    let overlaysToSave;
    let assetId = req.params.assetId;
    let thisArray = [];
    let result = {
        "id": req.params.overlayId,
        "status": "PUBLISHED",
        "moments": []
    }
    let overlayId;
    try {
        overlaysToSave = await Overlay.findByAssetId(
            assetId
        )
        for (let i = 0; i < overlaysToSave.length; i++){
            overlayId = overlaysToSave[i]._id;
            result.id = overlayId;
            momentsToSave = await Moment.findByOverlayId(
                overlayId
            )
            console.log("momentsToSave is " + momentsToSave);
            for (let j = 0; j < momentsToSave.length; j++){
                let moment = momentsToSave[j];
                let simpleMoment = {
                    "momentNumber": moment.momentNumber,
                    "status": moment.status,
                    "title": moment.title,
                }
                result.moments.push(simpleMoment)
            }
        }
        res.status(200).json(result)
    } catch (error) {
        res.status(500).json({message: error.message})
    }
})

//POST a new Template
router.post('/dnoc/templates', async (req, res) => {
    const data = new Template({
        htmlCode: req.body.htmlCode
    })

    try {
        const templateToSave = await data.save();
        res.status(200).json(templateToSave)
    }
    catch (error) {
        res.status(400).json({ message: error.message })
    }
})

//Get all Asset/Events
router.get('/dnoc/templates/:templateId', async (req, res) => {
    try {
        const templateId = req.params.templateId;
        const template = await Template.findById(
            templateId
        )
        res.json(template)
    } catch (error) {
        res.status(500).json({message: error.message})
    }
})

//POST a new Asset/Event
router.post('/dnoc/assets', async (req, res) => {
    const data = new Asset({
        assetType: req.body.assetType,
        title: req.body.title
    })
    try {
        let assetToSave= await data.save()
        res.status(200).json(assetToSave)
    }
    catch (error) {
        res.status(400).json({ message: error.message })
    }
})

//Post an Overlay for the first time
router.post('/dnoc/overlay', async (req, res) => {
    console.log("assetId is  " + req.body.assetId);
    const data = new Overlay({
        "assetId": req.body.assetId
    })
    console.log("saving " + data);
    try {
        const overlayToSave = await data.save();
        res.status(200).json(overlayToSave)
    }
    catch (error) {
        res.status(400).json({ message: error.message })
    }
})

//Post an Overlay for the first time
router.post('/dnoc/overlay/:overlayId/moment', async (req, res) => {
    const data = new Moment({
        "overlayId": req.params.overlayId,
        "momentNumber": req.body.momentNumber,
        "isLive": req.body.isLive,
        "subtitle": req.body.subtitle,
        "title": req.body.title,
        "buttonText": req.body.buttonText,
        "templateId": req.body.templateId
    })
    console.log("saving " + data);
    try {
        const momentToSave = await data.save();
        res.status(200).json(momentToSave)
    }
    catch (error) {
        res.status(400).json({ message: error.message })
    }
})

/*//Get all Moments by Asset/Event ID Method
router.get('/dnoc/asset/:assetId/overlay', async (req, res) => {
    try {
        const overlays = await Overlay.findByAssetId(req.params.assetId);
        res.json(overlays)
    }
    catch (error) {
        res.status(500).json({ message: error.message })
    }
})*/

//POST a new or updated AppState
router.post('/dnoc/appstate/:contentId', async (req, res) => {
    const data = new AppState({
        _id: req.body.contentId,
        lists: req.body.lists
    })
    try {
        const appStateToSave = await data.save();
        res.status(200).json(appStateToSave)
    }
    catch (error) {
        res.status(400).json({ message: error.message })
    }
})

//Get an AppState by contentId
router.get('/dnoc/appstate/:contentId', async (req, res) => {
    try {
        const _id = req.params.contentId;
        const appState = await AppState.findById(
            _id
        )
        res.json(appState)
    } catch (error) {
        res.status(500).json({message: error.message})
    }
})

module.exports = router;
