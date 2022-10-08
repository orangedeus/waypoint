var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');

var cors = require('cors');



var app = express();

app.use(cors({ origin: true }));

app.use(logger('dev'));
app.use(cookieParser());




require('dotenv').config();

app.use(express.static(path.join(__dirname, 'build')));

if (process.env.NODE_ENV === 'production') {

    app.get('/*', function (req, res) {
        res.sendFile(path.join(__dirname, 'build', 'index.html'));
    });

}

app.use(function (err, req, res, next) {
    // set locals, only providing error in development
    res.locals.message = err.message;
    res.locals.error = req.app.get('env') === 'development' ? err : {};

    // render the error page
    res.status(err.status || 500);
    res.render('error');
});

module.exports = app;