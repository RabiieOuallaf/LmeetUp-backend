const express = require('express')
const router = express.Router()
const {CheckIfEmailIsExist, signIn, signUp, getOneRevendeur, sellTicket,getRevendeurSoldTickets} = require('../../controllers/users/controller.revendeur')
const { formValidation } = require('../../middlewares/Validators/revendeurCreateFormValidator')
const { loginFormValidation } = require('../../middlewares/Validators/revendeurLoginFormValidation')
const { verifyRevendeurHeaderToken } = require('../../middlewares/Authentification/revendeurAuth')
const { verifyAuthHeaderToken } = require('../../middlewares/Authentification/superAdminAuth')

router.post('/signUp', verifyAuthHeaderToken,formValidation, CheckIfEmailIsExist, signUp)
router.post('/signIn', loginFormValidation,signIn)
router.post('/sellTicket', verifyRevendeurHeaderToken, sellTicket)

router.get('/:id', verifyAuthHeaderToken, getOneRevendeur)
router.get('/getRevendeurSoldTickets/:id', verifyRevendeurHeaderToken, getRevendeurSoldTickets)
// router.post('/signOut', signOut)

module.exports = router