const express = require('express')
const router = express.Router()
const {checkIfEmailExists, signUp, signIn, getOneBenevolent} = require('../../controllers/users/controller.benevolent')
const {formValidator} = require('../../middlewares/Validators/benevolentFormValidator')
const {verifyBenevolentHeaderToken} = require('../../middlewares/Authentification/benevolentAuth')
router.post('/signUp', formValidator, checkIfEmailExists, signUp)
router.post('/signIn', formValidator, signIn)

router.get('/:id', verifyBenevolentHeaderToken,getOneBenevolent)

module.exports = router