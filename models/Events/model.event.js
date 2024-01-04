const mongoose = require('mongoose');
const seatType = require('../../enums/enum.SeatTypes');
const eventSchema = new mongoose.Schema({
    title: {
        type: String,
        default: 'Sans titre',
    },
    description: {
        type: String,
        default: 'Sans description',
    },
    eventClass: {
        type: String,
        default: null,
    },
    category: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Category',
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
    miniatureUrl : {
        type : String
    },
    videoUrl : {
        type : String 
    },
    revendeur : {
        type : mongoose.Schema.Types.ObjectId,
        ref : 'Revendeur'
    },
    city: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'City',
    },
    eventPlan: {
        type: String,
    }
}, { timestamps: true });

const Event = mongoose.model('Event', eventSchema);

module.exports = Event;
