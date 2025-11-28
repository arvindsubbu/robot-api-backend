const express = require('express');
const cors = require('cors');

const robotsRouter = require('./routes/robots');
const logsRouter = require('./routes/logs');
const errorHandler = require('./middlewares/errorHandler');

const app = express();

//Middlewares
app.use(cors());
app.use(express.json());

//Routes
app.use('/robots', robotsRouter);
app.use('/robots', logsRouter);

app.use(errorHandler);

module.exports = app;