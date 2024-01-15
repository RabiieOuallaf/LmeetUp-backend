const mongoose = require('mongoose');
const ticketSchema = new mongoose.Schema({
    class: {
        type : mongoose.Schema.Types.ObjectId,
        ref : 'Class'
    },
    event: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Event',
    },
    price : {
        type : Number,
    }
}, { timestamps: true });

const Ticket = mongoose.model('Ticket', ticketSchema);

module.exports = Ticket;
