var cluster = require('cluster');
var numCPUs = require('os').cpus().length;

if(cluster.isMaster){
  for(var i=0; i<numCPUs; i++){
    cluster.fork();
  }

  cluster.on('death', function(worker){
    console.log('worker ['+worker.id+'] died!');
  });

  cluster.on("exit", function(worker){
    console.log('worker ['+worker.id+'] exit!');
  });

  cluster.on("online", function(worker){
    console.log('worker ['+worker.id+'] online!');
  });

  cluster.on("listening", function(worker){
    console.log('worker ['+worker.id+'] listening!');
  });
}else{

  /************************** Default Local Module ***********************/
  var express      = require('express');
  var path         = require('path');
  var favicon      = require('serve-favicon');
  var logger       = require('morgan');
  var cookieParser = require('cookie-parser');
  var bodyParser   = require('body-parser');
  var cors         = require('cors');

  var app          = express();
  /************************** Default Local Module ***********************/

  /************************** Add Global Module **************************/
  global._Passport  = require('passport');
  global._Config    = require('./configs/app-config');
  global._Common    = require('./common');
  /************************** Add Global Module **************************/

  /************************** Add Local Module ***************************/
  var timeout       = require('connect-timeout');
  var session       = require('express-session');
  var LocalStrategy = require('passport-local').Strategy;
  var redis         = require('redis');
  var RedisStore    = require('connect-redis')(session);
  var cuid          = require('cuid');

  /************************** Add Local Module ***************************/

  // uncomment after placing your favicon in /public
  //app.use(favicon(__dirname + '/public/favicon.ico'));
  app.use(cors());
  app.use(logger('dev'));
  app.use(bodyParser.json());
  app.use(bodyParser.urlencoded({ extended: true }));
  app.use(cookieParser());

  app.set('views', path.join(__dirname, 'views'));
  app.use(express.static(path.join(__dirname, 'views')));
  app.use(timeout(_Config.CONNECT_TIME));

  var document = require('./routes/document');
  app.use('/document', document);
  // catch 404 and forward to error handler
  app.use(function(req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
  });

  // setConnectTimeout

  app.use(function(req, res, next){
    if(!req.timeout) {
      console.log('connetion timeout!!');
      next();
    }
  });

  // development error handler
  // will print stacktrace
  if (app.get('env') === 'development') {
    app.use(function(err, req, res, next) {
      console.log(err);
      res.status(err.status || 500);      
      res.send(err);
    });
  }

  // production error handler
  // no stacktraces leaked to user
  app.use(function(err, req, res, next) {
    console.log(JSON.stringify(err));
    res.status(err.status || 500);
    res.send(err);

  });

  app.listen(_Config.APP.PORT);

  console.log('server on');
}

module.exports = app;
