const express = require('express')
const router = express.Router()

const { formValidation } = require('../../middlewares/Validators/couponFormValidator')
const { addCoupon, 
    updateCoupon, 
    getAllCoupons, 
    getOneCoupon, 
    deleteCoupon,
    filterCoupons
} = require('../../controllers/tickets/controller.coupon')

router.post('/add', formValidation, addCoupon)
router.put('/update/:id', formValidation, updateCoupon)

router.get('/getAll', getAllCoupons)
router.get('/get/:id', getOneCoupon)
router.get('/filter', filterCoupons)

router.delete('/delete/:id', deleteCoupon);
module.exports = router;