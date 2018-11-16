const private = require('./private')

// Container for all the environments
const environments = {};

// Development (default) environment
environments.development = {
  httpPort: 3000,
  httpsPort: 3001,
  envName: 'staging',
  maxCarts: 5,
  ...private.development

};

// Production environment
environments.production = {
  httpPort: 5000,
  httpsPort: 5001,
  envName: 'production',
  maxCarts: 5,
  ...private.production
};

const envName = typeof(process.env.NODE_ENV) === 'string'
                                  ? process.env.NODE_ENV.toLowerCase() 
                                  : '';

module.exports = envName in environments
                        ? environments[enveronmentName] 
                        : environments.development;