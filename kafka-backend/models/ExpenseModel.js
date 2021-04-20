const mongoose = require('mongoose');
const Schema = mongoose.Schema;

var expenseSchema = new Schema({
    creator_id: {type: mongoose.Schema.Types.ObjectId, required: true},
    creator_name: {type: String, required: true},
    group_id: {type: mongoose.Schema.Types.ObjectId, required: true},
    group_name: {type: String, required: true},
    money: {type: Number, required: true},
    name: {type: String, required: true},
    create_at: {type: Date, required: true},
    comment_list: [{type: mongoose.Schema.Types.ObjectId,ref: 'comment'}]
},
{
    versionKey: false
});

const ExpenseModel = mongoose.model('expense', expenseSchema);
module.exports = ExpenseModel;

