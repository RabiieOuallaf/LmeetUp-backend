const mongoose = require('mongoose')
const boughtTicketSchema = new mongoose.Schema({
    code : {
        type : String,
    },
    user : {
        type : mongoose.Schema.Types.ObjectId,
        ref : 'User'
    },
    ticket : {
        type : mongoose.Schema.Types.ObjectId,
        ref : 'Ticket'
    },
    event : {
        type : mongoose.Schema.Types.ObjectId,
        ref : 'Event'
    },
    revendeur : {
        type : mongoose.Schema.Types.ObjectId,
        ref : 'Revendeur'
    }
    
}, { timestamps: true });

boughtTicketSchema.methods.toJSON = function () {
    const boughtTicket = this.toObject();
    delete boughtTicket.user.password;
    return boughtTicket;
  };

const boughtTicket = mongoose.model('boughtTicket', boughtTicketSchema);

module.exports = boughtTicket;