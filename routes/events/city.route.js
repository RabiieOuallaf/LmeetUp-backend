const express = require('express')
const { formValidation } = require('../../middlewares/Validators/cityFormValidator')
const router = express.Router()

const { addCity , updateCity, getOneCity, getAllCities} = require('../../controllers/tickets/controller.city')

router.post('/add', formValidation, addCity)
router.put('/update/:id', formValidation, updateCity)

router.get('/get/:id', getOneCity)
router.get('/getAll', getAllCities)

module.exports = router;