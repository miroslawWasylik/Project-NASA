const express = require('express');
const cors = require('cors');

const planetsRouter = require('./src/routes/planets/planets.router');

const app = express();

app.use(cors({
	origin: 'http://localhost:3000'
}));
app.use(planetsRouter);
app.use(express.json());

module.exports = app;