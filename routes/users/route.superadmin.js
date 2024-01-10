const express = require('express')
const router = express.Router()
const {CheckIfEmailIsExist, signup, signIn, getOneAdmin, refreshToken} = require('../../controllers/users/controller.superAdmin')
const { formValidation } = require('../../middlewares/Validators/superAdminFormValidation')

const {verifyAuthHeaderToken, verifyCookieToken, adminByID, signOut} = require('../../middlewares/Authentification/superAdminAuth')


router.post('/signUp', formValidation, CheckIfEmailIsExist, signup)
router.post('/signIn', formValidation, signIn)

router.get('/:id', verifyAuthHeaderToken, getOneAdmin)
router.post('/signOut', signOut)

router.param('adminID', adminByID)

module.exports = router
