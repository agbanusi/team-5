require('dotenv').config();
const express= require('express')
const app =express()
const http = require('http').createServer(app)
const io = require('socket.io')(http)
const routes = require('./routes')
const sockets = require('./socket')
app.use(express.json())

routes(app)
sockets(io)
http.listen(process.env.PORT || 5000, () => {
    console.log('listening on port 5000');
})