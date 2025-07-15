import express from "express";
import cors from "cors";
import { connectDB } from "./config/db.js";
import foodRouter from "./routes/foodRoute.js";
import userRouter from "./routes/userRoute.js";
import "dotenv/config";
import cartRouter from "./routes/cartRoute.js";
import orderRouter from "./routes/orderRoute.js";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// app config
const app = express();
const port = process.env.PORT || 4000;

// CORS configuration
const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    const allowedOrigins = [
      'https://food-ordering-app-frontend-3mzu.onrender.com',
      'https://food-delivery-admin-wrme.onrender.com',
      'https://food-ordering-app-n7dq.onrender.com',
      'https://food-ordering-app-frontend.onrender.com',
      'https://food-ordering-app-admin.onrender.com',
      'https://food-delivery-frontend-s2l9.onrender.com',
      'https://food-delivery-admin-wrme.onrender.com',
      'http://localhost:3000',
      'http://localhost:5173',
      'http://localhost:4000',
      'http://localhost:8080'
    ];
    
    // Check if origin is in allowed list or if it's a Render domain
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

//middlewares
app.use(express.json());
app.use(cors(corsOptions));

// Handle preflight requests for all routes
app.options('*', cors(corsOptions));

// Add CORS headers to all responses
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

// Optimized health check endpoint for Render - responds immediately
app.get("/health", (req, res) => {
  res.status(200).json({ 
    status: "OK", 
    message: "Server is running",
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// Additional lightweight health check for faster response
app.get("/ping", (req, res) => {
  res.status(200).send("pong");
});

// DB connection with retry logic
let dbConnected = false;
const connectDBWithRetry = async () => {
  try {
    await connectDB();
    dbConnected = true;
    console.log("Database connected successfully");
  } catch (error) {
    console.error("Database connection failed:", error.message);
    // Don't exit process, let it retry
    setTimeout(connectDBWithRetry, 5000);
  }
};

// Start DB connection
connectDBWithRetry();

// api endpoints
app.use("/api/food", foodRouter);
app.use("/images", express.static("uploads"));
app.use("/api/user", userRouter);
app.use("/api/cart", cartRouter);
app.use("/api/order", orderRouter);

app.get("/", (req, res) => {
  res.json({ 
    message: "API Working",
    status: "online",
    database: dbConnected ? "connected" : "connecting",
    timestamp: new Date().toISOString()
  });
});

// Error handling middleware
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

// Handle 404
app.use((req, res) => {
  res.status(404).json({ error: "Route not found" });
});

app.listen(port, () => {
  console.log(`Server Started on port: ${port}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`Database status: ${dbConnected ? 'Connected' : 'Connecting...'}`);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  console.log('Unhandled Rejection:', err);
  process.exit(1);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('SIGINT received, shutting down gracefully');
  process.exit(0);
});
