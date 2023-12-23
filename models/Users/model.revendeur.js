const mongoose = require('mongoose');
const { generateSaltedHash } = require('../../utils/generateHash');
const { identityDocumentTypes } = require('../../enums/enum.identityDocumentTypes');

const revendeurSchema = new mongoose.Schema({
    firstName: {
        type: String,
        required: true
    },
    lastName: {
        type: String,
        required: true
    },
    email : {
        type: String,
        required: true
    },
    password: {
        type: Object,
        required: true
    },
    phoneNumber : {
        type: String,
        required: true
    },
    pseudo: {
        type: String,
        required: true
    },
    birthday : {
        type : Date,
        required: true
    },
    identityDocumentType : {
        type : String ,
        enum : Object.values(identityDocumentTypes),
        required: true
    },
    identityDocumentNumber : {
        type : String,
        required: true
    }
    
},{timestamps: true})