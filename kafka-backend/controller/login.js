"use strict";
const express = require("express");
const { auth } = require("../utils/passport");
const Users = require("../models/UserModel");
var crypto = require('crypto');

auth();

async function handle_request(msg, callback) {
	//async function loginUser(req,res) {
	let response = {};
	switch (msg.api) {
		case "login_user": {
			console.log("Inside Login Post Request");
			console.log("Req Body : ", msg);
			let message = msg.data;
			try {
				const user = await Users.findOne({ Email: message.email, 
					Password: crypto.createHash('md5').update(message.password).digest("hex") }
				);
				if(user) {
					const payload = {
						_id: user._id,
						email: user.Email,	
					};	
					console.log("login success")
					response.status = 200;
					response.data = payload;
					callback(null, response);
				} 
				else {
					response.status = 401;
					response.data = "Invalid Credentials";
					callback(null, response);
				}
			} catch (error) {
				console.log(error);
				response.status = 500;
				response.data = "Network Error";
				callback(null, response);
			}
			break;
		}
		case "signup_user": {
			console.log("Inside Signup Post Request");
			console.log("Req Body : ", msg);
			let message = msg.data;
			var newuser = new Users({
				Name : message.name,
				Email : message.email,
				Password :crypto.createHash('md5').update(message.password).digest("hex")
			});
			
			try {
				Users.findOne({ Email: message.email }, (error, user) => {
					if (user) {
						response.status = 400;
						callback(null, response);
					}
					else {
						newuser.save((error, data) => {
							if (error) {
								response.status = 500;
								callback(null, response);
							}
							else {
								response.status = 200;
								callback(null, response);
							}
						});
					}
				});
			} catch (error) {
				console.log(error);
				response.status = 500;
				response.data = "Network Error";
				callback(null, response);
			}
			break;
		}
		case "get_profile": {
			console.log("Inside Profile Get Request");
			console.log("Req Body : ", msg);
			let message = msg.data;
			var userId = message.user_id;
			try {
				Users.findOne({ _id: userId }, (err, user) => {
				if (err) {
					response.status = 401;
					callback(null, response);
				} else {
					console.log(user)
					response.status = 200;
					response.data = user;
					callback(null, response);
				}
		});
			} catch (error) {
				console.log(error);
				response.status = 500;
				response.data = "Network Error";
				callback(null, response);
			}
			break;
		}
		case "post_profile": {
			console.log("Inside Profile Post Request");
			console.log("Req Body : ", msg);
			let message = msg.data;
			id = message.user_id
			var newvalues = {$set: {Name: message.name,Email: message.email,Picture:message.picture,
			Phone: message.phone, Currency: message.currency,Timezone: message.timezone,Language:message.language} };
			try {
				Users.findByIdAndUpdate( id, newvalues ,(err, user) => {
					if (err) {
						response.status = 401;
						callback(null, response);
					} else {
						response.status = 200;
						callback(null, response);
					}
				});
			} catch (error) {
				console.log(error);
				response.status = 500;
				response.data = "Network Error";
				callback(null, response);
			}
			break;
		}

	}
}

module.exports = {
	handle_request,
};
