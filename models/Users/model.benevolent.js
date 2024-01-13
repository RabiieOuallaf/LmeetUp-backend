const mongoose = require('mongoose')
const { generateSaltedHash } = require('../../utils/generateHash')
const identityDocumentTypes = require('../../enums/enum.identityDocumentTypes')
const functionTypes = require('../../enums/enum.functionTypes');

const benevolentSchema = new mongoose.Schema({
    firstName: {
        type: String,
    },
    lastName: {
        type: String,
    },
    email : {
        type: String,
    },
    password: {
        type: Object,
    },
    phoneNumber : {
        type: String,
    },
    pseudo: {
        type: String,
    },
    birthdate : {
        type : Date,
    },
    identityDocumentType : {
        type : String ,
        enum : Object.values(identityDocumentTypes),
        default : identityDocumentTypes.CIN,
    },
    identityDocumentNumber : {
        type : String,
    },
    function : {
        type : String,
        enum : Object.values(functionTypes),
    }
    
});
benevolentSchema.pre('save', async function(next) {
    const hashedPassword = await generateSaltedHash(this.password)

    this.password = hashedPassword
    next()
});

const Benevolent = mongoose.model('Benevolent', benevolentSchema);
module.exports = Benevolent;