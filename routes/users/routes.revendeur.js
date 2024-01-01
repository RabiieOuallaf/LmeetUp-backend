const express = require('express')
const router = express.Router()
const {CheckIfEmailIsExist, signIn, signUp, getOneRevendeur} = require('../../controllers/users/controller.revendeur')
const {formValidation} = require('../../middlewares/Validators/userFormValidator')
const {verifyAuthHeaderToken, verifyCookieToken, adminByID, signOut} = require('../../middlewares/Authentification/userAuth')

router.post('/signUp', formValidation, CheckIfEmailIsExist, signUp)
router.post('/signIn', formValidation, signIn)

router.get('/:revendeurId', verifyAuthHeaderToken, getOneRevendeur)
router.post('/signOut', signOut)

module.exports = router