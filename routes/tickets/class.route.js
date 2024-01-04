const express = require('express')
const router = express.Router()

const { formValidation } = require('../../middlewares/Validators/classFormValidator')
const { addClass, updateClass, getAllClasses, getOneClass, deleteClass } = require('../../controllers/tickets/controller.class')
const { verifyAuthHeaderToken } = require('../../middlewares/Authentification/auth')


router.post('/add',  formValidation, addClass)
router.put('/update/:id', formValidation, updateClass)

router.get('/getAll' ,getAllClasses)
router.get('/get/:id' ,getOneClass)

router.delete('/delete/:id', deleteClass);

module.exports = router;

