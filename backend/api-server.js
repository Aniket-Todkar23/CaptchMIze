require('dotenv').config();
const express = require("express");
const axios = require("axios");
const path = require("path");
const requestIp = require('request-ip');
const { v4: uuidv4 } = require('uuid');
const CaptchaService = require('./captcha-service');

// Import database functions
const {
  initializeDatabase,
  createUser,
  getUserByEmail,
  generateApiKey,
  getUsageStats
} = require('./database');

// Import middleware
const {
  authenticateApiKey,
  rateLimitMiddleware,
  logUsage,
  corsMiddleware,
  errorHandler
} = require('./middleware');

const app = express();
const PORT = process.env.PORT || 3001; // Use different port from main app

// Initialize captcha service
const captchaService = new CaptchaService();

// Cache for active captcha sessions
const activeCaptchas = new Map(); // sessionId -> { captchaData, expiresAt, attempts }

// Middleware setup
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(requestIp.mw());
app.use(corsMiddleware);

// Serve static files from public directory
app.use('/static', express.static(path.join(__dirname, 'public')));

// Request timeout middleware
app.use((req, res, next) => {
  req.setTimeout(30000, () => {
    const err = new Error('Request timeout');
    err.code = 'ETIMEDOUT';
    next(err);
  });
  next();
});

// Initialize database on startup
initializeDatabase().then(() => {
  console.log('Database initialized successfully');
}).catch(err => {
  console.error('Failed to initialize database:', err);
  process.exit(1);
});

// Helper functions
// (Captcha generation now handled by CaptchaService)

// Public Routes (No API key required)

// API Registration endpoint
app.post('/api/register', async (req, res) => {
  try {
    const { email, name, keyName = 'Default Key' } = req.body;

    if (!email || !name) {
      return res.status(400).json({
        error: 'Missing required fields',
        message: 'Email and name are required',
        code: 'MISSING_FIELDS'
      });
    }

    // Check if user already exists
    let user = await getUserByEmail(email);
    
    if (!user) {
      // Create new user
      const userId = await createUser(email, name);
      user = { id: userId, email, name };
    }

    // Generate new API key
    const apiKey = await generateApiKey(user.id, keyName);

    res.status(201).json({
      success: true,
      message: 'API key generated successfully',
      data: {
        apiKey: apiKey,
        user: {
          id: user.id,
          email: user.email,
          name: user.name
        },
        rateLimit: '1000 requests per hour',
        documentation: '/api/docs'
      }
    });

  } catch (error) {
    console.error('Registration error:', error);
    
    if (error.code === 'SQLITE_CONSTRAINT') {
      return res.status(409).json({
        error: 'User already exists',
        message: 'A user with this email already exists',
        code: 'USER_EXISTS'
      });
    }
    
    res.status(500).json({
      error: 'Registration failed',
      message: 'An error occurred during registration',
      code: 'REGISTRATION_ERROR'
    });
  }
});

// API Documentation endpoint - serve the HTML documentation page
app.get('/api/docs', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'api-docs.html'));
});

// JSON API documentation endpoint for programmatic access
app.get('/api/docs/json', (req, res) => {
  res.json({
    title: 'Captcha API Documentation',
    version: '1.0.0',
    description: 'Multi-type CAPTCHA API for integration into web applications',
    baseURL: `http://localhost:${PORT}/api`,
    authentication: {
      type: 'API Key',
      header: 'X-API-Key',
      alternativeParam: 'api_key'
    },
    rateLimit: '1000 requests per hour per API key',
    captchaTypes: ['gif', 'image', 'text', 'math', 'puzzle'],
    endpoints: {
      'POST /register': {
        description: 'Register for an API key',
        auth: false,
        body: {
          email: 'string (required)',
          name: 'string (required)',
          keyName: 'string (optional)'
        },
        response: {
          apiKey: 'string',
          user: 'object',
          rateLimit: 'string'
        }
      },
      'GET /captcha/generate': {
        description: 'Generate a new captcha challenge',
        auth: true,
        query: {
          type: 'string (optional) - gif|image|text|math|puzzle'
        },
        response: {
          sessionId: 'string',
          type: 'string',
          question: 'string',
          mediaUrl: 'string (for gif/image/text types)',
          options: 'array of strings (for multiple choice types)',
          inputType: 'string (for text input types)',
          expiresIn: 'number (minutes)'
        }
      },
      'POST /captcha/verify': {
        description: 'Verify captcha solution',
        auth: true,
        body: {
          sessionId: 'string (required)',
          answer: 'string (required)'
        },
        response: {
          success: 'boolean',
          verified: 'boolean',
          message: 'string',
          captchaType: 'string'
        }
      },
      'GET /usage': {
        description: 'Get API usage statistics',
        auth: true,
        query: {
          timeframe: '1h|24h|7d|30d (optional, default: 24h)'
        },
        response: {
          stats: 'array of objects',
          summary: 'object'
        }
      },
      'GET /health': {
        description: 'Check API health status',
        auth: false,
        response: {
          status: 'string',
          timestamp: 'string',
          uptime: 'number',
          version: 'string'
        }
      }
    }
  });
});

// Protected Routes (API key required)
app.use('/api/captcha', authenticateApiKey, rateLimitMiddleware(1000), logUsage);
app.use('/api/usage', authenticateApiKey, rateLimitMiddleware(100), logUsage);

// Generate captcha challenge
app.get('/api/captcha/generate', async (req, res) => {
  try {
    // Allow type specification via query parameter
    const requestedType = req.query.type;
    
    // Generate captcha using the new service
    const captchaData = await captchaService.generateCaptcha(requestedType);

    // Create session
    const sessionId = uuidv4();
    const expiresAt = Date.now() + (10 * 60 * 1000); // 10 minutes

    activeCaptchas.set(sessionId, {
      captchaData,
      expiresAt,
      attempts: 0,
      apiKey: req.apiKey
    });

    // Prepare response based on captcha type
    const responseData = {
      sessionId,
      type: captchaData.type,
      question: captchaData.question,
      expiresIn: 10 // minutes
    };

    // Add type-specific data
    if (captchaData.mediaUrl) {
      responseData.mediaUrl = captchaData.mediaUrl;
    }

    if (captchaData.options) {
      responseData.options = captchaData.options;
    }

    if (captchaData.inputType) {
      responseData.inputType = captchaData.inputType;
    }

    res.json({
      success: true,
      data: responseData
    });

  } catch (error) {
    console.error('Generate captcha error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to generate captcha',
      message: 'An error occurred while generating the captcha',
      code: 'GENERATION_ERROR',
      requestId: req.requestId,
      timestamp: new Date().toISOString()
    });
  }
});

// Verify captcha solution
app.post('/api/captcha/verify', async (req, res) => {
  try {
    const { sessionId, answer } = req.body;

    if (!sessionId || !answer) {
      return res.status(400).json({
        error: 'Missing required fields',
        message: 'sessionId and answer are required',
        code: 'MISSING_FIELDS'
      });
    }

    const captchaSession = activeCaptchas.get(sessionId);

    if (!captchaSession) {
      return res.status(404).json({
        error: 'Invalid session',
        message: 'Captcha session not found or expired',
        code: 'INVALID_SESSION'
      });
    }

    // Check if session expired
    if (Date.now() > captchaSession.expiresAt) {
      activeCaptchas.delete(sessionId);
      return res.status(410).json({
        error: 'Session expired',
        message: 'This captcha session has expired',
        code: 'SESSION_EXPIRED'
      });
    }

    // Check if API key matches
    if (captchaSession.apiKey !== req.apiKey) {
      return res.status(403).json({
        error: 'Unauthorized',
        message: 'This session belongs to a different API key',
        code: 'UNAUTHORIZED_SESSION'
      });
    }

    // Increment attempts
    captchaSession.attempts++;

    // Check if too many attempts
    if (captchaSession.attempts > 3) {
      activeCaptchas.delete(sessionId);
      return res.status(429).json({
        error: 'Too many attempts',
        message: 'Maximum verification attempts exceeded',
        code: 'MAX_ATTEMPTS_EXCEEDED'
      });
    }

    // Check answer using the captcha service
    const isCorrect = captchaService.verifyCaptcha(captchaSession.captchaData, answer);

    if (isCorrect) {
      activeCaptchas.delete(sessionId);
      res.json({
        success: true,
        verified: true,
        message: 'Captcha verified successfully',
        captchaType: captchaSession.captchaData.type
      });
    } else {
      const remainingAttempts = 3 - captchaSession.attempts;
      res.status(400).json({
        success: false,
        verified: false,
        message: 'Incorrect answer',
        code: 'INCORRECT_ANSWER',
        remainingAttempts,
        captchaType: captchaSession.captchaData.type
      });
    }

  } catch (error) {
    console.error('Verify captcha error:', error);
    res.status(500).json({
      error: 'Verification failed',
      message: 'An error occurred during verification',
      code: 'VERIFICATION_ERROR'
    });
  }
});

// Get usage statistics
app.get('/api/usage', async (req, res) => {
  try {
    const timeframe = req.query.timeframe || '24h';
    const stats = await getUsageStats(req.apiKey, timeframe);

    const summary = {
      totalRequests: stats.reduce((sum, stat) => sum + stat.request_count, 0),
      successfulRequests: stats.reduce((sum, stat) => sum + stat.success_count, 0),
      errorRequests: stats.reduce((sum, stat) => sum + stat.error_count, 0),
      avgResponseTime: stats.reduce((sum, stat) => sum + stat.avg_response_time, 0) / stats.length || 0,
      timeframe: timeframe
    };

    res.json({
      success: true,
      data: {
        stats,
        summary
      }
    });

  } catch (error) {
    console.error('Usage stats error:', error);
    res.status(500).json({
      error: 'Failed to get usage statistics',
      message: 'An error occurred while retrieving usage stats',
      code: 'STATS_ERROR'
    });
  }
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    version: '1.0.0'
  });
});

// Clean up expired captcha sessions periodically
setInterval(() => {
  const now = Date.now();
  for (const [sessionId, session] of activeCaptchas.entries()) {
    if (now > session.expiresAt) {
      activeCaptchas.delete(sessionId);
    }
  }
}, 5 * 60 * 1000); // Clean up every 5 minutes

// Error handling middleware
app.use(errorHandler);

// Start the API server
app.listen(PORT, () => {
  console.log(`Captcha API Server running on http://localhost:${PORT}`);
  console.log(`API Documentation available at: http://localhost:${PORT}/api/docs`);
  console.log(`Register for API key at: http://localhost:${PORT}/api/register`);
});

module.exports = app;