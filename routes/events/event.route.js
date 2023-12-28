const express = require('express')
const { formValidation } = require('../../middlewares/Validators/eventFormValidator')
const router = express.Router()

const { addEvent , updateEvent, getAllEvents, getOneEvent, deleteEvent} = require('../../controllers/events/controller.event')
router.post('/addEvent', formValidation,addEvent)
router.put('/updateEvent/:id', formValidation, updateEvent)

// checkRedisEvent"s" Cache

router.get('/getAll' ,getAllEvents)
router.get('/get/:id' ,getOneEvent)

router.delete('/delete/:id', deleteEvent)

module.exports = router

