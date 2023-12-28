const express = require('express')
const cors = require('cors')
const helmet = require('helmet')
const cookieParser = require('cookie-parser');

const app = express()
const http = require("http").createServer(app);
const socketio = require("socket.io")(http); // Pass the HTTP server object to Socket.IO
const redisClient = require('./utils/redisClient')

require('dotenv').config()
app.use(cors())

const {connectedToDB} = require('./connection/mongodb')

connectedToDB();

app.use(express.json())
app.use(cookieParser())
app.use('/public/Statics', express.static('./public/Statics'))
app.use(helmet())

const superAdminRouter = require('./routes/users/route.superadmin')
const usersRouter = require('./routes/users/route.user')
const eventRouter = require('./routes/events/event.route')

app.use('/api/v1/superAdmin', superAdminRouter)
app.use('/api/v1/user', usersRouter)
app.use('/api/v1/event', eventRouter)



const port = process.env.PORT || 3000
http.listen(port, () => console.log('\x1b[32m%s\x1b[0m', `app is now listening at port ${port}`))

module.exports = app
