require('dotenv').config();
const cors = require('cors');
const express = require('express');
const mongoose = require('mongoose');
const mongoString = process.env.DATABASE_URL;

mongoose.connect(mongoString);
const database = mongoose.connection;

database.on('error', (error) => {
    console.log(error)
})

database.once('connected', () => {
    console.log('Database Connected');
})
const app = express();
app.use(cors())
app.use(express.json());

const routes = require('./routes/routes');

app.use('/api', routes)

//Update by ID Method
app.get('/', (req, res) => {
    return res.status(200).send({
        success: 'true',
        message: 'Hello',
    });
})

app.listen(process.env.PORT, () => {
    console.log(`Server Started at ${process.env.PORT}`)
})
