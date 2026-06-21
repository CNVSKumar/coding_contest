import React, { useState } from 'react';
import { User, Mail, Lock, UserCheck, ShieldAlert, ArrowRight } from 'lucide-react';
import { toast } from 'react-toastify';
import api from '../api';

export default function Register({ navigateTo }) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('PARTICIPANT');
  const [isLoading, setIsLoading] = useState(false);
  const [validationErrors, setValidationErrors] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isLoading) return;

    setIsLoading(true);
    setValidationErrors(null);
    const loadingToast = toast.loading('Registering account...');

    try {
      await api.register(name, email, password, role);
      toast.update(loadingToast, {
        render: 'Registration successful! Redirecting to sign in...',
        type: 'success',
        isLoading: false,
        autoClose: 3000,
      });
      setTimeout(() => {
        navigateTo('#/login');
      }, 1000);
    } catch (err) {
      if (err.validationErrors) {
        setValidationErrors(err.validationErrors);
        toast.update(loadingToast, {
          render: 'Please correct the validation errors below.',
          type: 'error',
          isLoading: false,
          autoClose: 4000,
        });
      } else {
        toast.update(loadingToast, {
          render: err.message || 'Registration failed. Please try again.',
          type: 'error',
          isLoading: false,
          autoClose: 4000,
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-md w-full mx-auto my-8 md:my-16">
      <div className="relative group">
        {/* Neon Glow Layer */}
        <div className="absolute -inset-1 bg-gradient-to-r from-cyber-primary via-purple-500 to-cyber-secondary rounded-3xl blur-md opacity-25 group-hover:opacity-45 transition duration-1000" />
        
        {/* Main Card */}
        <div className="relative glass p-8 rounded-3xl shadow-2xl flex flex-col gap-6 bg-[#0c0f1d]/75">
          <div className="text-center space-y-2">
            <h2 className="font-heading text-2xl md:text-3xl font-extrabold text-white tracking-tight">
              Create Account
            </h2>
            <p className="text-sm text-cyber-textSecondary">
              Sign up as a participant or administrator
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Name Input */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold uppercase tracking-wider text-cyber-textSecondary">
                Name
              </label>
              <div className="relative group/input">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-cyber-textMuted group-focus-within/input:text-cyber-primary transition-colors">
                  <User className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className={`w-full bg-[#070912]/80 border ${
                    validationErrors?.name ? 'border-red-500/50' : 'border-cyber-border'
                  } rounded-xl py-3 pl-11 pr-4 text-sm text-white placeholder-cyber-textMuted focus:outline-none focus:border-cyber-primary/70 focus:ring-1 focus:ring-cyber-primary/30 transition-all font-sans`}
                  placeholder="John Doe"
                  required
                />
              </div>
              {validationErrors?.name && (
                <p className="text-xs font-medium text-red-400 mt-1">{validationErrors.name}</p>
              )}
            </div>

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
                  className={`w-full bg-[#070912]/80 border ${
                    validationErrors?.email ? 'border-red-500/50' : 'border-cyber-border'
                  } rounded-xl py-3 pl-11 pr-4 text-sm text-white placeholder-cyber-textMuted focus:outline-none focus:border-cyber-primary/70 focus:ring-1 focus:ring-cyber-primary/30 transition-all font-sans`}
                  placeholder="john.doe@example.com"
                  required
                />
              </div>
              {validationErrors?.email && (
                <p className="text-xs font-medium text-red-400 mt-1">{validationErrors.email}</p>
              )}
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
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className={`w-full bg-[#070912]/80 border ${
                    validationErrors?.password ? 'border-red-500/50' : 'border-cyber-border'
                  } rounded-xl py-3 pl-11 pr-4 text-sm text-white placeholder-cyber-textMuted focus:outline-none focus:border-cyber-primary/70 focus:ring-1 focus:ring-cyber-primary/30 transition-all font-sans`}
                  placeholder="••••••••"
                  required
                />
              </div>
              {validationErrors?.password ? (
                <p className="text-xs font-medium text-red-400 mt-1">{validationErrors.password}</p>
              ) : (
                <p className="text-[10px] text-cyber-textMuted font-medium">Password must be at least 6 characters.</p>
              )}
            </div>

            {/* Account Role */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold uppercase tracking-wider text-cyber-textSecondary">
                Account Role
              </label>
              <div className="relative group/input">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-cyber-textMuted group-focus-within/input:text-cyber-primary transition-colors">
                  <UserCheck className="w-4 h-4" />
                </div>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  className="w-full bg-[#070912]/80 border border-cyber-border rounded-xl py-3 pl-11 pr-4 text-sm text-white focus:outline-none focus:border-cyber-primary/70 focus:ring-1 focus:ring-cyber-primary/30 transition-all font-sans appearance-none"
                >
                  <option value="PARTICIPANT">Participant</option>
                  <option value="ADMIN">Administrator</option>
                </select>
                {/* Custom arrow indicator */}
                <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none text-cyber-textMuted">
                  <span className="text-xs">▼</span>
                </div>
              </div>
            </div>

            {/* Generic validation message fallback */}
            {validationErrors && !validationErrors.name && !validationErrors.email && !validationErrors.password && (
              <div className="p-3 bg-red-500/10 border border-red-500/25 rounded-xl flex gap-2 text-red-400 text-xs font-medium">
                <ShieldAlert className="w-4 h-4 shrink-0" />
                <div>
                  {Object.entries(validationErrors).map(([field, msg]) => (
                    <div key={field}>• {field}: {msg}</div>
                  ))}
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full mt-6 py-3 px-4 inline-flex items-center justify-center gap-2 text-sm font-semibold rounded-xl text-white bg-cyber-primary hover:bg-cyber-primaryHover disabled:opacity-50 transition-all shadow-glow-primary hover:scale-[1.01] active:scale-[0.99]"
            >
              {isLoading ? (
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <span>Sign Up</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          <div className="text-center border-t border-cyber-border/40 pt-5 text-sm text-cyber-textSecondary">
            Already have an account?{' '}
            <a
              href="#/login"
              onClick={(e) => {
                e.preventDefault();
                navigateTo('#/login');
              }}
              className="font-semibold text-cyber-primary hover:text-cyber-secondary hover:underline transition-colors"
            >
              Login here
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
