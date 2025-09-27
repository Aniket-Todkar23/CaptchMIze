import React, { useState } from 'react';
import { Code, Key, Copy, CheckCircle, XCircle, Eye, EyeOff, ExternalLink, Book, Activity } from 'lucide-react';
import { API_ENDPOINTS } from '../config/environment';

const DeveloperPortal = ({ showNotification }) => {
  const [formData, setFormData] = useState({
    email: '',
    name: '',
    keyName: ''
  });
  const [apiKey, setApiKey] = useState('');
  const [loading, setLoading] = useState(false);
  const [showApiKey, setShowApiKey] = useState(false);
  const [step, setStep] = useState(1); // 1: Register, 2: Success
  const [copied, setCopied] = useState(false);
  const [usageStats, setUsageStats] = useState(null);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch(API_ENDPOINTS.REGISTER, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: formData.email,
          name: formData.name,
          keyName: formData.keyName || 'Default API Key'
        }),
      });

      const data = await response.json();

      if (data.success) {
        setApiKey(data.data.apiKey);
        setStep(2);
        showNotification('API key generated successfully!', 'success');
      } else {
        showNotification(data.message || 'Registration failed', 'error');
      }
    } catch (error) {
      console.error('Registration error:', error);
      showNotification('Failed to connect to API server. Please try again.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    showNotification('API key copied to clipboard!', 'success');
    setTimeout(() => setCopied(false), 2000);
  };

  const testApiKey = async () => {
    if (!apiKey) return;

    try {
      const response = await fetch(API_ENDPOINTS.CAPTCHA_GENERATE, {
        headers: {
          'X-API-Key': apiKey
        }
      });

      if (response.ok) {
        showNotification('API key is working correctly!', 'success');
      } else {
        showNotification('API key test failed', 'error');
      }
    } catch (error) {
      showNotification('Failed to test API key', 'error');
    }
  };

  const getUsageStats = async () => {
    if (!apiKey) return;

    try {
      const response = await fetch(`${API_ENDPOINTS.USAGE}?timeframe=24h`, {
        headers: {
          'X-API-Key': apiKey
        }
      });

      const data = await response.json();
      if (data.success) {
        setUsageStats(data.data.summary);
        showNotification('Usage stats loaded', 'success');
      }
    } catch (error) {
      showNotification('Failed to load usage stats', 'error');
    }
  };

  return (
    <div className="bg-slate-800/50 rounded-xl p-8 backdrop-blur-sm shadow-xl">
      <div className="flex items-center space-x-3 mb-8">
        <div className="bg-blue-500/20 p-3 rounded-lg">
          <Code className="w-8 h-8 text-blue-500" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-white">Developer Portal</h2>
          <p className="text-gray-400">Get your API key and integrate CAPTCHA into your applications</p>
        </div>
      </div>

      {step === 1 && (
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-300 mb-2">
              Full Name *
            </label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              required
              className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Enter your full name"
            />
          </div>

          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-2">
              Email Address *
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              required
              className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Enter your email address"
            />
          </div>

          <div>
            <label htmlFor="keyName" className="block text-sm font-medium text-gray-300 mb-2">
              API Key Name (Optional)
            </label>
            <input
              type="text"
              id="keyName"
              name="keyName"
              value={formData.keyName}
              onChange={handleInputChange}
              className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="e.g., My Website API Key"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center space-x-2"
          >
            {loading ? (
              <>
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                <span>Generating API Key...</span>
              </>
            ) : (
              <>
                <Key className="w-5 h-5" />
                <span>Generate API Key</span>
              </>
            )}
          </button>

          <div className="text-center text-sm text-gray-400">
            <p>By registering, you agree to our terms of service and privacy policy.</p>
            <p className="mt-2">Rate limit: 1000 requests per hour</p>
          </div>
        </form>
      )}

      {step === 2 && (
        <div className="space-y-6">
          <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-6">
            <div className="flex items-center space-x-2 mb-4">
              <CheckCircle className="w-6 h-6 text-green-500" />
              <h3 className="text-lg font-semibold text-white">API Key Generated Successfully!</h3>
            </div>
            <p className="text-gray-300 mb-4">
              Your API key has been created. Keep it secure and don't share it publicly.
            </p>
            
            <div className="bg-slate-900 rounded-lg p-4 mb-4">
              <div className="flex items-center justify-between mb-2">
                <label className="text-sm font-medium text-gray-300">Your API Key</label>
                <button
                  onClick={() => setShowApiKey(!showApiKey)}
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  {showApiKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              <div className="flex items-center space-x-2">
                <input
                  type={showApiKey ? 'text' : 'password'}
                  value={apiKey}
                  readOnly
                  className="flex-1 bg-transparent text-white font-mono text-sm border-none outline-none"
                />
                <button
                  onClick={() => copyToClipboard(apiKey)}
                  className="p-2 hover:bg-slate-700 rounded transition-colors"
                >
                  {copied ? <CheckCircle className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4 text-gray-400" />}
                </button>
              </div>
            </div>

            <div className="flex flex-wrap gap-3">
              <button
                onClick={testApiKey}
                className="px-4 py-2 bg-blue-500/20 text-blue-400 border border-blue-500/30 rounded-lg hover:bg-blue-500/30 transition-colors flex items-center space-x-2"
              >
                <Activity className="w-4 h-4" />
                <span>Test API Key</span>
              </button>
              <button
                onClick={getUsageStats}
                className="px-4 py-2 bg-purple-500/20 text-purple-400 border border-purple-500/30 rounded-lg hover:bg-purple-500/30 transition-colors flex items-center space-x-2"
              >
                <Activity className="w-4 h-4" />
                <span>View Usage</span>
              </button>
              <a
                href="http://localhost:3001/api/docs"
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2 bg-gray-500/20 text-gray-400 border border-gray-500/30 rounded-lg hover:bg-gray-500/30 transition-colors flex items-center space-x-2"
              >
                <Book className="w-4 h-4" />
                <span>View Docs</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </div>

          {usageStats && (
            <div className="bg-slate-700/50 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-white mb-4">Usage Statistics (Last 24h)</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-slate-800 rounded-lg p-3 text-center">
                  <div className="text-2xl font-bold text-blue-500">{usageStats.totalRequests || 0}</div>
                  <div className="text-sm text-gray-400">Total Requests</div>
                </div>
                <div className="bg-slate-800 rounded-lg p-3 text-center">
                  <div className="text-2xl font-bold text-green-500">{usageStats.successfulRequests || 0}</div>
                  <div className="text-sm text-gray-400">Successful</div>
                </div>
                <div className="bg-slate-800 rounded-lg p-3 text-center">
                  <div className="text-2xl font-bold text-red-500">{usageStats.errorRequests || 0}</div>
                  <div className="text-sm text-gray-400">Errors</div>
                </div>
                <div className="bg-slate-800 rounded-lg p-3 text-center">
                  <div className="text-2xl font-bold text-yellow-500">{Math.round(usageStats.avgResponseTime || 0)}ms</div>
                  <div className="text-sm text-gray-400">Avg Response</div>
                </div>
              </div>
            </div>
          )}

          <div className="bg-slate-700/30 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-white mb-4">Quick Start</h3>
            <div className="space-y-3 text-sm">
              <div className="bg-slate-800 rounded p-3">
                <p className="text-gray-300 mb-2">1. Generate a CAPTCHA:</p>
                <code className="text-green-400 break-all">
                  GET http://localhost:3001/api/captcha/generate
                  <br />Header: X-API-Key: {apiKey.substring(0, 20)}...
                </code>
              </div>
              <div className="bg-slate-800 rounded p-3">
                <p className="text-gray-300 mb-2">2. Verify the answer:</p>
                <code className="text-green-400 break-all">
                  POST http://localhost:3001/api/captcha/verify
                  <br />Body: {`{"sessionId": "...", "answer": "animals"}`}
                </code>
              </div>
            </div>
          </div>

          <div className="flex gap-4">
            <button
              onClick={() => {
                setStep(1);
                setApiKey('');
                setFormData({ email: '', name: '', keyName: '' });
                setUsageStats(null);
              }}
              className="px-4 py-2 bg-slate-600 text-white rounded-lg hover:bg-slate-500 transition-colors"
            >
              Generate New Key
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default DeveloperPortal;