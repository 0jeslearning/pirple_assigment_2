/**
 * Menu handlers
 */

 // Dependecies
 const {
    formatResponse,
   } = require('../../helpers');

const DataFile = require('../../lib/DataFile');
const Store = new DataFile('MenuItem');
const Session = require('./Session');

const Menu = {}

// Required data: id
// Optional data: none
Menu.get = async ({headers}) => {
    try {
        // Verify that the given token is valid for the email
        await Session._verifyToken(headers);
        //Verify that the given token is valid for the email
        const menuItemData = await Store.list();
        const list = await Promise.all(menuItemData.map( (itemId) => Store.read(itemId)));
        return formatResponse.success('Get MenuItem was successfully', list);
    }
    catch (error) {
        return formatResponse.fileError(error);
    }
 };


// Export the module
module.exports =  Menu
