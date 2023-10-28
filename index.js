require('dotenv').config();
const cors = require('cors');
const express = require('express');
const mongoose = require('mongoose');
const mongoString = process.env.DATABASE_URL;
const database = mongoose.connection;
const socketIO = require("socket.io");
const PORT = process.env.PORT || 5501;
const app = express();
const http = require("http");
const sever = http.createServer(app);
const io = socketIO();

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

io.on("connection", async (socket) => {
    console.log("A user connected", socket.id);

    socket.on("chat message", async (message) => {
        console.log("message from client", JSON.parse(message));
        io.emit("chat message", JSON.stringify(sendMessage));
    });
    // Handle disconnect event
    socket.on("disconnect", () => {
        console.log("A user disconnected");
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

app.listen(PORT, () => {
    console.log(`Server Started at ${process.env.PORT}`)
})
