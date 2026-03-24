import React, { useState, useEffect } from 'react';
import { ArrowRight, Shield, Zap, Home, Sun, Moon } from 'lucide-react';
import { Link } from 'react-router-dom';

const Landing = () => {
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
      if (document.documentElement.classList.contains('dark')) {
          setIsDark(true);
      }
  }, []);

  const toggleTheme = () => {
      setIsDark(!isDark);
      document.documentElement.classList.toggle('dark');
  };

  return (
    <div className="min-h-screen bg-background text-foreground overflow-hidden selection:bg-primary/30">
      {/* Dynamic Background */}
      <div className="fixed inset-0 -z-10 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/10 via-background to-background"></div>
      
      <div className="fixed top-[-20%] left-[-10%] w-[50%] h-[50%] rounded-full bg-primary/10 blur-[120px] -z-10 animate-pulse mix-blend-screen" style={{ animationDuration: '8s' }}></div>
      <div className="fixed bottom-[-20%] right-[-10%] w-[50%] h-[50%] rounded-full bg-accent/10 blur-[120px] -z-10 animate-pulse mix-blend-screen" style={{ animationDuration: '10s', animationDelay: '2s' }}></div>

      {/* Navigation */}
      <nav className="container mx-auto px-6 py-6 flex justify-between items-center relative z-10">
        <div className="flex items-center gap-2 font-bold text-2xl tracking-tighter">
          <div className="bg-primary text-primary-foreground p-2 rounded-xl shadow-lg shadow-primary/25">
            <Home className="w-6 h-6" />
          </div>
          <span>Hostel<span className="text-primary">Sys</span></span>
        </div>
        <div className="flex items-center gap-4">
          <button 
              onClick={toggleTheme} 
              className="p-2.5 rounded-full bg-muted/50 text-foreground/70 hover:text-primary hover:bg-muted shadow-sm transition-all border border-border/50"
              title="Toggle theme"
          >
              {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
          </button>
          <Link to="/login" className="font-medium text-sm px-5 py-2.5 rounded-full bg-secondary/80 text-secondary-foreground hover:bg-secondary transition-all hover:shadow-md backdrop-blur-sm border border-border/50">
            Sign In
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="container mx-auto px-6 pt-24 pb-32 text-center relative z-10">
        
        <h1 className="text-6xl md:text-8xl font-black tracking-tight mb-8 leading-tight">
          Manage spaces with <br className="hidden md:block"/>
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-accent drop-shadow-sm">absolute clarity.</span>
        </h1>
        
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-12 leading-relaxed">
          The all-in-one platform for modern student housing. Streamline allocations, track payments, and manage facilities with our beautiful, intuitive dashboard.
        </p>
        
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link to="/login" className="group relative px-8 py-4 bg-primary text-primary-foreground font-semibold rounded-full overflow-hidden transition-all hover:scale-105 hover:shadow-xl hover:shadow-primary/30 flex items-center gap-2 w-full sm:w-auto justify-center">
            <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out"></div>
            <span className="relative z-10">Get Started</span>
            <ArrowRight className="w-5 h-5 relative z-10 group-hover:translate-x-1 transition-transform" />
          </Link>
          <a href="#features" className="px-8 py-4 bg-transparent text-foreground font-semibold rounded-full border border-border hover:bg-muted/50 transition-all w-full sm:w-auto justify-center flex">
            Explore Features
          </a>
        </div>
      </main>

      {/* Feature Section */}
      <section id="features" className="container mx-auto px-6 py-24 relative z-10">
        <div className="grid md:grid-cols-3 gap-8">
          <div className="bg-card/40 backdrop-blur-xl border border-border p-8 rounded-3xl hover:border-primary/50 transition-colors group shadow-sm hover:shadow-xl hover:shadow-primary/5">
            <div className="w-14 h-14 bg-primary/10 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-primary group-hover:text-primary-foreground transition-colors text-primary">
              <Shield className="w-7 h-7" />
            </div>
            <h3 className="text-2xl font-bold mb-4">Secure Allocations</h3>
            <p className="text-muted-foreground leading-relaxed">Smart room assignment algorithms ensure fair distribution while maintaining perfect security and strict access controls.</p>
          </div>
          
          <div className="bg-card/40 backdrop-blur-xl border border-border p-8 rounded-3xl hover:border-primary/50 transition-colors group shadow-sm hover:shadow-xl hover:shadow-primary/5 relative transform md:-translate-y-4">
            <div className="absolute inset-x-0 -top-px h-px w-full bg-gradient-to-r from-transparent via-primary/50 to-transparent"></div>
            <div className="w-14 h-14 bg-accent/10 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-accent group-hover:text-accent-foreground transition-colors text-accent">
              <Zap className="w-7 h-7" />
            </div>
            <h3 className="text-2xl font-bold mb-4">Real-time Sync</h3>
            <p className="text-muted-foreground leading-relaxed">Instant updates across all devices. Know exactly who paid, who is moving in, and which rooms are instantly available.</p>
          </div>
          
          <div className="bg-card/40 backdrop-blur-xl border border-border p-8 rounded-3xl hover:border-primary/50 transition-colors group shadow-sm hover:shadow-xl hover:shadow-primary/5">
            <div className="w-14 h-14 bg-secondary/10 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-secondary group-hover:text-secondary-foreground transition-colors text-secondary-foreground">
              <Home className="w-7 h-7" />
            </div>
            <h3 className="text-2xl font-bold mb-4">Facility Tracking</h3>
            <p className="text-muted-foreground leading-relaxed">Comprehensive tools to manage maintenance requests, asset tracking, and overall hostel condition monitoring.</p>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Landing;
