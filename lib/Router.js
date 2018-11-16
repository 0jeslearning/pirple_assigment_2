
/**
 * Route controller
 */
const url = require('url');
const {StringDecoder} = require('string_decoder');
const util = require('util');
const debug = util.debuglog('server');
const {
    validateString, 
    formatResponse,
    parseJsonToObject,
} = require('../helpers');

// Define the router 
const Router = {

    // Define route list {path, method, view, handler}
    mapper: [],

    // Add route to mapper
    addRoute(route={}) {

        if (!('path' in route) || !validateString(route.path)) {
            console.log(`Invalid Route ${JSON.stringify(route)} does no have path.`);
            return;
        }

        const routeExist = Router.mapper.some( currentRoute => currentRoute.path ===  route.path 
                                                                    && currentRoute.method ===  route.method );

        // Check if handler prop do not exist in route
        if (!('handler' in route)) {
            route.handler = (data, callback) => callback(400, { 'message': `The route '${route.path}' has not handler.` });
        }
        
        // Check if view prop do not exist in route
        if (!('view' in route)) {
            route.view = (data) => (400, { 'message': `The route '${route.path}' has not view.` });
        }
        
        // Check if route was created before
        if (!routeExist) {
            Router.mapper.push(route);
        }
        else {
            console.log(`The route ${route.path} with method ${route.method} had been defined`);
        }

    },

    // Get Route by path and method
    getRoute(path, method, defaultPath='NotFound') {
        let result = null;

        // Find the route by path and method
        Router.mapper.forEach( route => {
            if (route.path === path && route.method === method) {
               
                result = route;
            }
            else if (!result && route.path === defaultPath) {
                result = route;
            }
        });

        // Return the matches route or Default 404 route
        return result ? result : {
            path: 'notFound',
            handler: (data) => new Promise((resolve) => {
                resolve(formatResponse.custom(400, `Invalid route Path: (${path}) or method: (${method})`));
            })
        };
    },

    // 
    render(req, res) {

        // Get the URL and parse it
        const parsedUrl = url.parse(req.url, true);

        // Get the path
        const path = parsedUrl.pathname;
        const trimmedPath = path.replace(/^\/+|\/+$/g, '');

        // Get the query string as an object
        const queryStringObject = parsedUrl.query;

        // Get the HTTP Method
        const method = req.method.toLowerCase();

        // Get the headers as an object
        const headers = req.headers;

        // Get the payload, if any
        let buffer = '';
        const decoder = new StringDecoder('utf-8');

        req.on('data', (data) => {
            buffer += decoder.write(data);
        });

        req.on('end', async () => {
            buffer += decoder.end();

            // Construct the data object to send to the handler
            const data = {
                trimmedPath,
                queryStringObject,
                method,
                headers,
                payload: parseJsonToObject(buffer)
            };


            // Choose the handler this request should go to. If one is not found, use the notFound handler
            const {handler} = Router.getRoute(trimmedPath, method);

            // Route the request to the handler specified in the router
            const response = await handler(data);
  
            // Return the response
            res.setHeader('Content-Type', 'application/json');
            res.writeHead(response.status);
            res.end(JSON.stringify(response));

            // If the response is 200, print green, otherwise print red
            const debugColor = (response.status == 200)  
                                    ? '\x1b[32m%s\x1b[0m'
                                    : '\x1b[31m%s\x1b[0m';
            debug(`${debugColor} ${method.toUpperCase()} / ${trimmedPath} ${response.status}`);

            
        });
    }
}

const Route = {

    // Add route with get method
    get(route) {
        Router.addRoute({
            ...route,
            method: 'get'
        });
    },

    // Add route with post method
    post(route) {
        Router.addRoute({
            ...route,
            method: 'post'
        });
    },

    // Add route with put method
    put(route) {
        Router.addRoute({
            ...route,
            method: 'put'
        });
    },

    // Add route with delete method
    delete(route) {
        Router.addRoute({
            ...route,
            method: 'delete'
        });
    },

}



 // Export the module
 module.exports = {
    Route,
    Router
 };
