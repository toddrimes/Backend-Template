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
const {AppState, Template} = require("./models/model");
const socketio = require("socket.io");
const Mustache = require('mustache');
const mqtt = require('mqtt');
const io = socketio(server, {
    cors: {
        origin: `*`,
        methods: ["GET", "POST"],
        credentials: false
    }
});

function renderLaunch(markup, mObject) {
    const rendered = Mustache.render(markup, mObject);
    return rendered;
}
function fetchTemplate(templateId) {
    let markup =  Template.findById(
        templateId
    )
    .then((data) => {
        // console.dir(data);
        if(data){
            return data.htmlCode;
        }
    });
    return markup;
}

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

// MQTT CLIENT SETUP // MQTT CLIENT SETUP // MQTT CLIENT SETUP // MQTT CLIENT SETUP // MQTT CLIENT SETUP
const url = 'wss://bwmmoe.stackhero-network.com:443/mqtt';
const username = 'node-red';
const password = 'nji0OM7MBBSlw7qMTfk6sn5PDX6rPKwo';
console.log('⏳ Connecting to MQTT server ' + url + '...');
const client = mqtt.connect(url, { username, password });
client.on('error', function (error) {console.log('🚨 Error: ' + error);});
client.on('close', function () {console.log('🔌 Connection has been closed');});
client.on('reconnect', function () {console.log('⏳ Reconnecting...');});
client.on('connect', function () {console.log('✅ Connected!');});
// END MQTT CLIENT SETUP // END MQTT CLIENT SETUP // END MQTT CLIENT SETUP // END MQTT CLIENT SETUP // END MQTT CLIENT SETUP

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
        newState._id = newState.contentId;
        io.emit('stateChange', newState);
        let firstKey = Object.keys(newState.lists)[0];
        let moments = newState.lists[firstKey];
        moments.map((moment) => {
            let nowMS = new Date().getTime();
            if(moment.phase == "launched" && moment.timecode > nowMS){
                // let markup = fetchTemplate(moment.templateId || '65366c268b981eca359b04a2');
                let markup = '<!-- div id="la-moment" --><div id="la-lefts"><img id="la-image" src="https://slemoments-b7158398214d.herokuapp.com/pic{{momentNumber}}.png"/>{{#isLive}}<div id="la-live">Live</div>{{/isLive}}</div><div id="la-texts"><div id="la-subtitle">{{subtitle}}</div><div id="la-title">{{title}}</div><div id="la-cta"><span class="la-flatten">{{buttonText}}</span></div></div><!-- /div -->';
                let delayMS = nowMS - moment.timecode;
                let finalMarkup = renderLaunch(markup, moment);
                setTimeout(() => {
                    // send mqtt broker the markup
                    client.publish(
                        'moments',
                        finalMarkup,
                        { qos: 2 },
                        function(err) {
                            if (err) {
                                console.log('🚨 Error when publishing to topic ' + topic + ': ' + err);
                            } else {
                                console.log('Sent + ' + finalMarkup)
                            }
                        }
                    );
//                 }, delayMS);
                }, 10000);
            }
        })
    });

    // Handle disconnections
    socket.on('disconnect', () => {
        console.log('A user disconnected');
    });
});

const routes = require('./routes/routes');
const {render} = require("express/lib/application");

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
