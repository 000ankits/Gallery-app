const mongoose = require('mongoose');
const user = require('./user');
const comment = require('./comment');

const imageSchema = new mongoose.Schema({
	url      : String,
	desc     : String,
	likes    : Number,
	privacy  : {
		type : String,
		enum : [ 'public', 'private' ]
	},
	comments : [
		{
			type : mongoose.Schema.Types.ObjectId,
			ref  : 'comment'
		}
	],
	owner    : {
		type : mongoose.Schema.Types.ObjectId,
		ref  : 'user'
	}
});

module.exports = mongoose.model('image', imageSchema);
