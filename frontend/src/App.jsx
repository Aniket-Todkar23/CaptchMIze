import React, { useState, useEffect } from 'react';
import { Shield, MousePointerClick, Users, ChevronDown, ChevronLeft, ChevronRight, Lock, ShieldCheck, Bot, Linkedin, X } from 'lucide-react';
import { CheckCircle, XCircle } from 'lucide-react'; // Added missing import
import DeveloperPortal from './components/DeveloperPortal';
import DemoLogin from './components/DemoLogin';
import DemoDashboard from './components/DemoDashboard';

// Galaxy Background Component
function GalaxyBackground() {
  useEffect(() => {
    const createStar = () => {
      const star = document.createElement('div');
      star.className = 'star';
      
      // Random star properties with slower animation
      const size = Math.random() * 2;
      const duration = 8 + Math.random() * 12; // Increased duration for slower movement
      const left = Math.random() * window.innerWidth;
      
      star.style.width = `${size}px`;
      star.style.height = `${size}px`;
      star.style.left = `${left}px`;
      star.style.setProperty('--duration', `${duration}s`);
      
      return star;
    };

    const stars = document.querySelector('.stars');
    const starCount = 100; // Reduced star count

    // Initial stars
    for (let i = 0; i < starCount; i++) {
      const star = createStar();
      star.style.top = `${Math.random() * 100}vh`;
      stars?.appendChild(star);
    }

    // Continuous star creation with longer interval
    const interval = setInterval(() => {
      const star = createStar();
      star.style.top = '100vh';
      stars?.appendChild(star);

      // Remove star after animation
      setTimeout(() => {
        star.remove();
      }, 20000); // Increased timeout
    }, 200); // Increased interval

    return () => {
      clearInterval(interval);
    };
  }, []);

  return <div className="stars" />;
}

function DialogBox({ isOpen, onClose, url, showNotification }) {
  const [isLoading, setIsLoading] = useState(true);
  const [isVerified, setIsVerified] = useState(false);
  
  useEffect(() => {
    // Listen for messages from the iframe to detect successful verification
    const handleMessage = (event) => {
      // Make sure origin is trusted
      if (event.data === 'verification-successful') {
        setIsVerified(true);
        // Show success notification
        if (showNotification) {
          showNotification('Verification successful!', 'success');
        }
        // Dialog will close automatically after 5 seconds via the notification effect
      }
    };
    
    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [onClose, showNotification]);
  
  if (!isOpen) return null;
  
  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4 animate-fadeIn">
      <div className="bg-slate-800 rounded-xl shadow-2xl w-full max-w-4xl overflow-hidden flex flex-col h-[90vh] border border-slate-700">
        <div className="flex items-center justify-between p-4 bg-slate-900 border-b border-slate-700">
          <div className="flex items-center space-x-3">
            <div className="bg-blue-500/20 p-2 rounded-lg">
              <Lock className="w-5 h-5 text-blue-500" />
            </div>
            <h3 className="text-xl font-semibold text-white">Captchamize Demo</h3>
          </div>
          <button 
            onClick={onClose}
            className="p-2 rounded-full hover:bg-slate-700 transition-colors group"
          >
            <X className="w-5 h-5 text-gray-400 group-hover:text-white" />
          </button>
        </div>
        
        <div className="flex-1 relative">
          {isLoading && (
            <div className="absolute inset-0 flex items-center justify-center bg-slate-800 z-10">
              <div className="flex flex-col items-center">
                <div className="w-16 h-16 relative">
                  <div className="w-16 h-16 border-4 border-blue-500/30 border-t-blue-500 rounded-full animate-spin"></div>
                  <Shield className="w-6 h-6 text-blue-500 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2" />
                </div>
                <p className="mt-4 text-gray-300">Loading secure environment...</p>
              </div>
            </div>
          )}
          
          {isVerified && (
            <div className="absolute inset-0 flex items-center justify-center bg-slate-800/90 z-20 animate-fadeIn">
              <div className="flex flex-col items-center bg-slate-900 p-8 rounded-xl border border-green-500/30">
                <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mb-4">
                  <ShieldCheck className="w-10 h-10 text-green-500" />
                </div>
                <h3 className="text-xl font-semibold text-white mb-2">Verification Successful!</h3>
                <p className="text-gray-300 text-center">You have been verified as human.</p>
              </div>
            </div>
          )}
          
          <iframe
            src={url}
            title="Captchamize Demo"
            className="w-full h-full border-0"
            onLoad={() => setIsLoading(false)}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          ></iframe>
        </div>
        
        <div className="p-4 bg-slate-900 border-t border-slate-700 flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <div className={`w-2 h-2 rounded-full ${isLoading ? 'bg-yellow-500 animate-pulse' : 'bg-green-500'}`}></div>
            <span className="text-sm text-gray-400">
              {isLoading ? 'Establishing secure connection...' : 'Connection secure'}
            </span>
          </div>
          <button 
            onClick={onClose}
            className="px-4 py-2 text-sm bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-colors"
          >
            Close Demo
          </button>
        </div>
      </div>
    </div>
  );
}

function ImageSlider() {
  const [currentIndex, setCurrentIndex] = useState(0);

  const images = [
    {
      url: "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&w=1200&h=400&q=80",
      alt: "Digital Security"
    },
    {
      url: "https://images.unsplash.com/photo-1563986768494-4dee2763ff3f?auto=format&fit=crop&w=1200&h=400&q=80",
      alt: "Cybersecurity Protection"
    },
    {
      url: "https://images.unsplash.com/photo-1544197150-b99a580bb7a8?auto=format&fit=crop&w=1200&h=400&q=80",
      alt: "Network Security"
    },
    {
      url: "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&w=1200&h=400&q=80",
      alt: "Cyber Protection"
    },
    {
      url: "https://images.unsplash.com/photo-1614064641938-3bbee52942c7?auto=format&fit=crop&w=1200&h=400&q=80",
      alt: "Digital Matrix"
    }
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentIndex((prevIndex) => 
        prevIndex === images.length - 1 ? 0 : prevIndex + 1
      );
    }, 4000);

    return () => clearInterval(timer);
  }, [images.length]);

  const nextSlide = () => {
    setCurrentIndex((prevIndex) => 
      prevIndex === images.length - 1 ? 0 : prevIndex + 1
    );
  };

  const prevSlide = () => {
    setCurrentIndex((prevIndex) => 
      prevIndex === 0 ? images.length - 1 : prevIndex - 1
    );
  };

  return (
    <div className="relative overflow-hidden rounded-xl shadow-2xl h-96">
      <div 
        className="flex h-full transition-transform duration-700 ease-in-out"
        style={{ transform: `translateX(-${currentIndex * 100}%)` }}
      >
        {images.map((image, index) => (
          <img
            key={index}
            src={image.url}
            alt={image.alt}
            className="min-w-full h-full object-cover"
          />
        ))}
      </div>
      
      <div className="absolute inset-0 bg-gradient-to-r from-slate-900/50 to-transparent" />
      
      <button
        onClick={prevSlide}
        className="absolute left-4 top-1/2 -translate-y-1/2 p-2 bg-black/50 text-white rounded-full hover:bg-black/70 transition"
      >
        <ChevronLeft className="w-6 h-6" />
      </button>
      <button
        onClick={nextSlide}
        className="absolute right-4 top-1/2 -translate-y-1/2 p-2 bg-black/50 text-white rounded-full hover:bg-black/70 transition"
      >
        <ChevronRight className="w-6 h-6" />
      </button>

      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex space-x-2">
        {images.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentIndex(index)}
            className={`w-2 h-2 rounded-full transition-all ${
              index === currentIndex ? 'bg-white w-4' : 'bg-white/50'
            }`}
          />
        ))}
      </div>
    </div>
  );
}

function TeamMember({ name, role, image, linkedin }) {
  return (
    <div className="bg-slate-800/50 p-6 rounded-xl shadow-lg backdrop-blur-sm hover:transform hover:scale-105 transition-all">
      <div className="text-center">
        <img
          src="/api/placeholder/128/128"
          alt={name}
          className="w-32 h-32 rounded-full mx-auto mb-4 object-cover"
        />
        <h3 className="text-xl font-semibold text-white mb-2">{name}</h3>
        <p className="text-gray-400 mb-4">{role}</p>
        <a
          href={linkedin}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center space-x-2 text-blue-400 hover:text-blue-300 transition-colors"
        >
          <Linkedin className="w-5 h-5" />
          <span>LinkedIn</span>
        </a>
      </div>
    </div>
  );
}

function App() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const demoUrl = "https://captchamize.vercel.app/";
  const [notification, setNotification] = useState({
    show: false,
    message: '',
    type: 'success'
  });
  // Demo state management
  const [demoState, setDemoState] = useState('main'); // main, login, dashboard
  const [demoUser, setDemoUser] = useState(null);
  
  const openDialog = () => setIsDialogOpen(true);
  const closeDialog = () => setIsDialogOpen(false);

  // Demo navigation functions
  const startDemo = () => {
    setDemoState('login');
  };

  const handleDemoLogin = (userData) => {
    setDemoUser(userData);
    setDemoState('dashboard');
  };

  const handleDemoLogout = () => {
    setDemoUser(null);
    setDemoState('main');
    showNotification('Demo session ended. Thank you for trying our CAPTCHA API!', 'success');
  };

  const backToMain = () => {
    setDemoState('main');
  };

  // Function to show notifications
  const showNotification = (message, type = 'success') => {
    setNotification({
      show: true,
      message,
      type
    });
    
    // Set timeout to hide notification after 5 seconds
    setTimeout(() => {
      setNotification(prev => ({ ...prev, show: false }));
    }, 5000);
  };
  
  // Add event listener for messages from the captcha iframe
  useEffect(() => {
    const handleCaptchaMessage = (event) => {
      // Check if the message is from the captcha iframe
      if (event.data && typeof event.data === 'string') {
        if (event.data === 'verification-successful') {
          showNotification('Verification successful!', 'success');
          
          // Add timeout to close dialog after notification
          setTimeout(() => {
            closeDialog();
          }, 5000);
        } else if (event.data.includes('alert') || event.data.includes('error')) {
          // Handle any alert or error messages from the iframe
          showNotification('Received message from captcha: ' + event.data, 'error');
        }
      }
    };
    
    window.addEventListener('message', handleCaptchaMessage);
    return () => window.removeEventListener('message', handleCaptchaMessage);
  }, []);

  const teamMembers = [
    {
      name: "Aniket Todkar",
      role: "Full Stack Developer",
      image: "/api/placeholder/128/128",
      linkedin: "https://linkedin.com/in/aniket-todkar-313260288"
    },
    {
      name: "Prasad Umbarkar",
      role: "Backend Developer",
      image: "/api/placeholder/128/128",
      linkedin: "https://linkedin.com/in/prasad-umbarkar-55140928a"
    },
    {
      name: "Soham Gogowale",
      role: "Frontend Developer",
      image: "/api/placeholder/128/128",
      linkedin: "https://linkedin.com/in/soham-gogawale-155252291"
    },
    {
      name: "Yash Shah",
      role: "UI/UX Designer",
      image: "/api/placeholder/128/128",
      linkedin: "https://www.linkedin.com/in/yash-shah"
    }
  ];

  // Demo routing
  if (demoState === 'login') {
    return (
      <DemoLogin 
        onLoginSuccess={handleDemoLogin} 
        showNotification={showNotification} 
        onBack={backToMain}
      />
    );
  }

  if (demoState === 'dashboard') {
    return (
      <DemoDashboard 
        user={demoUser} 
        onLogout={handleDemoLogout} 
        showNotification={showNotification}
      />
    );
  }

  return (
    <div className="min-h-screen galaxy-background">
      <GalaxyBackground />
      
      <DialogBox 
        isOpen={isDialogOpen} 
        onClose={closeDialog} 
        url={demoUrl} 
        showNotification={showNotification}
      />
      
      {notification.show && (
        <div className={`fixed top-4 left-1/2 transform -translate-x-1/2 px-4 py-3 rounded-lg shadow-lg z-50 flex items-center space-x-2 transition-all duration-300 ${
          notification.type === 'success' ? 'bg-green-600 text-white' : 'bg-red-600 text-white'
        }`}>
          {notification.type === 'success' ? (
            <CheckCircle className="w-5 h-5" />
          ) : (
            <XCircle className="w-5 h-5" />
          )}
          <p className="font-medium">{notification.message}</p>
        </div>
      )}
      
      <nav className="fixed w-full bg-slate-900/80 backdrop-blur-sm z-40 border-b border-slate-700/50 shadow-lg">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <a 
              href="#home" 
              className="flex items-center space-x-2 group"
            >
              <Lock className="w-8 h-8 text-blue-500 group-hover:scale-110 transition-transform" />
              <span className="text-2xl font-bold text-white group-hover:text-blue-500 transition-colors">Captchamize</span>
            </a>
            <div className="hidden md:flex space-x-8">
              {[
                { href: '#home', label: 'Home' },
                { href: '#try', label: 'Try CAPTCHA' },
                { href: '#features', label: 'Features' },
                { href: '#developers', label: 'Developers' },
                { href: '#contact', label: 'Contact' }
              ].map(({ href, label }) => (
                <a
                  key={href}
                  href={href}
                  className="text-gray-300 hover:text-white hover:scale-105 transition-all duration-200 relative after:content-[''] after:absolute after:left-0 after:bottom-0 after:w-0 after:h-0.5 after:bg-blue-500 hover:after:w-full after:transition-all"
                >
                  {label}
                </a>
              ))}
            </div>
          </div>
        </div>
      </nav>

      <section id="home" className="pt-32 pb-20 px-4 relative">
        <div className="container mx-auto max-w-6xl">
          <div className="flex flex-col md:flex-row items-center justify-between gap-12">
            <div className="flex-1 text-center md:text-left">
              <h1 className="text-4xl md:text-5xl font-bold text-white mb-6 tracking-tight">
                Secure Your Site with <span className="text-blue-500">Smart CAPTCHA</span>
              </h1>
              <p className="text-lg text-gray-300 mb-8 leading-relaxed max-w-lg">
                Advanced bot protection with a human touch. Our CAPTCHA system keeps your website secure while providing a seamless user experience.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center md:justify-start">
                <button 
                  className="px-8 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 hover:scale-105 transition-all"
                  onClick={startDemo}
                >
                  Try Demo
                </button>
                <button className="px-8 py-3 border border-gray-600 text-white rounded-lg hover:border-blue-500 hover:text-blue-500 hover:scale-105 transition-all">
                  Learn More
                </button>
              </div>
            </div>
            <div className="flex-1">
              <ImageSlider />
            </div>
          </div>
        </div>
      </section>

      <section id="try" className="py-20 px-4 relative">
        <div className="container mx-auto max-w-6xl">
          <h2 className="text-3xl md:text-4xl font-bold text-white text-center mb-6">
            Experience Our CAPTCHA
          </h2>
          <p className="text-gray-300 text-center mb-12 max-w-2xl mx-auto">
            Try our next-generation CAPTCHA system that combines security with simplicity. Just slide to verify you're human.
          </p>
          
          <div className="text-center mt-6 mb-12">
            <button 
              onClick={startDemo}
              className="px-8 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 hover:scale-105 transition-all flex items-center gap-2 mx-auto"
            >
              Try Full Demo
              <ChevronRight className="w-5 h-5" />
            </button>
            <p className="text-gray-400 mt-4 text-sm">
              Access our complete demo without leaving this page
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-slate-800/50 p-6 rounded-xl shadow-lg backdrop-blur-sm hover:transform hover:scale-105 transition-all">
              <Shield className="w-12 h-12 text-blue-500 mb-4" />
              <h3 className="text-xl font-semibold text-white mb-2">Advanced Security</h3>
              <p className="text-gray-300">Protection against sophisticated bot attacks and automated threats.</p>
            </div>
            <div className="bg-slate-800/50 p-6 rounded-xl shadow-lg backdrop-blur-sm hover:transform hover:scale-105 transition-all">
              <MousePointerClick className="w-12 h-12 text-blue-500 mb-4" />
              <h3 className="text-xl font-semibold text-white mb-2">User Friendly</h3>
              <p className="text-gray-300">Simple, intuitive verification process that takes seconds to complete.</p>
            </div>
            <div className="bg-slate-800/50 p-6 rounded-xl shadow-lg backdrop-blur-sm hover:transform hover:scale-105 transition-all">
              <Bot className="w-12 h-12 text-blue-500 mb-4" />
              <h3 className="text-xl font-semibold text-white mb-2">Bot Detection</h3>
              <p className="text-gray-300">Advanced Behavioral analysis to detect and block automated bot traffic.</p>
            </div>
          </div>
        </div>
      </section>

      <section id="features" className="py-20 px-4 relative">
        <div className="container mx-auto max-w-6xl">
          <h2 className="text-3xl md:text-4xl font-bold text-white text-center mb-12">
            Why Choose Captchamize?
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <div key={i} className="bg-slate-800/50 p-6 rounded-xl shadow-lg backdrop-blur-sm hover:transform hover:scale-105 transition-all">
                    <div className="flex items-start space-x-4">
                      <div className="bg-blue-500/10 p-3 rounded-lg">
                        <Shield className="w-6 h-6 text-blue-500" />
                      </div>
                      <div>
                        {i === 1 && (
                          <>
                            <h3 className="text-lg font-semibold text-white mb-2">View Once Functionality</h3>
                            <p className="text-gray-400">Prevents OCR-based attacks by making CAPTCHA visible only once.</p>
                          </>
                        )}
                        {i === 2 && (
                          <>
                            <h3 className="text-lg font-semibold text-white mb-2">Real-time Mouse Tracking</h3>
                            <p className="text-gray-400">Analyzes behavioral patterns to detect automated bot activity.</p>
                          </>
                        )}
                        {i === 3 && (
                          <>
                            <h3 className="text-lg font-semibold text-white mb-2">Randomized CAPTCHA Type</h3>
                            <p className="text-gray-400">Dynamically changes CAPTCHA to prevent bots from learning patterns.</p>
                          </>
                        )}
                        {i === 4 && (
                          <>
                            <h3 className="text-lg font-semibold text-white mb-2">Screenshot Prevention</h3>
                            <p className="text-gray-400">Detects screenshots and blacks out the CAPTCHA screen.</p>
                          </>
                        )}
                        {i === 5 && (
                          <>
                            <h3 className="text-lg font-semibold text-white mb-2">Engaging Captchas</h3>
                            <p className="text-gray-400">Enhanced user experience for seamless captcha solving.</p>
                          </>
                        )}
                        {i === 6 && (
                          <>
                            <h3 className="text-lg font-semibold text-white mb-2">Device Tracking</h3>
                            <p className="text-gray-400">Monitors the device and adjusts the captcha accordingly.</p>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

        </div>
      </section>

      <section id="developers" className="py-20 px-4 relative">
        <div className="container mx-auto max-w-4xl">
          <h2 className="text-3xl md:text-4xl font-bold text-white text-center mb-6">
            For Developers
          </h2>
          <p className="text-gray-300 text-center mb-12 max-w-2xl mx-auto">
            Integrate our powerful CAPTCHA API into your applications. Get started in minutes with our simple REST API.
          </p>
          
          <DeveloperPortal showNotification={showNotification} />
          
          <div className="mt-12 grid md:grid-cols-3 gap-6">
            <div className="bg-slate-800/30 rounded-lg p-6 text-center">
              <div className="bg-blue-500/20 w-12 h-12 rounded-lg flex items-center justify-center mx-auto mb-4">
                <Shield className="w-6 h-6 text-blue-500" />
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">Easy Integration</h3>
              <p className="text-gray-400 text-sm">Simple REST API with comprehensive documentation and examples.</p>
            </div>
            <div className="bg-slate-800/30 rounded-lg p-6 text-center">
              <div className="bg-green-500/20 w-12 h-12 rounded-lg flex items-center justify-center mx-auto mb-4">
                <MousePointerClick className="w-6 h-6 text-green-500" />
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">High Performance</h3>
              <p className="text-gray-400 text-sm">Fast response times and 99.9% uptime with global CDN support.</p>
            </div>
            <div className="bg-slate-800/30 rounded-lg p-6 text-center">
              <div className="bg-purple-500/20 w-12 h-12 rounded-lg flex items-center justify-center mx-auto mb-4">
                <Bot className="w-6 h-6 text-purple-500" />
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">Advanced Analytics</h3>
              <p className="text-gray-400 text-sm">Detailed usage statistics and real-time monitoring dashboard.</p>
            </div>
          </div>
        </div>
      </section>

      <section id="team" className="py-20 px-4 relative">
        <div className="container mx-auto max-w-6xl">
          <h2 className="text-3xl md:text-4xl font-bold text-white text-center mb-12">
            Meet Our Team
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {teamMembers.map((member, index) => (
              <TeamMember key={index} {...member} />
            ))}
          </div>
        </div>
      </section>

      

      <footer className="bg-slate-900/80 backdrop-blur-sm py-8 px-4 relative">
        <div className="container mx-auto text-center text-gray-400">
          <p>&copy; 2025 Captchamize. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}

export default App;