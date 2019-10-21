const mongoose = require('mongoose');
const user = require('./user');
const comment = require('./comment');

const imageSchema = new mongoose.Schema({
	data     : Buffer,
	type     : String,
	desc     : String,
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
