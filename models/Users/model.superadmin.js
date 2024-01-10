const mongoose = require('mongoose')
const { generateSaltedHash } = require('../../utils/generateHash')

const superAdminSchema = new mongoose.Schema({
    fullName : {
        type : String
    },
    email: {
        type: String,
    },
    phoneNumber: {
        type : String
    },
    logoUrl : {
        type : String
    },
    pseudo : {
        type : String
    },
    password: {
        type: Object,
    }
}, {timestamps: true})

superAdminSchema.pre('save', async function(next) {
    const hashedPassword = await generateSaltedHash(this.password)
    this.password = hashedPassword
    next()
});

const superAdmin = mongoose.model('SuperAdmin', superAdminSchema)

module.exports = superAdmin
