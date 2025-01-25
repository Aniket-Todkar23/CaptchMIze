import React, { useState, useEffect } from 'react';
import { Shield, MousePointerClick, Users, ChevronDown, ChevronLeft, ChevronRight, Lock, ShieldCheck, Bot, Linkedin } from 'lucide-react';

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

function ImageSlider() {
  const [currentIndex, setCurrentIndex] = useState(0);

  const images = [
    {
      url: "https://images.unsplash.com/photo-1555949963-aa79dcee981c?auto=format&fit=crop&w=1200&q=80",
      alt: "Digital Security"
    },
    {
      url: "https://images.unsplash.com/photo-1563986768609-322da13575f3?auto=format&fit=crop&w=1200&q=80",
      alt: "Cybersecurity Protection"
    },
    {
      url: "https://images.unsplash.com/photo-1510511459019-5dda7724fd87?auto=format&fit=crop&w=1200&q=80",
      alt: "Network Security"
    },
    {
      url: "https://images.unsplash.com/photo-1614064641938-3bbee52942c7?auto=format&fit=crop&w=1200&q=80",
      alt: "Cyber Protection"
    },
    {
      url: "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&w=1200&q=80",
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
  }, []);

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
    <div className="relative overflow-hidden rounded-xl shadow-2xl h-[400px]">
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

function CaptchaDemo() {
  const [isVerified, setIsVerified] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [dragProgress, setDragProgress] = useState(0);

  const handleDragStart = () => setIsDragging(true);
  const handleDragEnd = () => {
    setIsDragging(false);
    if (dragProgress > 90) {
      setIsVerified(true);
    }
    setDragProgress(0);
  };

  const handleDrag = (e: { currentTarget: { getBoundingClientRect: () => any; }; clientX: number; }) => {
    if (isDragging) {
      const container = e.currentTarget.getBoundingClientRect();
      const x = e.clientX - container.left;
      const progress = (x / container.width) * 100;
      setDragProgress(Math.min(Math.max(progress, 0), 100));
    }
  };

  return (
    <div className="bg-slate-800/80 p-8 rounded-xl shadow-lg backdrop-blur-sm">
      {!isVerified ? (
        <div
          className="relative h-16 bg-slate-700 rounded-lg overflow-hidden cursor-pointer"
          onMouseDown={handleDragStart}
          onMouseUp={handleDragEnd}
          onMouseLeave={handleDragEnd}
          onMouseMove={handleDrag}
        >
          <div
            className="absolute inset-y-0 left-0 bg-blue-500 transition-all"
            style={{ width: `${dragProgress}%` }}
          />
          <div className="absolute inset-0 flex items-center justify-center text-white">
            Slide to verify
          </div>
        </div>
      ) : (
        <div className="flex items-center justify-center space-x-2 text-green-500">
          <ShieldCheck className="w-6 h-6" />
          <span>Verification successful!</span>
        </div>
      )}
    </div>
  );
}

function TeamMember({ name, role, image, linkedin }) {
  return (
    <div className="bg-slate-800/50 p-6 rounded-xl shadow-lg backdrop-blur-sm hover:transform hover:scale-105 transition-all">
      <div className="text-center">
        <img
          src={image}
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
  const teamMembers = [
    {
      name: "Aniket Todkar",
      role: "Full Stack Developer",
      image: "https://i.postimg.cc/ZWwYH8Ng/1707634010143.jpg[/img][/url]",
      linkedin: "https://linkedin.com/in/aniket-todkar-313260288"
    },
    {
      name: "Prasad Umbarkar",
      role: "Backend Developer",
      image: "https://i.postimg.cc/DSvy1jSL/1707651963072.jpg[/img][/url]",
      linkedin: "https://linkedin.com/in/prasad-umbarkar-55140928a"
    },
    {
      name: "Soham Gogowale",
      role: "Frontend Developer",
      image: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=300&q=80",
      linkedin: "https://linkedin.com/in/soham-gogawale-155252291"
    },
    {
      name: "Yash Shah",
      role: "UI/UX Designer",
      image: "https://images.unsplash.com/photo-1519345182560-3f2917c472ef?auto=format&fit=crop&w=300&q=80",
      linkedin: "https://www.linkedin.com/in/yash-shah"
    }
  ];

  return (
    <div className="min-h-screen galaxy-background">
      <GalaxyBackground />
      
      <nav className="fixed w-full bg-slate-900/80 backdrop-blur-sm z-50 border-b border-slate-700/50 shadow-lg">
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
                Advanced bot protection with a human touch. Our AI-powered CAPTCHA system keeps your website secure while providing a seamless user experience.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center md:justify-start">
                <button className="px-8 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 hover:scale-105 transition-all">
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
          
          <div className="max-w-md mx-auto mb-16">
            <CaptchaDemo />
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-slate-800/50 p-6 rounded-xl shadow-lg backdrop-blur-sm hover:transform hover:scale-105 transition-all">
              <Shield className="w-12 h-12 text-blue-500 mb-4" />
              <h3 className="text-xl font-semibold text-white mb-2">Advanced Security</h3>
              <p className="text-gray-300">AI-powered protection against sophisticated bot attacks and automated threats.</p>
            </div>
            <div className="bg-slate-800/50 p-6 rounded-xl shadow-lg backdrop-blur-sm hover:transform hover:scale-105 transition-all">
              <MousePointerClick className="w-12 h-12 text-blue-500 mb-4" />
              <h3 className="text-xl font-semibold text-white mb-2">User Friendly</h3>
              <p className="text-gray-300">Simple, intuitive verification process that takes seconds to complete.</p>
            </div>
            <div className="bg-slate-800/50 p-6 rounded-xl shadow-lg backdrop-blur-sm hover:transform hover:scale-105 transition-all">
              <Bot className="w-12 h-12 text-blue-500 mb-4" />
              <h3 className="text-xl font-semibold text-white mb-2">Bot Detection</h3>
              <p className="text-gray-300">Advanced algorithms to detect and block automated bot traffic.</p>
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
          <p>&copy; 2024 Captchamize. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}

export default App;