/**
 * User handlers
 */

 // Dependecies
  const {
     validateString, 
     validateEmail,
     formatResponse,
     hash,
    } = require('../../helpers');

const DataFile = require('../../lib/DataFile');
const Session = require('./Session');
const Cart = require('./Cart');
const Store = new DataFile('User');

const User = {}

// User - post
// Required data: name, email, password, streetAddress
// Optional data: none
 User.create = async ({payload}) => {

    // Check thtat all required field are filled out
    const name = validateString(payload.name) ? payload.name.trim() : false;
    const email = validateEmail(payload.email) ? payload.email.trim() : false;
    const password = validateString(payload.password) ? payload.password.trim() : false;
    const streetAddress = validateString(payload.streetAddress) ? payload.streetAddress.trim()  : false;

    if (name && email && password && streetAddress) {
        try {
             // Hash the password
             const hashedPassword = hash(password);

             // Create the user object
             if (hashedPassword) {

               const userObject = {
                  name, 
                  email, 
                  hashedPassword, 
                  streetAddress
                };

                await Store.create(email, userObject);
                const sessionId = await Session._create(email);
                Cart._createUserCart(email);

                return formatResponse.success('User created', { 
                    name, 
                    email, 
                    streetAddress,
                    sessionId
                });

            }
        }
        catch(error) {
            return formatResponse.fileError(error, 'User');
        }
    }
    else {
        return formatResponse.custom(400, 'Missing required fields');
    }
 }

 
// Required data: email, password
// Optional data: none
 User.login = async ({payload}) => {
    const email = validateEmail(payload.email) ? payload.email.trim() : false;
    const password = validateString(payload.password) ? payload.password.trim() : false;

    if (email && password) {
        try {
            const userData = await Store.read(email);
            var hashedPassword = hash(password);
            // Hash the sent password, and compare it to the password stored in the user object
            if (hashedPassword == userData.hashedPassword) {
                const sessionId = await Session._create(userData.email);
                delete userData.hashedPassword;
                return formatResponse.success('User logged', {
                    ...userData,
                    sessionId
                });
            }
            else {
                return formatResponse.error('Password did not match the specified user\'s stored password');
            }
        }
        catch(error) {
            return formatResponse.fileError(error, 'User');
        }
    }
    else {
        return formatResponse.custom(400, 'Missing required fields');
    }

}

// Required data: email
// Optional data: none
User.profile = async ({queryStringObject, headers}) => {

    // Check that email is valid
    const email = validateEmail(queryStringObject.email) ? queryStringObject.email.trim() : false;

    if (email) {
      try {
          // Verify that the given token is valid for the email
          await Session._verifyToken(headers, email);
          //Verify that the given token is valid for the email
          let {name, streetAddress} =  await Store.read(email);
          return formatResponse.success('Get user was successfuly', {
                name ,
                email, 
                streetAddress
          });
       }
       catch(error) {
          return formatResponse.fileError(error, 'User');
       }
    }
    else {
        return formatResponse.custom(400, 'Missing required field');
    }
  };
  
// Required data: email
// Optional data: name, streetAddress, password (at least one must be specified)
User.put = async ({payload, headers}) => {

    // Check for required field
    const email = validateEmail(payload.email) ? payload.email.trim() : false;
    // Check for optional fields
    const name  = validateString(payload.name) ? payload.name.trim() : false;
    const password = validateString(payload.password) ? payload.password.trim() : false;
    const streetAddress = validateString(payload.streetAddress) ? payload.streetAddress.trim()  : false;

    // Error if email is invalid
    if (email) {

        // Error if nothing is sent to update
        if (name || streetAddress || password) {
            // Lookup the user
            try {
                // Verify that the given token is valid for the email
                await Session._verifyToken(headers, email);

                // Update the fields if necessary
                const userData = await Store.read(email);
                userData.name = name || userData.name;
                userData.hashedPassword = hash(password) || userData.hashedPassword;
                userData.streetAddress = streetAddress || userData.streetAddress;
                    
                // Lookup the user
                await Store.update(email, userData);
                delete userData.hashedPassword;
                return formatResponse.success('User updated successfully.', userData);
            }
            catch(error) {
                return formatResponse.fileError(error, 'User');
            }
        }
        else {
            return formatResponse.custom(400,  'Missing fields to update.');
        }
    }
    else {
        return formatResponse.custom(400, 'Missing required field.');
    }

};

// Required data: email
User.delete = async ({queryStringObject, headers}) => {

    // Check that email number is valid
    const email = validateEmail(queryStringObject.email) ? queryStringObject.email.trim() : false;

    if (email) {
        
        try {
            // Verify that the given token is valid for the email
            await Session._verifyToken(headers, email);

            // Lookup the user
            const data = await Store.delete(email);
            
            Cart._deleteUserCart(email);

            return formatResponse.success('User deleted', data);
        }
        catch(error) {
            return formatResponse.fileError(error, 'User');
        }
    }
    else {
        return formatResponse.custom(400, 'Missing required field');
    }
};
  

// Export the module
 module.exports = User;
