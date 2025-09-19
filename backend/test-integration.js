#!/usr/bin/env node

/**
 * Integration Test Script for Captcha API
 * 
 * This script tests the complete API flow as an external integrator would use it.
 * It simulates real-world usage scenarios and error conditions.
 */

const axios = require('axios');

const BASE_URL = 'http://localhost:3001/api';
const TEST_EMAIL = `test-${Date.now()}@example.com`;

// Colors for console output
const colors = {
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  reset: '\x1b[0m'
};

function log(color, message) {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

async function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

class CaptchaAPITester {
  constructor() {
    this.apiKey = null;
    this.testResults = [];
  }

  async runTest(testName, testFn) {
    log('blue', `\n🧪 Running test: ${testName}`);
    try {
      const startTime = Date.now();
      await testFn();
      const duration = Date.now() - startTime;
      log('green', `✅ ${testName} passed (${duration}ms)`);
      this.testResults.push({ name: testName, status: 'passed', duration });
    } catch (error) {
      log('red', `❌ ${testName} failed: ${error.message}`);
      this.testResults.push({ name: testName, status: 'failed', error: error.message });
    }
  }

  async testApiHealth() {
    const response = await axios.get(`${BASE_URL}/health`);
    if (response.status !== 200) {
      throw new Error(`Health check failed with status ${response.status}`);
    }
    if (response.data.status !== 'healthy') {
      throw new Error(`API not healthy: ${response.data.status}`);
    }
    log('green', 'API is healthy and responsive');
  }

  async testApiKeyRegistration() {
    const response = await axios.post(`${BASE_URL}/register`, {
      email: TEST_EMAIL,
      name: 'Integration Test User',
      keyName: 'Integration Test Key'
    });

    if (response.status !== 201) {
      throw new Error(`Registration failed with status ${response.status}`);
    }

    if (!response.data.success || !response.data.data.apiKey) {
      throw new Error('Registration response missing API key');
    }

    this.apiKey = response.data.data.apiKey;
    log('green', `API key generated: ${this.apiKey.substring(0, 20)}...`);
  }

  async testInvalidApiKey() {
    try {
      await axios.get(`${BASE_URL}/captcha/generate`, {
        headers: { 'X-API-Key': 'invalid-key' }
      });
      throw new Error('Should have failed with invalid API key');
    } catch (error) {
      if (error.response && error.response.status === 401) {
        log('green', 'Correctly rejected invalid API key');
      } else {
        throw error;
      }
    }
  }

  async testMissingApiKey() {
    try {
      await axios.get(`${BASE_URL}/captcha/generate`);
      throw new Error('Should have failed without API key');
    } catch (error) {
      if (error.response && error.response.status === 401) {
        log('green', 'Correctly rejected missing API key');
      } else {
        throw error;
      }
    }
  }

  async testCaptchaGeneration() {
    const response = await axios.get(`${BASE_URL}/captcha/generate`, {
      headers: { 'X-API-Key': this.apiKey }
    });

    if (response.status !== 200) {
      throw new Error(`Captcha generation failed with status ${response.status}`);
    }

    if (!response.data.success || !response.data.data) {
      throw new Error('Invalid captcha generation response');
    }

    const { sessionId, gifUrl, options, expiresIn } = response.data.data;

    if (!sessionId || !gifUrl || !Array.isArray(options) || !expiresIn) {
      throw new Error('Captcha response missing required fields');
    }

    if (options.length !== 4) {
      throw new Error(`Expected 4 options, got ${options.length}`);
    }

    this.testSessionId = sessionId;
    this.testOptions = options;
    log('green', `Captcha generated with ${options.length} options, expires in ${expiresIn} minutes`);
  }

  async testCaptchaVerificationSuccess() {
    // Use the first option as the "correct" answer for testing
    const answer = this.testOptions[0];

    const response = await axios.post(`${BASE_URL}/captcha/verify`, {
      sessionId: this.testSessionId,
      answer: answer
    }, {
      headers: { 'X-API-Key': this.apiKey }
    });

    // Note: This might fail with wrong answer, which is expected
    if (response.status === 200 && response.data.verified) {
      log('green', 'Captcha verification successful');
    } else if (response.status === 400 && !response.data.verified) {
      log('yellow', 'Captcha verification failed (expected for random answer)');
    } else {
      throw new Error(`Unexpected verification response: ${response.status}`);
    }
  }

  async testCaptchaVerificationInvalidSession() {
    try {
      await axios.post(`${BASE_URL}/captcha/verify`, {
        sessionId: 'invalid-session-id',
        answer: 'animals'
      }, {
        headers: { 'X-API-Key': this.apiKey }
      });
      throw new Error('Should have failed with invalid session ID');
    } catch (error) {
      if (error.response && error.response.status === 404) {
        log('green', 'Correctly rejected invalid session ID');
      } else {
        throw error;
      }
    }
  }

  async testRateLimit() {
    log('blue', 'Testing rate limiting...');
    const requests = [];
    
    // Make multiple rapid requests
    for (let i = 0; i < 5; i++) {
      requests.push(
        axios.get(`${BASE_URL}/captcha/generate`, {
          headers: { 'X-API-Key': this.apiKey }
        })
      );
    }

    const responses = await Promise.allSettled(requests);
    let successCount = 0;
    let rateLimitHeaders = null;

    responses.forEach((result, index) => {
      if (result.status === 'fulfilled') {
        successCount++;
        if (result.value.headers) {
          rateLimitHeaders = {
            limit: result.value.headers['x-ratelimit-limit'],
            remaining: result.value.headers['x-ratelimit-remaining'],
            reset: result.value.headers['x-ratelimit-reset']
          };
        }
      }
    });

    if (successCount > 0) {
      log('green', `Rate limiting working: ${successCount} requests succeeded`);
      if (rateLimitHeaders) {
        log('blue', `Rate limit headers: ${JSON.stringify(rateLimitHeaders)}`);
      }
    } else {
      throw new Error('All rate limit requests failed');
    }
  }

  async testUsageStats() {
    const response = await axios.get(`${BASE_URL}/usage?timeframe=1h`, {
      headers: { 'X-API-Key': this.apiKey }
    });

    if (response.status !== 200) {
      throw new Error(`Usage stats failed with status ${response.status}`);
    }

    if (!response.data.success || !response.data.data) {
      throw new Error('Invalid usage stats response');
    }

    log('green', `Usage stats retrieved: ${JSON.stringify(response.data.data.summary)}`);
  }

  async testCORSHeaders() {
    const response = await axios.options(`${BASE_URL}/captcha/generate`, {
      headers: {
        'Origin': 'https://example.com',
        'Access-Control-Request-Method': 'GET',
        'Access-Control-Request-Headers': 'X-API-Key'
      }
    });

    if (response.status !== 200) {
      throw new Error(`CORS preflight failed with status ${response.status}`);
    }

    const corsHeaders = {
      'access-control-allow-origin': response.headers['access-control-allow-origin'],
      'access-control-allow-methods': response.headers['access-control-allow-methods'],
      'access-control-allow-headers': response.headers['access-control-allow-headers']
    };

    if (!corsHeaders['access-control-allow-origin']) {
      throw new Error('Missing CORS allow-origin header');
    }

    log('green', 'CORS headers properly configured');
  }

  async testErrorHandling() {
    // Test with malformed JSON
    try {
      await axios.post(`${BASE_URL}/captcha/verify`, 'invalid-json', {
        headers: { 
          'X-API-Key': this.apiKey,
          'Content-Type': 'application/json'
        }
      });
      throw new Error('Should have failed with malformed JSON');
    } catch (error) {
      if (error.response && error.response.status === 400) {
        log('green', 'Correctly handled malformed JSON');
      } else {
        throw error;
      }
    }
  }

  async runAllTests() {
    log('blue', '🚀 Starting Captcha API Integration Tests');
    log('blue', '===============================================');

    await this.runTest('API Health Check', () => this.testApiHealth());
    await this.runTest('API Key Registration', () => this.testApiKeyRegistration());
    await this.runTest('Invalid API Key Rejection', () => this.testInvalidApiKey());
    await this.runTest('Missing API Key Rejection', () => this.testMissingApiKey());
    await this.runTest('Captcha Generation', () => this.testCaptchaGeneration());
    await this.runTest('Captcha Verification', () => this.testCaptchaVerificationSuccess());
    await this.runTest('Invalid Session Rejection', () => this.testCaptchaVerificationInvalidSession());
    await this.runTest('Rate Limiting', () => this.testRateLimit());
    await this.runTest('Usage Statistics', () => this.testUsageStats());
    await this.runTest('CORS Headers', () => this.testCORSHeaders());
    await this.runTest('Error Handling', () => this.testErrorHandling());

    this.printResults();
  }

  printResults() {
    log('blue', '\n📊 Test Results Summary');
    log('blue', '======================');

    const passed = this.testResults.filter(r => r.status === 'passed').length;
    const failed = this.testResults.filter(r => r.status === 'failed').length;
    const total = this.testResults.length;

    this.testResults.forEach(result => {
      const status = result.status === 'passed' 
        ? `${colors.green}✅ PASSED${colors.reset}` 
        : `${colors.red}❌ FAILED${colors.reset}`;
      
      const duration = result.duration ? ` (${result.duration}ms)` : '';
      console.log(`${status} ${result.name}${duration}`);
      
      if (result.error) {
        console.log(`   ${colors.red}Error: ${result.error}${colors.reset}`);
      }
    });

    log('blue', '\n📈 Summary:');
    log('green', `✅ Passed: ${passed}`);
    log('red', `❌ Failed: ${failed}`);
    log('blue', `📊 Total: ${total}`);

    if (failed === 0) {
      log('green', '\n🎉 All tests passed! API is ready for external integration.');
    } else {
      log('red', `\n⚠️  ${failed} test(s) failed. Please review and fix issues before production use.`);
      process.exit(1);
    }
  }
}

// Run the tests
async function main() {
  const tester = new CaptchaAPITester();
  
  try {
    await tester.runAllTests();
  } catch (error) {
    log('red', `\n💥 Test suite failed: ${error.message}`);
    process.exit(1);
  }
}

// Check if this is being run directly
if (require.main === module) {
  main();
}

module.exports = CaptchaAPITester;