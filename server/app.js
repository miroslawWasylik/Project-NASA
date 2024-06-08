const express = require('express');
const planetsRouter = require('./src/routes/planets/planets.router');

const app = express();
app.use(planetsRouter);
app.use(express.json());

module.exports = app;