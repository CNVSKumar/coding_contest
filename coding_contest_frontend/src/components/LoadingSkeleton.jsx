import React from 'react';

export function CardSkeleton() {
  return (
    <div className="glass border border-cyber-border/40 rounded-2xl p-6 h-[220px] flex flex-col justify-between animate-pulse">
      <div>
        <div className="flex justify-between items-center mb-4">
          <div className="h-5 w-20 bg-slate-800 rounded-md" />
          <div className="h-4 w-12 bg-slate-800 rounded-md" />
        </div>
        <div className="h-6 w-3/4 bg-slate-800 rounded-md mb-3" />
        <div className="h-4 w-full bg-slate-850 rounded-md mb-2" />
        <div className="h-4 w-5/6 bg-slate-850 rounded-md" />
      </div>
      <div className="flex justify-between items-center border-t border-cyber-border/40 pt-4">
        <div className="h-5 w-32 bg-slate-800 rounded-md" />
        <div className="h-9 w-24 bg-slate-800 rounded-md" />
      </div>
    </div>
  );
}

export function GridSkeleton({ count = 6 }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {Array.from({ length: count }).map((_, i) => (
        <CardSkeleton key={i} />
      ))}
    </div>
  );
}

export function TableSkeleton({ rows = 5, cols = 4 }) {
  return (
    <div className="glass border border-cyber-border rounded-xl overflow-hidden animate-pulse">
      <div className="h-12 bg-slate-900 border-b border-cyber-border flex items-center px-6">
        <div className="grid grid-cols-12 w-full gap-4">
          {Array.from({ length: cols }).map((_, i) => (
            <div key={i} className="h-4 bg-slate-800 rounded-md col-span-3" />
          ))}
        </div>
      </div>
      <div className="divide-y divide-cyber-border">
        {Array.from({ length: rows }).map((_, r) => (
          <div key={r} className="h-14 flex items-center px-6">
            <div className="grid grid-cols-12 w-full gap-4">
              {Array.from({ length: cols }).map((_, c) => (
                <div key={c} className="h-4 bg-slate-850 rounded-md col-span-3" />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function DashboardSkeleton() {
  return (
    <div className="space-y-8 animate-pulse">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="space-y-2 w-1/3">
          <div className="h-8 bg-slate-800 rounded-md" />
          <div className="h-4 bg-slate-850 rounded-md" />
        </div>
        <div className="h-10 w-32 bg-slate-800 rounded-md" />
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="glass p-6 rounded-2xl h-24 bg-slate-900/20 border border-cyber-border/40" />
        ))}
      </div>

      <div className="space-y-4">
        <div className="h-6 w-48 bg-slate-800 rounded-md" />
        <GridSkeleton count={3} />
      </div>
    </div>
  );
}

export default function LoadingSkeleton({ type = 'grid' }) {
  if (type === 'dashboard') return <DashboardSkeleton />;
  if (type === 'table') return <TableSkeleton />;
  return <GridSkeleton />;
}
