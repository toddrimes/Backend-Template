require('dotenv').config();
const cors = require('cors');
const express = require('express');
const mongoose = require('mongoose');
const mongoString = process.env.DATABASE_URL;
const database = mongoose.connection;
const PORT = process.env.PORT || 5501;
const http = require("http");
const app = express();
const server = http.createServer(app);
const {AppState} = require("./models/model");
const socketio = require("socket.io");
const io = socketio(server, {
    cors: {
        origin: `*`,
        methods: ["GET", "POST"],
        credentials: false
    }
});

mongoose.connect(mongoString);

// https://momentsapi-tr-0b46d75889bf.herokuapp.com/api/dnoc/assets HEROKU

database.on('error', (error) => {
    console.log(error)
})

database.once('connected', () => {
    console.log('Database Connected');
})

app.use(cors())
app.use(express.json());

app.use((req, res, next) => {
    res.header("Access-Control-Allow-Origin", "*");
    res.header(
        "Access-Control-Allow-Headers",
        "Origin, X-Requested-With, Content-Type, Accept"
    );
    next();
});

io.on('connection', (socket) => {
    console.log('A user connected');

    // Listen for state changes from clients
    socket.on('init', (contentId) => {
        console.log('init with contentId : ' + contentId);
        // Broadcast the newState to all connected clients
        AppState.findById(
            contentId
        )
        .then((data) => {
            // console.dir(data);
            if(data){
                console.log("emitting data back to single caller");
                io.to(socket.id).emit('stateChange', data);
            }
        });
    });

    // Listen for state changes from clients
    socket.on('stateChange', (newState) => {
        console.log('stateChange');
        console.dir(newState);
        // Broadcast the newState to all connected clients
        const filter = {_id: newState.contentId};
        const update = {lists: newState.lists};
        AppState.findOneAndUpdate(filter, update,{new: true, upsert: true})
        .then((data) => {
            console.dir(data);
        });
        io.emit('stateChange', newState);
    });

    // Handle disconnections
    socket.on('disconnect', () => {
        console.log('A user disconnected');
    });
});

const routes = require('./routes/routes');

app.use('/api', routes)

//Update by ID Method
app.get('/', (req, res) => {
    return res.status(200).send({
        success: 'true',
        message: 'Hello',
    });
})

server.listen(PORT, () => {
    console.log(`Server Started at ${process.env.PORT}`)
})
