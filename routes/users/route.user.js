const express = require('express')
const router = express.Router()
const {CheckIfEmailIsExist, signup, signin, getOneAdmin} = require('../../controllers/users/controller.user')
const {formValidation} = require('../../middlewares/Validators/userFormValidation')
const {verifyAuthHeaderToken, verifyCookieToken, adminByID, signOut} = require('../../middlewares/Authentification/userAuth')

router.post('/signUp', formValidation, CheckIfEmailIsExist, signup)
router.post('/signIn', formValidation, signin)

router.get('/:adminID', verifyAuthHeaderToken, getOneAdmin)
router.post('/signOut', signOut)

router.param('adminID', adminByID)

module.exports = router
