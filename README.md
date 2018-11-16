# Assignment 02: Homework for pirple nodejs lesson

For test you can use, for login and get sessionId:

    {
        "user": "pirple@test.com",
        "password": "123456"
    }


## ```404 Rootes```

#### POST | GET | DELETE | PUT

#### Errors
    404: Invalid route Path: ({Route.Path}) or method: ({Roote.Method})


## ```/user```

### POST » user/SingUp
   Create a new user with a unique email address.  
   Required fields: (in JSON payload) `name`, `email`, `password`, `streetAddress`.  

#### Response
    {   
        status: 200,
        message: 'User created',
        data: {
            name,
            email,
            streetAddress,
            sessionId
        }
    }

#### Errors
    400: Required fields missing
    400: The file already exists
    500: Permission denied

### POST » user/SingIn
   Create a new session id.  
   Required fields: (in JSON payload) `email`, `password`.  
   Requires sessionId: `No`  

#### Response
    {   
        status: 200,
        message: 'User logged',
        data: {
            name,
            email,
            streetAddress,
            sessionId
        }
    }

#### Errors
    400: Required fields missing
    400: Password did not match the specified user\'s stored password
    500: Permission denied

### GET » user/Profile
   Retrieve data for an existing user.  
   Required fields: (in query string) `email`  
   Requires sessionId: `Yes`  

#### Response
    {   
        status: 200,
        message: 'Get user was successfuly',
        data: {
            name,
            email,
            streetAddress,
        }
    }

#### Errors
    400: Required fields missing
    403: Unauthorized access
    403: Session has expired
    500: Permission denied

### PUT » user/Update
   Update an existing user.  
   Required fields: (in JSON payload) `email`  
   Optional fields: (in JSON payload) `name`, `password`, `streetAddress` (at least one must be specified)  
   Requires sessionId: `Yes`  

#### Response
    {   
        status: 200,
        message: 'Get user was successfuly',
        data: {
            name,
            email,
            streetAddress,
        }
    }

#### Errors
    400: Required fields missing
    403: Unauthorized access
    403: Session has expired
    500: Permission denied

### DELETE » user/Delete
   Delete an existing user.  
   Required fields: (in query string) `email`  
   Requires sessionId: `Yes`  

#### Response
    {   
        status: 200,
        message: 'User deleted',
    }

#### Errors
    400: Required fields missing
    403: Unauthorized access
    404: User: no such file
    403: Session has expired
    500: Permission denied

### DELETE » user/LogOut
   Remove a sessionId configuring the user's log out.  
   Requires sessionId: `Yes`  

#### Response
    {
        status: 200,
        message: 'Session deleted correctly',
    }

#### Errors
    400: Missing session Id
    404: Session: No such file
    500: Permission denied

## ```/menu```

### GET » menu/List
   Returns the menu in a JSON object.  
   Requires sessionId: `Yes`  

#### Response
    {   
        status: 200,
        message: "Get MenuItem was successfully",
        data: [{
            id, 
            name, 
            price
        }]
    }

#### Errors
    400: Required fields missing
    400: Session id is missing
    404: Cart: No such file
    500: Permission denied


## ```/cart```

### GET » cart/GetCart
   Get user's shopping cart.  
   Requires sessionId: `Yes`  

#### Response
    {   
        status: 200,
        message: "Get Cart was successfuly",
        data: [{
            quantity,
            id,
            name,
            price
        }]
    }

#### Errors
    400: Required fields missing
    400: Session id is missing
    403: Unauthorized access
    403: Session has expired
    404: Cart: No such file
    500: Permission denied

### PUT » cart/AddItem
   Add a menu item to the user's shopping cart.  
   Required fields: (in JSON payload) `itemId`  
   Optional fields: (in JSON payload) `quantity`  
   Requires sessionId: `Yes`  

#### Response
    {   
        status: 200,
        message: "Get Cart was successfuly",
        data: { 
            items: {
                itemId: Quantity,
                ...
            }
        }
    }

#### Errors
    400: Required fields missing
    400: Session id is missing
    403: Unauthorized access
    403: Session has expired
    500: Permission denied

### PUT » cart/RemoveItem

   Delete one item of the user's shopping cart.  
   Required fields: (in query string) `itemId`  
   Requires sessionId: `Yes`  

#### Response
    {   
        status: 200,
        message: "Cart: ${itemId} item added",
        data: { 
            items: {
                itemId: Quantity,
                ...
            }
        }
    }

#### Errors
    400: Required fields missing
    400: Session id is missing
    403: Unauthorized access
    403: Session has expired
    500: Permission denied

## ```/order```

### GET » order/Create
   Will create the order with the items on the cart  
   Requires sessionId: `Yes`  

#### Response
    {   
        status: 200,
        message: "Order was sent successfully",
    }

#### Errors
    400: Cart is empty
    400: Session id is missing
    403: Unauthorized access
    403: Session has expired
    500: Permission denied

