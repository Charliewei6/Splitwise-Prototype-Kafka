//import the require dependencies
var express = require('express');
var app = express();
var bodyParser = require('body-parser');
var session = require('express-session');
var cookieParser = require('cookie-parser');
var cors = require('cors');
app.set('view engine', 'ejs');
var path = require('path');
var multer = require("multer");
var moment = require("moment");
var crypto = require('crypto');
var fs = require('fs');
var AWS = require('aws-sdk');
var kafka = require("./kafka/client");
var config = require("./config");

const jwt = require('jsonwebtoken');
const { secret } = require('./config');
const { checkAuth } = require("./passport");
const { auth } = require("./passport");
auth();


const { mongoDB } = require('./config');
const mongoose = require('mongoose');
const Users = require('./Models/UserModel')
const CreateGroup = require('./Models/CreateGroupModel')
const GroupPerson = require('./Models/GroupPersonModel')
const Invite = require('./Models/InviteModel')
const Expense = require('./Models/ExpenseModel')
const ExpenseItem = require('./Models/ExpenseItemModel')
const Comment = require('./Models/CommentModel')
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
mongoose.set('useFindAndModify', false);

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

var fileFilter = function (req, file, cb) {
    var acceptableMime = ["image/jpeg", "image/png", "image/jpg", "image/gif"];
    if (acceptableMime.indexOf(file.mimetype) !== -1) {
        cb(null, true);
    } else {
        cb(null, false);
    }
};
var storage = multer.diskStorage({
    destination: path.resolve(__dirname, "./upload"),
    filename: function (req, file, cb) {
        let extName = file.originalname.slice(file.originalname.lastIndexOf("."));
        let fileName = Date.now();
        cb(null, fileName + extName);
    },
});
const imageUploader = multer({
    fileFilter,
    storage
}).single("file");

app.use(bodyParser.json());

app.post('/login',(req, res) => {
    const data = {
		api: "login_user",
		data: req.body,
	};
	kafka.make_request(config.login_topic, data, function (err, results) {
		if (err) {
			console.log("Inside err");
			res.status(500);
			res.json({
				status: "error",
				msg: "System Error, Try Again.",
			});
			res.end();
		} else {
			console.log("inside else of request");
			if (results.status === 200) {
				const token = jwt.sign(results.data, secret, {
					expiresIn: 1008000,
				});               
                res.status(200).json({
                    id: results.data._id,
                    jwt: "JWT " + token
                });
			} else {
                res.status(401).end("Invalid Credentials");
			}
		}
		return res;
	});
});

app.post('/signup',function(req,res){
    const data = {
		api: "signup_user",
		data: req.body,
	};
	kafka.make_request(config.login_topic, data, function (err, results) {
		if (err) {
			console.log("Inside err");
			res.status(500);
			res.json({
				status: "error",
				msg: "System Error, Try Again.",
			});
			res.end();
		} else {
			if(results.status === 200){
                res.writeHead(200,{
                    'Content-Type' : 'text/plain'
                })
                res.end("Successful Signup");
            }
            else if(results.status === 400){
                res.writeHead(400, {
                    'Content-Type': 'text/plain'
                })
                res.end("Email already exists");
            }
            else{
                res.writeHead(401, {
                    'Content-Type': 'text/plain'
                })
                res.end("Error");
            }
        }
		return res;
	});
});

app.get('/profile',checkAuth,function(req,res){
    const data = {
		api: "get_profile",
		data: req.query,
	};
	kafka.make_request(config.login_topic, data, function (err, results) {
		if (err) {
			console.log("Inside err");
			res.status(500);
			res.json({
				status: "error",
				msg: "System Error, Try Again.",
			});
			res.end();
		} else {
            if(results.status === 200){
                res.send(results.data);
            }
            else{
                console.log("error: ", err);
                res.status(401).send('error');
            }
			
		}
		return res;
	});
});

app.post('/profile', checkAuth,function (req, res) {
    const data = {
		api: "post_profile",
		data: req.body
	};
	kafka.make_request(config.login_topic, data, function (err, results) {
		if (err) {
			console.log("Inside err");
			res.status(500);
			res.json({
				status: "error",
				msg: "System Error, Try Again.",
			});
			res.end();
		} else {
            if(results.status === 200){
                res.status(200).json({
                    message: 'success'
                });
            }
            else{
                console.log("error: ", err);
                res.status(401).json({
                    message: 'error'
                });
            }
			
		}
		return res;
	});
});
const s3 = new AWS.S3({
    accessKeyId: "AKIAXVWN4WFGRBBGFJHM",
    secretAccessKey: "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"
})
app.post('/upload',imageUploader,(req,res,next) => {
    if(!req.file){
        res.status(404).send({message: "File not found"})
    }
    const name = Math.floor(Date.now()/1000)+req.file.originalname
    const params={
        Bucket: "mys3-xichao",
        Key: name,
        Body: fs.createReadStream(req.file.path),
        ContentType: req.file.mimetype,
        ACL: 'public-read'
    }
    s3.upload(params,(err,data) =>{
        if(err){
            res.status(400).send(err)
        }
        var s = data.Location
        res.status(200).json({
            
                    message: 'success',
                    data: {
                        "url": s
                    },
        });
        // res.status(200).send(data.Location)

    })
})
app.get('/upload', function (req, res) {
    res.sendFile( __dirname + "/" + req.url );
});


app.post('/group',checkAuth, function (req, res) {

    const data = {
		api: "post_group",
		data: req.body
	};
	kafka.make_request(config.group_topic, data, function (err, results) {
		if (err) {
			console.log("Inside err");
			res.status(500);
			res.json({
				status: "error",
				msg: "System Error, Try Again.",
			});
			res.end();
		} else {
            if(results.status === 200){
                res.status(200).json({
                    message: 'success'
                });
            }
            else if(results.status === 400){
                res.writeHead(400, {
                    'Content-Type': 'text/plain'
                })
                res.end("Name already exists");
            }
            else{
                console.log("error: ", err);
                res.status(401).json({
                    message: 'error'
                });
            }
			
		}
		return res;
	});
    
   
});
app.get('/search_person', function (req, res) {
    const data = {
		api: "search_person",
		data: req.query
	};
	kafka.make_request(config.group_topic, data, function (err, results) {
		if (err) {
			console.log("Inside err");
			res.status(500);
			res.json({
				status: "error",
				msg: "System Error, Try Again.",
			});
			res.end();
		} else {
            if(results.status === 200){
                res.status(200).json(
                    results.data
                );
            }
            else{
                res.status(401).json({
                    message: 'error'
                });
            }
			
		}
		return res;
	});
});
// app.get('/group', function (req, res) {
//     var groupId = req.query.group_id;
//     var sql = `SELECT * FROM cre_group WHERE id = ${groupId}; SELECT p.id,p.Name,p.Email FROM group_person AS gp LEFT JOIN Persons AS p ON gp.person_id = p.id WHERE gp.group_id = ${groupId}`;
//     db.query(sql,(err, result) => {
//         if (err) {
//             console.log(err)
//             res.status(401).json({
//                 message: 'error'
//             });
//         } else {
//             res.status(200).json({
//                 group: result[0],
//                 members: result[1]
//             });
//         }
//     });
// });

app.get('/invite', checkAuth,function (req, res) {
    const data = {
		api: "get_invite",
		data: req.query
	};
	kafka.make_request(config.group_topic, data, function (err, results) {
		if (err) {
			console.log("Inside err");
			res.status(500);
			res.json({
				status: "error",
				msg: "System Error, Try Again.",
			});
			res.end();
		} else {
            if(results.status === 200){
                res.status(200).json(
                    results.data
                );
            }
            else{
                res.status(401).json({
                    message: 'error'
                });
            }
			
		}
		return res;
	});
});
app.post('/invite',checkAuth, function (req, res) {

    const data = {
		api: "post_invite",
		data: req.body
	};
	kafka.make_request(config.group_topic, data, function (err, results) {
		if (err) {
			console.log("Inside err");
			res.status(500);
			res.json({
				status: "error",
				msg: "System Error, Try Again.",
			});
			res.end();
		} else {
            if(results.status === 200){
                res.status(200).json({
                    message: 'success'
                });
            }
            else{
                console.log("error: ", err);
                res.status(401).json({
                    message: 'error'
                });
            }
			
		}
		return res;
	});

});
app.get('/groups', checkAuth,function (req, res) {
    const data = {
		api: "get_groups",
		data: req.query
	};
	kafka.make_request(config.group_topic, data, function (err, results) {
		if (err) {
			console.log("Inside err");
			res.status(500);
			res.json({
				status: "error",
				msg: "System Error, Try Again.",
			});
			res.end();
		} else {
            if(results.status === 200){
                res.status(200).json(
                    results.data
                );
            }
            else{
                res.status(401).json({
                    message: 'error'
                });
            }
			
		}
		return res;
	});
});

app.post('/quit', function (req, res) {
    const data = {
		api: "post_quit",
		data: req.body
	};
	kafka.make_request(config.group_topic, data, function (err, results) {
		if (err) {
			console.log("Inside err");
			res.status(500);
			res.json({
				status: "error",
				msg: "System Error, Try Again.",
			});
			res.end();
		} else {
            if(results.status === 200){
                res.status(200).json({
                    message: 'success'
                });
            }
            else if(results.status === 400){
                res.status(200).json({
                    code: 0
                });
            }
            else{
                console.log("error: ", err);
                res.status(401).json({
                    message: 'error'
                });
            }
			
		}
		return res;
	});

});

app.post('/add_expense', checkAuth,function (req, res) {
    const data = {
		api: "post_expense",
		data: req.body
	};
	kafka.make_request(config.expense_topic, data, function (err, results) {
		if (err) {
			console.log("Inside err");
			res.status(500);
			res.json({
				status: "error",
				msg: "System Error, Try Again.",
			});
			res.end();
		} else {
            if(results.status === 200){
                res.status(200).json({
                    message: 'success'
                });
            }
            else if(results.status === 400){
                res.status(200).json({
                    code: 0
                });
            }
            else{
                console.log("error: ", err);
                res.status(401).json({
                    message: 'error'
                });
            }
			
		}
		return res;
	});
});

app.get('/group_page',checkAuth, function (req, res) {
    const data = {
		api: "get_groupPage",
		data: req.query
	};
	kafka.make_request(config.expense_topic, data, function (err, results) {
		if (err) {
			console.log("Inside err");
			res.status(500);
			res.json({
				status: "error",
				msg: "System Error, Try Again.",
			});
			res.end();
		} else {
            if(results.status === 200){
                const [expense,member] = results.data;
                res.status(200).json({
                    expenses: expense,
                    members: member
                });
            }
            else{
                res.status(401).json({
                    message: 'error'
                });
            }
			
		}
		return res;
	});

});

app.get('/activity',checkAuth, function (req, res) {
    const data = {
		api: "get_activity",
		data: req.query
	};
	kafka.make_request(config.recent_topic, data, function (err, results) {
		if (err) {
			console.log("Inside err");
			res.status(500);
			res.json({
				status: "error",
				msg: "System Error, Try Again.",
			});
			res.end();
		} else {
            if(results.status === 200){
                res.status(200).json(
                    results.data
                );
            }
            else{
                res.status(401).json({
                    message: 'error'
                });
            }
			
		}
		return res;
	});
});

app.get('/dashboard',checkAuth,function(req,res){
    const data = {
		api: "get_dashboard",
		data: req.query
	};
	kafka.make_request(config.recent_topic, data, function (err, results) {
		if (err) {
			console.log("Inside err");
			res.status(500);
			res.json({
				status: "error",
				msg: "System Error, Try Again.",
			});
			res.end();
		} else {
            if(results.status === 200){
                const [res1,res2] = results.data;
                var owe_sum=0
                for(var i=0;i<res1.length;i++)
                    owe_sum +=res1[i].money        

                var owed_sum=0
                for(var i=0;i<res2.length;i++)
                    owed_sum +=res2[i].money
                
                var total = owed_sum - owe_sum
                
                res.status(200).json({
                    owe: res1,
                    owed: res2,
                    total_owe: owe_sum,
                    total_owed: owed_sum,
                    total_balance: total
                });
            }
            else{
                res.status(401).json({
                    message: 'error'
                });
            }
			
		}
		return res;
	});
});

app.post('/settle_up',async function(req,res){
    const data = {
		api: "settle_up",
		data: req.body
	};
	kafka.make_request(config.recent_topic, data, function (err, results) {
		if (err) {
			console.log("Inside err");
			res.status(500);
			res.json({
				status: "error",
				msg: "System Error, Try Again.",
			});
			res.end();
		} else {
            if(results.status === 200){
                res.status(200).json({
                    message: 'success'
                });
            }
            else{
                console.log("error: ", err);
                res.status(401).json({
                    message: 'error'
                });
            }
			
		}
		return res;
	});
});

app.post('/add_comment', function (req, res) {
    const data = {
		api: "add_comment",
		data: req.body
	};
	kafka.make_request(config.expense_topic, data, function (err, results) {
		if (err) {
			console.log("Inside err");
			res.status(500);
			res.json({
				status: "error",
				msg: "System Error, Try Again.",
			});
			res.end();
		} else {
            if(results.status === 200){
                res.status(200).json({
                    message: 'success'
                });
            }
            else{
                console.log("error: ", err);
                res.status(401).json({
                    message: 'error'
                });
            }
			
		}
		return res;
	});
});


app.post('/delete_comment', function (req, res) {
    const data = {
		api: "delete_comment",
		data: req.body
	};
	kafka.make_request(config.expense_topic, data, function (err, results) {
		if (err) {
			console.log("Inside err");
			res.status(500);
			res.json({
				status: "error",
				msg: "System Error, Try Again.",
			});
			res.end();
		} else {
            if(results.status === 200){
                res.status(200).json({
                    message: 'success'
                });
            }
            else{
                console.log("error: ", err);
                res.status(401).json({
                    message: 'error'
                });
            }
			
		}
		return res;
	});

});
//start your server on port 3001
app.listen(3001);
module.exports = app;
console.log("Server Listening on port 3001")
