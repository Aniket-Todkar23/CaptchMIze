import React, { useState, useEffect } from 'react';
import { ScratchCaptcha } from './components/ScratchCaptcha';
import { GifCaptcha } from './components/GifCaptcha';
import { ShieldCheck, ShieldX } from 'lucide-react';

export function App() {
  const [verificationResult, setVerificationResult] = useState<boolean | null>(null);
  const [captchaType, setCaptchaType] = useState<'scratch' | 'gif'>('scratch');
  const [key, setKey] = useState(0); // Key to force re-render of CAPTCHA components

  const handleVerify = (isHuman: boolean) => {
    setVerificationResult(isHuman);
  };

  const handleNewCaptcha = () => {
    setCaptchaType(prev => prev === 'scratch' ? 'gif' : 'scratch');
    setKey(prev => prev + 1);
    setVerificationResult(null);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-lg w-full max-w-[500px] min-h-[200px] flex flex-col sm:flex-row items-center gap-6 sm:gap-4 p-6">
        <div className="flex-1 text-center sm:text-left">
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">
            {captchaType === 'scratch' ? 'Scratch CAPTCHA' : 'GIF CAPTCHA'}
          </h1>
          <p className="text-sm text-gray-600">
            {captchaType === 'scratch' 
              ? 'Scratch the gray area within 4 secs to verify'
              : 'Select the matching category to verify'
            }
          </p>
          {verificationResult !== null && (
            <div className={`mt-3 flex items-center gap-2 justify-center sm:justify-start ${
              verificationResult ? 'text-green-600' : 'text-red-600'
            }`}>
              {verificationResult ? (
                <>
                  <ShieldCheck className="w-5 h-5" />
                  <span className="text-sm font-medium">Human verified!</span>
                </>
              ) : (
                <>
                  <ShieldX className="w-5 h-5" />
                  <span className="text-sm font-medium">Verification failed</span>
                </>
              )}
            </div>
          )}
          <button
            onClick={handleNewCaptcha}
            className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors w-full sm:w-auto"
          >
            Try Different CAPTCHA
          </button>
        </div>
        
        <div className="flex-shrink-0">
          {captchaType === 'scratch' ? (
            <ScratchCaptcha key={`scratch-${key}`} onVerify={handleVerify} />
          ) : (
            <GifCaptcha key={`gif-${key}`} onVerify={handleVerify} />
          )}
        </div>
      </div>
    </div>
  );
}

export default App;