/**
 * Cart handlers
 */

 // Dependecies
 const {
    validateNumber, 
    validateForeignKey,
    formatResponse,
    hash,
   } = require('../../helpers');

const DataFile = require('../../lib/DataFile');
const Session = require('./Session');
const Store = new DataFile('Cart');
const ItemStore = new DataFile('MenuItem');

const Cart = {}

// Cart - post
// Required data: itemId
// Optional data: quantity
Cart.addItem = async ({payload, headers}) => {

   // Check thtat all required field are filled out
   const itemId = validateForeignKey(payload.itemId, 16) ? payload.itemId : false;
   const quantity = validateNumber(payload.quantity) ? payload.quantity : 1;

   if (itemId) {
       let userCart = {};
       try {
            // Verify that the given token was expired
            const email = await Session._verifyToken(headers);
            userCart = await Cart._getCartData(email);
            
            if (quantity === 0) {
                if (itemId in userCart.items) {
                    delete userCart.items[itemId];
                }
                else {
                    return formatResponse.custom(400, 'Quantity value must be mayor than 0'); 
                }
            }
            else {
                userCart.items[itemId] = quantity;
            }

            const userCartUpdated = await Store.update(email, userCart);
            
            return formatResponse.success(`Cart: ${itemId} item added`, userCartUpdated);
       } 
       catch (error) {
            return formatResponse.fileError(error, 'Cart');
       }
   }
   else {
       return formatResponse.custom(400, 'Missing required fields');
   }
}

// Required data: none
// Optional data: none
Cart.getCart = async ({headers}) => {
   // Get token from headers
    try {
        // Verify that the given token was expired
        const email = await Session._verifyToken(headers);
        const list = await Cart._getCartList(email);

        return formatResponse.success('Get Cart was successfuly', list);
    }
    catch (error) {
        return formatResponse.fileError(error, 'Cart');
    }
 };
 

// Required data: itemId
Cart.removeItem = async ({payload, headers}) => {
    // Check thtat all required field are filled out
    const itemId = validateForeignKey(payload.itemId, 16) ? payload.itemId : false;

    try {
        const {value} = await Session._read(sessionId);
        // Verify that the given token is valid for the email
        await Session._verifyToken(headers, value);
        
        const cartItem = await Cart._getCartData(value);
        delete cartItem.items[itemId];

        await Store.update(value, cartItem);
        return formatResponse.success('Cart deleted', itemId);
    }
    catch (error) {
        return formatResponse.fileError(error, 'Cart');
    }
    

};

///////// Internal methods

// Get Cart list of user
Cart._getCartList = async (email) => {
    const userCart = await Cart._getCartData(email);
    const list =  await Promise.all(Object.keys(userCart.items)
                    .map( async (itemId) => ({
                        quantity: userCart.items[itemId],
                        ...await ItemStore.read(itemId)
                    })));
    return list
}

// Create user cart
Cart._createUserCart = async (email) => {
    const cartItems = await Store.create(email, {items: {}});
    return cartItems;
}
 
// Delete user cart
Cart._deleteUserCart = async (email) => {
    await Store.delete(email);
    return formatResponse.success('Cart deleted', email);

};

Cart._cleanUserCart = async (email) => {
    const userCart = await Store.read(email);
    userCart.items = {};
    await Store.update(email, userCart);
    return {};
};

Cart._getCartData = async (email) => {
    try {
        return await Store.read(email);
    }
    catch(error) {
        if (error.code === 'ENOENT') {
            return await Store.create(email, {items: {}});
        }
        else {
            throw error;
        }
    }
};
 

// Export the module
module.exports = Cart;
