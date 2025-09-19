import React, { useState, useEffect } from 'react';
import { User, Lock, Eye, EyeOff, Shield, ArrowRight, CheckCircle, AlertCircle } from 'lucide-react';
import CaptchaDisplay from './CaptchaDisplay';

const DemoLogin = ({ onLoginSuccess, showNotification, onBack }) => {
  const [formData, setFormData] = useState({
    username: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [captchaData, setCaptchaData] = useState(null);
  const [selectedAnswer, setSelectedAnswer] = useState('');
  const [loading, setLoading] = useState(false);
  const [captchaLoading, setCaptchaLoading] = useState(false);
  const [apiKey, setApiKey] = useState('');
  const [step, setStep] = useState('generating-key'); // generating-key, login

  // Demo credentials
  const DEMO_CREDENTIALS = [
    { username: 'demo', password: 'demo123' },
    { username: 'admin', password: 'admin123' },
    { username: 'user', password: 'password' }
  ];

  // Generate demo API key on component mount
  useEffect(() => {
    generateDemoApiKey();
  }, []);

  const generateDemoApiKey = async () => {
    try {
      const response = await fetch('http://localhost:3001/api/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: `demo-${Date.now()}@captchademo.com`,
          name: 'Demo User',
          keyName: 'Demo Login Key'
        }),
      });

      const data = await response.json();
      if (data.success) {
        setApiKey(data.data.apiKey);
        setStep('login');
        showNotification('Demo API key generated successfully!', 'success');
        // Automatically load first captcha
        setTimeout(() => loadCaptcha(data.data.apiKey), 500);
      } else {
        showNotification('Failed to generate demo API key', 'error');
      }
    } catch (error) {
      console.error('API key generation error:', error);
      showNotification('Failed to connect to API server', 'error');
    }
  };

  const loadCaptcha = async (keyToUse = apiKey) => {
    if (!keyToUse) return;
    
    setCaptchaLoading(true);
    try {
      const response = await fetch('http://localhost:3001/api/captcha/generate', {
        headers: {
          'X-API-Key': keyToUse
        }
      });

      const data = await response.json();
      if (data.success) {
        setCaptchaData(data.data);
        setSelectedAnswer('');
        const typeMessage = data.data.type ? ` (${data.data.type.toUpperCase()})` : '';
        showNotification(`New captcha loaded${typeMessage}`, 'success');
      } else {
        showNotification('Failed to load captcha', 'error');
      }
    } catch (error) {
      console.error('Captcha load error:', error);
      showNotification('Failed to load captcha', 'error');
    } finally {
      setCaptchaLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    
    if (!formData.username || !formData.password) {
      showNotification('Please enter username and password', 'error');
      return;
    }

    if (!selectedAnswer) {
      showNotification('Please solve the captcha first', 'error');
      return;
    }

    if (!captchaData) {
      showNotification('Captcha not loaded. Please refresh.', 'error');
      return;
    }

    setLoading(true);

    try {
      // First verify captcha
      const captchaResponse = await fetch('http://localhost:3001/api/captcha/verify', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-API-Key': apiKey
        },
        body: JSON.stringify({
          sessionId: captchaData.sessionId,
          answer: selectedAnswer
        })
      });

      const captchaResult = await captchaResponse.json();

      if (!captchaResult.success || !captchaResult.verified) {
        showNotification(captchaResult.message || 'Captcha verification failed', 'error');
        // Load new captcha on failure
        loadCaptcha();
        return;
      }

      // Verify demo credentials
      const isValidCredentials = DEMO_CREDENTIALS.some(
        cred => cred.username === formData.username && cred.password === formData.password
      );

      if (!isValidCredentials) {
        showNotification('Invalid username or password', 'error');
        loadCaptcha(); // Load new captcha on login failure
        return;
      }

      // Success!
      showNotification('Login successful! Redirecting to dashboard...', 'success');
      setTimeout(() => {
        onLoginSuccess({
          username: formData.username,
          apiKey: apiKey
        });
      }, 1500);

    } catch (error) {
      console.error('Login error:', error);
      showNotification('Login failed. Please try again.', 'error');
      loadCaptcha();
    } finally {
      setLoading(false);
    }
  };

  if (step === 'generating-key') {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
        <div className="bg-slate-800 rounded-xl p-8 w-full max-w-md text-center">
          <div className="mb-6">
            <div className="w-16 h-16 mx-auto bg-blue-500/20 rounded-full flex items-center justify-center mb-4">
              <Shield className="w-8 h-8 text-blue-500 animate-pulse" />
            </div>
            <h2 className="text-2xl font-bold text-white mb-2">Setting Up Demo</h2>
            <p className="text-gray-400">Generating demo API key and initializing captcha system...</p>
          </div>
          
          <div className="flex items-center justify-center space-x-2">
            <div className="w-8 h-8 border-2 border-blue-500/30 border-t-blue-500 rounded-full animate-spin"></div>
            <span className="text-gray-300">Please wait...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
      <div className="bg-slate-800 rounded-xl shadow-2xl w-full max-w-md overflow-hidden">
        {/* Header */}
        <div className="bg-slate-700 px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Shield className="w-6 h-6 text-blue-500" />
              <h2 className="text-xl font-bold text-white">Demo Login</h2>
            </div>
            <button
              onClick={onBack}
              className="text-gray-400 hover:text-white transition-colors"
            >
              ×
            </button>
          </div>
        </div>

        <div className="p-6">
          {/* Demo Credentials Info */}
          <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4 mb-6">
            <h3 className="text-sm font-semibold text-blue-400 mb-2">Demo Credentials</h3>
            <div className="text-xs text-blue-300 space-y-1">
              <div>• Username: <code className="bg-slate-700 px-1 rounded">demo</code> Password: <code className="bg-slate-700 px-1 rounded">demo123</code></div>
              <div>• Username: <code className="bg-slate-700 px-1 rounded">admin</code> Password: <code className="bg-slate-700 px-1 rounded">admin123</code></div>
              <div>• Username: <code className="bg-slate-700 px-1 rounded">user</code> Password: <code className="bg-slate-700 px-1 rounded">password</code></div>
            </div>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            {/* Username Field */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Username
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <User className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  name="username"
                  value={formData.username}
                  onChange={handleInputChange}
                  className="w-full pl-10 pr-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter username"
                  required
                />
              </div>
            </div>

            {/* Password Field */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  className="w-full pl-10 pr-10 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter password"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                >
                  {showPassword ? 
                    <EyeOff className="h-5 w-5 text-gray-400 hover:text-gray-300" /> :
                    <Eye className="h-5 w-5 text-gray-400 hover:text-gray-300" />
                  }
                </button>
              </div>
            </div>

            {/* Captcha Section */}
            <CaptchaDisplay
              captchaData={captchaData}
              selectedAnswer={selectedAnswer}
              onAnswerChange={setSelectedAnswer}
              onRefresh={() => loadCaptcha()}
              loading={captchaLoading}
            />

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading || !captchaData || !selectedAnswer}
              className="w-full py-2 px-4 bg-blue-500 hover:bg-blue-600 disabled:bg-slate-600 disabled:cursor-not-allowed text-white rounded-lg font-medium transition-colors flex items-center justify-center space-x-2"
            >
              {loading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  <span>Verifying...</span>
                </>
              ) : (
                <>
                  <span>Login with CAPTCHA</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Status */}
          <div className="mt-4 text-center">
            <div className="flex items-center justify-center space-x-2">
              {selectedAnswer ? (
                <div className="flex items-center space-x-1 text-green-400">
                  <CheckCircle className="w-4 h-4" />
                  <span className="text-xs">Captcha answered</span>
                </div>
              ) : (
                <div className="flex items-center space-x-1 text-yellow-400">
                  <AlertCircle className="w-4 h-4" />
                  <span className="text-xs">Please solve captcha to continue</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DemoLogin;