const mongoose = require('mongoose');
const Schema = mongoose.Schema;

var inviteSchema = new Schema({
    inviter_id: {type: mongoose.Schema.Types.ObjectId, required: true},
    inviter_name: {type: String, required: true},
    group_id: {type: mongoose.Schema.Types.ObjectId, required: true},
    group_name: {type: String},
    invitee_id: {type: mongoose.Schema.Types.ObjectId, required: true},
},
{
    versionKey: false
});

const InviteModel = mongoose.model('invite', inviteSchema);
module.exports = InviteModel;

