/*
 * Helpers for various tasks
 *
 */

// Dependencies
const config = require('../config');
const crypto = require('crypto');
const https = require('https');
const querystring = require('querystring');

// Mail validation
const mailRegex = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;

// Container for all the helpers
const helpers = {};

// Parse a JSON string to an object in all cases, without throwing
helpers.parseJsonToObject = (str) => {
  try {
    const obj = JSON.parse(str);
    return obj;
  } 
  catch (e) {
    if (e instanceof SyntaxError && str) {
      console.log(`JSON >> SyntaxError >> ${e.message} >> (${str})`);
    } 
    return  {};
  }
};

// Create a SHA256 hash
helpers.hash = (str) => {
  if (helpers.validateString(str)) {
    const hash = crypto.createHmac('sha256', config.hashingSecret).update(str).digest('hex');
    return hash;
  } 
  else  {
    return false;
  }
};

// Create a string of random alphanumeric characters, of a given length
helpers.createRandomString = (strLength) => {
  strLength = helpers.validateNumber(0) ? strLength: false;

  if (strLength) {
    // Define all the possible characters that could go into a string
    const possibleCharacters = 'abcdefghijklmnopqrstuvwxyz0123456789';

    // Start the final string
    let str = '';
    for (let i = 1; i <= strLength; i++)  {
        // Get a random charactert from the possibleCharacters string
        const randomCharacter = possibleCharacters.charAt(Math.floor(Math.random() * possibleCharacters.length));
        // Append this character to the string
        str += randomCharacter;
    }
    // Return the final string
    return str;
  } 
  else {
    return false;
  }
};

helpers.sendTwilioSms = (phone, msg, callback) => {
  // Validate parameters
  phone = helpers.validateString(phone, 9, 10) ? phone.trim(): false;
  msg = helpers.validateString(msg, 9, 1600) ? msg.trim(): false;

  if (phone && msg) {

    // Configure the request payload
    const payload =  {
      'From': config.twilio.fromPhone, 
      'To': '+1'+phone, 
      'Body': msg
    };
    const stringPayload = querystring.stringify(payload);

    // Configure the request details
    const requestDetails = {
      'protocol': 'https:', 
      'hostname': 'api.twilio.com', 
      'method': 'POST', 
      'path': '/2010-04-01/Accounts/'+config.twilio.accountSid+'/Messages.json', 
      'auth': config.twilio.accountSid+':'+config.twilio.authToken, 
      'headers':  {
        'Content-Type': 'application/x-www-form-urlencoded', 
        'Content-Length': Buffer.byteLength(stringPayload)
      }
    };

    // Instantiate the request object
    const req = https.request(requestDetails, (res) => {

        // Grab the status of the sent request
        const status =  res.status;

        // Callback successfully if  the request went through
        if (status == 200 || status == 201) {
          callback(false);
        } 
        else  {
          callback(`Status code returned was ${status}`);
        }
    });

    // Bind to the error event so it doesn't get thrown
    req.on('error', (e) => {
      callback(e);
    });

    // Add the payload
    req.write(stringPayload);

    // End the request
    req.end();

  } 
  else  {
    callback('Given parameters were missing or invalid');
  }
};

helpers.formatResponse = {
  // File errors
  fileError: (error, entity='Error') => {
    switch (error.code) {
      case 'ENOENT': return {status: 404, message: `${entity}: No such file`};
      case 'EEXIST': return {status: 400, message: `${entity}: The file already exists`};
      case 'EACCES': return {status: 500, message: `${entity}: Permission denied`};
      case 'EISDIR': return {status: 500, message: `${entity}: The file is a directory`};
      default:
          return helpers.formatResponse.error(error.message, error.status);
    }
  },
  error: (message, status=400) => ({status, message}),
  success: (message, data={}) => ({status: 200, message, data}),
  // Custom response
  custom: (status, message, data={}) => ({status, message, data}),
};

// Validate String
helpers.validateString = (value, min=1, max=0) => typeof(value) == 'string' && value.trim().length >= min && (max === 0 || value.trim().length <= max)

// Validate Number
helpers.validateNumber = (value, regex=/\d+/) => typeof(value) == 'number' && regex.test(value);

// Validate Boolean
helpers.validateBoolean = (value, defaultValue) => typeof(value) == 'boolean' && value == defaultValue;

// Validate Emails
helpers.validateEmail = (value) => helpers.validateString(value, 5) && mailRegex.test(value);

// Validate foreign keys
helpers.validateForeignKey = (value, max=20) => helpers.validateString(value, max, max);

// Https request
helpers.httpsRequest = async (options, data)  => {
    return new Promise((resolve, reject) => {
      const req = https.request(options, (res) => {
        //console.log('statusCode:', res.statusCode);
        //console.log('headers:', res.headers);

        let response = '';
        res.setEncoding('utf-8');
        res.on('data', (resData) => {
            //process.stdout.write(d);
            // console.log(resData)
          response = resData;
        });
        res.on('end', () => {
          try {
            response = JSON.parse(response);
            resolve(response);
          } 
          catch (error) {
            resolve(response);
          }
        });
      });
      req.on('error', (error) => {
        reject(helpers.formatResponse.error(error.message));
      });
      req.write(data);
      req.end();
    });
  };

// Send mail using MailGun
helpers.sendMail = async (sendTo, subject, message) => {

    //validate parameters
  message  = helpers.validateString(message) ? message: false;
  subject  = helpers.validateString(subject) ? subject: false;
  // nowadays the email will be send to only one recipient. 
  // If want to send to more in the future change this to an object
  sendTo  =  helpers.validateString(sendTo) ? sendTo: false;

  if (!(message && subject && sendTo)){
    throw helpers.formatResponse.custom(400, 'Mailgun - Given parameters were missing or invalid');
  }

  //configure the payload for the request
  const payload = {
    from: `Assign2 <${config.mailgun.from}>`,
    to: sendTo,
    subject: subject,
    text: message
  };

  const data = querystring.stringify(payload);

  // Configure the request details
  const options = {
    protocol: config.mailgun.protocol,
    hostname: config.mailgun.hostUrl,
    method: 'POST',
    path: config.mailgun.path,
    auth: `api:${config.mailgun.secretKey}`,
    retry: 1,
    port: config.mailgun.port,
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'Content-Length': Buffer.byteLength(data),
    }
  }; 

  const response = await helpers.httpsRequest(options, data);
  return response;

};;

// Send charges using Stripe
helpers.sendCharges = async (orderId, amount=0) => {
      amount = helpers.validateNumber(amount) ? amount: 0;
    
      //configure the payload for the request
      const payload = {
         amount: amount * 100,
         currency: 'usd', 
         description: `charges for this orderId ${orderId}`,
         source: 'tok_visa'
      };
  
      const data = querystring.stringify(payload);

      // Configure the request details
      const options = {
          protocol: 'https:',
          hostname: config.stripe.hostUrl,
          method: 'POST',
          port: 443,
          path: config.stripe.chargePath,
          headers: {
              'Content-Type': 'application/x-www-form-urlencoded',
              'Content-Length': Buffer.byteLength(data),
              'Authorization': `Bearer ${config.stripe.secretKey}`
          }
      }; 
  
      const response = await helpers.httpsRequest(options, data);
      return response;
  
    };;


// Export the module
module.exports = helpers;