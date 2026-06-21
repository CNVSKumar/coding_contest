import React, { useState, useEffect } from 'react';
import { Timer, Clock } from 'lucide-react';

export default function CountdownTimer({ startTime, endTime, status, showIcon = true, size = 'sm' }) {
  const [timeLeft, setTimeLeft] = useState('');
  const [timerType, setTimerType] = useState('ended'); // 'upcoming', 'active', 'ended'

  useEffect(() => {
    const startMs = new Date(startTime).getTime();
    const endMs = new Date(endTime).getTime();

    const formatDuration = (ms) => {
      const seconds = Math.floor((ms / 1000) % 60);
      const minutes = Math.floor((ms / (1000 * 60)) % 60);
      const hours = Math.floor((ms / (1000 * 60 * 60)) % 24);
      const days = Math.floor(ms / (1000 * 60 * 60 * 24));

      const parts = [];
      if (days > 0) parts.push(`${days}d`);
      if (hours > 0 || days > 0) parts.push(`${hours}h`);
      parts.push(`${minutes}m`);
      parts.push(`${seconds}s`);
      return parts.join(' ');
    };

    const updateTimer = () => {
      const now = new Date().getTime();

      if (status === 'COMPLETED' || now > endMs) {
        setTimeLeft('Ended');
        setTimerType('ended');
        return;
      }

      if (now < startMs) {
        const diff = startMs - now;
        setTimeLeft(formatDuration(diff));
        setTimerType('upcoming');
      } else {
        const diff = endMs - now;
        setTimeLeft(formatDuration(diff));
        setTimerType('active');
      }
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);

    return () => clearInterval(interval);
  }, [startTime, endTime, status]);

  if (timerType === 'ended') {
    return (
      <div className={`inline-flex items-center gap-1.5 font-mono font-medium text-cyber-textMuted ${size === 'lg' ? 'text-base' : 'text-xs'}`}>
        {showIcon && <Clock className="w-3.5 h-3.5" />}
        <span>Contest Ended</span>
      </div>
    );
  }

  if (timerType === 'upcoming') {
    return (
      <div className={`inline-flex items-center gap-1.5 font-mono font-semibold text-amber-400 ${size === 'lg' ? 'text-lg' : 'text-xs'}`}>
        {showIcon && <Timer className="w-4 h-4 animate-pulse" />}
        <span>Starts in: {timeLeft}</span>
      </div>
    );
  }

  return (
    <div className={`inline-flex items-center gap-1.5 font-mono font-bold text-cyber-success glow-pulse-success px-2.5 py-1 bg-cyber-success/5 border border-cyber-success/20 rounded-md ${size === 'lg' ? 'text-xl' : 'text-sm'}`}>
      {showIcon && <Clock className="w-4 h-4 animate-spin-[spin_3s_linear_infinite]" />}
      <span>Time Left: {timeLeft}</span>
    </div>
  );
}
