const express = require("express");
const cors = require("cors");
const app = express();
const compression = require("compression");
const AppError = require("./Utilities/appError");
const versionOne = require("./versions/v1");
const globalErrorHandler = require("./Utilities/globalErrorhandler");
const cookieParser = require("cookie-parser");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
const mongoSanitize = require("express-mongo-sanitize");
const xss = require("xss-clean");
const hpp = require("hpp");

// Security Headers
// app.use(helmet());
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'", "'unsafe-inline'", "https:"],
        objectSrc: ["'none'"],
        upgradeInsecureRequests: [],
      },
    },
    frameguard: { action: "deny" },
    hsts: { maxAge: 31536000, includeSubDomains: true }, // Enforce HTTPS for one year
    noCache: true,
    ieNoOpen: true, // Prevent download of untrusted content
    dnsPrefetchControl: { allow: false }, // Prevent DNS prefetching
  })
);

const limiter = rateLimit({
  max: 1000, // Maximum number of requests
  windowMs: 10 * 60 * 1000,
  message: "Too many requests from this IP, please try again in 10 minutes!",
  keyGenerator: (req) => req.ip,
});

// Apply to all requests or specific routes
app.use(limiter);

// Body parser, reading data from body into req.body
app.use(express.json({ limit: "10kb" })); // Body larger than 10kb will not be accepted
app.use(express.urlencoded({ extended: true, limit: "10kb" }));
app.use(cookieParser());

// Data sanitization against NoSQL query injection
app.use(mongoSanitize());

// Data sanitization against XSS
app.use(xss());

// Prevent parameter pollution
app.use(
  hpp({
    whitelist: [], // Add parameters that are allowed to be duplicated
  })
);

// Compression
app.use(compression({ threshold: 512 }));

const allowedOrigins = [
  "https://accounting-frontend-gules.vercel.app",
  "http://localhost:5173",
];

const corsOptions = {
  origin: function (origin, callback) {
    if (allowedOrigins.includes(origin) || !origin) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  methods: ["GET", "POST", "PATCH", "DELETE"],
  allowedHeaders: [
    "Content-Type",
    "Authorization",
    "X-Requested-With",
    "Accept",
    "Origin",
  ],
  credentials: true,
  maxAge: 3600, // Maximum age for CORS preflight request cache
  exposedHeaders: ["Set-Cookie"],
};
// Apply CORS middleware first
app.use(cors(corsOptions));

// Custom CORS headers (if needed)
app.use((req, res, next) => {
  const allowedOrigins = [
    "https://accounting-frontend-gules.vercel.app",
    "http://localhost:5173",
  ];

  const origin = req.headers.origin; // Get the origin of the request
  if (allowedOrigins.includes(origin)) {
    res.setHeader("Access-Control-Allow-Origin", origin); // Allow the request origin
  }
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
  res.setHeader("Access-Control-Allow-Credentials", "true"); // Allow cookies
  next();
});

// Security headers
app.use((req, res, next) => {
  // Cache control
  res.setHeader(
    "Cache-Control",
    "no-store, no-cache, must-revalidate, proxy-revalidate"
  );
  res.setHeader("Pragma", "no-cache");
  res.setHeader("Expires", "0");
  res.setHeader("Surrogate-Control", "no-store");

  // Additional security headers
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("X-Frame-Options", "DENY");
  res.setHeader("X-XSS-Protection", "1; mode=block");

  // Remove X-Powered-By header
  res.removeHeader("X-Powered-By");

  next();
});

// Trust proxy if behind a reverse proxy
app.set("trust proxy", 1);

// Routes
app.use("/v1", versionOne);

// Handle 404 routes
app.all("*", (req, res, next) => {
  next(new AppError(`Cannot find the ${req.originalUrl} on the page!`, 404));
});

// Global error handler
app.use(globalErrorHandler);

module.exports = app;
