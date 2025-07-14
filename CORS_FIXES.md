# CORS Issues Fixes

## Problem
CORS (Cross-Origin Resource Sharing) errors are blocking requests from the frontend to the backend.

## Root Cause
The backend server is not properly configured to allow requests from the frontend domain.

## Solutions Applied

### 1. **Updated CORS Configuration** (`backend/server.js`)

```javascript
const corsOptions = {
  origin: function (origin, callback) {
    if (!origin) return callback(null, true);
    
    const allowedOrigins = [
      'https://food-ordering-app-frontend-3mzu.onrender.com',
      'https://food-delivery-admin-wrme.onrender.com',
      'https://food-ordering-app-n7dq.onrender.com',
      'https://food-ordering-app-frontend.onrender.com',
      'https://food-ordering-app-admin.onrender.com',
      'https://food-delivery-frontend-s2l9.onrender.com',
      'http://localhost:3000',
      'http://localhost:5173',
      'http://localhost:4000',
      'http://localhost:8080'
    ];
    
    if (allowedOrigins.indexOf(origin) !== -1 || 
        origin.includes('onrender.com') || 
        origin.includes('localhost')) {
      console.log('CORS allowed origin:', origin);
      callback(null, true);
    } else {
      console.log('CORS blocked origin:', origin);
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: [
    'Content-Type', 
    'Authorization', 
    'token', 
    'x-requested-with',
    'Accept',
    'Origin',
    'X-Requested-With'
  ],
  exposedHeaders: ['Content-Length', 'X-Requested-With'],
  optionsSuccessStatus: 200,
  preflightContinue: false
};
```

### 2. **Added CORS Headers Middleware**

```javascript
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', req.headers.origin);
  res.header('Access-Control-Allow-Credentials', true);
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS, PATCH');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization, token');
  
  if (req.method === 'OPTIONS') {
    res.sendStatus(200);
  } else {
    next();
  }
});
```

### 3. **Improved Frontend Axios Configuration**

```javascript
// Configure axios defaults
axios.defaults.withCredentials = true;
axios.defaults.headers.common['Content-Type'] = 'application/json';
```

### 4. **Better Error Handling**

```javascript
app.use((err, req, res, next) => {
  console.error('Error:', err.message);
  console.error('Stack:', err.stack);
  
  if (err.message === 'Not allowed by CORS') {
    return res.status(403).json({ 
      error: 'CORS: Origin not allowed',
      message: 'Cross-origin request blocked',
      origin: req.headers.origin 
    });
  }
  
  res.status(500).json({ 
    error: "Something went wrong!",
    message: err.message 
  });
});
```

## Key Changes

### Backend Changes:
1. **Flexible Origin Checking**: Allows all Render domains and localhost
2. **Additional Headers**: Added more allowed headers for better compatibility
3. **Preflight Handling**: Proper handling of OPTIONS requests
4. **Better Logging**: Detailed logging for debugging CORS issues

### Frontend Changes:
1. **Axios Defaults**: Set default headers and credentials
2. **Simplified Headers**: Removed redundant Content-Type headers
3. **Better Error Handling**: More specific error messages

## Testing

After deployment, test these endpoints:
1. `GET /api/food/list` - Should return food items
2. `POST /api/user/validate` - Should validate tokens
3. `POST /api/cart/get` - Should return cart data
4. `POST /api/order/verify` - Should verify payments

## Prevention

To prevent future CORS issues:
1. Always include new frontend URLs in the allowedOrigins array
2. Use flexible origin checking for development
3. Monitor server logs for CORS errors
4. Test all API endpoints after deployment

## Debugging

If CORS errors persist:
1. Check server logs for blocked origins
2. Verify frontend URL is in allowedOrigins
3. Test with curl to isolate frontend/backend issues
4. Check if backend is properly deployed and running 