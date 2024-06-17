const axios = require('axios');

const launchesDatabase = require('./launches.mongo');
const planets = require('./planets.mongo');

const DEFAULT_FLIGHT_NUMBER = 100;

// const launches = new Map();

// let lastestFlightNumber = 100;

const launch = {
	flightNumber: 100, //flight_number
	mission: 'Kepler Exploration X', //name
	rocket: 'Explorer IS1', //rocket.name
	launchDate: new Date('December 27, 2030'), //date_local
	target: 'Kepler-442 b', //not applicable
	customers: ['ZTM', 'NASA' ], //payload.customers for each payload
	upcoming: true, //upcoming
	success: true, //success
};

saveLaunch(launch);

const SPACEX_API_URL = 'https://api.spacexdata.com/v4/launches/query';

async function populateLaunches() {
	console.log('Loading launch data');
	const response = await axios.post(SPACEX_API_URL, {
		query: {},
		options: {
			pagination: false,
			populate: [
				{
					path: 'rocket',
					select: {
						name: 1
					}
				},
				{
					path: 'payloads',
					select: {
						customers: 1
					}
				}
			]
		}
	});

	const launchDocs = response.data.docs;
	for (const launchDoc of launchDocs) {
		const payloads = launchDoc['payloads'];
		const customers = payloads.flatMap((payload) => {
			return payload['customers'];
		});

		const launch = {
			flightNumber: launchDoc['flight_number'],
			mission: launchDoc['name'],
			rocket: launchDoc['rocket']['name'],
			launchDate: launchDoc['date_local'],
			upcoming: launchDoc['upcoming'],
			success: launchDoc['success'],
			customers,
		};

		console.log(`${launch.flightNumber} ${launch.mission}`);

		//TODO: populate launches collection...
	}
}

async function loadLaunchData() {
	const firstLaunch = await findLaunch({
		flightNumber: 1,
		rocket: 'Falcon 1',
		mission: 'FalconSat'
	});
	if(firstLaunch) {
		console.log('Launch data already loaded');
		return;
	} else {
		await populateLaunches();
	}
}

// launches.set(launch.flightNumber, launch);

async function findLaunch(filter) {
	return await launchesDatabase.findOne(filter);
}

async function existsLaunchWithId(launchId) {
	return await findLaunch({
		flightNumber: launchId,
	});
}

async function getLastestFlightNumber() {
	const lastestLaunch = await launchesDatabase
		.findOne()
		.sort('-flightNumber');

	if(!lastestLaunch) {
		return DEFAULT_FLIGHT_NUMBER;
	}
		
	return lastestLaunch.flightNumber;
}

async function getAllLaunches() {
	// return Array.from(launches.values());
	return await launchesDatabase
		.find({}, { 'id': 0, '__v': 0});
}

async function saveLaunch(launch) {

	const planet = await planets.findOne({
		keplerName: launch.target,
	});

	if(!planet) {
		throw new Error('No matching planet found!');
	}
	
	await launchesDatabase.findOneAndUpdate({
		flightNumber: launch.flightNumber,
	}, launch, {
		upsert: true,
	})
}

async function scheduleNewLaunch(launch) {

	const newFlightNumber = await getLastestFlightNumber() + 1;

	const newLaunch = Object.assign(launch,  {
		success: true,
		upcoming: true,
		customers: ['Zero to Mastery', 'NASA'],
		flightNumber: newFlightNumber
	});

	await saveLaunch(newLaunch);
}

// function addNewLaunch(launch) {
// 	lastestFlightNumber++;
// 	launches.set(
// 		launch.flightNumber, 
// 		Object.assign(launch, {
// 			success: true,
// 			upcoming: true,
// 			customers: ['Zero to Mastery', 'NASA'],
// 			flightNumber: lastestFlightNumber,
// 		}));
// }

async function abortLaunchById(launchId) {
	const aborted =  await launchesDatabase.updateOne({
		flightNumber: launchId,
	}, {
		upcoming: false,
		success: false,
	});

	return aborted.modifiedCount === 1;
	// const aborted = launches.get(launchId);
	// aborted.upcoming = false;
	// aborted.success = false;

	// return aborted;
}

module.exports = {
	loadLaunchData,
	existsLaunchWithId,
	getAllLaunches,
	scheduleNewLaunch,
	abortLaunchById
}