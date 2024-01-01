const mongoose = require('mongoose');

const categorySchema = new mongoose.Schema({
    name: {
        type: String,
    },
    description: {
        type: String,
    },
    events: [{
        // type: mongoose.Schema.Types.ObjectId,
        type: String,
        // ref: 'Event'
    }]
});

const Category = mongoose.model('Category', categorySchema);

module.exports = Category;
