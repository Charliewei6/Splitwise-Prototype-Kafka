const mongoose = require('mongoose');
const Schema = mongoose.Schema;

var groupPersonSchema = new Schema({
    group_id: {type: Schema.Types.ObjectId, ref: 'createGroup'},
    person_id: {type: mongoose.Schema.Types.ObjectId, required: true,ref: 'user'},
    balance: {type: Number, default: 0}

},
{
    versionKey: false
});

const GroupPersonModel = mongoose.model('groupPerson', groupPersonSchema);
module.exports = GroupPersonModel;

