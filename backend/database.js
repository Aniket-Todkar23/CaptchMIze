const { Pool } = require('pg');
const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');

// Database connection
const pool = new Pool({
  connectionString: process.env.DATABASE_URL || process.env.POSTGRES_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

// Initialize database tables
const initializeDatabase = async () => {
  const client = await pool.connect();
  try {
    // Users table
    await client.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        email VARCHAR(255) UNIQUE NOT NULL,
        name VARCHAR(255) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // API Keys table
    await client.query(`
      CREATE TABLE IF NOT EXISTS api_keys (
        id SERIAL PRIMARY KEY,
        api_key VARCHAR(255) UNIQUE NOT NULL,
        user_id INTEGER NOT NULL,
        name VARCHAR(255) NOT NULL,
        status VARCHAR(50) DEFAULT 'active',
        permissions VARCHAR(50) DEFAULT 'basic',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        last_used_at TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users (id)
      )
    `);

    // Usage tracking table
    await client.query(`
      CREATE TABLE IF NOT EXISTS usage_logs (
        id SERIAL PRIMARY KEY,
        api_key VARCHAR(255) NOT NULL,
        endpoint VARCHAR(255) NOT NULL,
        ip_address VARCHAR(45),
        user_agent TEXT,
        timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        response_time INTEGER,
        status_code INTEGER
      )
    `);

    // Rate limiting table
    await client.query(`
      CREATE TABLE IF NOT EXISTS rate_limits (
        id SERIAL PRIMARY KEY,
        api_key VARCHAR(255) NOT NULL,
        endpoint VARCHAR(255) NOT NULL,
        request_count INTEGER DEFAULT 0,
        window_start TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(api_key, endpoint)
      )
    `);

    console.log('✅ Database tables initialized successfully');
  } catch (error) {
    console.error('❌ Database initialization error:', error);
    throw error;
  } finally {
    client.release();
  }
};

// User management functions
const createUser = async (email, name) => {
  const client = await pool.connect();
  try {
    const result = await client.query(
      'INSERT INTO users (email, name) VALUES ($1, $2) RETURNING id',
      [email, name]
    );
    return result.rows[0].id;
  } catch (error) {
    throw error;
  } finally {
    client.release();
  }
};

const getUserByEmail = async (email) => {
  const client = await pool.connect();
  try {
    const result = await client.query(
      'SELECT * FROM users WHERE email = $1',
      [email]
    );
    return result.rows[0];
  } catch (error) {
    throw error;
  } finally {
    client.release();
  }
};

// API Key management functions
const generateApiKey = async (userId, keyName) => {
  const apiKey = 'captcha_' + uuidv4().replace(/-/g, '');
  
  const client = await pool.connect();
  try {
    await client.query(
      'INSERT INTO api_keys (api_key, user_id, name) VALUES ($1, $2, $3)',
      [apiKey, userId, keyName]
    );
    return apiKey;
  } catch (error) {
    throw error;
  } finally {
    client.release();
  }
};

const validateApiKey = async (apiKey) => {
  const client = await pool.connect();
  try {
    const result = await client.query(`
      SELECT ak.*, u.email, u.name as user_name 
      FROM api_keys ak 
      JOIN users u ON ak.user_id = u.id 
      WHERE ak.api_key = $1 AND ak.status = 'active'
    `, [apiKey]);
    return result.rows[0];
  } catch (error) {
    throw error;
  } finally {
    client.release();
  }
};

const updateApiKeyUsage = async (apiKey) => {
  const client = await pool.connect();
  try {
    await client.query(
      'UPDATE api_keys SET last_used_at = CURRENT_TIMESTAMP WHERE api_key = $1',
      [apiKey]
    );
  } catch (error) {
    throw error;
  } finally {
    client.release();
  }
};

// Usage tracking functions
const logApiUsage = async (apiKey, endpoint, ipAddress, userAgent, responseTime, statusCode) => {
  const client = await pool.connect();
  try {
    await client.query(`
      INSERT INTO usage_logs (api_key, endpoint, ip_address, user_agent, response_time, status_code) 
      VALUES ($1, $2, $3, $4, $5, $6)
    `, [apiKey, endpoint, ipAddress, userAgent, responseTime, statusCode]);
  } catch (error) {
    throw error;
  } finally {
    client.release();
  }
};

const getUsageStats = async (apiKey, timeframe = '24h') => {
  const client = await pool.connect();
  try {
    let timeCondition = '';
    switch(timeframe) {
      case '1h':
        timeCondition = "timestamp >= NOW() - INTERVAL '1 hour'";
        break;
      case '24h':
        timeCondition = "timestamp >= NOW() - INTERVAL '1 day'";
        break;
      case '7d':
        timeCondition = "timestamp >= NOW() - INTERVAL '7 days'";
        break;
      case '30d':
        timeCondition = "timestamp >= NOW() - INTERVAL '30 days'";
        break;
      default:
        timeCondition = "timestamp >= NOW() - INTERVAL '1 day'";
    }

    const result = await client.query(`
      SELECT 
        endpoint,
        COUNT(*) as request_count,
        AVG(response_time) as avg_response_time,
        COUNT(CASE WHEN status_code >= 200 AND status_code < 300 THEN 1 END) as success_count,
        COUNT(CASE WHEN status_code >= 400 THEN 1 END) as error_count
      FROM usage_logs 
      WHERE api_key = $1 AND ${timeCondition}
      GROUP BY endpoint
    `, [apiKey]);
    
    return result.rows;
  } catch (error) {
    throw error;
  } finally {
    client.release();
  }
};

// Rate limiting functions
const checkRateLimit = async (apiKey, endpoint, limit = 100, windowMinutes = 60) => {
  const client = await pool.connect();
  try {
    const windowStart = new Date(Date.now() - windowMinutes * 60 * 1000);
    
    const result = await client.query(`
      SELECT request_count 
      FROM rate_limits 
      WHERE api_key = $1 AND endpoint = $2 AND window_start > $3
    `, [apiKey, endpoint, windowStart]);
    
    const currentCount = result.rows[0] ? result.rows[0].request_count : 0;
    const remaining = Math.max(0, limit - currentCount);
    
    return {
      allowed: currentCount < limit,
      remaining: remaining,
      resetTime: new Date(Date.now() + windowMinutes * 60 * 1000)
    };
  } catch (error) {
    throw error;
  } finally {
    client.release();
  }
};

const incrementRateLimit = async (apiKey, endpoint) => {
  const client = await pool.connect();
  try {
    await client.query(`
      INSERT INTO rate_limits (api_key, endpoint, request_count, window_start)
      VALUES ($1, $2, 1, NOW())
      ON CONFLICT (api_key, endpoint) 
      DO UPDATE SET 
        request_count = CASE 
          WHEN rate_limits.window_start > NOW() - INTERVAL '1 hour' 
          THEN rate_limits.request_count + 1 
          ELSE 1 
        END,
        window_start = CASE 
          WHEN rate_limits.window_start > NOW() - INTERVAL '1 hour' 
          THEN rate_limits.window_start 
          ELSE NOW() 
        END
    `, [apiKey, endpoint]);
  } catch (error) {
    throw error;
  } finally {
    client.release();
  }
};

module.exports = {
  pool,
  initializeDatabase,
  createUser,
  getUserByEmail,
  generateApiKey,
  validateApiKey,
  updateApiKeyUsage,
  logApiUsage,
  getUsageStats,
  checkRateLimit,
  incrementRateLimit
};