const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema({
    category: {
        // type: mongoose.Schema.Types.ObjectId,
        type : String,
        // ref: 'Category',
    },
    startTime: {
        type: Date,
    },
    endTime: {
        type: Date,
    },
    turnOver: { // Chiffre d'affaire
        type: Number,
    },
    totalTickets: {
        type: Number,
    },
    imageUrl: {
        type: String,
    },
    city: {
        // type: mongoose.Schema.Types.ObjectId,
        type : String,
        // ref: 'City',
    },
    eventPlan: {
        type: String,
    }
}, { timestamps: true });

const Event = mongoose.model('Event', eventSchema);

module.exports = Event;
