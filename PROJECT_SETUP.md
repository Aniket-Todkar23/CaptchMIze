# Captcha API Project Setup

This project consists of a complete CAPTCHA API system with both frontend and backend components.

## 🏗️ Project Structure

```
captcha/
├── backend/          # API Server & Database
│   ├── api-server.js        # Main API server (Port 3001)
│   ├── app.js              # Demo CAPTCHA server (Port 3000)  
│   ├── database.js         # Database operations
│   ├── middleware.js       # Authentication & rate limiting
│   ├── start-api.js        # API startup script
│   ├── package.json        # Backend dependencies
│   └── README.md          # API documentation
└── frontend/         # React Web Interface
    ├── src/
    │   ├── App.jsx            # Main application
    │   └── components/
    │       └── DeveloperPortal.jsx  # API key registration
    ├── package.json           # Frontend dependencies
    └── vite.config.js         # Vite configuration
```

## 🚀 Quick Start

### 1. Start the API Server (Port 3001)
```bash
cd backend
npm start
```

The API server will be available at:
- **API Base**: http://localhost:3001/api
- **Documentation**: http://localhost:3001/api/docs
- **Registration**: http://localhost:3001/api/register

### 2. Start the Frontend (Port 5173)
```bash
cd frontend
npm run dev
```

The frontend will be available at:
- **Main Site**: http://localhost:5173
- **Developer Portal**: http://localhost:5173#developers

## 🔑 API Key Registration

### Via Frontend (Recommended)
1. Go to http://localhost:5173#developers
2. Fill out the registration form
3. Get your API key instantly
4. Test the API directly from the portal

### Via API (Programmatic)
```bash
curl -X POST http://localhost:3001/api/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "your-email@example.com",
    "name": "Your Name",
    "keyName": "My App Key"
  }'
```

## 📡 API Usage

### Generate CAPTCHA
```bash
curl -X GET http://localhost:3001/api/captcha/generate \
  -H "X-API-Key: your-api-key-here"
```

### Verify Answer
```bash
curl -X POST http://localhost:3001/api/captcha/verify \
  -H "Content-Type: application/json" \
  -H "X-API-Key: your-api-key-here" \
  -d '{
    "sessionId": "session-id-from-generate",
    "answer": "animals"
  }'
```

### Get Usage Stats
```bash
curl -X GET http://localhost:3001/api/usage?timeframe=24h \
  -H "X-API-Key: your-api-key-here"
```

## 🛠️ Development Commands

### Backend
```bash
cd backend

# Start API server (main)
npm start

# Start API server with logs
npm run start:api  

# Start demo CAPTCHA (original)
npm run start:demo

# Install dependencies
npm install
```

### Frontend
```bash
cd frontend

# Start development server
npm run dev

# Build for production
npm run build

# Install dependencies
npm install
```

## 🔒 Security Features

- **API Key Authentication**: Secure access control
- **Rate Limiting**: 1000 requests/hour per API key
- **Usage Tracking**: Monitor API usage and performance
- **CORS Support**: Cross-origin request handling
- **Session Management**: Secure CAPTCHA sessions with expiration
- **Input Validation**: Comprehensive request validation

## 📊 Database

The system uses SQLite for simplicity:
- **Database File**: `backend/captcha_api.db`
- **Tables**: users, api_keys, usage_logs, rate_limits
- **Auto-created**: Database and tables created automatically on first run

## 🎯 Integration Examples

### JavaScript/HTML
```html
<script>
const API_KEY = 'your-api-key';
const BASE_URL = 'http://localhost:3001/api';

// Generate CAPTCHA
const response = await fetch(`${BASE_URL}/captcha/generate`, {
  headers: { 'X-API-Key': API_KEY }
});
const data = await response.json();

// Show GIF and options
document.getElementById('gif').src = data.data.gifUrl;
// ... display options and handle verification
</script>
```

### Node.js
```javascript
const axios = require('axios');

const captcha = {
  apiKey: 'your-api-key',
  baseURL: 'http://localhost:3001/api',
  
  async generate() {
    const response = await axios.get(`${this.baseURL}/captcha/generate`, {
      headers: { 'X-API-Key': this.apiKey }
    });
    return response.data.data;
  },
  
  async verify(sessionId, answer) {
    const response = await axios.post(`${this.baseURL}/captcha/verify`, {
      sessionId, answer
    }, {
      headers: { 'X-API-Key': this.apiKey }
    });
    return response.data;
  }
};
```

## 🐛 Troubleshooting

### Backend Issues
- **Port 3001 in use**: Change PORT in api-server.js
- **Database errors**: Delete captcha_api.db to reset
- **Missing dependencies**: Run `npm install` in backend/

### Frontend Issues  
- **Port 5173 in use**: Vite will auto-increment port
- **API connection failed**: Ensure backend is running on 3001
- **CORS errors**: Backend has CORS enabled for all origins

### API Issues
- **401 Unauthorized**: Check API key format and validity
- **429 Rate Limited**: Wait for rate limit window to reset
- **404 Not Found**: Verify endpoint URL and method

## 🔧 Configuration

### Backend Environment
Create `.env` file in backend/:
```env
PORT=3001
NODE_ENV=development
GIPHY_API_KEY=your-giphy-key
DATABASE_PATH=./captcha_api.db
```

### Rate Limits (Configurable)
- **CAPTCHA Generation/Verification**: 1000/hour
- **Usage Stats**: 100/hour  
- **Registration**: Unlimited

## 📈 Monitoring

The system provides comprehensive monitoring:
- **Real-time Usage**: Track requests, success/error rates
- **Performance Metrics**: Response times, throughput
- **API Key Analytics**: Per-key usage statistics
- **Health Monitoring**: Server uptime and status

## 🚀 Deployment

For production deployment:
1. Use environment variables for configuration
2. Set up proper database (PostgreSQL/MySQL)
3. Enable HTTPS/TLS
4. Configure rate limiting per your needs
5. Set up monitoring and logging
6. Use PM2 or similar for process management

## 📚 Documentation

- **API Docs**: http://localhost:3001/api/docs
- **Full Documentation**: `backend/README.md`
- **Integration Examples**: Available in API docs

## 🆘 Support

For issues and questions:
1. Check the troubleshooting section above
2. Review API documentation at /api/docs
3. Check server logs for error details
4. Ensure all dependencies are installed

## 🎉 Features

✅ **Complete API System**: Registration, generation, verification, analytics
✅ **Developer Portal**: Web interface for API key management  
✅ **Comprehensive Documentation**: API docs and integration examples
✅ **Security**: Authentication, rate limiting, usage tracking
✅ **Performance**: Fast response times, session management
✅ **Scalability**: Database-backed with proper architecture