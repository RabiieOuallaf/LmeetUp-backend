const mongoose = require('mongoose')

const invitationSchema = new mongoose.Schema({
    firstName: {
        type: String,
    },
    lastName: {
        type: String,
    },
    email : {
        type : String,
    },
    phoneNumber : {
        type : String,
    },
    class : {
        type : mongoose.Schema.Types.ObjectId,
        ref : 'Class'
    },
    event : {
        type : mongoose.Schema.Types.ObjectId,
        ref : 'Event'
    
    }
})

const Invetation = mongoose.model('Invetation', invitationSchema);
module.exports = Invetation;