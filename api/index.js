// Vercel Serverless Function Entry Point
// This file imports the Express app from backend/api-server.js
// and exports it as a serverless function handler for Vercel

// Import the Express app from the backend directory
const app = require('../backend/api-server');

// Export the app as a Vercel serverless function handler
// Vercel expects a function that accepts (req, res) parameters
module.exports = app;
