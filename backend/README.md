# Captcha API - GIF-based CAPTCHA Service

A powerful, easy-to-integrate GIF-based CAPTCHA API service that helps protect your applications from bots and automated attacks.

## Features

- 🎯 **GIF-based Challenges**: Uses animated GIFs with category-based questions
- 🔐 **API Key Authentication**: Secure access with unique API keys
- 📊 **Usage Tracking**: Monitor API usage and performance metrics
- ⚡ **Rate Limiting**: Built-in protection against abuse (1000 req/hour)
- 🌐 **CORS Support**: Works with any web application
- 📱 **Session Management**: Secure captcha sessions with expiration
- 🎨 **Multiple Categories**: Animals, vehicles, sports, buildings, cartoons, actions

## Getting Started

### 1. Register for an API Key

```bash
curl -X POST http://localhost:3001/api/register \
  -H "Content-Type: application/json" \
  -d '{\n    "email": "your-email@example.com",\n    "name": "Your Name",\n    "keyName": "My App Key"\n  }'
```

**Response:**
```json
{\n  "success": true,\n  "message": "API key generated successfully",\n  "data": {\n    "apiKey": "captcha_abc123def456...",\n    "user": {\n      "id": 1,\n      "email": "your-email@example.com",\n      "name": "Your Name"\n    },\n    "rateLimit": "1000 requests per hour",\n    "documentation": "/api/docs"\n  }\n}\n```

### 2. Generate a Captcha Challenge

```bash
curl -X GET http://localhost:3001/api/captcha/generate \\\n  -H "X-API-Key: your-api-key-here"\n```

**Response:**
```json
{\n  "success": true,\n  "data": {\n    "sessionId": "uuid-session-id",\n    "gifUrl": "https://media.giphy.com/media/xyz/giphy.gif",\n    "options": ["animals", "vehicles", "sports", "buildings"],\n    "expiresIn": 10\n  }\n}\n```

### 3. Verify the Answer

```bash
curl -X POST http://localhost:3001/api/captcha/verify \\\n  -H "Content-Type: application/json" \\\n  -H "X-API-Key: your-api-key-here" \\\n  -d '{\n    "sessionId": "uuid-session-id",\n    "answer": "animals"\n  }'\n```

**Success Response:**
```json
{\n  "success": true,\n  "verified": true,\n  "message": "Captcha verified successfully"\n}\n```

**Error Response:**
```json
{\n  "success": false,\n  "verified": false,\n  "message": "Incorrect answer",\n  "code": "INCORRECT_ANSWER",\n  "remainingAttempts": 2\n}\n```

## API Reference

### Base URL
```
http://localhost:3001/api
```

### Authentication

All protected endpoints require an API key sent via:
- **Header**: `X-API-Key: your-api-key`
- **Query Parameter**: `?api_key=your-api-key`

### Endpoints

#### POST `/register`
Register for a new API key.

**Request Body:**
```json
{\n  "email": "string (required)",\n  "name": "string (required)",\n  "keyName": "string (optional)"\n}\n```

**Response:** `201 Created`
```json
{\n  "success": true,\n  "message": "API key generated successfully",\n  "data": {\n    "apiKey": "string",\n    "user": {},\n    "rateLimit": "string"\n  }\n}\n```

#### GET `/captcha/generate` 🔒
Generate a new captcha challenge.

**Headers:**
- `X-API-Key: your-api-key` (required)

**Response:** `200 OK`
```json
{\n  "success": true,\n  "data": {\n    "sessionId": "string",\n    "gifUrl": "string",\n    "options": ["string"],\n    "expiresIn": 10\n  }\n}\n```

#### POST `/captcha/verify` 🔒
Verify a captcha solution.

**Headers:**
- `X-API-Key: your-api-key` (required)
- `Content-Type: application/json`

**Request Body:**
```json
{\n  "sessionId": "string (required)",\n  "answer": "string (required)"\n}\n```

**Response:** `200 OK` (success) or `400 Bad Request` (wrong answer)
```json
{\n  "success": true,\n  "verified": true,\n  "message": "string"\n}\n```

#### GET `/usage` 🔒
Get API usage statistics.

**Headers:**
- `X-API-Key: your-api-key` (required)

**Query Parameters:**
- `timeframe`: `1h`, `24h`, `7d`, `30d` (optional, default: `24h`)

**Response:** `200 OK`
```json
{\n  "success": true,\n  "data": {\n    "stats": [],\n    "summary": {\n      "totalRequests": 150,\n      "successfulRequests": 145,\n      "errorRequests": 5,\n      "avgResponseTime": 250,\n      "timeframe": "24h"\n    }\n  }\n}\n```

#### GET `/docs`
Get API documentation (this information in JSON format).

#### GET `/health`
Health check endpoint.

**Response:** `200 OK`
```json
{\n  "status": "healthy",\n  "timestamp": "2023-12-19T10:30:00.000Z",\n  "uptime": 3600,\n  "version": "1.0.0"\n}\n```

## Integration Examples

### HTML/JavaScript Integration

```html
<!DOCTYPE html>\n<html>\n<head>\n    <title>Captcha Integration</title>\n</head>\n<body>\n    <div id="captcha-container">\n        <img id="captcha-gif" src="" alt="Captcha GIF" style="display:none;">\n        <div id="captcha-options"></div>\n        <button onclick="loadCaptcha()">Load Captcha</button>\n        <button onclick="submitAnswer()" id="submit-btn" style="display:none;">Submit</button>\n        <div id="result"></div>\n    </div>\n\n    <script>\n        const API_KEY = 'your-api-key-here';\n        const BASE_URL = 'http://localhost:3001/api';\n        let currentSession = null;\n        let selectedAnswer = null;\n\n        async function loadCaptcha() {\n            try {\n                const response = await fetch(`${BASE_URL}/captcha/generate`, {\n                    headers: {\n                        'X-API-Key': API_KEY\n                    }\n                });\n                \n                const data = await response.json();\n                \n                if (data.success) {\n                    currentSession = data.data.sessionId;\n                    document.getElementById('captcha-gif').src = data.data.gifUrl;\n                    document.getElementById('captcha-gif').style.display = 'block';\n                    \n                    const optionsDiv = document.getElementById('captcha-options');\n                    optionsDiv.innerHTML = '';\n                    \n                    data.data.options.forEach(option => {\n                        const button = document.createElement('button');\n                        button.textContent = option;\n                        button.onclick = () => selectAnswer(option);\n                        optionsDiv.appendChild(button);\n                    });\n                    \n                    document.getElementById('submit-btn').style.display = 'block';\n                }\n            } catch (error) {\n                console.error('Error loading captcha:', error);\n            }\n        }\n\n        function selectAnswer(answer) {\n            selectedAnswer = answer;\n            // Visual feedback for selection\n            document.querySelectorAll('#captcha-options button').forEach(btn => {\n                btn.style.backgroundColor = btn.textContent === answer ? '#007bff' : '';\n                btn.style.color = btn.textContent === answer ? 'white' : '';\n            });\n        }\n\n        async function submitAnswer() {\n            if (!selectedAnswer || !currentSession) {\n                alert('Please select an answer first');\n                return;\n            }\n\n            try {\n                const response = await fetch(`${BASE_URL}/captcha/verify`, {\n                    method: 'POST',\n                    headers: {\n                        'Content-Type': 'application/json',\n                        'X-API-Key': API_KEY\n                    },\n                    body: JSON.stringify({\n                        sessionId: currentSession,\n                        answer: selectedAnswer\n                    })\n                });\n                \n                const data = await response.json();\n                const resultDiv = document.getElementById('result');\n                \n                if (data.success && data.verified) {\n                    resultDiv.innerHTML = '<p style="color: green;">✅ Captcha verified successfully!</p>';\n                    // Proceed with form submission or next steps\n                } else {\n                    resultDiv.innerHTML = `<p style="color: red;">❌ ${data.message}</p>`;\n                    if (data.remainingAttempts > 0) {\n                        resultDiv.innerHTML += `<p>Remaining attempts: ${data.remainingAttempts}</p>`;\n                    } else {\n                        // Load new captcha\n                        loadCaptcha();\n                    }\n                }\n            } catch (error) {\n                console.error('Error verifying captcha:', error);\n            }\n        }\n    </script>\n</body>\n</html>\n```

### Node.js Integration

```javascript\nconst axios = require('axios');\n\nclass CaptchaService {\n    constructor(apiKey) {\n        this.apiKey = apiKey;\n        this.baseURL = 'http://localhost:3001/api';\n    }\n\n    async generateCaptcha() {\n        try {\n            const response = await axios.get(`${this.baseURL}/captcha/generate`, {\n                headers: {\n                    'X-API-Key': this.apiKey\n                }\n            });\n            return response.data.data;\n        } catch (error) {\n            throw new Error(`Failed to generate captcha: ${error.message}`);\n        }\n    }\n\n    async verifyCaptcha(sessionId, answer) {\n        try {\n            const response = await axios.post(`${this.baseURL}/captcha/verify`, {\n                sessionId,\n                answer\n            }, {\n                headers: {\n                    'X-API-Key': this.apiKey,\n                    'Content-Type': 'application/json'\n                }\n            });\n            return response.data;\n        } catch (error) {\n            if (error.response) {\n                return error.response.data;\n            }\n            throw new Error(`Failed to verify captcha: ${error.message}`);\n        }\n    }\n\n    async getUsageStats(timeframe = '24h') {\n        try {\n            const response = await axios.get(`${this.baseURL}/usage`, {\n                headers: {\n                    'X-API-Key': this.apiKey\n                },\n                params: { timeframe }\n            });\n            return response.data.data;\n        } catch (error) {\n            throw new Error(`Failed to get usage stats: ${error.message}`);\n        }\n    }\n}\n\n// Usage example\nconst captcha = new CaptchaService('your-api-key');\n\n// In your login/registration route\napp.post('/register', async (req, res) => {\n    const { sessionId, answer, email, password } = req.body;\n    \n    // Verify captcha first\n    const verification = await captcha.verifyCaptcha(sessionId, answer);\n    \n    if (!verification.verified) {\n        return res.status(400).json({ \n            error: 'Captcha verification failed',\n            message: verification.message \n        });\n    }\n    \n    // Proceed with user registration\n    // ... your registration logic here\n    \n    res.json({ success: true, message: 'User registered successfully' });\n});\n```

### Python Integration

```python\nimport requests\nimport json\n\nclass CaptchaAPI:\n    def __init__(self, api_key):\n        self.api_key = api_key\n        self.base_url = 'http://localhost:3001/api'\n        self.headers = {'X-API-Key': api_key}\n    \n    def generate_captcha(self):\n        response = requests.get(\n            f'{self.base_url}/captcha/generate',\n            headers=self.headers\n        )\n        return response.json()\n    \n    def verify_captcha(self, session_id, answer):\n        response = requests.post(\n            f'{self.base_url}/captcha/verify',\n            headers={**self.headers, 'Content-Type': 'application/json'},\n            json={'sessionId': session_id, 'answer': answer}\n        )\n        return response.json()\n    \n    def get_usage_stats(self, timeframe='24h'):\n        response = requests.get(\n            f'{self.base_url}/usage',\n            headers=self.headers,\n            params={'timeframe': timeframe}\n        )\n        return response.json()\n\n# Usage example\ncaptcha = CaptchaAPI('your-api-key')\n\n# Generate captcha\nchallenge = captcha.generate_captcha()\nprint(f\"GIF URL: {challenge['data']['gifUrl']}\")\nprint(f\"Options: {challenge['data']['options']}\")\n\n# Verify answer\nresult = captcha.verify_captcha(challenge['data']['sessionId'], 'animals')\nprint(f\"Verified: {result.get('verified', False)}\")\n```

## Error Codes

| Code | Description |\n|------|-------------|\n| `MISSING_API_KEY` | API key not provided |\n| `INVALID_API_KEY` | API key is invalid or inactive |\n| `RATE_LIMIT_EXCEEDED` | Too many requests |\n| `MISSING_FIELDS` | Required fields missing from request |\n| `INVALID_SESSION` | Session not found or expired |\n| `SESSION_EXPIRED` | Captcha session has expired |\n| `INCORRECT_ANSWER` | Wrong captcha answer |\n| `MAX_ATTEMPTS_EXCEEDED` | Too many verification attempts |\n\n## Rate Limits\n\n- **Generation/Verification**: 1000 requests per hour per API key\n- **Usage Stats**: 100 requests per hour per API key\n- **Registration**: No limit (public endpoint)\n\n## Best Practices\n\n1. **Store API Keys Securely**: Never expose API keys in client-side code\n2. **Handle Errors Gracefully**: Always check response status and handle errors\n3. **Session Management**: Don't store session IDs longer than necessary\n4. **Rate Limiting**: Implement client-side rate limiting to avoid hitting limits\n5. **Timeout Handling**: Sessions expire in 10 minutes, implement proper timeout handling\n6. **Fallback Options**: Have a fallback captcha solution for high availability\n\n## Support\n\nFor support, feature requests, or bug reports, please contact the API administrator or check the API documentation at `/api/docs`.\n\n## Changelog\n\n### Version 1.0.0\n- Initial release\n- GIF-based captcha challenges\n- API key authentication\n- Rate limiting and usage tracking\n- Session management\n- Multi-language support ready