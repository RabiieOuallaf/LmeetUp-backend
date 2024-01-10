const express = require('express')
const router = express.Router()

const { formValidation } = require('../../middlewares/Validators/classFormValidator')
const { addClass, updateClass, getAllClasses, getOneClass, deleteClass, getTicketClasses } = require('../../controllers/tickets/controller.class')
const { verifyAuthHeaderToken } = require('../../middlewares/Authentification/superAdminAuth')


router.post('/add',  verifyAuthHeaderToken,formValidation, addClass)
router.put('/update/:id', verifyAuthHeaderToken,formValidation, updateClass)

router.get('/getAll' ,getAllClasses)
router.get('/get/:id' ,getOneClass)
router.get('/getTicketClasses/:id', getTicketClasses);

router.delete('/delete/:id', deleteClass);

module.exports = router;

