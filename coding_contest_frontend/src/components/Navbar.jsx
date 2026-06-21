import React, { useState } from 'react';
import { Code2, LogOut, Shield, User, Menu, X, Terminal } from 'lucide-react';
import api from '../api';

export default function Navbar({ currentHash, navigateTo, user, onLogout }) {
  const [isOpen, setIsOpen] = useState(false);
  const isAuthenticated = !!user;
  const isAdmin = user?.role === 'ADMIN';

  const handleNavClick = (hash) => {
    setIsOpen(false);
    navigateTo(hash);
  };

  const isActive = (hash) => {
    if (hash === '#/contests') {
      return currentHash === '#/contests' || currentHash === '' || currentHash.startsWith('#/contests/');
    }
    return currentHash === hash;
  };

  const linkClass = (hash) =>
    `relative text-sm font-medium transition-colors duration-200 py-1.5 px-3 rounded-lg ${
      isActive(hash)
        ? 'text-white bg-white/5'
        : 'text-cyber-textSecondary hover:text-white hover:bg-white/5'
    }`;

  return (
    <nav className="sticky top-0 z-55 glass-nav border-b border-cyber-border py-4 px-6 md:px-12 flex justify-between items-center">
      {/* Brand Logo */}
      <a
        href="#/contests"
        onClick={(e) => {
          e.preventDefault();
          handleNavClick('#/contests');
        }}
        className="flex items-center gap-2.5 group"
      >
        <div className="p-2 bg-gradient-to-br from-cyber-primary/20 to-cyber-secondary/20 border border-cyber-primary/30 rounded-xl group-hover:border-cyber-primary/60 transition-colors duration-300">
          <Code2 className="w-5 h-5 text-cyber-primary group-hover:text-cyber-secondary transition-colors duration-300" />
        </div>
        <span className="font-heading text-lg md:text-xl font-bold tracking-tight text-white">
          Contest<span className="text-cyber-secondary">Arena</span>
        </span>
      </a>

      {/* Desktop Links & Profile */}
      <div className="hidden md:flex items-center gap-6">
        {isAuthenticated && (
          <>
            <a
              href="#/contests"
              onClick={(e) => {
                e.preventDefault();
                handleNavClick('#/contests');
              }}
              className={linkClass('#/contests')}
            >
              Contests
            </a>

            {isAdmin && (
              <a
                href="#/admin"
                onClick={(e) => {
                  e.preventDefault();
                  handleNavClick('#/admin');
                }}
                className={linkClass('#/admin')}
              >
                Admin Control
              </a>
            )}
          </>
        )}

        {!isAuthenticated ? (
          <div className="flex items-center gap-3">
            <a
              href="#/login"
              onClick={(e) => {
                e.preventDefault();
                handleNavClick('#/login');
              }}
              className="text-sm font-medium text-cyber-textSecondary hover:text-white transition-colors py-2 px-4"
            >
              Sign In
            </a>
            <a
              href="#/register"
              onClick={(e) => {
                e.preventDefault();
                handleNavClick('#/register');
              }}
              className="text-sm font-semibold text-white bg-cyber-primary hover:bg-cyber-primaryHover transition-all shadow-glow-primary py-2 px-4 rounded-lg"
            >
              Get Started
            </a>
          </div>
        ) : (
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2.5 px-3 py-1.5 bg-white/[0.03] border border-cyber-border rounded-full select-none">
              <div className={`p-1 rounded-full ${isAdmin ? 'bg-amber-500/10 text-amber-500' : 'bg-indigo-500/10 text-indigo-500'}`}>
                {isAdmin ? <Shield className="w-3.5 h-3.5" /> : <Terminal className="w-3.5 h-3.5" />}
              </div>
              <span className="text-xs font-semibold tracking-wider uppercase text-cyber-textSecondary px-1">
                {user.role}
              </span>
              <div className="h-4 w-[1px] bg-cyber-border" />
              <span className="text-sm font-medium text-white pr-1">
                {user.name}
              </span>
            </div>

            <button
              onClick={onLogout}
              className="flex items-center gap-2 text-sm font-medium text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-all py-2 px-3 rounded-lg border border-red-500/10 hover:border-red-500/25"
            >
              <LogOut className="w-4 h-4" />
              <span>Sign Out</span>
            </button>
          </div>
        )}
      </div>

      {/* Mobile Hamburger toggle */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="md:hidden p-2 text-cyber-textSecondary hover:text-white rounded-lg hover:bg-white/5 transition-colors"
      >
        {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
      </button>

      {/* Mobile Drawer */}
      {isOpen && (
        <div className="absolute top-[71px] left-0 right-0 w-full glass-modal border-b border-cyber-border flex flex-col p-6 gap-4 md:hidden shadow-2xl animate-fadeIn">
          {isAuthenticated && (
            <>
              <a
                href="#/contests"
                onClick={(e) => {
                  e.preventDefault();
                  handleNavClick('#/contests');
                }}
                className={`py-2.5 px-4 rounded-lg font-medium text-sm transition-colors ${
                  isActive('#/contests') ? 'bg-white/5 text-white' : 'text-cyber-textSecondary'
                }`}
              >
                Contests
              </a>

              {isAdmin && (
                <a
                  href="#/admin"
                  onClick={(e) => {
                    e.preventDefault();
                    handleNavClick('#/admin');
                  }}
                  className={`py-2.5 px-4 rounded-lg font-medium text-sm transition-colors ${
                    isActive('#/admin') ? 'bg-white/5 text-white' : 'text-cyber-textSecondary'
                  }`}
                >
                  Admin Control
                </a>
              )}
            </>
          )}

          <div className="h-[1px] bg-cyber-border my-1" />

          {!isAuthenticated ? (
            <div className="flex flex-col gap-2">
              <a
                href="#/login"
                onClick={(e) => {
                  e.preventDefault();
                  handleNavClick('#/login');
                }}
                className="py-2.5 text-center text-cyber-textSecondary font-medium rounded-lg hover:bg-white/5 transition-colors"
              >
                Sign In
              </a>
              <a
                href="#/register"
                onClick={(e) => {
                  e.preventDefault();
                  handleNavClick('#/register');
                }}
                className="py-2.5 text-center text-white bg-cyber-primary hover:bg-cyber-primaryHover font-semibold rounded-lg shadow-glow-primary transition-colors"
              >
                Get Started
              </a>
            </div>
          ) : (
            <div className="flex flex-col gap-4">
              <div className="flex items-center justify-between px-4 py-3 bg-white/[0.02] border border-cyber-border rounded-xl">
                <span className="text-xs font-semibold uppercase text-cyber-textMuted tracking-wider">
                  Signed in as:
                </span>
                <div className="flex items-center gap-2">
                  <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded border uppercase ${
                    isAdmin ? 'bg-amber-500/10 border-amber-500/20 text-amber-500' : 'bg-indigo-500/10 border-indigo-500/20 text-indigo-500'
                  }`}>
                    {user.role}
                  </span>
                  <span className="text-sm font-semibold text-white">
                    {user.name}
                  </span>
                </div>
              </div>
              <button
                onClick={() => {
                  setIsOpen(false);
                  onLogout();
                }}
                className="flex items-center justify-center gap-2 w-full text-center py-2.5 text-red-400 border border-red-500/20 bg-red-500/5 hover:bg-red-500/10 transition-colors font-medium rounded-lg"
              >
                <LogOut className="w-4 h-4" />
                <span>Sign Out</span>
              </button>
            </div>
          )}
        </div>
      )}
    </nav>
  );
}
