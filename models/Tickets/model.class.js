const mongoose = require('mongoose')

const classSchema = new mongoose.Schema({
    name : {
        type : String
    },
    description : {
        type : String
    },
    ticket : {
        type : mongoose.Schema.Types.ObjectId,
        ref : 'Ticket'
    }
})

const Class = mongoose.model('Class', classSchema)

module.exports = Class;