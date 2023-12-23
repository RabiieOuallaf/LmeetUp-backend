const express = require('express')
const cors = require('cors')
const helmet = require('helmet')
const cookieParser = require('cookie-parser');
const redis = require('redis');

const app = express()
const http = require("http").createServer(app);
const socketio = require("socket.io")(http); // Pass the HTTP server object to Socket.IO

require('dotenv').config()
app.use(cors())

const client = redis.createClient();
const {connectedToDB} = require('./connection/mongodb')

// database connection
connectedToDB();

// test app
app.get('/', (req, res) => {
    res.send("folder structure folder")
})
// middlwares
app.use(express.json())
app.use(cookieParser())
app.use('/public/Statics', express.static('./public/Statics'))

// app security
app.use(helmet())

// routes middlwares
const superAdminRouter = require('./routes/route.superadmin')
app.use('/api/v1/superAdmin', superAdminRouter)

const usersRouter = require('./routes/route.user')
app.use('/api/v1/user', usersRouter)

const port = process.env.PORT || 3000
http.listen(port, () => console.log('\x1b[32m%s\x1b[0m', `app is now listening at port ${port}`))

module.exports = app
