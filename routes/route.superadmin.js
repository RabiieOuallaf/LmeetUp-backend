const express = require('express')
const router = express.Router()
const {CheckIfEmailIsExist, signup, signin, getOneAdmin} = require('../controllers/controller.superAdmin')
const {formValidation} = require('../middlwars/formValidator')
const {verifyAuhtHeaderToken, verifyCookieToken, adminByID, signOut} = require('../middlwars/auth')

router.post('/SignUp', formValidation, CheckIfEmailIsExist, signup)
router.post('/signIn', formValidation, signin)

router.get('/:adminID', verifyAuhtHeaderToken, getOneAdmin)
router.post('/signOut', signOut)

router.param('adminID', adminByID)

module.exports = router
