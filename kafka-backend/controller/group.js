"use strict";
const { auth } = require("../utils/passport");
const Users = require("../models/UserModel");
const CreateGroup = require('../models/CreateGroupModel')
const GroupPerson = require('../models/GroupPersonModel')
const Invite = require('../models/InviteModel')


auth();

async function handle_request(msg, callback) {
	//async function loginUser(req,res) {
	let response = {};
	switch (msg.api) {
		case "post_group": {
			console.log("Inside group Post Request");
			console.log("Req Body : ", msg);
			let message = msg.data;

			var userName = message.user_name;
			var name = message.name;
			var members = message.members;
		
			var newgroup = new CreateGroup({
				name : message.name,
				picture :message.picture,
				creator_id: message.user_id
			});
			
			try {
				CreateGroup.findOne({ name: message.name },(err, result) => {
					if (err) {
						response.status = 401;
						callback(null, response);
					}
					if (result) {
						response.status = 400;
						callback(null, response);
					}
					
					else {
			
						newgroup.save((error, data) => {
							if (error) {
								response.status = 500;
								callback(null, response);
							}
							else {
								var groupId = data._id;
								var myobj = { group_id: groupId, person_id: data.creator_id };
								GroupPerson.create(myobj,(err, result) => {
									if (err) {
										response.status = 500;
										callback(null, response);
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
													response.status = 401;
													callback(null, response);
												}
											});
										}
									}
								});
							}
					});
				}
				
				response.status = 200;
				callback(null, response);
			});
			} catch (error) {
				console.log(error);
				response.status = 500;
				response.data = "Network Error";
				callback(null, response);
			}
			break;
		}
		case "search_person": {
			console.log("Inside Seach Person Get Request");
			console.log("Req Body : ", msg);
			let message = msg.data;
			var email = message.email;
			email = email.split(" ").map(n => new RegExp(n));
			console.log(email)
			try {
				Users.find({Email:{ $in: email }},(err, result) => {
					if (err) {
						response.status = 401;
						callback(null, response);
					} else {
						response.status = 200;
						response.data = result;
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

		case "get_invite": {
			console.log("Inside Invite Get Request");
			console.log("Req Body : ", msg);
			let message = msg.data;

			var userId = message.user_id;

			try {
				Invite.find({invitee_id:userId},(err, result) => {
					if (err) {
						response.status = 401;
						callback(null, response);
					} else {
						response.status = 200;
						response.data = result;
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
		case "post_invite": {
			console.log("Inside Invite Post Request");
			console.log("Req Body : ", msg);
			let message = msg.data;
			var inviteId = message.invite_id;
			try {
				Invite.find({_id:inviteId},(err, result) => {
					if (err) {
						console.log(err)
						response.status = 401;
						callback(null, response);
					} else {
						var groupId = result[0].group_id;
						var personId = result[0].invitee_id;
						var myobj = { group_id: groupId, person_id: personId, balance:0 };
						GroupPerson.create(myobj,(err, addResult) => {
							if (err) {
								console.log(err)
								response.status = 401;
								callback(null, response);
							} else {
								Invite.findByIdAndDelete({_id:inviteId},(err, delResult) => {
									if (err) {
										console.log(err)
										response.status = 401;
										callback(null, response);
									} else {
										response.status = 200;
										callback(null, response);
									}
								});
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
		case "get_groups": {
			console.log("Inside Groups Get Request");
			console.log("Req Body : ", msg);
			let message = msg.data;
			var userId = message.user_id;
			try {
				if (message.name) {
					var name = message.name.split(" ").map(n => new RegExp(n));
					GroupPerson.find({ person_id:userId}).
					populate({path: 'group_id',match:{name:{$in: name}} } ).
					exec(function (err, result) {
						if (err) {
							console.log(err)
							response.status = 401;
							callback(null, response);
						} else {
							result= result.filter(element=>element.group_id !== null)
							response.status = 200;
							response.data = result;
							callback(null, response);
						}
					});
				} else {
					GroupPerson.find({ person_id:userId }).
					populate('group_id').
					exec(function (err, result) {
						if (err) {
							console.log(err)
							response.status = 401;
							callback(null, response);
						} else {
							response.status = 200;
							response.data = result;
							callback(null, response);
						}
					});
				
				}
			} catch (error) {
				console.log(error);
				response.status = 500;
				response.data = "Network Error";
				callback(null, response);
			}
			break;
		}
		case "post_quit": {
			console.log("Inside quit Post Request");
			console.log("Req Body : ", msg);
			let message = msg.data;
			var userId = message.user_id;
			var groupId = message.group_id;			
			try {
				GroupPerson.find({group_id:groupId,person_id:userId},(err, result) => {
					if (err) {
						console.log(err)
						response.status = 401;
						callback(null, response);
					} else {
						if (result[0].balance != 0) {
							response.status = 400;
							callback(null, response);
						} else if (result[0].balance === 0) {
							GroupPerson.findByIdAndDelete({_id:result[0]._id},(err, delResult) => {
								if (err) {
									console.log(err)
									response.status = 401;
									callback(null, response);
								} else {
									response.status = 200;
									callback(null, response);
								}
							});
						 } 
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
