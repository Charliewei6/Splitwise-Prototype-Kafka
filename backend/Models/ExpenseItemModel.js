const mongoose = require('mongoose');
const Schema = mongoose.Schema;

var expenseItemSchema = new Schema({
    expense_id: {type: mongoose.Schema.Types.ObjectId, required: true,ref: 'expense'},
    group_id: {type: mongoose.Schema.Types.ObjectId, required: true},
    owe_id: {type: mongoose.Schema.Types.ObjectId, required: true,ref: 'user'},
    owed_id: {type: mongoose.Schema.Types.ObjectId, required: true,ref: 'user'},
    money: {type: Number, required: true},
    status: {type: Number, default: 0}
},
{
    versionKey: false
});

const ExpenseItemModel = mongoose.model('expenseItem', expenseItemSchema);
module.exports = ExpenseItemModel;

