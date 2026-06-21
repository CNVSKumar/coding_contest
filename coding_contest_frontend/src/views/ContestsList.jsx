import React, { useState, useEffect } from 'react';
import { Trophy, Activity, Calendar, Search, SlidersHorizontal, ArrowUpRight } from 'lucide-react';
import { toast } from 'react-toastify';
import api from '../api';
import CountdownTimer from '../components/CountdownTimer';
import LoadingSkeleton from '../components/LoadingSkeleton';
import EmptyState from '../components/EmptyState';

export default function ContestsList({ navigateTo }) {
  const [contests, setContests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

  useEffect(() => {
    async function fetchContests() {
      try {
        const data = await api.getContests();
        setContests(data || []);
      } catch (err) {
        toast.error('Failed to load contests: ' + err.message);
      } finally {
        setLoading(false);
      }
    }
    fetchContests();
  }, []);

  const getStats = () => {
    const total = contests.length;
    const active = contests.filter((c) => c.status === 'ACTIVE').length;
    const upcoming = contests.filter((c) => c.status === 'UPCOMING').length;
    return { total, active, upcoming };
  };

  const filteredContests = contests.filter((c) => {
    const matchesSearch = c.title.toLowerCase().includes(search.toLowerCase()) || 
                          (c.description && c.description.toLowerCase().includes(search.toLowerCase()));
    const matchesStatus = statusFilter === 'ALL' || c.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  if (loading) {
    return <LoadingSkeleton type="dashboard" />;
  }

  const { total, active, upcoming } = getStats();

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="font-heading text-3xl font-extrabold text-white tracking-tight">
            Coding Contests
          </h2>
          <p className="text-cyber-textSecondary text-sm md:text-base">
            Select an active contest to submit solutions or view historical rankings.
          </p>
        </div>
      </div>

      {/* Analytics Statistics Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Stat Card 1 */}
        <div className="glass p-5 rounded-2xl flex items-center gap-4 bg-slate-900/20 border-l-2 border-l-cyber-primary/70">
          <div className="p-3 bg-cyber-primary/10 border border-cyber-primary/20 rounded-xl text-cyber-primary">
            <Trophy className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs font-semibold text-cyber-textSecondary uppercase tracking-wider">Total Contests</div>
            <div className="text-2xl font-bold text-white mt-0.5">{total}</div>
          </div>
        </div>

        {/* Stat Card 2 */}
        <div className="glass p-5 rounded-2xl flex items-center gap-4 bg-slate-900/20 border-l-2 border-l-cyber-success/70">
          <div className="p-3 bg-cyber-success/10 border border-cyber-success/20 rounded-xl text-cyber-success">
            <Activity className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <div className="text-xs font-semibold text-cyber-textSecondary uppercase tracking-wider">Active Contests</div>
            <div className="text-2xl font-bold text-white mt-0.5">{active}</div>
          </div>
        </div>

        {/* Stat Card 3 */}
        <div className="glass p-5 rounded-2xl flex items-center gap-4 bg-slate-900/20 border-l-2 border-l-amber-500/70">
          <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-xl text-amber-500">
            <Calendar className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs font-semibold text-cyber-textSecondary uppercase tracking-wider">Upcoming Events</div>
            <div className="text-2xl font-bold text-white mt-0.5">{upcoming}</div>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between glass p-4 rounded-2xl bg-slate-900/10">
        <div className="relative w-full md:w-80 group">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-cyber-textMuted group-focus-within:text-cyber-primary transition-colors" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-[#080b12] border border-cyber-border rounded-xl py-2.5 pl-10 pr-4 text-sm text-white placeholder-cyber-textMuted focus:outline-none focus:border-cyber-primary/70 transition-all font-sans"
            placeholder="Search contests..."
          />
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto">
          <SlidersHorizontal className="w-4 h-4 text-cyber-textSecondary hidden md:block" />
          <div className="grid grid-cols-4 md:flex items-center gap-1.5 w-full md:w-auto bg-[#080b12] p-1 border border-cyber-border rounded-xl">
            {['ALL', 'ACTIVE', 'UPCOMING', 'COMPLETED'].map((status) => (
              <button
                key={status}
                onClick={() => setStatusFilter(status)}
                className={`py-1.5 px-3.5 text-xs font-semibold rounded-lg transition-all ${
                  statusFilter === status
                    ? 'bg-cyber-primary text-white shadow-glow-primary'
                    : 'text-cyber-textSecondary hover:text-white hover:bg-white/5'
                }`}
              >
                {status.charAt(0) + status.slice(1).toLowerCase()}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Grid of Contest Cards */}
      {filteredContests.length === 0 ? (
        <EmptyState
          title="No Contests Found"
          description={
            search || statusFilter !== 'ALL'
              ? 'No programming contests match your current search queries or filters.'
              : 'There are no active or configured programming contests right now.'
          }
          actionText={search || statusFilter !== 'ALL' ? 'Reset Filters' : null}
          onAction={() => {
            setSearch('');
            setStatusFilter('ALL');
          }}
          icon={Trophy}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredContests.map((c) => {
            const isCompleted = c.status === 'COMPLETED';
            const isUpcoming = c.status === 'UPCOMING';
            const isActive = c.status === 'ACTIVE';

            return (
              <div
                key={c.id}
                className="flex flex-col justify-between glass border border-cyber-border/40 hover:border-cyber-primary/35 rounded-2xl p-6 min-h-[240px] glow-card-hover group/card relative overflow-hidden"
              >
                {/* Backdrop lighting effects */}
                <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-cyber-primary/5 to-transparent rounded-full blur-xl pointer-events-none" />

                <div>
                  <div className="flex justify-between items-start mb-3">
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full tracking-wider uppercase border ${
                        isActive
                          ? 'bg-cyber-success/10 border-cyber-success/20 text-cyber-success glow-pulse-success'
                          : isUpcoming
                          ? 'bg-amber-500/10 border-amber-500/20 text-amber-400'
                          : 'bg-white/5 border-white/10 text-cyber-textSecondary'
                      }`}
                    >
                      {c.status}
                    </span>
                    <span className="font-mono text-xs text-cyber-textMuted font-semibold">
                      ID: #{c.id}
                    </span>
                  </div>

                  <h3 className="font-heading text-lg font-bold text-white mb-2 group-hover/card:text-cyber-secondary transition-colors duration-300">
                    {c.title}
                  </h3>
                  <p className="text-cyber-textSecondary text-xs leading-relaxed mb-4 line-clamp-2">
                    {c.description || 'No description provided.'}
                  </p>
                </div>

                <div className="border-t border-cyber-border/40 pt-4 flex items-center justify-between gap-4 mt-auto">
                  <div className="flex flex-col gap-0.5">
                    <span className="text-[10px] text-cyber-textMuted font-semibold uppercase tracking-wider">
                      Schedule Details
                    </span>
                    <CountdownTimer startTime={c.startTime} endTime={c.endTime} status={c.status} />
                  </div>

                  <button
                    onClick={() => navigateTo(`#/contests/${c.id}`)}
                    className={`inline-flex items-center gap-1.5 py-1.5 px-3 rounded-lg text-xs font-bold transition-all ${
                      isActive
                        ? 'bg-cyber-primary hover:bg-cyber-primaryHover text-white shadow-glow-primary hover:scale-[1.03]'
                        : 'bg-white/[0.04] hover:bg-white/[0.08] border border-cyber-border text-white hover:scale-[1.03]'
                    }`}
                  >
                    <span>{isUpcoming ? 'Details' : 'Enter'}</span>
                    <ArrowUpRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
