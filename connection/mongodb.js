const mongoose = require('mongoose')

const MONGODB_OPTION = {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    family: 4
}

const connectedToDB = async () => {
    try {
        await mongoose.connect(process.env.DATABASE, MONGODB_OPTION)
        console.log('\x1b[32m%s\x1b[0m', 'connected to DB');
    }
    catch (error) {
        console.log('\x1b[31m%s\x1b[0m', `Database is not connected ${error}`)
    }
}

module.exports = { connectedToDB }
