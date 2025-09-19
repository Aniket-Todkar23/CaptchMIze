import React, { useState } from 'react';
import { RefreshCw } from 'lucide-react';

const CaptchaDisplay = ({ 
  captchaData, 
  selectedAnswer, 
  onAnswerChange, 
  onRefresh, 
  loading 
}) => {
  const [textInput, setTextInput] = useState('');

  if (!captchaData) {
    return (
      <div className="text-center py-8">
        <div className="w-8 h-8 border-2 border-blue-500/30 border-t-blue-500 rounded-full animate-spin mx-auto mb-2"></div>
        <p className="text-sm text-gray-400">Loading captcha...</p>
      </div>
    );
  }

  const handleTextInputChange = (e) => {
    const value = e.target.value;
    setTextInput(value);
    onAnswerChange(value);
  };

  const handleOptionSelect = (option) => {
    onAnswerChange(option);
  };

  const renderCaptchaContent = () => {
    switch (captchaData.type) {
      case 'gif':
        return (
          <div className="space-y-3">
            <div className="text-center">
              <img
                src={captchaData.mediaUrl}
                alt="Captcha GIF"
                className="mx-auto rounded-lg max-h-32 object-contain bg-slate-900"
              />
              <p className="text-xs text-gray-400 mt-2">{captchaData.question}</p>
            </div>
            <div className="grid grid-cols-2 gap-2">
              {captchaData.options.map((option) => (
                <button
                  key={option}
                  type="button"
                  onClick={() => handleOptionSelect(option)}
                  className={`p-2 text-sm rounded-lg border transition-all ${
                    selectedAnswer === option
                      ? 'bg-blue-500 text-white border-blue-500'
                      : 'bg-slate-700 text-gray-300 border-slate-600 hover:border-slate-500'
                  }`}
                >
                  {option.charAt(0).toUpperCase() + option.slice(1)}
                </button>
              ))}
            </div>
          </div>
        );

      case 'image':
        return (
          <div className="space-y-3">
            <div className="text-center">
              <img
                src={captchaData.mediaUrl}
                alt="Captcha Image"
                className="mx-auto rounded-lg max-h-40 object-cover bg-slate-900"
              />
              <p className="text-xs text-gray-400 mt-2">{captchaData.question}</p>
            </div>
            <div className="grid grid-cols-2 gap-2">
              {captchaData.options.map((option) => (
                <button
                  key={option}
                  type="button"
                  onClick={() => handleOptionSelect(option)}
                  className={`p-2 text-sm rounded-lg border transition-all ${
                    selectedAnswer === option
                      ? 'bg-blue-500 text-white border-blue-500'
                      : 'bg-slate-700 text-gray-300 border-slate-600 hover:border-slate-500'
                  }`}
                >
                  {option.charAt(0).toUpperCase() + option.slice(1)}
                </button>
              ))}
            </div>
          </div>
        );

      case 'text':
        return (
          <div className="space-y-3">
            {captchaData.mediaUrl && (
              <div className="text-center">
                <img
                  src={captchaData.mediaUrl}
                  alt="Text Captcha"
                  className="mx-auto rounded-lg bg-slate-900 border border-slate-600"
                />
              </div>
            )}
            <div className="text-center">
              <p className="text-sm text-gray-300 mb-3">{captchaData.question}</p>
              <input
                type="text"
                value={textInput}
                onChange={handleTextInputChange}
                placeholder="Enter your answer"
                className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
        );

      case 'math':
        return (
          <div className="space-y-3">
            <div className="text-center">
              <div className="bg-slate-900 border border-slate-600 rounded-lg p-4 mb-3">
                <p className="text-lg font-mono text-white">{captchaData.question}</p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2">
              {captchaData.options.map((option) => (
                <button
                  key={option}
                  type="button"
                  onClick={() => handleOptionSelect(option)}
                  className={`p-3 text-lg font-mono rounded-lg border transition-all ${
                    selectedAnswer === option
                      ? 'bg-blue-500 text-white border-blue-500'
                      : 'bg-slate-700 text-gray-300 border-slate-600 hover:border-slate-500'
                  }`}
                >
                  {option}
                </button>
              ))}
            </div>
          </div>
        );

      case 'puzzle':
        return (
          <div className="space-y-3">
            <div className="text-center">
              <div className="bg-slate-900 border border-slate-600 rounded-lg p-4 mb-3">
                <p className="text-sm text-white">{captchaData.question}</p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2">
              {captchaData.options.map((option) => (
                <button
                  key={option}
                  type="button"
                  onClick={() => handleOptionSelect(option)}
                  className={`p-2 text-sm rounded-lg border transition-all ${
                    selectedAnswer === option
                      ? 'bg-blue-500 text-white border-blue-500'
                      : 'bg-slate-700 text-gray-300 border-slate-600 hover:border-slate-500'
                  }`}
                >
                  {option}
                </button>
              ))}
            </div>
          </div>
        );

      default:
        return (
          <div className="text-center py-4">
            <p className="text-gray-400">Unsupported captcha type: {captchaData.type}</p>
          </div>
        );
    }
  };

  return (
    <div className="border border-slate-600 rounded-lg p-4">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center space-x-2">
          <label className="block text-sm font-medium text-gray-300">
            Security Verification
          </label>
          {captchaData.type && (
            <span className="text-xs px-2 py-1 bg-blue-500/20 text-blue-400 rounded-full">
              {captchaData.type.toUpperCase()}
            </span>
          )}
        </div>
        <button
          type="button"
          onClick={onRefresh}
          disabled={loading}
          className="p-1 text-gray-400 hover:text-white transition-colors"
          title="Refresh captcha"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {renderCaptchaContent()}
    </div>
  );
};

export default CaptchaDisplay;