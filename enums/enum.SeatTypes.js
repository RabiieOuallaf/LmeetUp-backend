const { model } = require("mongoose")

const seatTypes = {
    VIP : 'VIP',
    NORMAL : 'NORMAL',
    BACKSTAGE : 'BACKSTAGE'
}

model.export = seatTypes;