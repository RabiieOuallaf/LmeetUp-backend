const express = require('express')
const { formValidation } = require('../../middlewares/Validators/eventFormValidator')
const router = express.Router()
const upload = require('../../middlewares/helpers/multerConfig')
const { addEvent , updateEvent, getAllEvents, getOneEvent, deleteEvent, advancedAddEvent, assignRevendeurToEvent} = require('../../controllers/events/controller.event')
const { verifyAuthHeaderToken } = require('../../middlewares/Authentification/superAdminAuth')



router.post('/add', verifyAuthHeaderToken ,upload, formValidation,addEvent)
router.post('/addAdvanced/:id',verifyAuthHeaderToken,advancedAddEvent)
router.put('/update/:id', verifyAuthHeaderToken,upload, formValidation, updateEvent)
router.post('/assignRevendeur',verifyAuthHeaderToken, assignRevendeurToEvent)


router.get('/getAll' ,getAllEvents)
router.get('/get/:id' ,getOneEvent)


router.delete('/delete/:id', deleteEvent)

module.exports = router

