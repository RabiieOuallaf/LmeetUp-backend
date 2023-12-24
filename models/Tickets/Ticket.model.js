const mongoose = require('mongoose');
const SeatTypeEnum = require('../../enums/enum.SeatTypes')

const ticketSchema = new mongoose.Schema({
    seatNumber: {
        type: Number,
        required: true
    },
    seatClass: {
        type: String,
        enum: Object.values(SeatTypeEnum),
        required: true
    },
    quantityTotal: {
        type: Number,
        required: true
    },
    quantityOnline: {
        type: Number,
        required: true
    },
    quantityOffline: {
        type: Number,
        required: true
    },
    price: {
        type: Number,
        required: true
    },
    event: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Event',
        required: true
    },
    coupon : {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Coupon',
    }
});

const Ticket = mongoose.model('Ticket', ticketSchema);

module.exports = Ticket;
