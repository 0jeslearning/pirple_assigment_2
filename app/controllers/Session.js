
/**
 * Session controller
 */

 // Dependecies
 const DataFile = require('../../lib/DataFile');
 const {
     validateString,
     validateForeignKey,
     createRandomString,
     formatResponse,
     hash
    } = require('../../helpers');


const Store = new DataFile('Session');
const Session = {}


// Required header: sessionid
Session.logout = async ({headers}) => {
    // Check thtat all required field are filled out
    const id = validateForeignKey(headers.sessionid, 20) ? headers.sessionid.trim() : false;
    if (id) {
        try {
            await Session._delete(headers.sessionid);
            return formatResponse.success('Session deleted correctly');;
        }
        catch (error) {
            return formatResponse.fileError(error, 'Session');
        }
    }
    else {
        return formatResponse.custom(400, 'Missing session Id');
    }

}

//=============
// Internal methods
Session._create = async (value) => { 
    // If valid,  create a new token with a random name. 
    // Set an expiration date 1 hour in the future.
    const sessionid = createRandomString(20);
    const expires = Date.now() + 1000 * 60 * 60;
    const data = {
        value, 
         'id': sessionid, 
         'expires': expires
    };
 

    await Store.create(sessionid, data);
    return sessionid;
};

Session._read = async (sessionid) => { 
    const data = await Store.read(sessionid);
    return data;
};

Session._update = async (sessionid) => { 
    const data = await Store.read(sessionid);
    if (data.expires > Date.now()) {
        data.expires = Date.now() + 1000 * 60 * 60;

        await Store.update(sessionid, data);
        return data;
    }
    else {
        throw formatResponse.custom(400, 'The session has already expired, and cannot be extended.');
    }
};

Session._delete = async (sessionid) => { 
    await Store.delete(sessionid);
    return true;
};

// Verify if a given token id is currently valid for a given user
// The sessionValue only necessary for super access modifications
Session._verifyToken = async ({sessionid}, sessionValue='') => {
    
    // Get token from headers
    const id = validateForeignKey(sessionid) ? sessionid : false;

    // Get value 
    const value = validateString(sessionValue) ? sessionValue : false;

    if (!!id) {
        try {
            const data = await Store.read(sessionid);
            if (data.expires > Date.now() && (!value || data.value === sessionValue)) {
                return data.value;
            } 
            else if (data.value !== sessionValue) {
                throw formatResponse.custom(401, 'Unauthorized access');
            } 
            else {
                throw formatResponse.custom(403, 'Session has expired');
            }
        } 
        catch (error) {
            if (error.code === 'ENOENT') {
                throw formatResponse.custom(403, 'Unauthorized access');
            }
            else {
                throw error;
            }
        }
    } 
    else {
        throw formatResponse.custom(400, 'Session Id is missing.');
    }
};

// Export the module
 module.exports = Session;
