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
    },
    type : {
        type : String,
        enum : Object.values(couponTypes),
    },
    creator : {
        type : String,
        enum : Object.values(couponCreatorTypes),
    },
    expirationDate: {
        type: Date,
    },
    isActive: {
        type: Boolean,
        default: true
    }
});

const Coupon = mongoose.model('Coupon', couponSchema);

module.exports = Coupon;
