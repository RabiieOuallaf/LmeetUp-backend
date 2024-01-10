const mongoose = require('mongoose')
const { generateSaltedHash } = require('../../utils/generateHash')
const identityDocumentTypes = require('../../enums/enum.identityDocumentTypes')
const userSchema = new mongoose.Schema({
    firstName : {
        type : String
    },
    lastName : {
        type : String
    },
    email: {
        type: String,
    },
    phoneNumber: {
        type : String
    },
    identityDocumentTypes : {
        type : String,
        default: identityDocumentTypes.CIN,
        enum : Object.values(identityDocumentTypes)
    },
    identityDocumentNumber : {
        type : String
    },
    birthDate : {
        type : Date
    },
    City : {
        type : String,
        ref : "City"
    },
    password: {
        type: Object,
    },
    BoughtTickets : [{
        type : mongoose.Schema.Types.ObjectId,
        ref : "BoughtTicket"
    }],
    attendedEvents : [{
        type : mongoose.Schema.Types.ObjectId,
        ref : "Event"
    }]
}, {timestamps: true})

 userSchema.pre('save', async function(next) {
    const hashedPassword = await generateSaltedHash(this.password)

    this.password = hashedPassword
    next()
});

const User = mongoose.model('User', userSchema);


module.exports = User;