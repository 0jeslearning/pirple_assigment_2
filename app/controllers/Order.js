/**
 * Order handlers
 */

 // Dependecies
 const {
    sendCharges, 
    sendMail,
    formatResponse,
    createRandomString,
   } = require('../../helpers');

const DataFile = require('../../lib/DataFile');
const Session = require('./Session');
const Store = new DataFile('Order');
const Cart = require('./Cart');

const Order = {}


// Order - post
// Required data: none
// Optional data: none
Order.post = async ({headers}) => {
    try {
        // Verify that the given token was expired
        const email = await Session._verifyToken(headers);

        // Get all cart items of user
        const cartList = await Cart._getCartList(email);

        if (cartList.length) {

            // Get a random string as id for the new token
            const orderId = createRandomString(20);
            const orderData = {
                orderId,
                items: cartList,
                userEmail: email,
                amount: cartList.reduce((totalCost, item) => totalCost += item.price, 0),
                orderDate: Date.now()
            };

            const {
                outcome, 
                paid, 
                error
            } = await sendCharges(orderId, orderData.amount);

            if (error) {
                throw error;
            }

            if (outcome.type === 'authorized' && paid === true) {
                // Send email to user
                const emailResponse = await sendMail(
                                                    email,
                                                    'Your order has been paid',
                                                    'Receipt for the orderId ' + orderId,
                                                );

                console.log(emailResponse)
                
                // Clean cart
                await Cart._cleanUserCart(email);
                // Store order by email and orderId
                await Store.create(`${email}_${orderId}`, orderData);
                return formatResponse.success('Order was sent successfully');
            }
        }
        else {
            return formatResponse.error('Cart is empty');
        }
    } 
    catch (error) {
        return formatResponse.fileError(error, 'Order');
    }
}

//Todo: get all order by user

// Export the module
module.exports =  Order
