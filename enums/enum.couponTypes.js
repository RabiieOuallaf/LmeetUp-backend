const { model } = require("mongoose")

const couponTypes = {
    PERCENTAGE: 'PERCENTAGE',
    AMOUNT: 'AMOUNT'
}

model.exports = couponTypes;