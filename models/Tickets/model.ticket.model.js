const mongoose = require('mongoose');
const SeatTypeEnum = require('../../enums/enum.SeatTypes')

const ticketSchema = new mongoose.Schema({
    
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
        // type: mongoose.Schema.Types.ObjectId,
        // ref: 'Event',
        type : String
    },
    coupon : {
        // type: mongoose.Schema.Types.ObjectId,
        // ref: 'Coupon',
        type : String
    },
    seats : [
        {
            seatId : {
                type : String
            },
            seatSource : {
                type : String
            },
            seatAvailability : {
                type : Boolean
            }
        }
    
    ]
});

const Ticket = mongoose.model('Ticket', ticketSchema);

module.exports = Ticket;
