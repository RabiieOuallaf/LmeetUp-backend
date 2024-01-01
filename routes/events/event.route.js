const express = require('express')
const { formValidation } = require('../../middlewares/Validators/eventFormValidator')
const router = express.Router()
const upload = require('../../middlewares/helpers/multerConfig')
const { addEvent , updateEvent, getAllEvents, getOneEvent, deleteEvent} = require('../../controllers/events/controller.event')



router.post('/add', upload,formValidation,addEvent)
router.put('/update/:id', upload,formValidation, updateEvent)


router.get('/getAll' ,getAllEvents)
router.get('/get/:id' ,getOneEvent)

router.delete('/delete/:id', deleteEvent)

module.exports = router

