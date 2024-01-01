const express = require('express')
const cors = require('cors')
const helmet = require('helmet')
const cookieParser = require('cookie-parser');
const app = express()
const http = require("http").createServer(app);
const socketio = require("socket.io")(http); // Pass the HTTP server object to Socket.IO
const {connectedToDB} = require('./connection/mongodb')
const multer = require('multer')
const storage = require('./middlewares/helpers/multerConfig')
require('dotenv').config()

connectedToDB();


  
app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(helmet())
app.use(cors())
app.use(cookieParser())
app.use('/public/Statics', express.static('./public/Statics'))

const superAdminRouter = require('./routes/users/route.superadmin')
const usersRouter = require('./routes/users/route.user')
const eventRouter = require('./routes/events/event.route')
const categoryRouter = require('./routes/events/category.route')
const ticketRouter = require('./routes/tickets/ticket.route')
const couponRouter = require('./routes/tickets/coupon.route')
const cityRouter = require('./routes/events/city.route');

app.use('/api/v1/superAdmin', superAdminRouter)
app.use('/api/v1/user', usersRouter)
app.use('/api/v1/event', eventRouter)
app.use('/api/v1/category', categoryRouter)
app.use('/api/v1/ticket', ticketRouter)
app.use('/api/v1/coupon', couponRouter)
app.use('/api/v1/city', cityRouter)

const port = process.env.PORT || 3000
http.listen(port, () => console.log('\x1b[32m%s\x1b[0m', `app is now listening at port ${port}`))

module.exports = app
