const {Route} = require('../lib/Router');
const User = require('./controllers/User');
const Cart = require('./controllers/Cart');
const Menu = require('./controllers/Menu');
const Session = require('./controllers/Session');
const Order = require('./controllers/Order');

const Routes = {
    init() {

        // User routes

        Route.delete({
            path: 'user/Delete',
            handler: User.delete
        });

        Route.delete({
            path: 'user/LogOut',
            handler: Session.logout
        });

        Route.get({
            path: 'user/Profile',
            handler: User.profile
        });

        Route.post({
            path: 'user/SingIn',
            handler: User.login
        });

        Route.post({
            path: 'user/SingUp',
            handler: User.create
        });

        Route.put({
            path: 'user/Update',
            handler: User.put
        });

        // MenuItem routes

        Route.get({
            path: 'menu/List',
            handler:  Menu.get
        });

        // Shopping cart routes

        Route.put({
            path: 'cart/AddItem',
            handler: Cart.addItem
        });

        Route.get({
            path: 'cart/GetCart',
            handler: Cart.getCart
        });

        Route.put({
            path: 'cart/RemoveItem',
            handler: Cart.removeItem
        });

        Route.post({
            path: 'order/Create',
            handler: Order.post
        });

    }
}


 // Export the module
 module.exports = Routes;