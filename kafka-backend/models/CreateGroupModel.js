const mongoose = require('mongoose');
const Schema = mongoose.Schema;
var createGroupSchema = new Schema({
    name: {type: String, required: true},
    picture: {type: String, default: null},
    creator_id: {type: mongoose.Schema.Types.ObjectId, required: true}
},
{
    versionKey: false
});

const CreateGroupModel = mongoose.model('createGroup', createGroupSchema);
module.exports = CreateGroupModel;

