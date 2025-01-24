import React, { useEffect, useState } from 'react';
import { ShieldCheck, ShieldX, RefreshCw } from 'lucide-react';

interface GifCaptchaProps {
  onVerify: (isHuman: boolean) => void;
}

interface CaptchaData {
  gifUrl: string;
  correctAnswer: string;
  options: string[];
}

export function GifCaptcha({ onVerify }: GifCaptchaProps) {
  const [captchaData, setCaptchaData] = useState<CaptchaData | null>(null);
  const [selected, setSelected] = useState<string | null>(null);
  const [verified, setVerified] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const fetchNewCaptcha = async () => {
    try {
      setIsLoading(true);
      // Simulating API call with static categories
      const categories = ["vehicles", "animals", "sports", "buildings", "cartoons", "actions"];
      const correctAnswer = categories[Math.floor(Math.random() * categories.length)];
      const options = categories
        .filter(cat => cat !== correctAnswer)
        .sort(() => 0.5 - Math.random())
        .slice(0, 3);
      
      // Using Giphy API
      const GIPHY_API_KEY = "2rjciYoFCG2Hf5olBzHeGq7Y8townEkW";
      const response = await fetch(
        `https://api.giphy.com/v1/gifs/search?api_key=${GIPHY_API_KEY}&q=${correctAnswer}&limit=1`
      );
      const data = await response.json();
      const gifUrl = data.data[0].images.fixed_height.url;

      setCaptchaData({
        gifUrl,
        correctAnswer,
        options: [correctAnswer, ...options].sort(() => 0.5 - Math.random())
      });
      setSelected(null);
      setVerified(false);
    } catch (error) {
      console.error('Error fetching CAPTCHA:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchNewCaptcha();
  }, []);

  const handleOptionClick = (option: string) => {
    if (verified) return;
    
    setSelected(option);
    const isCorrect = option === captchaData?.correctAnswer;
    setVerified(true);
    onVerify(isCorrect);
  };

  if (!captchaData) {
    return <div className="animate-pulse bg-gray-200 rounded-lg w-full h-[300px]" />;
  }

  return (
    <div className="w-full max-w-[500px] bg-white rounded-xl shadow-lg p-6">
      <div className="flex flex-col items-center gap-4">
        <div className="relative w-full aspect-video rounded-lg overflow-hidden bg-gray-100">
          {isLoading ? (
            <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
              <RefreshCw className="w-8 h-8 text-gray-400 animate-spin" />
            </div>
          ) : (
            <img
              src={captchaData.gifUrl}
              alt="CAPTCHA GIF"
              className="w-full h-full object-cover"
            />
          )}
        </div>
        <div className="grid grid-cols-2 gap-3 w-full">
          {captchaData.options.map((option) => (
            <button
              key={option}
              onClick={() => handleOptionClick(option)}
              disabled={verified || isLoading}
              className={`
                px-4 py-2 rounded-lg text-sm font-medium transition-colors
                ${verified && option === selected
                  ? option === captchaData.correctAnswer
                    ? 'bg-green-100 text-green-700 border-2 border-green-500'
                    : 'bg-red-100 text-red-700 border-2 border-red-500'
                  : verified
                  ? 'bg-gray-100 text-gray-500 cursor-not-allowed'
                  : 'bg-white border-2 border-gray-200 hover:border-blue-500 text-gray-700'
                }
                ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}
              `}
            >
              {option}
            </button>
          ))}
        </div>
        {verified && (
          <div className={`flex items-center gap-2 ${
            selected === captchaData.correctAnswer ? 'text-green-600' : 'text-red-600'
          }`}>
            {selected === captchaData.correctAnswer ? (
              <>
                <ShieldCheck className="w-5 h-5" />
                <span className="font-medium">Correct!</span>
              </>
            ) : (
              <>
                <ShieldX className="w-5 h-5" />
                <span className="font-medium">Incorrect, try again!</span>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}