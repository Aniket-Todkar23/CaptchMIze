const { 
  validateApiKey, 
  updateApiKeyUsage, 
  logApiUsage, 
  checkRateLimit, 
  incrementRateLimit 
} = require('./database');

// API Key Authentication Middleware
const authenticateApiKey = async (req, res, next) => {
  const startTime = Date.now();
  
  try {
    const apiKey = req.headers['x-api-key'] || req.query.api_key;
    
    if (!apiKey) {
      const responseTime = Date.now() - startTime;
      try {
        await logApiUsage(null, req.path, req.ip, req.get('User-Agent'), responseTime, 401);
      } catch (logError) {
        console.error('Failed to log usage for missing API key:', logError.message);
      }
      
      return res.status(401).json({
        success: false,
        error: 'API key is required',
        message: 'Please provide a valid API key in the X-API-Key header or as a query parameter',
        code: 'MISSING_API_KEY',
        requestId: req.requestId,
        timestamp: new Date().toISOString()
      });
    }

    const keyData = await validateApiKey(apiKey);
    
    if (!keyData) {
      const responseTime = Date.now() - startTime;
      try {
        await logApiUsage(apiKey, req.path, req.ip, req.get('User-Agent'), responseTime, 401);
      } catch (logError) {
        console.error('Failed to log usage for invalid API key:', logError.message);
      }
      
      return res.status(401).json({
        success: false,
        error: 'Invalid API key',
        message: 'The provided API key is invalid or has been deactivated',
        code: 'INVALID_API_KEY',
        requestId: req.requestId,
        timestamp: new Date().toISOString()
      });
    }

    // Attach API key data to request
    req.apiKey = apiKey;
    req.apiKeyData = keyData;
    req.startTime = startTime;
    
    // Update last used timestamp
    await updateApiKeyUsage(apiKey);
    
    next();
  } catch (error) {
    const responseTime = Date.now() - startTime;
    console.error('Authentication error:', error);
    
    return res.status(500).json({
      error: 'Authentication error',
      message: 'An error occurred while validating the API key',
      code: 'AUTH_ERROR'
    });
  }
};

// Rate Limiting Middleware
const rateLimitMiddleware = (requestsPerHour = 1000) => {
  return async (req, res, next) => {
    try {
      const apiKey = req.apiKey;
      const endpoint = req.path;
      
      // Check current rate limit
      const rateLimit = await checkRateLimit(apiKey, endpoint, requestsPerHour, 60);
      
      // Add rate limit headers
      res.set({
        'X-RateLimit-Limit': requestsPerHour.toString(),
        'X-RateLimit-Remaining': rateLimit.remaining.toString(),
        'X-RateLimit-Reset': rateLimit.resetTime.toISOString()
      });
      
      if (!rateLimit.allowed) {
        const responseTime = Date.now() - req.startTime;
        await logApiUsage(apiKey, endpoint, req.ip, req.get('User-Agent'), responseTime, 429);
        
        return res.status(429).json({
          error: 'Rate limit exceeded',
          message: `Too many requests. Limit: ${requestsPerHour} requests per hour`,
          code: 'RATE_LIMIT_EXCEEDED',
          resetTime: rateLimit.resetTime
        });
      }
      
      // Increment rate limit counter
      await incrementRateLimit(apiKey, endpoint);
      
      next();
    } catch (error) {
      console.error('Rate limiting error:', error);
      // Continue processing if rate limiting fails
      next();
    }
  };
};

// Usage Logging Middleware (to be used at the end of request)
const logUsage = async (req, res, next) => {
  const originalSend = res.send;
  
  res.send = async function(body) {
    const responseTime = Date.now() - req.startTime;
    
    try {
      await logApiUsage(
        req.apiKey,
        req.path,
        req.ip,
        req.get('User-Agent'),
        responseTime,
        res.statusCode
      );
    } catch (error) {
      console.error('Usage logging error:', error);
    }
    
    originalSend.call(this, body);
  };
  
  next();
};

// CORS Middleware for API access
const corsMiddleware = (req, res, next) => {
  // Get allowed origins from environment or default to all
  const allowedOrigins = process.env.CORS_ORIGIN ? process.env.CORS_ORIGIN.split(',') : ['*'];
  const origin = req.headers.origin;
  
  if (allowedOrigins.includes('*') || allowedOrigins.includes(origin)) {
    res.header('Access-Control-Allow-Origin', allowedOrigins.includes('*') ? '*' : origin);
  }
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS, PATCH');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, X-API-Key, Authorization, Cache-Control, Pragma');
  res.header('Access-Control-Expose-Headers', 'X-RateLimit-Limit, X-RateLimit-Remaining, X-RateLimit-Reset, X-Request-ID');
  res.header('Access-Control-Max-Age', '86400'); // Cache preflight for 24 hours
  
  // Add request ID for tracking
  req.requestId = Date.now().toString(36) + Math.random().toString(36).substr(2);
  res.header('X-Request-ID', req.requestId);
  
  if (req.method === 'OPTIONS') {
    res.sendStatus(200);
  } else {
    next();
  }
};

// Error handling middleware
const errorHandler = (err, req, res, next) => {
  console.error('API Error:', {
    requestId: req.requestId,
    error: err.message,
    stack: err.stack,
    url: req.url,
    method: req.method,
    apiKey: req.apiKey ? req.apiKey.substring(0, 10) + '...' : 'none',
    timestamp: new Date().toISOString()
  });
  
  if (res.headersSent) {
    return next(err);
  }
  
  // Determine error type and status
  let statusCode = 500;
  let errorCode = 'INTERNAL_ERROR';
  let message = 'An unexpected error occurred';
  
  if (err.name === 'ValidationError') {
    statusCode = 400;
    errorCode = 'VALIDATION_ERROR';
    message = err.message;
  } else if (err.name === 'UnauthorizedError') {
    statusCode = 401;
    errorCode = 'UNAUTHORIZED';
    message = 'Invalid or missing API key';
  } else if (err.code === 'ENOTFOUND' || err.code === 'ECONNREFUSED') {
    statusCode = 503;
    errorCode = 'SERVICE_UNAVAILABLE';
    message = 'External service temporarily unavailable';
  } else if (err.code === 'ETIMEDOUT') {
    statusCode = 408;
    errorCode = 'TIMEOUT';
    message = 'Request timeout';
  }
  
  res.status(statusCode).json({
    success: false,
    error: err.name || 'Error',
    message: message,
    code: errorCode,
    requestId: req.requestId,
    timestamp: new Date().toISOString(),
    ...(process.env.NODE_ENV === 'development' && { 
      stack: err.stack,
      details: err.toString()
    })
  });
};

// Request validation middleware
const validateRequest = (schema) => {
  return (req, res, next) => {
    const { error } = schema.validate(req.body);
    if (error) {
      return res.status(400).json({
        error: 'Validation error',
        message: error.details[0].message,
        code: 'VALIDATION_ERROR'
      });
    }
    next();
  };
};

module.exports = {
  authenticateApiKey,
  rateLimitMiddleware,
  logUsage,
  corsMiddleware,
  errorHandler,
  validateRequest
};