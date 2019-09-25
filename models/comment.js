const mongoose = require('mongoose');
const user = require('./user');
const image = require('./image');

const commentSchema = new mongoose.Schema({
	text   : String,
	author : String,
	image  : {
		type : mongoose.Schema.Types.ObjectId,
		ref  : 'image'
	},
	owner  : {
		type : mongoose.Schema.Types.ObjectId,
		ref  : 'user'
	}
});

module.exports = mongoose.model('comment', commentSchema);
