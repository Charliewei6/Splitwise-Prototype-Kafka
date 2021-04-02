//import the require dependencies
var express = require('express');
var app = express();
var bodyParser = require('body-parser');
var session = require('express-session');
var cookieParser = require('cookie-parser');
var cors = require('cors');
app.set('view engine', 'ejs');
var mysql = require('mysql');
var path = require('path');
var multer = require("multer");
var moment = require("moment");
var crypto = require('crypto');
var fs = require('fs');
var AWS = require('aws-sdk');

const { mongoDB } = require('./config');
const mongoose = require('mongoose');
const Users = require('./Models/UserModel')


var options = {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    poolSize: 500,
    bufferMaxEntries: 0
};

mongoose.connect(mongoDB, options, (err, res) => {
    if (err) {
        console.log(err);
        console.log(`MongoDB Connection Failed`);
    } else {
        console.log(`MongoDB Connected`);
    }
});
//use cors to allow cross origin resource sharing
app.use(cors());

//use express session to maintain session data
app.use(session({
    secret              : 'cmpe273_kafka_passport_mongo',
    resave              : false, // Forces the session to be saved back to the session store, even if the session was never modified during the request
    saveUninitialized   : false, // Force to save uninitialized session to db. A session is uninitialized when it is new but not modified.
    duration            : 60 * 60 * 1000,    // Overall duration of Session : 30 minutes : 1800 seconds
    activeDuration      :  5 * 60 * 1000
}));


app.use(bodyParser.json());

app.post('/login',(req, res) => {
    console.log("enter login")
    var u = {
        email :req.body.email,
        password :req.body.password,
    };
    Users.findOne({ Email: req.body.email, Password: crypto.createHash('md5').update(req.body.password).digest("hex") }, (error, user) => {
        if (error) {
            // res.writeHead(500, {
            //     'Content-Type': 'text/plain'
            // })
            // res.end("Error Occured");
            return;
        }
        if (user) {
            res.cookie('cookie', "admin", { maxAge: 900000, httpOnly: false, path: '/' });
            req.session.user = u;
            res.status(200).json({
                id: user._id,
                name: user.Name,
                email: user.Email
            });
            console.log("login success")
        }
        else {
            res.status(401).json({
                message: 'error'
            });
        }
    });    
});

app.post('/signup',function(req,res){
    var newuser = new Users({
        Name : req.body.name,
        Email :req.body.email,
        Password :crypto.createHash('md5').update(req.body.password).digest("hex")
    });

    Users.findOne({ Email: req.body.email }, (error, user) => {
        if (error) {
            res.status(401).json({
                message: 'error'
            });
        }
        if (user) {
            res.writeHead(400, {
                'Content-Type': 'text/plain'
            })
            res.end("Book ID already exists");
        }
        else {
            newuser.save((error, data) => {
                if (error) {
                    res.writeHead(500, {
                        'Content-Type': 'text/plain'
                    })
                    res.end();
                }
                else {
                    res.writeHead(200,{
                        'Content-Type' : 'text/plain'
                    })
                    res.end("Successful Login");
                    console.log("signup success")
                }
            });
        }
    });
   
});
app.get('/profile',function(req,res){
    var userId = req.query.user_id;
    
    Users.findOne({ _id: userId }, (err, user) => {
        if (err) {
            console.log("error: ", err);
            res.status(401).send('error');
        } else {
            console.log(user)
            res.send(user);
        }
        res.end();
    });
});



//start your server on port 3001
app.listen(3001);
module.exports = app;
console.log("Server Listening on port 3001");
