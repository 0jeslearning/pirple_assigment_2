/**
 * Primary file for the API
 * 
 */

// Dependecies
const http = require('http');
const https = require('https');
const config = require('../config');
const fs = require('fs');
const {Router} = require('./Router');
const path = require('path');


// The server should response to all requests with a string
const server = {
   
};

server.httpServer = http.createServer((req, res) => {
    Router.render(req, res);
});

server.httpsServerOptions = {
    'key': fs.readFileSync(path.join(__dirname,'/../https/key.pem')),
    'cert': fs.readFileSync(path.join(__dirname,'/../https/cert.pem'))
};

server.httpsServer = https.createServer(server.httpsServerOptions, (req, res) => {
    Router.render(req, res);
});

// Init script
server.init = () => {

  // Start the HTTP server
  server.httpServer.listen(config.httpPort, () => {
    console.log(`\x1b[36m%s\x1b[0m The HTTP server is running on port ${config.httpPort}`);
  });

  // Start the HTTPS server
  server.httpsServer.listen(config.httpsPort, () => {
    console.log(`\x1b[35m%s\x1b[0m The HTTPS server is running on port ${config.httpsPort}`);
  });

};

 // Export the module
 module.exports = server;

