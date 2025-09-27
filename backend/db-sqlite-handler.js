const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');

// Database connection
const dbPath = path.join(__dirname, 'captcha_api.db');
const db = new sqlite3.Database(dbPath);

// Initialize database tables
const initializeDatabase = () => {
  return new Promise((resolve, reject) => {
    db.serialize(() => {
      // Users table
      db.run(`CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        email TEXT UNIQUE NOT NULL,
        name TEXT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )`);

      // API Keys table
      db.run(`CREATE TABLE IF NOT EXISTS api_keys (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        api_key TEXT UNIQUE NOT NULL,
        user_id INTEGER NOT NULL,
        name TEXT NOT NULL,
        status TEXT DEFAULT 'active',
        permissions TEXT DEFAULT 'basic',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        last_used_at DATETIME,
        FOREIGN KEY (user_id) REFERENCES users (id)
      )`);

      // Usage tracking table
      db.run(`CREATE TABLE IF NOT EXISTS usage_logs (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        api_key TEXT NOT NULL,
        endpoint TEXT NOT NULL,
        ip_address TEXT,
        user_agent TEXT,
        timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
        response_time INTEGER,
        status_code INTEGER
      )`);

      // Rate limiting table
      db.run(`CREATE TABLE IF NOT EXISTS rate_limits (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        api_key TEXT NOT NULL,
        endpoint TEXT NOT NULL,
        request_count INTEGER DEFAULT 0,
        window_start DATETIME DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(api_key, endpoint)
      )`, (err) => {
        if (err) {
          reject(err);
        } else {
          resolve();
        }
      });
    });
  });
};

// User management functions
const createUser = async (email, name) => {
  return new Promise((resolve, reject) => {
    const stmt = db.prepare("INSERT INTO users (email, name) VALUES (?, ?)");
    stmt.run([email, name], function(err) {
      if (err) {
        reject(err);
      } else {
        resolve(this.lastID);
      }
    });
    stmt.finalize();
  });
};

const getUserByEmail = async (email) => {
  return new Promise((resolve, reject) => {
    db.get("SELECT * FROM users WHERE email = ?", [email], (err, row) => {
      if (err) {
        reject(err);
      } else {
        resolve(row);
      }
    });
  });
};

// API Key management functions
const generateApiKey = async (userId, keyName) => {
  const apiKey = 'captcha_' + uuidv4().replace(/-/g, '');
  
  return new Promise((resolve, reject) => {
    const stmt = db.prepare("INSERT INTO api_keys (api_key, user_id, name) VALUES (?, ?, ?)");
    stmt.run([apiKey, userId, keyName], function(err) {
      if (err) {
        reject(err);
      } else {
        resolve(apiKey);
      }
    });
    stmt.finalize();
  });
};

const validateApiKey = async (apiKey) => {
  return new Promise((resolve, reject) => {
    db.get(`
      SELECT ak.*, u.email, u.name as user_name 
      FROM api_keys ak 
      JOIN users u ON ak.user_id = u.id 
      WHERE ak.api_key = ? AND ak.status = 'active'
    `, [apiKey], (err, row) => {
      if (err) {
        reject(err);
      } else {
        resolve(row);
      }
    });
  });
};

const updateApiKeyUsage = async (apiKey) => {
  return new Promise((resolve, reject) => {
    const stmt = db.prepare("UPDATE api_keys SET last_used_at = CURRENT_TIMESTAMP WHERE api_key = ?");
    stmt.run([apiKey], function(err) {
      if (err) {
        reject(err);
      } else {
        resolve();
      }
    });
    stmt.finalize();
  });
};

// Usage tracking functions
const logApiUsage = async (apiKey, endpoint, ipAddress, userAgent, responseTime, statusCode) => {
  return new Promise((resolve, reject) => {
    const stmt = db.prepare(`
      INSERT INTO usage_logs (api_key, endpoint, ip_address, user_agent, response_time, status_code) 
      VALUES (?, ?, ?, ?, ?, ?)
    `);
    stmt.run([apiKey, endpoint, ipAddress, userAgent, responseTime, statusCode], function(err) {
      if (err) {
        reject(err);
      } else {
        resolve();
      }
    });
    stmt.finalize();
  });
};

const getUsageStats = async (apiKey, timeframe = '24h') => {
  return new Promise((resolve, reject) => {
    let timeCondition = '';
    switch(timeframe) {
      case '1h':
        timeCondition = "timestamp >= datetime('now', '-1 hour')";
        break;
      case '24h':
        timeCondition = "timestamp >= datetime('now', '-1 day')";
        break;
      case '7d':
        timeCondition = "timestamp >= datetime('now', '-7 days')";
        break;
      case '30d':
        timeCondition = "timestamp >= datetime('now', '-30 days')";
        break;
      default:
        timeCondition = "timestamp >= datetime('now', '-1 day')";
    }

    db.all(`
      SELECT 
        endpoint,
        COUNT(*) as request_count,
        AVG(response_time) as avg_response_time,
        COUNT(CASE WHEN status_code >= 200 AND status_code < 300 THEN 1 END) as success_count,
        COUNT(CASE WHEN status_code >= 400 THEN 1 END) as error_count
      FROM usage_logs 
      WHERE api_key = ? AND ${timeCondition}
      GROUP BY endpoint
    `, [apiKey], (err, rows) => {
      if (err) {
        reject(err);
      } else {
        resolve(rows);
      }
    });
  });
};

// Rate limiting functions
const checkRateLimit = async (apiKey, endpoint, limit = 100, windowMinutes = 60) => {
  return new Promise((resolve, reject) => {
    const windowStart = new Date(Date.now() - windowMinutes * 60 * 1000);
    
    db.get(`
      SELECT request_count 
      FROM rate_limits 
      WHERE api_key = ? AND endpoint = ? AND window_start > ?
    `, [apiKey, endpoint, windowStart.toISOString()], (err, row) => {
      if (err) {
        reject(err);
      } else {
        const currentCount = row ? row.request_count : 0;
        const remaining = Math.max(0, limit - currentCount);
        resolve({
          allowed: currentCount < limit,
          remaining: remaining,
          resetTime: new Date(Date.now() + windowMinutes * 60 * 1000)
        });
      }
    });
  });
};

const incrementRateLimit = async (apiKey, endpoint) => {
  return new Promise((resolve, reject) => {
    db.run(`
      INSERT OR REPLACE INTO rate_limits (api_key, endpoint, request_count, window_start)
      VALUES (
        ?, 
        ?, 
        COALESCE((SELECT request_count FROM rate_limits WHERE api_key = ? AND endpoint = ? AND window_start > datetime('now', '-1 hour')), 0) + 1,
        COALESCE((SELECT window_start FROM rate_limits WHERE api_key = ? AND endpoint = ? AND window_start > datetime('now', '-1 hour')), datetime('now'))
      )
    `, [apiKey, endpoint, apiKey, endpoint, apiKey, endpoint], function(err) {
      if (err) {
        reject(err);
      } else {
        resolve();
      }
    });
  });
};

module.exports = {
  db,
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