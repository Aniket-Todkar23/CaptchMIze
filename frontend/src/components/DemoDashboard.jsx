import React, { useState, useEffect } from 'react';
import { 
  User, Shield, Activity, BarChart3, Settings, LogOut, 
  CheckCircle, Clock, Globe, Key, RefreshCw, Eye, Copy,
  TrendingUp, Users, Server, Zap
} from 'lucide-react';

const DemoDashboard = ({ user, onLogout, showNotification }) => {
  const [usageStats, setUsageStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [showApiKey, setShowApiKey] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    loadUsageStats();
    // Refresh stats every 30 seconds
    const interval = setInterval(loadUsageStats, 30000);
    return () => clearInterval(interval);
  }, []);

  const loadUsageStats = async () => {
    try {
      const response = await fetch('http://localhost:3001/api/usage?timeframe=24h', {
        headers: {
          'X-API-Key': user.apiKey
        }
      });

      const data = await response.json();
      if (data.success) {
        setUsageStats(data.data.summary);
      }
    } catch (error) {
      console.error('Failed to load usage stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const copyApiKey = () => {
    navigator.clipboard.writeText(user.apiKey);
    setCopied(true);
    showNotification('API key copied to clipboard!', 'success');
    setTimeout(() => setCopied(false), 2000);
  };

  const testApiKey = async () => {
    try {
      const response = await fetch('http://localhost:3001/api/captcha/generate', {
        headers: {
          'X-API-Key': user.apiKey
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

  const StatCard = ({ icon, title, value, subtitle, color = 'blue' }) => (
    <div className="bg-slate-800/50 rounded-lg p-6 backdrop-blur-sm">
      <div className="flex items-center justify-between mb-4">
        <div className={`p-2 rounded-lg bg-${color}-500/20`}>
          {icon}
        </div>
        <div className="text-right">
          <div className="text-2xl font-bold text-white">{value}</div>
          <div className={`text-sm text-${color}-400`}>{subtitle}</div>
        </div>
      </div>
      <h3 className="text-gray-300 font-medium">{title}</h3>
    </div>
  );

  const TabButton = ({ id, label, active, onClick }) => (
    <button
      onClick={() => onClick(id)}
      className={`px-4 py-2 rounded-lg font-medium transition-all ${
        active
          ? 'bg-blue-500 text-white'
          : 'text-gray-400 hover:text-white hover:bg-slate-700'
      }`}
    >
      {label}
    </button>
  );

  return (
    <div className="min-h-screen bg-slate-900">
      {/* Header */}
      <header className="bg-slate-800/80 backdrop-blur-sm border-b border-slate-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <Shield className="w-8 h-8 text-blue-500" />
                <h1 className="text-xl font-bold text-white">Captcha Demo Dashboard</h1>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-blue-500/20 rounded-full flex items-center justify-center">
                  <User className="w-4 h-4 text-blue-500" />
                </div>
                <span className="text-gray-300">{user.username}</span>
              </div>
              
              <button
                onClick={onLogout}
                className="p-2 text-gray-400 hover:text-white hover:bg-slate-700 rounded-lg transition-colors"
                title="Logout"
              >
                <LogOut className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Message */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-white mb-2">
            Welcome, {user.username}! 🎉
          </h2>
          <p className="text-gray-400">
            You've successfully logged in using our CAPTCHA API system. This dashboard shows your API usage and statistics.
          </p>
        </div>

        {/* Stats Cards */}
        {!loading && usageStats && (
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <StatCard
              icon={<Activity className="w-5 h-5 text-blue-500" />}
              title="Total Requests"
              value={usageStats.totalRequests || 0}
              subtitle="Last 24h"
              color="blue"
            />
            <StatCard
              icon={<CheckCircle className="w-5 h-5 text-green-500" />}
              title="Successful Requests"
              value={usageStats.successfulRequests || 0}
              subtitle="Verified"
              color="green"
            />
            <StatCard
              icon={<Clock className="w-5 h-5 text-yellow-500" />}
              title="Avg Response Time"
              value={`${Math.round(usageStats.avgResponseTime || 0)}ms`}
              subtitle="Performance"
              color="yellow"
            />
            <StatCard
              icon={<TrendingUp className="w-5 h-5 text-purple-500" />}
              title="Success Rate"
              value={usageStats.totalRequests > 0 ? 
                `${Math.round((usageStats.successfulRequests / usageStats.totalRequests) * 100)}%` : '100%'}
              subtitle="Accuracy"
              color="purple"
            />
          </div>
        )}

        {/* Tab Navigation */}
        <div className="flex space-x-2 mb-6 overflow-x-auto">
          <TabButton 
            id="overview" 
            label="Overview" 
            active={activeTab === 'overview'} 
            onClick={setActiveTab} 
          />
          <TabButton 
            id="api-key" 
            label="API Key" 
            active={activeTab === 'api-key'} 
            onClick={setActiveTab} 
          />
          <TabButton 
            id="integration" 
            label="Integration" 
            active={activeTab === 'integration'} 
            onClick={setActiveTab} 
          />
        </div>

        {/* Tab Content */}
        <div className="space-y-6">
          {/* Overview Tab */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              <div className="bg-slate-800/50 rounded-lg p-6 backdrop-blur-sm">
                <h3 className="text-xl font-semibold text-white mb-4">Demo Success!</h3>
                <div className="space-y-4">
                  <div className="flex items-start space-x-3">
                    <CheckCircle className="w-5 h-5 text-green-500 mt-0.5" />
                    <div>
                      <p className="text-white font-medium">CAPTCHA Verification Completed</p>
                      <p className="text-gray-400 text-sm">You successfully solved the GIF-based captcha challenge.</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start space-x-3">
                    <Key className="w-5 h-5 text-blue-500 mt-0.5" />
                    <div>
                      <p className="text-white font-medium">Demo API Key Generated</p>
                      <p className="text-gray-400 text-sm">A temporary API key was created automatically for this demo.</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start space-x-3">
                    <Shield className="w-5 h-5 text-purple-500 mt-0.5" />
                    <div>
                      <p className="text-white font-medium">Security Validated</p>
                      <p className="text-gray-400 text-sm">The system verified you're human and granted access.</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Features Demo */}
              <div className="grid md:grid-cols-2 gap-6">
                <div className="bg-slate-800/50 rounded-lg p-6 backdrop-blur-sm">
                  <h4 className="text-lg font-semibold text-white mb-3">What You Experienced</h4>
                  <ul className="space-y-2 text-gray-300">
                    <li className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                      <span>Automatic API key generation</span>
                    </li>
                    <li className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                      <span>GIF-based captcha challenge</span>
                    </li>
                    <li className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                      <span>Real-time verification</span>
                    </li>
                    <li className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                      <span>Secure session management</span>
                    </li>
                  </ul>
                </div>

                <div className="bg-slate-800/50 rounded-lg p-6 backdrop-blur-sm">
                  <h4 className="text-lg font-semibold text-white mb-3">API Benefits</h4>
                  <ul className="space-y-2 text-gray-300">
                    <li className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <span>Easy integration</span>
                    </li>
                    <li className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <span>Rate limiting protection</span>
                    </li>
                    <li className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <span>Usage analytics</span>
                    </li>
                    <li className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <span>Comprehensive documentation</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          )}

          {/* API Key Tab */}
          {activeTab === 'api-key' && (
            <div className="space-y-6">
              <div className="bg-slate-800/50 rounded-lg p-6 backdrop-blur-sm">
                <h3 className="text-xl font-semibold text-white mb-4">Your Demo API Key</h3>
                <p className="text-gray-400 mb-4">
                  This API key was automatically generated for the demo. In production, you'd manage your keys through our developer portal.
                </p>
                
                <div className="bg-slate-900 rounded-lg p-4 mb-4">
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-sm font-medium text-gray-300">API Key</label>
                    <button
                      onClick={() => setShowApiKey(!showApiKey)}
                      className="text-gray-400 hover:text-white transition-colors"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="flex items-center space-x-2">
                    <input
                      type={showApiKey ? 'text' : 'password'}
                      value={user.apiKey}
                      readOnly
                      className="flex-1 bg-transparent text-white font-mono text-sm border-none outline-none"
                    />
                    <button
                      onClick={copyApiKey}
                      className="p-2 hover:bg-slate-700 rounded transition-colors"
                    >
                      {copied ? 
                        <CheckCircle className="w-4 h-4 text-green-500" /> : 
                        <Copy className="w-4 h-4 text-gray-400" />
                      }
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
                    onClick={loadUsageStats}
                    className="px-4 py-2 bg-purple-500/20 text-purple-400 border border-purple-500/30 rounded-lg hover:bg-purple-500/30 transition-colors flex items-center space-x-2"
                  >
                    <RefreshCw className="w-4 h-4" />
                    <span>Refresh Stats</span>
                  </button>
                </div>
              </div>

              {/* API Info */}
              <div className="bg-slate-800/50 rounded-lg p-6 backdrop-blur-sm">
                <h4 className="text-lg font-semibold text-white mb-3">API Information</h4>
                <div className="grid md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-400">Endpoint:</span>
                    <p className="text-white font-mono">http://localhost:3001/api</p>
                  </div>
                  <div>
                    <span className="text-gray-400">Rate Limit:</span>
                    <p className="text-white">1000 requests/hour</p>
                  </div>
                  <div>
                    <span className="text-gray-400">Authentication:</span>
                    <p className="text-white">X-API-Key header</p>
                  </div>
                  <div>
                    <span className="text-gray-400">Response Format:</span>
                    <p className="text-white">JSON</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Integration Tab */}
          {activeTab === 'integration' && (
            <div className="space-y-6">
              <div className="bg-slate-800/50 rounded-lg p-6 backdrop-blur-sm">
                <h3 className="text-xl font-semibold text-white mb-4">Integration Examples</h3>
                <p className="text-gray-400 mb-4">
                  Here's how you can integrate our CAPTCHA API into your applications:
                </p>
                
                <div className="space-y-4">
                  <div className="bg-slate-900 rounded-lg p-4">
                    <h4 className="text-sm font-semibold text-gray-300 mb-2">1. Generate CAPTCHA</h4>
                    <code className="text-green-400 text-xs break-all">
                      curl -X GET http://localhost:3001/api/captcha/generate \<br />
                      &nbsp;&nbsp;-H "X-API-Key: {user.apiKey.substring(0, 20)}..."
                    </code>
                  </div>
                  
                  <div className="bg-slate-900 rounded-lg p-4">
                    <h4 className="text-sm font-semibold text-gray-300 mb-2">2. Verify Answer</h4>
                    <code className="text-green-400 text-xs break-all">
                      curl -X POST http://localhost:3001/api/captcha/verify \<br />
                      &nbsp;&nbsp;-H "Content-Type: application/json" \<br />
                      &nbsp;&nbsp;-H "X-API-Key: {user.apiKey.substring(0, 20)}..." \<br />
                      &nbsp;&nbsp;-d '&#123;"sessionId": "uuid", "answer": "animals"&#125;'
                    </code>
                  </div>
                </div>
              </div>

              <div className="bg-slate-800/50 rounded-lg p-6 backdrop-blur-sm">
                <h4 className="text-lg font-semibold text-white mb-3">Next Steps</h4>
                <ul className="space-y-3 text-gray-300">
                  <li className="flex items-start space-x-3">
                    <div className="w-6 h-6 bg-blue-500/20 rounded-full flex items-center justify-center mt-0.5">
                      <span className="text-blue-400 text-xs font-bold">1</span>
                    </div>
                    <div>
                      <p className="font-medium">Get your production API key</p>
                      <p className="text-sm text-gray-400">Register at our developer portal for a permanent API key</p>
                    </div>
                  </li>
                  
                  <li className="flex items-start space-x-3">
                    <div className="w-6 h-6 bg-blue-500/20 rounded-full flex items-center justify-center mt-0.5">
                      <span className="text-blue-400 text-xs font-bold">2</span>
                    </div>
                    <div>
                      <p className="font-medium">Read the documentation</p>
                      <p className="text-sm text-gray-400">Check out our comprehensive API docs and integration guides</p>
                    </div>
                  </li>
                  
                  <li className="flex items-start space-x-3">
                    <div className="w-6 h-6 bg-blue-500/20 rounded-full flex items-center justify-center mt-0.5">
                      <span className="text-blue-400 text-xs font-bold">3</span>
                    </div>
                    <div>
                      <p className="font-medium">Implement in your app</p>
                      <p className="text-sm text-gray-400">Add CAPTCHA verification to your login, registration, or contact forms</p>
                    </div>
                  </li>
                </ul>
              </div>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="mt-12 text-center space-y-4">
          <div className="flex flex-wrap justify-center gap-4">
            <a
              href="http://localhost:3001/api/docs"
              target="_blank"
              rel="noopener noreferrer"
              className="px-6 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-medium transition-colors flex items-center space-x-2"
            >
              <Globe className="w-4 h-4" />
              <span>View API Docs</span>
            </a>
            
            <button
              onClick={() => setActiveTab('api-key')}
              className="px-6 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg font-medium transition-colors flex items-center space-x-2"
            >
              <Key className="w-4 h-4" />
              <span>Copy API Key</span>
            </button>
            
            <button
              onClick={onLogout}
              className="px-6 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg font-medium transition-colors flex items-center space-x-2"
            >
              <LogOut className="w-4 h-4" />
              <span>End Demo</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DemoDashboard;