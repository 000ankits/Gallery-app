const mongoose = require('mongoose');
const user = require('./user');

const imageSchema = new mongoose.Schema({
	url     : String,
	desc    : String,
	display : { type: String, enum: [ 'public', 'private' ] },
	owner   : {
		type : mongoose.Schema.Types.ObjectId,
		ref  : 'user'
	}
});

module.exports = mongoose.model('image', imageSchema);
