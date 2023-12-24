const mongoose = require('mongoose')
const { generateSaltedHash } = require('../../utils/generateHash')

const userSchema = new mongoose.Schema({
    email: {
        type: String,
    },
    password: {
        type: Object,
    }
}, {timestamps: true})

 userSchema.pre('save', async function(next) {
    const hashedPassword = await generateSaltedHash(this.password)

    this.password = hashedPassword
    next()
});

const User = mongoose.model('User', userSchema);


module.exports = User;