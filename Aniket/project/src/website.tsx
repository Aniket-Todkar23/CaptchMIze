import React, { useState, useEffect } from 'react';
import { Shield, MousePointerClick, Users, ChevronDown, ChevronLeft, ChevronRight, Lock, ShieldCheck, Bot, Linkedin, X } from 'lucide-react';

// Simplified Galaxy Background
function GalaxyBackground() {
  useEffect(() => {
    const createStar = () => {
      const star = document.createElement('div');
      star.className = 'star';
      star.style.width = `${Math.random() * 2}px`;
      star.style.height = star.style.width;
      star.style.left = `${Math.random() * window.innerWidth}px`;
      star.style.setProperty('--duration', `${8 + Math.random() * 12}s`);
      return star;
    };

    const stars = document.querySelector('.stars');
    
    // Initial stars
    for (let i = 0; i < 100; i++) {
      const star = createStar();
      star.style.top = `${Math.random() * 100}vh`;
      stars?.appendChild(star);
    }

    const interval = setInterval(() => {
      const star = createStar();
      star.style.top = '100vh';
      stars?.appendChild(star);
      setTimeout(() => star.remove(), 20000);
    }, 200);

    return () => clearInterval(interval);
  }, []);

  return <div className="stars" />;
}

// Simplified Dialog Box
function DialogBox({ isOpen, onClose, url, showNotification }) {
  const [isLoading, setIsLoading] = useState(true);
  const [isVerified, setIsVerified] = useState(false);
  
  useEffect(() => {
    const handleMessage = (event) => {
      if (event.data === 'verification-successful') {
        setIsVerified(true);
        if (showNotification) {
          showNotification('Verification successful!', 'success');
        }
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
          <button onClick={onClose} className="p-2 rounded-full hover:bg-slate-700 transition-colors">
            <X className="w-5 h-5 text-gray-400" />
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
          <button onClick={onClose} className="px-4 py-2 text-sm bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-colors">
            Close Demo
          </button>
        </div>
      </div>
    </div>
  );
}

// Simplified Image Slider with corrected URLs
function ImageSlider() {
  const [currentIndex, setCurrentIndex] = useState(0);

  const images = [
    { url: "https://i.postimg.cc/ygTfxLNp/photo-1555949963-aa79dcee981c.avif" },
    { url: "https://i.postimg.cc/n9c3DqjF/photo-1563986768609-322da13575f3.avif" },
    { url: "https://i.postimg.cc/YG7nt5tm/photo-1510511459019-5dda7724fd87.avif" },
    { url: "https://i.postimg.cc/ZCnfYFzj/photo-1614064641938-3bbee52942c7.avif" },
    { url: "https://i.postimg.cc/hhSy6RCk/photo-1526374965328-7f61d4dc18c5.avif" }
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex === images.length - 1 ? 0 : prevIndex + 1));
    }, 4000);
    return () => clearInterval(timer);
  }, []);

  const nextSlide = () => setCurrentIndex((prevIndex) => (prevIndex === images.length - 1 ? 0 : prevIndex + 1));
  const prevSlide = () => setCurrentIndex((prevIndex) => (prevIndex === 0 ? images.length - 1 : prevIndex - 1));

  return (
    <div className="relative overflow-hidden rounded-xl shadow-2xl h-[400px]">
      <div 
        className="flex h-full transition-transform duration-700 ease-in-out"
        style={{ transform: `translateX(-${currentIndex * 100}%)` }}
      >
        {images.map((image, index) => (
          <img key={index} src={image.url} alt={`Slide ${index + 1}`} className="min-w-full h-full object-cover" />
        ))}
      </div>
      
      <div className="absolute inset-0 bg-gradient-to-r from-slate-900/50 to-transparent" />
      
      <button onClick={prevSlide} className="absolute left-4 top-1/2 -translate-y-1/2 p-2 bg-black/50 text-white rounded-full hover:bg-black/70 transition">
        <ChevronLeft className="w-6 h-6" />
      </button>
      <button onClick={nextSlide} className="absolute right-4 top-1/2 -translate-y-1/2 p-2 bg-black/50 text-white rounded-full hover:bg-black/70 transition">
        <ChevronRight className="w-6 h-6" />
      </button>

      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex space-x-2">
        {images.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentIndex(index)}
            className={`w-2 h-2 rounded-full transition-all ${index === currentIndex ? 'bg-white w-4' : 'bg-white/50'}`}
          />
        ))}
      </div>
    </div>
  );
}

// Simplified Team Member Component
function TeamMember({ name, role, image, linkedin }) {
  return (
    <div className="bg-slate-800/50 p-6 rounded-xl shadow-lg backdrop-blur-sm hover:transform hover:scale-105 transition-all">
      <div className="text-center">
        <img src={image} alt={name} className="w-32 h-32 rounded-full mx-auto mb-4 object-cover" />
        <h3 className="text-xl font-semibold text-white mb-2">{name}</h3>
        <p className="text-gray-400 mb-4">{role}</p>
        <a href={linkedin} target="_blank" rel="noopener noreferrer" className="inline-flex items-center space-x-2 text-blue-400 hover:text-blue-300 transition-colors">
          <Linkedin className="w-5 h-5" />
          <span>LinkedIn</span>
        </a>
      </div>
    </div>
  );
}

// Main App
function App() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const demoUrl = "https://captchamize.vercel.app/";
  const [notification, setNotification] = useState({ show: false, message: '', type: 'success' });
  
  const showNotification = (message, type = 'success') => {
    setNotification({ show: true, message, type });
    setTimeout(() => setNotification(prev => ({ ...prev, show: false })), 5000);
  };
  
  useEffect(() => {
    const handleCaptchaMessage = (event) => {
      if (event.data && typeof event.data === 'string') {
        if (event.data === 'verification-successful') {
          showNotification('Verification successful!', 'success');
          setTimeout(() => setIsDialogOpen(false), 5000);
        } else if (event.data.includes('alert') || event.data.includes('error')) {
          showNotification('Received message from captcha: ' + event.data, 'error');
        }
      }
    };
    
    window.addEventListener('message', handleCaptchaMessage);
    return () => window.removeEventListener('message', handleCaptchaMessage);
  }, []);

  // Updated teamMembers with proper image formats
  const teamMembers = [
    {
      name: "Aniket Todkar",
      role: "Full Stack Developer",
      image: "https://i.postimg.cc/ZWwYH8Ng/1707634010143.jpg",
      linkedin: "https://linkedin.com/in/aniket-todkar-313260288"
    },
    {
      name: "Prasad Umbarkar",
      role: "Backend Developer",
      image: "https://i.postimg.cc/DSvy1jSL/1707651963072.jpg",
      linkedin: "https://linkedin.com/in/prasad-umbarkar-55140928a"
    },
    {
      name: "Soham Gogowale",
      role: "Frontend Developer",
      image: "/api/placeholder/300/300",
      linkedin: "https://linkedin.com/in/soham-gogawale-155252291"
    },
    {
      name: "Yash Shah",
      role: "UI/UX Designer",
      image: "/api/placeholder/300/300",
      linkedin: "https://www.linkedin.com/in/yash-shah"
    }
  ];

  return (
    <div className="min-h-screen galaxy-background">
      <GalaxyBackground />
      <DialogBox isOpen={isDialogOpen} onClose={() => setIsDialogOpen(false)} url={demoUrl} showNotification={showNotification} />
      
      {notification.show && (
        <div className={`fixed top-4 left-1/2 transform -translate-x-1/2 px-4 py-3 rounded-lg shadow-lg z-50 flex items-center space-x-2 transition-all duration-300 ${
          notification.type === 'success' ? 'bg-green-600 text-white' : 'bg-red-600 text-white'
        }`}>
          <p className="font-medium">{notification.message}</p>
        </div>
      )}
      
      <nav className="fixed w-full bg-slate-900/80 backdrop-blur-sm z-40 border-b border-slate-700/50 shadow-lg">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <a href="#home" className="flex items-center space-x-2 group">
              <Lock className="w-8 h-8 text-blue-500 group-hover:scale-110 transition-transform" />
              <span className="text-2xl font-bold text-white group-hover:text-blue-500 transition-colors">Captchamize</span>
            </a>
            <div className="hidden md:flex space-x-8">
              {['Home', 'Try CAPTCHA', 'Features', 'Contact'].map((label, i) => (
                <a key={i} href={`#${label.toLowerCase().replace(' ', '-')}`} className="text-gray-300 hover:text-white hover:scale-105 transition-all">
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
                Advanced bot protection with a human touch. Our AI-powered CAPTCHA system keeps your website secure.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center md:justify-start">
                <button 
                  className="px-8 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 hover:scale-105 transition-all"
                  onClick={() => setIsDialogOpen(true)}
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

      <section id="try-captcha" className="py-20 px-4 relative">
        <div className="container mx-auto max-w-6xl">
          <h2 className="text-3xl md:text-4xl font-bold text-white text-center mb-6">
            Experience Our CAPTCHA
          </h2>
          <p className="text-gray-300 text-center mb-12 max-w-2xl mx-auto">
            Try our next-generation CAPTCHA system that combines security with simplicity.
          </p>
          
          <div className="text-center mt-6 mb-12">
            <button 
              onClick={() => setIsDialogOpen(true)}
              className="px-8 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 hover:scale-105 transition-all flex items-center gap-2 mx-auto"
            >
              Try Full Demo
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              { icon: Shield, title: "Advanced Security", desc: "AI-powered protection against sophisticated bot attacks." },
              { icon: MousePointerClick, title: "User Friendly", desc: "Simple verification process that takes seconds to complete." },
              { icon: Bot, title: "Bot Detection", desc: "Advanced algorithms to detect and block automated bot traffic." }
            ].map((item, i) => (
              <div key={i} className="bg-slate-800/50 p-6 rounded-xl shadow-lg backdrop-blur-sm hover:transform hover:scale-105 transition-all">
                <item.icon className="w-12 h-12 text-blue-500 mb-4" />
                <h3 className="text-xl font-semibold text-white mb-2">{item.title}</h3>
                <p className="text-gray-300">{item.desc}</p>
              </div>
            ))}
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
                    <h3 className="text-lg font-semibold text-white mb-2">Feature {i}</h3>
                    <p className="text-gray-400">Advanced security feature description goes here.</p>
                  </div>
                </div>
              </div>
            ))}
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

      <section id="contact" className="py-12 px-4 relative">
        <div className="container mx-auto max-w-lg text-center">
          <h2 className="text-2xl font-bold text-white mb-4">Need Help?</h2>
          <p className="text-gray-400 mb-6">Contact our support team for assistance</p>
          <button className="px-8 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 hover:scale-105 transition-all">
            Contact Support
          </button>
        </div>
      </section>

      <footer className="bg-slate-900/80 backdrop-blur-sm py-8 px-4 relative">
        <div className="container mx-auto text-center text-gray-400">
          <p>&copy; 2025 Captchamize.All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}

export default App;