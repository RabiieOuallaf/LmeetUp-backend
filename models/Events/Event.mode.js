const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema({
    category: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Category',
        required: true
    },
    startTime: {
        type: Date,
        required: true
    },
    endTime: {
        type: Date,
        required: true
    },
    turnOver: {
        type: Number,
        required: true
    },
    totalTickets: {
        type: Number,
        required: true
    },
    imageUrl: {
        type: String,
        required: true
    },
    city: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'City',
        required: true
    },
    eventPlan: {
        type: Buffer,
        required: true
    }
});

const Event = mongoose.model('Event', eventSchema);

module.exports = Event;
