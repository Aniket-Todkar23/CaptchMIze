import React, { useState } from 'react';
import { ScratchCaptcha } from './components/ScratchCaptcha';
import { ShieldCheck, ShieldX } from 'lucide-react';

export function App() {
  const [verificationResult, setVerificationResult] = useState<boolean | null>(null);

  const handleVerify = (isHuman: boolean) => {
    setVerificationResult(isHuman);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-lg w-full max-w-[500px] min-h-[200px] flex flex-col sm:flex-row items-center gap-6 sm:gap-4 p-6">
        <div className="flex-1 text-center sm:text-left">
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">Scratch CAPTCHA</h1>
          <p className="text-sm text-gray-600">
            Scratch the gray area within 4 secs to verify you're human
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
        </div>
        
        <div className="flex-shrink-0">
          <ScratchCaptcha onVerify={handleVerify} />
        </div>
      </div>
    </div>
  );
}

export default App;