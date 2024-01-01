const mongoose = require('mongoose');
const { generateSaltedHash } = require('../../utils/generateHash');
const { identityDocumentTypes } = require('../../enums/enum.identityDocumentTypes');

const revendeurSchema = new mongoose.Schema({
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
    birthdate: {
        type : Date,
    },
    identityDocumentType : {
        type : String ,
        enum : Object.values(identityDocumentTypes),
    },
    identityDocumentNumber : {
        type : String,
    },
    event : {
        type : mongoose.Schema.Types.ObjectId,
        ref : 'Event'
    }

    
},{timestamps: true})

revendeurSchema.pre('save', async function(next) {
    const hashedPassword = await generateSaltedHash(this.password)

    this.password = hashedPassword
    next()
});
const Revendeur = mongoose.model('Revendeur', revendeurSchema);

module.exports = Revendeur;