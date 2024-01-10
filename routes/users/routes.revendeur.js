const express = require('express')
const router = express.Router()
const {CheckIfEmailIsExist, signIn, signUp, getOneRevendeur} = require('../../controllers/users/controller.revendeur')
const { formValidation } = require('../../middlewares/Validators/revendeurCreateFormValidator')
const { loginFormValidation } = require('../../middlewares/Validators/revendeurLoginFormValidation')
const { verifyRevendeurHeaderToken } = require('../../middlewares/Authentification/revendeurAuth')
const { verifyAuthHeaderToken } = require('../../middlewares/Authentification/superAdminAuth')

router.post('/signUp', verifyAuthHeaderToken,formValidation, CheckIfEmailIsExist, signUp)
router.post('/signIn', loginFormValidation,signIn)

router.get('/:id', verifyAuthHeaderToken, getOneRevendeur)
// router.post('/signOut', signOut)

module.exports = router