const mongoose = require('mongoose')
const { generateSaltedHash } = require('../../utils/generateHash')

const userSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true
    },
    password: {
        type: Object,
        required: true
    }
}, {timestamps: true})

 userSchema.pre('save', async function(next) {
    const hashedPassword = await generateSaltedHash(this.password)

    this.password = hashedPassword
    next()
});

module.exports = mongoose.model('User', userSchema)
