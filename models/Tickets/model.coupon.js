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
    class : {
        type : mongoose.Schema.Types.ObjectId,
        ref : 'Class',
    },
    startDate: {
        type: Date,
    },
    usageLimit : {
        type : Number,
    },
    expirationDate: {
        type: Date,
    },
    isActive: {
        type: Boolean,
        default: true
    },
    event: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Event',
    }
    
});

const Coupon = mongoose.model('Coupon', couponSchema);

module.exports = Coupon;
