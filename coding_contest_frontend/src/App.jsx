import React, { useState, useEffect } from 'react';
import { ToastContainer } from 'react-toastify';
import { motion, AnimatePresence } from 'framer-motion';
import api from './api';

// Components
import Navbar from './components/Navbar';

// Views
import Login from './views/Login';
import Register from './views/Register';
import ContestsList from './views/ContestsList';
import ContestDetails from './views/ContestDetails';
import QuestionDetails from './views/QuestionDetails';
import Leaderboard from './views/Leaderboard';
import AdminDashboard from './views/AdminDashboard';

export default function App() {
  const [currentHash, setCurrentHash] = useState(window.location.hash || '#/contests');
  const [user, setUser] = useState(api.user);

  // Sync route hash updates
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash || '#/contests';
      
      // Auth Guard Checking
      const publicPages = ['#/login', '#/register'];
      const authRequired = !publicPages.includes(hash);

      if (authRequired && !api.isAuthenticated()) {
        window.location.hash = '#/login';
        setCurrentHash('#/login');
        return;
      }

      setCurrentHash(hash);
    };

    window.addEventListener('hashchange', handleHashChange);
    // Initial verification
    handleHashChange();

    return () => {
      window.removeEventListener('hashchange', handleHashChange);
    };
  }, [user]);

  const navigateTo = (hash) => {
    window.location.hash = hash;
    setCurrentHash(hash);
  };

  const handleLoginSuccess = () => {
    setUser(api.user);
  };

  const handleLogout = () => {
    api.clearAuth();
    setUser(null);
    navigateTo('#/login');
  };

  // Render correct view according to active route matches
  const renderActiveView = () => {
    if (currentHash === '#/login') {
      return (
        <Login key="login" navigateTo={navigateTo} onLoginSuccess={handleLoginSuccess} />
      );
    }
    if (currentHash === '#/register') {
      return <Register key="register" navigateTo={navigateTo} />;
    }
    if (currentHash === '#/contests') {
      return <ContestsList key="contests" navigateTo={navigateTo} />;
    }
    if (currentHash === '#/admin') {
      if (user?.role === 'ADMIN') {
        return <AdminDashboard key="admin" />;
      }
      // Redirect unauthorized users
      navigateTo('#/contests');
      return null;
    }

    // Match route parameters
    const contestMatch = currentHash.match(/^#\/contests\/(\d+)$/);
    if (contestMatch) {
      const id = parseInt(contestMatch[1]);
      return <ContestDetails key={`contest-${id}`} contestId={id} navigateTo={navigateTo} />;
    }

    const questionMatch = currentHash.match(/^#\/questions\/(\d+)$/);
    if (questionMatch) {
      const id = parseInt(questionMatch[1]);
      return <QuestionDetails key={`question-${id}`} questionId={id} navigateTo={navigateTo} />;
    }

    const leaderboardMatch = currentHash.match(/^#\/contests\/(\d+)\/leaderboard$/);
    if (leaderboardMatch) {
      const id = parseInt(leaderboardMatch[1]);
      return <Leaderboard key={`leaderboard-${id}`} contestId={id} navigateTo={navigateTo} />;
    }

    // Fallback default redirect
    navigateTo('#/contests');
    return null;
  };

  return (
    <div className="flex flex-col min-h-screen bg-[#080a10] text-[#f3f4f6]">
      {/* Dynamic Header */}
      <Navbar
        currentHash={currentHash}
        navigateTo={navigateTo}
        user={user}
        onLogout={handleLogout}
      />

      {/* Dynamic View container with page transition animations */}
      <main className="max-w-7xl w-full mx-auto px-4 md:px-8 py-8 flex-1 flex flex-col justify-start">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentHash}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2, ease: 'easeInOut' }}
            className="flex-1"
          >
            {renderActiveView()}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Global Toast Container */}
      <ToastContainer
        position="bottom-right"
        autoClose={3500}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="dark"
        toastStyle={{
          backgroundColor: '#0c0f1c',
          border: '1px solid rgba(255, 255, 255, 0.08)',
          borderRadius: '16px',
          color: '#f3f4f6',
          fontFamily: 'Inter, sans-serif'
        }}
      />
    </div>
  );
}
