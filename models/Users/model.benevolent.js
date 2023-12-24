const mongoose = require('mongoose')
const { generateSaltedHash } = require('../../utils/generateHash')
const {identityDocumentTypes} = require('../../enums/enum.identityDocumentTypes');
const {functionTypes} = require('../../enums/enum.identityDocumentTypes');


const benevolentSchema = new mongoose.Schema({
    firstName: {
        type: String,
    },
    lastName: {
        type: String,
    },
    email : {
        type: String,
        // add trim 
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
    birthday : {
        type : Date,
    },
    identityDocumentType : {
        type : String ,
        enum : Object.values(identityDocumentTypes),
    },
    identityDocumentNumber : {
        type : String,
    },
    function : {
        type : String,
        enum : Object.values(functionTypes),
    }
    
}) // joi

const Benevolent = mongoose.model('Benevolent', benevolentSchema);
module.exports = Benevolent;