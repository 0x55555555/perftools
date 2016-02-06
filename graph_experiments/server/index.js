var express = require('express');
var app = express();

app.use(express.static(__dirname + '/../dist'));

app.use('/source/', express.static(__dirname + '/../web/'));

app.listen(process.env.PORT || 3000);
