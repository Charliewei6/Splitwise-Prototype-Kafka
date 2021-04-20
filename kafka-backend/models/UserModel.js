const mongoose = require('mongoose');
const Schema = mongoose.Schema;

var usersSchema = new Schema({
    Name: {type: String, required: true},
    Email: {type: String, required: true},
    Password: {type: String, required: true},
    Picture: {type: String, default: null},
    Phone: {type: String, default: null},
    Currency: {type: Number, default: null},
    Timezone: {type: String, default: null},
    Language: {type: Number, default: null},
},
{
    versionKey: false
});

const userModel = mongoose.model('user', usersSchema);
module.exports = userModel;

