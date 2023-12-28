const express = require('express')
const { formValidation } = require('../../middlewares/Validators/eventFormValidator')
const router = express.Router()

const { addEvent , updateEvent, getAllEvents, getOneEvent} = require('../../controllers/events/controller.event')

router.post('/addEvent', formValidation, addEvent)
router.put('/updateEvent/:id', formValidation, updateEvent)

router.get('/getAllEvents', getAllEvents)
router.get('/getOneEvent/:id', getOneEvent)


module.exports = router

