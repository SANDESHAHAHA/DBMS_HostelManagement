import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Home, User, Lock, ArrowRight, Loader2 } from 'lucide-react';
import api from '../lib/api';

const Login = () => {
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    
    try {
      const res = await api.post('/auth/login', { username, password });
      localStorage.setItem('token', res.data.token);
      localStorage.setItem('username', res.data.username || username);
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to login');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4 relative overflow-hidden">
      {/* Dynamic Background Elements */}
      <div className="absolute top-0 right-0 w-full h-full bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-primary/10 via-background to-background pointer-events-none"></div>
      <div className="absolute -bottom-[30%] -left-[10%] w-[70%] h-[70%] rounded-full bg-accent/10 blur-[150px] animate-pulse pointer-events-none" style={{ animationDuration: '7s' }}></div>

      <div className="w-full max-w-md relative z-10">
        {/* Logo/Brand */}
        <Link to="/" className="flex items-center justify-center gap-2 mb-8 group w-fit mx-auto">
          <div className="bg-card p-2.5 rounded-2xl shadow-lg border border-border group-hover:scale-110 transition-transform duration-300">
            <Home className="w-6 h-6 text-primary" />
          </div>
          <span className="font-bold text-3xl tracking-tight text-foreground group-hover:text-primary transition-colors">Hostel<span className="text-primary group-hover:text-foreground transition-colors">Sys</span></span>
        </Link>

        {/* Login Card */}
        <div className="bg-card/70 backdrop-blur-2xl border border-border/60 rounded-[2rem] p-8 shadow-2xl shadow-primary/5">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold tracking-tight mb-2">Welcome Back</h2>
            <p className="text-muted-foreground text-sm">Enter your credentials to access the dashboard</p>
          </div>

          {error && <div className="mb-4 p-3 bg-destructive/10 border border-destructive/20 text-destructive text-sm rounded-xl text-center">{error}</div>}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2 relative group">
              <label className="text-sm font-medium text-foreground ml-1">Username</label>
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
                <input 
                  type="text" 
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full bg-background/50 border border-input rounded-xl py-3.5 pl-12 pr-4 focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-all shadow-sm"
                  placeholder="admin"
                />
              </div>
            </div>

            <div className="space-y-2 relative group">
              <div className="flex justify-between items-center ml-1">
                <label className="text-sm font-medium text-foreground">Password</label>
                <a href="#" className="text-xs font-semibold text-primary hover:text-primary/80 transition-colors">Forgot?</a>
              </div>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
                <input 
                  type="password" 
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-background/50 border border-input rounded-xl py-3.5 pl-12 pr-4 focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-all shadow-sm"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <button 
              type="submit" 
              disabled={isLoading}
              className="w-full bg-primary text-primary-foreground font-semibold rounded-xl py-4 mt-4 relative overflow-hidden group disabled:opacity-80 transition-all hover:bg-primary/90 hover:shadow-lg hover:shadow-primary/25 flex items-center justify-center gap-2"
            >
              <div className="absolute inset-0 bg-white/10 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out"></div>
              {isLoading ? (
                <Loader2 className="w-5 h-5 animate-spin relative z-10" />
              ) : (
                <>
                  <span className="relative z-10">Sign In to Dashboard</span>
                  <ArrowRight className="w-5 h-5 relative z-10 group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;
