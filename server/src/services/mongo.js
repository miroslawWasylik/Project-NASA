const mongoose = require('mongoose');

const MONGO_URL = 'mongodb+srv://node_api:w843VSO3fw6DeGfr@cluster0.scmzbi3.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0';


mongoose.connection.once('open', () => {
	console.log('MongoDB connection ready!');
});

mongoose.connection.on('error', (err) => {
	console.error(err);
});

async function mongoConnect() {
	mongoose.connect(MONGO_URL);
}

async function mongoDisconnect() {
	await mongoose.disconnect();
}

module.exports = {
	mongoConnect,
	mongoDisconnect
}