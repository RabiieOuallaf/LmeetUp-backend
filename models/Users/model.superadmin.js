const mongoose = require('mongoose')
const { generateSaltedHash } = require('../../utils/generateHash')

const superAdminSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true
    },
    password: {
        type: Object,
        required: true
    }
}, {timestamps: true})

superAdminSchema.pre('save', async function(next) {
    const hashedPassword = await generateSaltedHash(this.password)

    this.password = hashedPassword
    next()
});

const superAdmin = mongoose.model('SuperAdmin', superAdminSchema)

module.exports = superAdmin
