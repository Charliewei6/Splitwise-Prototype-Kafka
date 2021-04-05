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

const { mongoDB } = require('./config');
const mongoose = require('mongoose');
const Users = require('./Models/UserModel')
const CreateGroup = require('./Models/CreateGroupModel')
const GroupPerson = require('./Models/GroupPersonModel')
const Invite = require('./Models/InviteModel')
const Expense = require('./Models/ExpenseModel')
const ExpenseItem = require('./Models/ExpenseItemModel')
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
    var u = {
        email :req.body.email,
        password :req.body.password,
    };
    Users.findOne({ Email: req.body.email, Password: crypto.createHash('md5').update(req.body.password).digest("hex") }, (error, user) => {
        if (error) {
            res.writeHead(500, {
                'Content-Type': 'text/plain'
            })
            res.end("Error Occured");
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
            res.end("Email already exists");
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
                    res.end("Successful Signup");
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

app.post('/profile', function (req, res) {
    id = req.body.user_id
    // var newvalues = {$set: {"Name": req.body.name,"Email": req.body.email,"Picture":req.body.picture,
    // "Phone":req.body.phone, "Currency":req.body.currency,"Language":req.body.language} };
    var newvalues = {$set: {Name: req.body.name,Email: req.body.email,Picture:req.body.picture,
    Phone:req.body.phone, Currency:req.body.currency,Language:req.body.language} };
    Users.findByIdAndUpdate( id, newvalues ,(err, user) => {
        if (err) {
            console.log("error: ", err);
            res.status(401).json({
                message: 'error'
            });
        } else {
            res.status(200).json({
                message: 'success'
            });
        }
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


app.post('/group', function (req, res) {
    var userId = req.body.user_id;
    var userName = req.body.user_name;
    var name = req.body.name;
    var members = req.body.members;

    var newgroup = new CreateGroup({
        name : req.body.name,
        picture :req.body.picture,
        creator_id: req.body.user_id
    });
    CreateGroup.findOne({ name: req.body.name },(err, result) => {
        if (err) {
            res.status(401).json({
                message: 'error'
            });
        }
        if (result) {
            res.writeHead(400, {
                'Content-Type': 'text/plain'
            })
            res.end("Name already exists");
        }
        
        else {

            newgroup.save((error, data) => {
                if (error) {
                    res.writeHead(500, {
                        'Content-Type': 'text/plain'
                    })
                    res.end();
                }
                else {
                    var groupId = data._id;
                    var myobj = { group_id: groupId, person_id: data.creator_id };
                    GroupPerson.create(myobj,(err, result) => {
                        if (err) {
                            res.status(200).json({
                                message: 'error'
                            });
                        } else {
                            if (members) {
                                var obj = [];
                                for (var i=0; i<members.length; i++) {
                                    obj.push({inviter_id:result.person_id,inviter_name:userName,group_id:groupId,group_name:name,invitee_id:members[i]})
                                }       
                                console.log(obj)
                        
                                Invite.create(obj,(err, result) => {
                                    if (err) {
                                        console.log(err);
                                        res.status(401).json({
                                            message: 'error'
                                        });
                                    }
                                });
                            }
                        }
                    });
                }
        });
    }
    
    res.status(200).json({
        message: 'success'
    });
});
});
app.get('/search_person', function (req, res) {
    var email = req.query.email;
    email = email.split(" ").map(n => new RegExp(n));
    Users.find({Email:{ $in: email }},(err, result) => {
        if (err) {
            console.log(err)
            res.status(401).json({
                message: 'error'
            });
        } else {
            res.status(200).json(
                result
            );
        }
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

app.get('/invite', function (req, res) {
    var userId = req.query.user_id;
    Invite.find({invitee_id:userId},(err, result) => {
        if (err) {
            console.log(err)
            res.status(401).json({
                message: 'error'
            });
        } else {
            res.status(200).json(result);
        }
    });
});
app.post('/invite', function (req, res) {
    var inviteId = req.body.invite_id;
    Invite.find({_id:inviteId},(err, result) => {
        if (err) {
            console.log(err)
            res.status(401).json({
                message: 'error'
            });
        } else {
            var groupId = result[0].group_id;
            var personId = result[0].invitee_id;
            var myobj = { group_id: groupId, person_id: personId, balance:0 };
            GroupPerson.create(myobj,(err, addResult) => {
                if (err) {
                    console.log(err)
                    res.status(401).json({
                        message: 'error'
                    });
                } else {
                    Invite.findByIdAndDelete({_id:inviteId},(err, delResult) => {
                        if (err) {
                            console.log(err)
                            res.status(401).json({
                                message: 'error'
                            });
                        } else {
                            res.status(200).json({
                                message: 'success'
                            });
                        }
                    });
                }
            });
        }
    });
});
app.get('/groups', function (req, res) {
    var userId = req.query.user_id;
    if (req.query.name) {
        var name = req.query.name.split(" ").map(n => new RegExp(n));
        GroupPerson.find({ person_id:userId}).
        populate({path: 'group_id',match:{name:{$in: name}} } ).
        exec(function (err, result) {
            if (err) {
                console.log(err)
                res.status(401).json({
                    message: 'error'
                });
            } else {
                result= result.filter(element=>element.group_id !== null)
                res.status(200).json(result);
            }
        });
    } else {
        GroupPerson.find({ person_id:userId }).
        populate('group_id').
        exec(function (err, result) {
            if (err) {
                console.log(err)
                res.status(401).json({
                    message: 'error'
                });
            } else {
                res.status(200).json(result);
            }
        });
    
    }
});

app.post('/quit', function (req, res) {
    var userId = req.body.user_id;
    var groupId = req.body.group_id;
    GroupPerson.find({group_id:groupId,person_id:userId},(err, result) => {
        if (err) {
            console.log(err)
            res.status(401).json({
                message: 'error'
            });
        } else {
            if (result[0].balance != 0) {
                res.status(200).json({
                    code: 0
                });
            } else if (result[0].balance === 0) {
                GroupPerson.findByIdAndDelete({_id:result[0]._id},(err, delResult) => {
                    if (err) {
                        console.log(err)
                        res.status(401).json({
                            message: 'error'
                        });
                    } else {
                        res.status(200).json({
                            message: 'success'
                        });
                    }
                });
             } 
        }
    });
});

app.post('/add_expense', function (req, res) {
    var userId = req.body.user_id;
    var userName = req.body.user_name;
    var groupId = req.body.group_id;
    var groupName = req.body.group_name;
    var name = req.body.name;
    var money = req.body.money;
    var create_at = moment().format('YYYY-MM-DD HH:mm:ss');
    GroupPerson.find({group_id:groupId},(err, members) => {
        if (err) {
            console.log(err)
            res.status(401).json({
                message: 'error'
            });
        } else {
            var obj={creator_id:userId, creator_name:userName, group_id:groupId, group_name:groupName, money:money, name:name, create_at:create_at}
            Expense.create(obj,(err, result) => {
                if (err) {
                    console.log(err)
                    res.status(401).json({
                        message: 'error'
                    });
                } else {

                    var expenseId = result._id;
                    var addsql = []

                    var num = members.length;
                    var item_money = money / num;
                    if (num <= 1) {
                        res.status(200).json({
                            code: 0
                        });
                    } else {
                        for (var i=0; i<num; i++) {
                            if (members[i].person_id != userId) {
                                addsql.push({expense_id:expenseId, group_id:groupId, owe_id:members[i].person_id, owed_id:userId, money:item_money})
                                GroupPerson.findOne({person_id: members[i].person_id,group_id:groupId}, (err, result) => {  
                                    if (err) {
                                        console.log(err)
                                        res.status(401).json({
                                            message: 'error'
                                        });
                                    } else {
                                        GroupPerson.findOneAndUpdate({person_id: result.person_id,group_id:result.group_id},{$set: {balance:result.balance-item_money}},(err, result) => {
                                            if (err) {
                                                console.log(err)
                                                res.status(401).json({
                                                    message: 'error'
                                                });
                                            } 
                                        });
                                      }

                                });
                            }
                        }
                        ExpenseItem.create(addsql,(err, result) => {
                            if (err) {
                                console.log(err)
                                res.status(401).json({
                                    message: 'error'
                                });
                            } 
                        });
                        var ownMnoey = money - item_money;
                        GroupPerson.findOne({person_id: userId,group_id:groupId}, (err, result) => {  
                        GroupPerson.findOneAndUpdate({person_id: userId,group_id:groupId},{$set: {balance:result.balance+ownMnoey}},(err, result) => {
                            if (err) {
                                console.log(err)
                                res.status(401).json({
                                    message: 'error'
                                });
                            }
                        });
                    });
                    }
                }
            });
        }
    });
    res.status(200).json({
        message: 'success'
    });
});

app.get('/group_page', function (req, res) {
    var groupId = req.query.group_id;
    Promise.all([
        Expense.find({group_id:groupId}).sort({ create_at: 'desc' }),
        GroupPerson.find({ group_id:groupId }).
        populate({path: 'person_id'} )
    ]).then(result=>{
        
        const [expense,member] = result;
        // console.log("1:",expense);
        // console.log("2:",member);
        res.status(200).json({
            expenses: expense,
            members: member
        });
    
    }).catch(err=>{
        if (err) {
            console.log(err)
            res.status(401).json({
                message: 'error'
            });
        } 
    })

});

app.get('/activity', function (req, res) {

    var userId = req.query.user_id;
    var groupId = req.query.group_id;
    var order = req.query.order;

    if (groupId) {
        ExpenseItem.find({ $or: [{ owe_id: userId }, { owed_id: userId }],group_id:groupId}).
        populate('expense_id owe_id').
        exec(function (err, result) {
            if (err) {
                console.log(err)
                res.status(401).json({
                    message: 'error'
                });
            } else {

                if(order==0)
                    result = result.reverse()
                res.status(200).json(result);
            }
        });

    }else{
        ExpenseItem.find({ $or: [{ owe_id: userId }, { owed_id: userId }]}).
        populate('expense_id owe_id').
        exec(function (err, result) {
            if (err) {
                console.log(err)
                res.status(401).json({
                    message: 'error'
                });
            } else {
                // console.log(result)
                if(order==0)
                    result = result.reverse()
                res.status(200).json(result);
            }
        });
    }

});

app.get('/dashboard',function(req,res){
    var userId = req.query.user_id;
     Promise.all([
        ExpenseItem.find({owe_id:userId,status:0}).sort({ _id: 'desc' }).
        populate('expense_id owed_id'),
        ExpenseItem.find({owed_id:userId,status:0}).sort({ _id: 'desc' }).
        populate('expense_id owe_id')
    ]).then(result=>{
        const [res1,res2] = result;
        // console.log("res1:",res1);
        // console.log("res2:",res2);

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
    
    }).catch(err=>{
        if (err) {
            console.log("error: ", err);
            res.status(401).json({
                message: 'error'
            });
        } 
    })
  

});

// app.post('/settle_up',function(req,res){
//     var userId = req.body.user_id;
//     console.log("enter settle")
//     Promise.all([
//         ExpenseItem.find({owe_id:userId,status:0}),
//         ExpenseItem.find({owed_id:userId,status:0})

//    ]).then(result=>{
//     const [res1,res2] = result;
//     console.log("res1:",res1);
//     console.log("res2:",res2);
//     for (var i=0; i<res1.length; i++) {
//         var m =  res1[i].money
//         GroupPerson.findOne({person_id: res1[i].owed_id,group_id:res1[i].group_id}, (err, result) => {
//             var v1 = result.balance-m
//             console.log("owe -",v1)
//             GroupPerson.findOneAndUpdate( {person_id: result.person_id,group_id:result.group_id},{$set: {balance:v1}},(err, result) => {
//                 if (err) {
//                     console.log(err)
//                     res.status(401).json({
//                         message: 'error'
//                     });
//                 }
           
//             });

//         });

//         GroupPerson.findOne({person_id: userId,group_id:res1[i].group_id}, (err, result) => { 
//             var v2 = result.balance+m
//             console.log("owe +",v2)
//             GroupPerson.findOneAndUpdate( {person_id: userId,group_id:result.group_id},{$set: {balance:v2}},(err, result) => {
//                 if (err) {
//                     console.log(err)
//                     res.status(401).json({
//                         message: 'error'
//                     });
//                 }
//             });
//         });

//     }
    
//     for (var i=0; i<res2.length; i++) {

//         var m2 =  res2[i].money
//         GroupPerson.findOne({person_id: res2[i].owe_id,group_id:res2[i].group_id}, (err, res) => { 
//             var v3 = res.balance+m2
//             console.log("owed +",v3)

//             GroupPerson.findOneAndUpdate( {person_id: res.person_id,group_id:res.group_id},{$set: {balance:v3}} ,(err, result) => {
//                 if (err) {
//                     console.log(err)
//                     res.status(401).json({
//                         message: 'error'
//                     });
//                 }
//             });
//         });
//         GroupPerson.findOne({person_id: userId,group_id:res2[i].group_id}, (err, res) => {
//             var v4 = res.balance-m2
//             console.log("owed-",v4)

//             GroupPerson.findOneAndUpdate( {person_id: userId,group_id:res.group_id},{$set: {balance:v4}} ,(err, result) => {
//                 if (err) {
//                     console.log(err)
//                     res.status(401).json({
//                         message: 'error'
//                     });
//                 }
               
//             });
//         });
//     }
//     // updSql += `UPDATE expense_item SET status = 1 WHERE owe_id = ${userId};
//     //            UPDATE expense_item SET status = 1 WHERE owed_id = ${userId};`;
//     ExpenseItem.updateMany({owe_id:userId,status:0},{$set: {status:1}},(err, result) => {

//         if (err) {
//             console.log(err)
//             res.status(401).json({
//                 message: 'error'
//             });

//         }
//         else{
//             console.log("answer:", result)
//         }
       
//     });

//     ExpenseItem.updateMany({owed_id:userId,status:0},{$set: {status:1}},(err, result) => {
//         if (err) {
//             console.log(err)
//             res.status(401).json({
//                 message: 'error'
//             });
//         }
       
//     });
//     res.status(200).json({
//         message: 'success'
//     });
//    }).catch(err=>{
//     if (err) {
//         console.log("error: ", err);
//         res.status(401).json({
//             message: 'error'
//         });
//     } 
// })
    
// });


app.post('/settle_up',async function(req,res){
    var userId = req.body.user_id;
    let foo = async () => {
    ExpenseItem.find({owe_id:userId,status:0}, async(err, res1) => {  
        console.log("res1:",res1) 
        if (err) {
            res.status(401).json({
                message: 'error'
            });
        } else{
            for (var i=0; i<res1.length; i++) {
                let m =  res1[i].money
                console.log("1")
                var result1 = await GroupPerson.findOne({person_id: res1[i].owed_id,group_id:res1[i].group_id})
                console.log("2")
                var result11 = await GroupPerson.findByIdAndUpdate( {_id:result1._id},{$set: {balance:result1.balance-m}})
                console.log("3")
                var result2 = await GroupPerson.findOne({person_id: userId,group_id:result1.group_id})
                console.log("4")
                var result22 = await GroupPerson.findByIdAndUpdate( {_id:result2._id},{$set: {balance:result2.balance+m}})                                  
            }
            ExpenseItem.updateMany({owe_id:userId,status:0},{$set: {status:1}} , (err, res) => {
                console.log("5")
                if (err) {
                    console.log(err)
                    res.status(401).json({
                        message: 'error'
                    });
                } 
                else{ 
                    ExpenseItem.find({owed_id:userId,status:0}, async(err, res2) => { 
                        console.log("res2:",res2)
                        if (err) {
                            console.log(err)
                            res.status(401).json({
                                message: 'error'
                            });
                        } 
                        else{ 
                            for (var i=0; i<res2.length; i++) {
                                let m2 =  res2[i].money
                                console.log("6")
                                result3 = await GroupPerson.findOne({person_id: res2[i].owe_id,group_id:res2[i].group_id})
                                console.log("7")
                                result33 = await GroupPerson.findByIdAndUpdate( {_id:result3._id},{$set: {balance:result3.balance+m2}})
                                console.log("8")
                                result4 = await GroupPerson.findOne({person_id: userId,group_id:result3.group_id})
                                console.log("9")
                                result44 = await GroupPerson.findByIdAndUpdate( {_id:result4._id},{$set: {balance:result4.balance-m2}})
                            } 
                            ExpenseItem.updateMany({owed_id:userId,status:0},{$set: {status:1}},(err, result) => {   
                                console.log("10")         
                            });
                        }
                        
                
                    });
                }   
            });

                }
            })

        }
    setTimeout( async function(){ 
        let a = await foo()
        res.status(200).json({
            message: 'success'
        
        });
    }, 300);   
    

      
       
    
});

//start your server on port 3001
app.listen(3001);
module.exports = app;
console.log("Server Listening on port 3001")
