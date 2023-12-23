const { model } = require("mongoose")

const couponCreatorTypes = {
    superAdmin : 'superAdmin',
    revendeur : 'revendeur',
}

model.exports = couponCreatorTypes;