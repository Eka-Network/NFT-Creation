var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var app = express();
const routes = require('./routes/token');
var cors = require("cors");
const mongoose = require("mongoose");
const http = require('http');
require("dotenv").config();
var JWT = require('./JWT_Auth');
var fileUpload = require('express-fileupload');

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'html');
app.use(bodyParser.json());
app.use(fileUpload());
app.use(cors({ credentials: true, origin: true }));
app.use(cookieParser());
app.get('/', function(req, res) {res.status(200).send("");})
app.use("/", JWT.JWTAuthMiddleware);
mongoose.connect(process.env.MONGODB_CONNECTION, {
    useNewUrlParser: true,
    useFindAndModify: false,
    useUnifiedTopology: true,
    useCreateIndex: true,
}, () => {
    console.log("connected to database");
});

app.use('/', routes);
app.use(function(err, req, res, next) {
    // set locals, only providing error in development
    console.log("[Server]error code " + err.message + ' ' + req.url);
    res.locals.message = err.message;
    res.locals.error = req.app.get('env') === 'development' ? err : {};
    //  render the error page
    res.status(err.status || 500);
    //res.render('error');
});


http.createServer(app).listen(process.env.PORT);
module.exports = app;
