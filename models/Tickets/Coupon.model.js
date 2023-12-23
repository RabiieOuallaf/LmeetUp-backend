const mongoose = require('mongoose');
const couponCreatorTypes = require('../../enums/enum.couponCreatorTypes');
const couponTypes = require('../../enums/enum.couponTypes');

const couponSchema = new mongoose.Schema({
    code: {
        type: String,
        required: true,
        unique: true
    },
    discount: {
        type: Number,
        required: true
    },
    type : {
        type : String,
        enum : Object.values(couponTypes),
        required: true
    },
    creator : {
        type : String,
        enum : Object.values(couponCreatorTypes),
        required: true
    },
    expirationDate: {
        type: Date,
        required: true
    },
    isActive: {
        type: Boolean,
        default: true
    }
});

const Coupon = mongoose.model('Coupon', couponSchema);

module.exports = Coupon;
