import express = require('express');
import morgan = require('morgan');

const app: express.Application = express();

app.use(morgan('combined'))

app.get('/', function(req, res) {
    res.send("Hello world!");
});

app.listen(3000, function() {
    console.log('Starting app on port 3000!');
})
