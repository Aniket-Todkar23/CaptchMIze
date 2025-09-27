// Vercel Serverless Function for /api/register endpoint
const cors = require('cors');

// Import database functions
const {
  initializeDatabase,
  createUser,
  getUserByEmail,
  generateApiKey
} = require('../backend/database');

// Initialize database
initializeDatabase().catch(console.error);

// CORS configuration
const corsOptions = {
  origin: [
    'https://captch-m-ize-g3le.vercel.app',
    'http://localhost:3000',
    'http://localhost:5173'
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-API-Key']
};

// Main handler function
export default async function handler(req, res) {
  // Handle CORS
  await new Promise((resolve, reject) => {
    cors(corsOptions)(req, res, (result) => {
      if (result instanceof Error) {
        return reject(result);
      }
      return resolve(result);
    });
  });

  // Handle OPTIONS request for CORS preflight
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({
      error: 'Method not allowed',
      message: 'Only POST requests are allowed for this endpoint'
    });
  }

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
}