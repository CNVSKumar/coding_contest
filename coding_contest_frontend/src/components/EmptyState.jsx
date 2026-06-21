import React from 'react';
import { Terminal, Inbox } from 'lucide-react';

export default function EmptyState({ title, description, actionText, onAction, icon: Icon = Inbox }) {
  return (
    <div className="flex flex-col items-center justify-center text-center p-8 md:p-16 glass border border-cyber-border/40 rounded-3xl max-w-2xl mx-auto shadow-xl">
      <div className="relative mb-6">
        {/* Glow Effects */}
        <div className="absolute -inset-1 bg-gradient-to-r from-cyber-primary to-cyber-secondary rounded-2xl blur opacity-25 group-hover:opacity-40 transition duration-1000" />
        <div className="relative p-5 bg-[#0e1220] border border-cyber-border rounded-2xl flex items-center justify-center">
          <Icon className="w-8 h-8 text-cyber-primary" />
        </div>
      </div>
      
      <h3 className="font-heading text-xl font-bold text-white mb-2 tracking-tight">
        {title}
      </h3>
      <p className="text-cyber-textSecondary text-sm max-w-md mb-8 leading-relaxed">
        {description}
      </p>

      {actionText && onAction && (
        <button
          onClick={onAction}
          className="inline-flex items-center gap-2 text-sm font-semibold text-white bg-cyber-primary hover:bg-cyber-primaryHover py-2.5 px-6 rounded-xl transition-all shadow-glow-primary hover:scale-[1.02] active:scale-[0.98]"
        >
          <Terminal className="w-4 h-4" />
          <span>{actionText}</span>
        </button>
      )}
    </div>
  );
}
