#!/usr/bin/env node

console.log('🚀 Starting Captcha API Server...');
console.log('📍 Backend Directory:', __dirname);
console.log('');

// Check if dependencies are installed
const fs = require('fs');
const path = require('path');

const nodeModulesPath = path.join(__dirname, 'node_modules');
if (!fs.existsSync(nodeModulesPath)) {
  console.error('❌ node_modules not found. Please run "npm install" first.');
  process.exit(1);
}

// Start the API server
require('./api-server');