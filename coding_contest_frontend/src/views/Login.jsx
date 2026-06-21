import React, { useState } from 'react';
import { Mail, Lock, LogIn, ArrowRight, Eye, EyeOff } from 'lucide-react';
import { toast } from 'react-toastify';
import api from '../api';

export default function Login({ navigateTo, onLoginSuccess }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isLoading) return;

    setIsLoading(true);
    const loadingToast = toast.loading('Verifying credentials...');

    try {
      const data = await api.login(email, password);
      toast.update(loadingToast, {
        render: `Welcome back, ${data.name}!`,
        type: 'success',
        isLoading: false,
        autoClose: 3000,
      });
      onLoginSuccess();
      navigateTo('#/contests');
    } catch (err) {
      toast.update(loadingToast, {
        render: err.message || 'Login failed. Please check your credentials.',
        type: 'error',
        isLoading: false,
        autoClose: 4000,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-md w-full mx-auto my-12 md:my-20">
      <div className="relative group">
        {/* Neon Glow Layer */}
        <div className="absolute -inset-1 bg-gradient-to-r from-cyber-primary via-purple-500 to-cyber-secondary rounded-3xl blur-md opacity-25 group-hover:opacity-45 transition duration-1000" />
        
        {/* Main Card */}
        <div className="relative glass p-8 rounded-3xl shadow-2xl flex flex-col gap-6 bg-[#0c0f1d]/75">
          <div className="text-center space-y-2">
            <h2 className="font-heading text-2xl md:text-3xl font-extrabold text-white tracking-tight">
              Welcome Back
            </h2>
            <p className="text-sm text-cyber-textSecondary">
              Login to join contests and solve coding challenges
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email Address */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold uppercase tracking-wider text-cyber-textSecondary">
                Email Address
              </label>
              <div className="relative group/input">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-cyber-textMuted group-focus-within/input:text-cyber-primary transition-colors">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-[#070912]/80 border border-cyber-border rounded-xl py-3 pl-11 pr-4 text-sm text-white placeholder-cyber-textMuted focus:outline-none focus:border-cyber-primary/70 focus:ring-1 focus:ring-cyber-primary/30 transition-all font-sans"
                  placeholder="you@example.com"
                  required
                />
              </div>
            </div>

            {/* Password */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold uppercase tracking-wider text-cyber-textSecondary">
                Password
              </label>
              <div className="relative group/input">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-cyber-textMuted group-focus-within/input:text-cyber-primary transition-colors">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-[#070912]/80 border border-cyber-border rounded-xl py-3 pl-11 pr-11 text-sm text-white placeholder-cyber-textMuted focus:outline-none focus:border-cyber-primary/70 focus:ring-1 focus:ring-cyber-primary/30 transition-all font-sans"
                  placeholder="••••••••"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-cyber-textMuted hover:text-white transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full mt-6 py-3 px-4 inline-flex items-center justify-center gap-2 text-sm font-semibold rounded-xl text-white bg-cyber-primary hover:bg-cyber-primaryHover disabled:opacity-50 transition-all shadow-glow-primary hover:scale-[1.01] active:scale-[0.99]"
            >
              {isLoading ? (
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <span>Sign In</span>
                  <LogIn className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          <div className="text-center border-t border-cyber-border/40 pt-5 text-sm text-cyber-textSecondary">
            Don't have an account?{' '}
            <a
              href="#/register"
              onClick={(e) => {
                e.preventDefault();
                navigateTo('#/register');
              }}
              className="font-semibold text-cyber-primary hover:text-cyber-secondary hover:underline transition-colors"
            >
              Register here
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
