const express = require('express')
const { formValidation } = require('../../middlewares/Validators/categoryFormValidator')
const { addCategory, updateCategory, getAllCategories, getOneCategory, deleteCategory } = require('../../controllers/events/controller.category')
const router = express.Router()


router.post('/add', formValidation, addCategory)
router.put('/update/:id', formValidation, updateCategory)

router.get('/getAll', getAllCategories)
router.get('/get/:id', getOneCategory)

router.delete('/delete/:id', deleteCategory)

module.exports = router