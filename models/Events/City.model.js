const mongoose = require('mongoose');

const citySchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    events: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Event'
    }
});

const City = mongoose.model('City', citySchema);

module.exports = City;
