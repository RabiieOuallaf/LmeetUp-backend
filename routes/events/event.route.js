const express = require('express')
const { formValidation } = require('../../middlewares/Validators/eventFormValidator')
const router = express.Router()
const {uploadEvent} = require('../../middlewares/helpers/multerConfig')
const { addEvent , 
    updateEvent, 
    getAllEvents, 
    getOneEvent, 
    deleteEvent, 
    advancedAddEvent, 
    assignRevendeurToEvent,
    getEventRevendeurs
} = require('../../controllers/events/controller.event')
const { verifyAuthHeaderToken } = require('../../middlewares/Authentification/superAdminAuth')
const { getSoldTicketsProgressByEvent, getSoldTicketsSourcesTable } = require('../../controllers/events/controller.eventStatistics')

router.post('/add', verifyAuthHeaderToken ,uploadEvent, formValidation,addEvent)
router.post('/addAdvanced/:id',verifyAuthHeaderToken,advancedAddEvent)
router.put('/update/:id', verifyAuthHeaderToken,uploadEvent, formValidation, updateEvent)
router.post('/assignRevendeur',verifyAuthHeaderToken, assignRevendeurToEvent)


router.get('/getAll' ,getAllEvents)
router.get('/get/:id' ,getOneEvent)
router.get('/getSoldTicketsProgressByEvent/:id' ,getSoldTicketsProgressByEvent)
router.get('/getEventRevendeurs/:id', getEventRevendeurs);
router.get('/getSoldTicketsSourcesTable/:id', getSoldTicketsSourcesTable);

router.delete('/delete/:id', deleteEvent)

module.exports = router

