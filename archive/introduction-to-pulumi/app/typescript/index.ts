import express = require('express');
import morgan = require('morgan');

const app: express.Application = express();
const listenPort = process.env["LISTEN_PORT"];

// defines a logger for output
app.use(morgan('combined'))

app.get('/', function(req, res) {
    res.send("Hello world!");
});

app.listen(listenPort, function() {
    console.log('Starting app on port' + listenPort);
})