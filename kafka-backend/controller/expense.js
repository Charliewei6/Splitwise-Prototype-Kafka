"use strict";
const { auth } = require("../utils/passport");
var moment = require("moment");
const GroupPerson = require('../models/GroupPersonModel')
const Expense = require('../models/ExpenseModel')
const ExpenseItem = require('../models/ExpenseItemModel')
const Comment = require('../models/CommentModel')
auth();

async function handle_request(msg, callback) {
	//async function loginUser(req,res) {
	let response = {};
	switch (msg.api) {
		case "post_expense": {
			console.log("Inside Expense Post Request");
			console.log("Req Body : ", msg);
			let message = msg.data;
			var userId = message.user_id;
			var userName = message.user_name;
			var groupId = message.group_id;
			var groupName = message.group_name;
			var name = message.name;
			var money = message.money;
			var create_at = moment().format('YYYY-MM-DD HH:mm:ss');
			try {
				GroupPerson.find({group_id:groupId},(err, members) => {
					if (err) {
						console.log(err)
						response.status = 401;
						callback(null, response);
					} else {
						var obj={creator_id:userId, creator_name:userName, group_id:groupId, group_name:groupName, money:money, name:name, create_at:create_at}
						Expense.create(obj,(err, result) => {
							if (err) {
								console.log(err)
								response.status = 401;
								callback(null, response);
							} else {
								var expenseId = result._id;
								var addsql = []
								var num = members.length;
								var item_money = money / num;
								if (num <= 1) {
									response.status = 400;
									callback(null, response);
								} else {
									for (var i=0; i<num; i++) {
										if (members[i].person_id != userId) {
											addsql.push({expense_id:expenseId, group_id:groupId, owe_id:members[i].person_id, owed_id:userId, money:item_money})
											GroupPerson.findOne({person_id: members[i].person_id,group_id:groupId}, (err, result) => {  
												if (err) {
													console.log(err)
													response.status = 401;
													callback(null, response);
												} else {
													GroupPerson.findOneAndUpdate({person_id: result.person_id,group_id:result.group_id},{$set: {balance:result.balance-item_money}},(err, result) => {
														if (err) {
															console.log(err)
															response.status = 401;
															callback(null, response);
														} 
													});
												  }
			
											});
										}
									}
									ExpenseItem.create(addsql,(err, result) => {
										if (err) {
											console.log(err)
											response.status = 401;
											callback(null, response);
										} 
									});
									var ownMnoey = money - item_money;
									GroupPerson.findOne({person_id: userId,group_id:groupId}, (err, result) => {  
									GroupPerson.findOneAndUpdate({person_id: userId,group_id:groupId},{$set: {balance:result.balance+ownMnoey}},(err, result) => {
										if (err) {
											console.log(err)
											response.status = 401;
											callback(null, response);
										}
									});
								});
								}
							}
						});
					}
				});
				response.status = 200;
				callback(null, response);
			} catch (error) {
				console.log(error);
				response.status = 500;
				response.data = "Network Error";
				callback(null, response);
			}
			break;
		}
		case "get_groupPage": {
			console.log("Inside Group Page Get Request");
			console.log("Req Body : ", msg);
			let message = msg.data;
			var groupId = message.group_id;
			try {
				Promise.all([
					Expense.find({group_id:groupId}).sort({ create_at: 'desc' }).
					populate([ {path: 'comment_list'},{path: 'comment_list',populate: {path: 'creator_id'}} ]),
					GroupPerson.find({ group_id:groupId }).
					populate({path: 'person_id'} )
				]).then(result=>{

					response.status = 200;
					response.data = result;
					callback(null, response);

				}).catch(err=>{
					if (err) {
						console.log(err)
						response.status = 401;
						callback(null, response);
					} 
				})
			} catch (error) {
				console.log(error);
				response.status = 500;
				response.data = "Network Error";
				callback(null, response);
			}
			break;
		}

		case "add_comment": {
			console.log("Inside Add Comment Request");
			console.log("Req Body : ", msg);
			let message = msg.data;
			var expenseId = message.expense_id
			var userId = message.user_id
			var note = message.note
			var obj={creator_id:userId,notes:note}
			try {
				Comment.create(obj,(err, result) => {
					if (err) {
						console.log(err)
						response.status = 401;
						callback(null, response);
					} else {
						Expense.findOne({_id:expenseId}, (error, info) => {
							if (error) {
								response.status = 401;
								callback(null, response);
							}else{
								var commentList = info.comment_list
								commentList.push(result._id)
								var newvalues = {$set: {comment_list: commentList} };
								Expense.findByIdAndUpdate( {_id:info._id}, newvalues ,(err, user) => {
									if (err) {
										console.log("error: ", err);
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
		case "delete_comment": {
			console.log("Inside Delete Comment Request");
			console.log("Req Body : ", msg);
			let message = msg.data;
			var noteId = message.noteId
			try {
				Comment.findByIdAndDelete({_id:noteId},(err, delResult) => {
					if (err) {
						console.log(err)
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
