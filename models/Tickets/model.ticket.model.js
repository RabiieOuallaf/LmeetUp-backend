const mongoose = require('mongoose');
const SeatTypeEnum = require('../../enums/enum.SeatTypes')

const ticketSchema = new mongoose.Schema({
    seatNumber: {
        type: Number,
    },
    seatClass: {
        type: String,
        enum: Object.values(SeatTypeEnum),
    },
    quantityTotal: {
        type: Number,
    },
    quantityOnline: {
        type: Number,
    },
    quantityOffline: {
        type: Number,
    },
    price: {
        type: Number,
    },
    event: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Event',
    },
    coupon : {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Coupon',
    }
});

const Ticket = mongoose.model('Ticket', ticketSchema);

module.exports = Ticket;
