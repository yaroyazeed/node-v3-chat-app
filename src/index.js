const path = require ('path')
const http = require('http')
const express = require ('express')
const socketio = require('socket.io')
const filter = require('bad-words')
const {generateMessage, generateLocationMessage} = require('./utils/messages')
const { addUser, removeUser, getUser, getUsersInRoom} = require ('./utils/users')

const app = express()
const server = http.createServer(app)
const io = socketio(server)

const port = process.env.PORT || 3000
const publicDirectoryPath = path.join(__dirname, '../public')

app.use(express.static(publicDirectoryPath))


io.on('connection', (socket) => {
    console.log('new web socket connection')


    socket.on('join', (options, callback) => {
      const {error, user} =  addUser({id: socket.id, ...options})

      if(error){
          return callback(error)
      }

        socket.join(user.room)

        socket.emit('message', generateMessage('Admin', 'welcome!'))
        socket.broadcast.to(room).emit('message', generateMessage('Admin', `${user.username} has joined`))
        io.to(user.room).emit('roomData', {
            room: user.room,
            users: getUsersInRoom(user.room)
        })

        callback()
        //socket.emit to a specific client
        //io.emit to every client
        //socket.broadcast.emit(every connected client but this one)
    })

    socket.on('sendMessage', (message, callback) => {
        const user = getUser(socket.id)
        const filter = new filter()

        if(filter.isProfane(messages)){
            return callback('Profanity is not allowed')
        }

        io.to(user.room).emit('message', generateMessage(user.username, message))
        callback()
    })

    socket.on('sendLocation', (coords, callback) => {
        //this sends my current location to the other users via a google map link
        const user = getUser(socket.id)
        io.to(user.room).emit('message', generateLocationMessage(user.username, `https://google.com/maps?q=${coords.latitude},${coords.longitude}`))
        callback()
    })

    socket.on('disconnect', () => {
        const user = removeUser(socket.id)

        if(user){
            io.to(user.room).emit('message', generateMessage('Admin', `${user.username} has left`))
            io.to(users.room).emit('roomData', {
                room: user.room,
                users:getUsersInRoom(user.room)
            })
        }
    })
    // socket.emit('countUpdated', count)

    // socket.on('increment', () => {
    //     count++
    //     io.emit('countUpdated', count)
    // })
})

server.listen(port, () => {
    console.log(`Server is up on port ${port}`)
})