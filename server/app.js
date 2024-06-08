const path = require('path');
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');

const planetsRouter = require('./src/routes/planets/planets.router');
const launchesRouter = require('./src/routes/launches/launches.router');

const app = express();

app.use(cors({
	origin: 'http://localhost:3000'
}));
app.use(morgan('combined'));

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

app.use(planetsRouter);
app.use(launchesRouter);
app.get('/', (req, res) => {
	res.send(path.join(__dirname, 'public', 'index.html'));
})

module.exports = app;