/*
 * Primary file for API
 *
 */

// Dependencies
const server = require('./lib/server');
const routes = require('./app/routes');
// const workers = require('./lib/workers');

// Declare the app
const app = {
    // Init function
    init() {
        // Start the server
        routes.init();
        server.init();
        // Start the workers
        //workers.init();
    }
};

// Self executing
app.init();

// Export the app
module.exports = app;