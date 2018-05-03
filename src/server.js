const http = require('http');
const api = require('./api');

// Module variables
var serverInstance;
var apiInstance;
var server = http.createServer(api.handleRequest);

/** @function start
  * Starts the server
  * @param {integer} port - the port to listen on
  * @param {string} datafile - the path to the database file
  * @param {function} callback - an optional callback invoked when the server starts
  */
function start(port, datafile, callback) {
  apiInstance = api.load(datafile);
  serverInstance = server.listen(port, function(){
    console.log("Listening on port " + port);
    if(typeof callback === "function") callback();
  });
}

/** @function stop
  * Stops the server from listening
  */
function stop() {
  if(serverInstance) {
    serverInstance.close();
  }
}

/** @module server
  * A server for implementing an API.
  */
module.exports = {
  start: start,
  stop: stop
};
