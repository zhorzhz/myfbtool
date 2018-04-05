const hskey   = fs.readFileSync('/etc/letsencrypt/live/myfbtool.com/privkey.pem');
const hscert  = fs.readFileSync('/etc/letsencrypt/live/myfbtool.com/fullchain.pem');
const options = {
    key: hskey,
    cert: hscert
};

const _         = require("lodash");
const express   = require("express");
const app       = express();
const https     = require("https");
const request   = require("request");
const server    = https.Server(options, app);
const io        = require("socket.io")(server);

server.listen(3000);

var user;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(function(req, res, next) {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET, PUT, POST, DELETE, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, Content-Length, X-Requested-With, X-API-Token, X-JWT-Token');
    
    if ('OPTIONS' === req.method) {
        return res.sendStatus(200);
    }
    
    next();
});

app.get("/webhook", function (req, res) {
    console.log("req",req.body, req.query);
    res.send(req.query["hub.challenge"]).end();
});

app.post("/webhook", function (req, res) {
    console.log("req" ,req.body.entry, req.body.entry[0].messaging, _.get(req, "body.entry[0].messaging[0].message.text", ""));
    if(user){
        user.emit("receiver", {
            text    : _.get(req, "body.entry[0].messaging[0].message.text", ""),
            sender  : _.get(req, "body.entry[0].messaging[0].sender.id", ""),
            page    : _.get(req, "body.entry[0].messaging[0].recipient.id", ""),
        });
    }
    res.sendStatus(200);
});


io.on("connection", function (socket) {
    user = socket;
    socket.emit("message", { text: "hellooooo" });
    socket.on("sender", function (data) {
        console.log("data", data);
        request.post({
            url : "https://graph.facebook.com/v2.6/me/messages?access_token=EAAClceU7X3IBAEMTVjQy7plqRcqZCYofp2P10QppftVjPZBkV6eJ6YTgJIM3fF4phZCWcHhngOyWQnOt03gIxnyh7LZBD9qfJJG3oesJSxfqCGVoNRPNe51ZCbFYeWc61TwwuQuxkpuceVnWnQ9XJEI0kZCd6v5Wndi7Be0lnECZBx49owOcROh",
            json   : true,
            method : "POST",
            body    : {
                messaging_type  : "RESPONSE",
                recipient       : { id: data.recipient },
                message         : { text: data.text },
                
            }
        }, (error, success) => {
            console.log("message sent", error, success);
        })
    });
});

console.log("server started");