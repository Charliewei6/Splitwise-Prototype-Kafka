const mongoose = require('mongoose');
const Schema = mongoose.Schema;

var commentSchema = new Schema({
    notes: {type: String, required: true},
    creator_id: {type: mongoose.Schema.Types.ObjectId, required: true,ref: 'user'}
},
{
    versionKey: false
});

const commentModel = mongoose.model('comment', commentSchema);
module.exports = commentModel;

