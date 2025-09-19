const axios = require('axios');
const { createCanvas, loadImage } = require('canvas');

// CAPTCHA Types
const CAPTCHA_TYPES = {
  GIF: 'gif',
  IMAGE: 'image', 
  TEXT: 'text',
  MATH: 'math',
  PUZZLE: 'puzzle'
};

// Categories for GIF and Image captchas
const categories = ["vehicles", "animals", "sports", "buildings", "cartoons", "actions"];

// Giphy API Key
const GIPHY_API_KEY = "2rjciYoFCG2Hf5olBzHeGq7Y8townEkW";

// Cache for used content
const usedGifIds = new Set();
const usedImageIds = new Set();

class CaptchaService {
  constructor() {
    this.initializeService();
  }

  async initializeService() {
    console.log('🎯 Captcha Service initialized with multiple types');
  }

  // Get random captcha type
  getRandomCaptchaType() {
    const types = Object.values(CAPTCHA_TYPES);
    return types[Math.floor(Math.random() * types.length)];
  }

  // Get random category
  getRandomCategory() {
    return categories[Math.floor(Math.random() * categories.length)];
  }

  // Generate captcha based on type
  async generateCaptcha(requestedType = null) {
    const captchaType = requestedType || this.getRandomCaptchaType();
    
    console.log(`🎲 Generating ${captchaType.toUpperCase()} captcha`);

    switch (captchaType) {
      case CAPTCHA_TYPES.GIF:
        return await this.generateGifCaptcha();
      case CAPTCHA_TYPES.IMAGE:
        return await this.generateImageCaptcha();
      case CAPTCHA_TYPES.TEXT:
        return await this.generateTextCaptcha();
      case CAPTCHA_TYPES.MATH:
        return await this.generateMathCaptcha();
      case CAPTCHA_TYPES.PUZZLE:
        return await this.generatePuzzleCaptcha();
      default:
        return await this.generateGifCaptcha(); // Fallback to GIF
    }
  }

  // GIF Captcha (existing implementation)
  async generateGifCaptcha(retryCount = 0) {
    const maxRetries = 3;
    const timeout = 10000;
    const category = this.getRandomCategory();
    
    try {
      const response = await axios.get(
        `https://api.giphy.com/v1/gifs/search?api_key=${GIPHY_API_KEY}&q=${category}&limit=10`,
        { timeout }
      );

      if (!response.data || !response.data.data || response.data.data.length === 0) {
        throw new Error(`No GIFs found for category: ${category}`);
      }

      const gifList = response.data.data.filter((gif) => !usedGifIds.has(gif.id));

      let gifData;
      if (gifList.length === 0) {
        if (retryCount < maxRetries) {
          usedGifIds.clear();
          return this.generateGifCaptcha(retryCount + 1);
        } else {
          gifData = response.data.data[0];
        }
      } else {
        gifData = gifList[0];
        usedGifIds.add(gifData.id);
      }

      // Generate options
      const correctAnswer = category;
      const options = [...categories.filter((cat) => cat !== category)];
      options.sort(() => 0.5 - Math.random());
      const allOptions = [correctAnswer, ...options.slice(0, 3)];
      allOptions.sort(() => 0.5 - Math.random());

      return {
        type: CAPTCHA_TYPES.GIF,
        mediaUrl: gifData.images.fixed_height.url,
        question: "What category does this GIF belong to?",
        options: allOptions,
        correctAnswer: correctAnswer,
        metadata: {
          giphyId: gifData.id,
          category: category
        }
      };

    } catch (error) {
      console.error(`Error generating GIF captcha (attempt ${retryCount + 1}):`, error.message);
      
      if (retryCount < maxRetries) {
        await new Promise(resolve => setTimeout(resolve, 1000 * (retryCount + 1)));
        return this.generateGifCaptcha(retryCount + 1);
      }
      
      throw new Error(`Failed to generate GIF captcha: ${error.message}`);
    }
  }

  // Static Image Captcha
  async generateImageCaptcha() {
    const category = this.getRandomCategory();
    
    try {
      // Use Unsplash API for high-quality images
      const response = await axios.get(
        `https://source.unsplash.com/400x300/?${category}`,
        { 
          timeout: 10000,
          responseType: 'arraybuffer',
          maxRedirects: 5
        }
      );

      // Convert buffer to base64 for easy transport
      const imageBuffer = Buffer.from(response.data);
      const base64Image = `data:image/jpeg;base64,${imageBuffer.toString('base64')}`;

      // Generate options
      const correctAnswer = category;
      const options = [...categories.filter((cat) => cat !== category)];
      options.sort(() => 0.5 - Math.random());
      const allOptions = [correctAnswer, ...options.slice(0, 3)];
      allOptions.sort(() => 0.5 - Math.random());

      return {
        type: CAPTCHA_TYPES.IMAGE,
        mediaUrl: base64Image,
        question: "What is the main subject of this image?",
        options: allOptions,
        correctAnswer: correctAnswer,
        metadata: {
          category: category,
          source: 'unsplash'
        }
      };

    } catch (error) {
      console.error('Error generating image captcha:', error.message);
      // Fallback to GIF captcha
      return this.generateGifCaptcha();
    }
  }

  // Text-based Captcha
  async generateTextCaptcha() {
    const words = ['SECURE', 'VERIFY', 'HUMAN', 'ACCESS', 'UNLOCK', 'GUARD', 'SHIELD', 'TRUST'];
    const word = words[Math.floor(Math.random() * words.length)];
    
    try {
      // Create distorted text image
      const canvas = createCanvas(200, 80);
      const ctx = canvas.getContext('2d');

      // Background with noise
      ctx.fillStyle = '#f0f0f0';
      ctx.fillRect(0, 0, 200, 80);

      // Add noise
      for (let i = 0; i < 50; i++) {
        ctx.fillStyle = `hsl(${Math.random() * 360}, 50%, 80%)`;
        ctx.fillRect(Math.random() * 200, Math.random() * 80, 2, 2);
      }

      // Add lines
      for (let i = 0; i < 5; i++) {
        ctx.strokeStyle = `hsl(${Math.random() * 360}, 50%, 70%)`;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(Math.random() * 200, Math.random() * 80);
        ctx.lineTo(Math.random() * 200, Math.random() * 80);
        ctx.stroke();
      }

      // Draw distorted text
      ctx.fillStyle = '#333';
      ctx.font = '28px Arial';
      ctx.textAlign = 'center';
      
      // Add character distortion
      for (let i = 0; i < word.length; i++) {
        const x = 30 + i * 25 + Math.random() * 10 - 5;
        const y = 45 + Math.random() * 10 - 5;
        const rotation = (Math.random() - 0.5) * 0.5;
        
        ctx.save();
        ctx.translate(x, y);
        ctx.rotate(rotation);
        ctx.fillText(word[i], 0, 0);
        ctx.restore();
      }

      const base64Image = canvas.toDataURL();

      return {
        type: CAPTCHA_TYPES.TEXT,
        mediaUrl: base64Image,
        question: "Enter the text shown in the image",
        inputType: "text",
        correctAnswer: word.toLowerCase(),
        metadata: {
          originalWord: word,
          caseSensitive: false
        }
      };

    } catch (error) {
      console.error('Error generating text captcha:', error.message);
      // Fallback to simple text captcha
      return {
        type: CAPTCHA_TYPES.TEXT,
        question: `What comes after "${word.slice(0, -1)}" in the word "${word}"?`,
        inputType: "text",
        correctAnswer: word.slice(-1).toLowerCase(),
        metadata: {
          originalWord: word,
          caseSensitive: false
        }
      };
    }
  }

  // Math Captcha
  async generateMathCaptcha() {
    const operations = ['+', '-', '*'];
    const operation = operations[Math.floor(Math.random() * operations.length)];
    
    let num1, num2, correctAnswer, question;

    switch (operation) {
      case '+':
        num1 = Math.floor(Math.random() * 20) + 1;
        num2 = Math.floor(Math.random() * 20) + 1;
        correctAnswer = num1 + num2;
        question = `What is ${num1} + ${num2}?`;
        break;
      case '-':
        num1 = Math.floor(Math.random() * 30) + 10;
        num2 = Math.floor(Math.random() * num1) + 1;
        correctAnswer = num1 - num2;
        question = `What is ${num1} - ${num2}?`;
        break;
      case '*':
        num1 = Math.floor(Math.random() * 10) + 1;
        num2 = Math.floor(Math.random() * 10) + 1;
        correctAnswer = num1 * num2;
        question = `What is ${num1} × ${num2}?`;
        break;
    }

    // Generate wrong options
    const wrongOptions = [];
    for (let i = 0; i < 3; i++) {
      let wrongAnswer;
      do {
        wrongAnswer = correctAnswer + (Math.floor(Math.random() * 10) - 5);
      } while (wrongAnswer === correctAnswer || wrongAnswer < 0 || wrongOptions.includes(wrongAnswer));
      wrongOptions.push(wrongAnswer);
    }

    const allOptions = [correctAnswer, ...wrongOptions];
    allOptions.sort(() => 0.5 - Math.random());

    return {
      type: CAPTCHA_TYPES.MATH,
      question: question,
      options: allOptions.map(String),
      correctAnswer: String(correctAnswer),
      metadata: {
        operation: operation,
        operands: [num1, num2]
      }
    };
  }

  // Puzzle Captcha
  async generatePuzzleCaptcha() {
    const puzzles = [
      {
        question: "Complete the sequence: 2, 4, 6, 8, ?",
        options: ["9", "10", "11", "12"],
        correct: "10"
      },
      {
        question: "Which is the odd one out?",
        options: ["Apple", "Banana", "Cherry", "Carrot"],
        correct: "Carrot"
      },
      {
        question: "If today is Monday, what day was it 3 days ago?",
        options: ["Thursday", "Friday", "Saturday", "Sunday"],
        correct: "Friday"
      },
      {
        question: "How many sides does a triangle have?",
        options: ["2", "3", "4", "5"],
        correct: "3"
      },
      {
        question: "What color do you get mixing red and blue?",
        options: ["Green", "Purple", "Yellow", "Orange"],
        correct: "Purple"
      }
    ];

    const puzzle = puzzles[Math.floor(Math.random() * puzzles.length)];

    return {
      type: CAPTCHA_TYPES.PUZZLE,
      question: puzzle.question,
      options: puzzle.options,
      correctAnswer: puzzle.correct,
      metadata: {
        puzzleType: 'logical'
      }
    };
  }

  // Verify captcha answer
  verifyCaptcha(captchaData, userAnswer) {
    if (!captchaData || !captchaData.correctAnswer) {
      return false;
    }

    const correctAnswer = captchaData.correctAnswer.toLowerCase().trim();
    const userAnswerNormalized = userAnswer.toLowerCase().trim();

    // Handle different captcha types
    switch (captchaData.type) {
      case CAPTCHA_TYPES.TEXT:
        // Text captchas might be case-insensitive
        return userAnswerNormalized === correctAnswer;
      
      case CAPTCHA_TYPES.MATH:
        // Math answers should be exact
        return userAnswer.toString().trim() === captchaData.correctAnswer.toString();
      
      default:
        // For GIF, IMAGE, and PUZZLE captchas
        return userAnswerNormalized === correctAnswer;
    }
  }
}

module.exports = CaptchaService;