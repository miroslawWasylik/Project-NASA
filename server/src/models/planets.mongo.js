const mongoose = require('mongoose');

const planetSchema = new mongoose.Schema({
	keplerName: {
		type: 'string',
		required: true,
	}
});

module.exports = mongoose.model('Planet', planetSchema);