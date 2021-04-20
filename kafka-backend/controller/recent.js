"use strict";
const { auth } = require("../utils/passport");
const GroupPerson = require('../models/GroupPersonModel')
const ExpenseItem = require('../models/ExpenseItemModel')
auth();

async function handle_request(msg, callback) {
	//async function loginUser(req,res) {
	let response = {};
	switch (msg.api) {
		case "get_activity": {
			console.log("Inside Activity Get Request");
			console.log("Req Body : ", msg);
			let message = msg.data;
			var userId = message.user_id;
			var groupId = message.group_id;
			var order = message.order;
			try {
				if (groupId) {
					ExpenseItem.find({ $or: [{ owe_id: userId }, { owed_id: userId }],group_id:groupId}).
					populate('expense_id owe_id').
					exec(function (err, result) {
						console.log(result)
						if (err) {
							console.log(err)
							response.status = 401;
							callback(null, response);
						} else {
							if(order==0)
								result = result.reverse()
							response.status = 200;
							response.data = result;
							callback(null, response);
						}
					});
			
				}else{
					ExpenseItem.find({ $or: [{ owe_id: userId }, { owed_id: userId }]}).
					populate('expense_id owe_id').
					exec(function (err, result) {
						console.log(result)
						if (err) {
							console.log(err)
							response.status = 401;
							callback(null, response);
						} else {
							if(order==0)
								result = result.reverse()
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

		case "get_dashboard": {
			console.log("Inside Dashboard Get Request");
			console.log("Req Body : ", msg);
			let message = msg.data;
			var userId = message.user_id;

			try {
				Promise.all([
					ExpenseItem.find({owe_id:userId,status:0}).sort({ _id: 'desc' }).
					populate('expense_id owed_id'),
					ExpenseItem.find({owed_id:userId,status:0}).sort({ _id: 'desc' }).
					populate('expense_id owe_id')
				]).then(result=>{
					response.status = 200;
					response.data = result;
					callback(null, response);
				
				}).catch(err=>{
					if (err) {
						console.log("error: ", err);
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
		
		case "settle_up": {
			console.log("Inside Settle Up Post Request");
			console.log("Req Body : ", msg);
			let message = msg.data;
			var userId = message.user_id;
			try {
				ExpenseItem.find({owe_id:userId,status:0}, async(err, res1) => {  
					console.log("res1:",res1) 
					if (err) {
						console.log(err)
						response.status = 401;
						callback(null, response);
					} else{
						for (var i=0; i<res1.length; i++) {
							let m =  res1[i].money
							var result1 = await GroupPerson.findOne({person_id: res1[i].owed_id,group_id:res1[i].group_id})
							var result11 = await GroupPerson.findByIdAndUpdate( {_id:result1._id},{$set: {balance:result1.balance-m}})
							var result2 = await GroupPerson.findOne({person_id: userId,group_id:result1.group_id})
							var result22 = await GroupPerson.findByIdAndUpdate( {_id:result2._id},{$set: {balance:result2.balance+m}})                                  
						}
						ExpenseItem.updateMany({owe_id:userId,status:0},{$set: {status:1}} , (err, result1) => {
							if (err) {
								console.log(err)
								response.status = 401;
								callback(null, response);
							} 
							else{ 
								ExpenseItem.find({owed_id:userId,status:0}, async(err, res2) => { 
									console.log("res2:",res2)
									if (err) {
										console.log(err)
										response.status = 401;
										callback(null, response);
									} 
									else{ 
										for (var i=0; i<res2.length; i++) {
											let m2 =  res2[i].money
											var result3 = await GroupPerson.findOne({person_id: res2[i].owe_id,group_id:res2[i].group_id})
											var result33 = await GroupPerson.findByIdAndUpdate( {_id:result3._id},{$set: {balance:result3.balance+m2}})
											var result4 = await GroupPerson.findOne({person_id: userId,group_id:result3.group_id})
											var result44 = await GroupPerson.findByIdAndUpdate( {_id:result4._id},{$set: {balance:result4.balance-m2}})
										} 
										ExpenseItem.updateMany({owed_id:userId,status:0},{$set: {status:1}},(err, result2) => {   
											response.status = 200;
											callback(null, response);    
										});
									}
							
								});
							}   
							});
			
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

	}
}

module.exports = {
	handle_request,
};
