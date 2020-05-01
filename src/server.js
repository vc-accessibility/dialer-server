const WebSocket = require("ws");
const express = require("express");
const https = require('https');
const fs = require('fs');
const path = require("path");
const util = require('util')

//configure ssl
const options = {
    key: fs.readFileSync('key.pem'),
    cert: fs.readFileSync('cert.pem')
};

//Include Google Speech to Text
const speech = require("@google-cloud/speech");
const client = new speech.SpeechClient();

//Configure Transcription Request
const request = {
    config: {
        encoding: "MULAW",
        sampleRateHertz: 8000,
        languageCode: "en-US"
    },
    interimResults: true
};

//Configure twilioClient object
const accountSid = process.env.ACCOUNT_SID;
const authToken = process.env.AUTH_TOKEN;
const twilioClient = require('twilio')(accountSid, authToken);

//make our outbound call, use twiml to tell it to attach to the web socket
function makeCall(callback, number) {
    let call = twilioClient.calls
        .create({
            url: "",
            to: number,
            from: process.env.TWILIO_PHONE_NUMBER,
            twiml: `
                <Response>
                  <Start>
                    <Stream url="wss://${callback}/"/>
                  </Start>
                  <Say>I will stream the next 60 seconds of audio through your websocket</Say>
                  <Pause length="60" />
                </Response>
              `
        });
   return call;
}

const app = express();
const server = https.createServer(options, app);
const wss = new WebSocket.Server({ server });

let recognizeStream = null;

// Handle Web Socket Connection
// idea is that this will run one per user using a serverless container
// so the broadcast is ok more work needed on deployment methods
// to confirm
wss.on("connection", function connection(ws) {
    ws.on("message", function incoming(message) {
        const msg = JSON.parse(message);
        switch (msg.event) {
            case "connected":
                console.log(`A new call has connected.`);
                // Create Stream to the Google Speech to Text API
                recognizeStream = client
                    .streamingRecognize(request)
                    .on("error", console.error)
                    .on("data", data => {
                        console.log(data.results[0].alternatives[0].transcript);
                        wss.clients.forEach(client => {
                            if (client.readyState === WebSocket.OPEN) {
                                client.send(
                                    JSON.stringify({
                                        event: "interim-transcription",
                                        text: data.results[0].alternatives[0].transcript
                                    })
                                );
                            }
                        });
                    });
                break;
            case "start":
                console.log(`Starting Media Stream ${msg.streamSid}`);
                break;
            case "media":
                // Write Media Packets to the recognize stream
                recognizeStream.write(msg.media.payload);
                break;
            case "stop":
                console.log(`Call Has Ended`);
                recognizeStream.destroy();
                break;
        }
    });

});

app.use(express.urlencoded());
app.use(express.static("public"));

//Handle initial page Request
app.get("/", (req, res) => res.sendFile(path.join(__dirname, "/index.html")));

// checks that the number requested matches the one
// in the env var then requests the call be made
// obviously, this is a bit hacky in order to make
// it public with short amount of time to implement
app.post("/dial", (req, res) => {
    let number = req.body.number;
    let responseString = "Cannot dial anything but the special number";
    console.log("received: " + number);
    if (number == process.env.SPECIAL_PHONE_NUMBER) {
        console.log(`calling ${number}`)
        let call = makeCall(req.headers.host, number);
        responseString = `Dialing ${req.body.number}`;
    }
    res.send(responseString);
});

console.log("Listening at Port 8080");
server.listen(8080);
