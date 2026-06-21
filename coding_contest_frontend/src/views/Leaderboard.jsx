import React, { useState, useEffect } from 'react';
import { Trophy, Search, ArrowLeft, Award, Clock, Star } from 'lucide-react';
import { toast } from 'react-toastify';
import api from '../api';
import LoadingSkeleton from '../components/LoadingSkeleton';

export default function Leaderboard({ contestId, navigateTo }) {
  const [board, setBoard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    async function fetchLeaderboard() {
      try {
        const data = await api.getLeaderboard(contestId);
        setBoard(data);
      } catch (err) {
        toast.error('Failed to load scoreboard: ' + err.message);
      } finally {
        setLoading(false);
      }
    }
    fetchLeaderboard();
  }, [contestId]);

  if (loading) {
    return <LoadingSkeleton type="table" />;
  }

  if (!board) {
    return (
      <div className="text-center py-16 glass max-w-xl mx-auto rounded-3xl border border-red-500/20 bg-red-500/5">
        <h3 className="text-xl font-bold text-red-400 mb-2">Scoreboard Unavailable</h3>
        <p className="text-cyber-textSecondary mb-6">Failed to retrieve the leaderboard for this contest.</p>
        <button
          onClick={() => navigateTo(`#/contests/${contestId}`)}
          className="inline-flex items-center gap-2 py-2.5 px-5 bg-white/5 border border-cyber-border rounded-xl text-sm font-semibold hover:bg-white/10"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Contest</span>
        </button>
      </div>
    );
  }

  const entries = board.entries || [];
  
  const filteredEntries = entries.filter((e) =>
    e.userName.toLowerCase().includes(search.toLowerCase())
  );

  // Divide into Podium and Remaining List
  const podiumEntries = entries.slice(0, 3);
  const tableEntries = filteredEntries; // display all filtered rows

  const getRankBadgeColor = (rank) => {
    if (rank === 1) return 'text-yellow-400 bg-yellow-500/10 border-yellow-500/30';
    if (rank === 2) return 'text-slate-350 bg-slate-350/10 border-slate-350/30';
    if (rank === 3) return 'text-amber-600 bg-amber-600/10 border-amber-600/30';
    return 'text-cyber-textSecondary bg-white/5 border-cyber-border';
  };

  const getPodiumOrder = (items) => {
    // Standard layout: 2nd place on left, 1st center, 3rd right
    const ordered = [];
    if (items[1]) ordered.push({ ...items[1], height: 'h-[160px]', order: 1 });
    if (items[0]) ordered.push({ ...items[0], height: 'h-[200px]', order: 2, isWinner: true });
    if (items[2]) ordered.push({ ...items[2], height: 'h-[140px]', order: 3 });
    return ordered.sort((a, b) => a.order - b.order);
  };

  const podiumItems = getPodiumOrder(podiumEntries);

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 border-b border-cyber-border/40 pb-6">
        <div className="space-y-3">
          <button
            onClick={() => navigateTo(`#/contests/${contestId}`)}
            className="group inline-flex items-center gap-2 text-xs font-semibold text-cyber-textSecondary hover:text-white transition-colors py-1.5 px-3 bg-white/[0.02] hover:bg-white/[0.06] border border-cyber-border rounded-xl"
          >
            <ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-0.5 transition-transform" />
            <span>Back to Contest</span>
          </button>
          
          <div>
            <h2 className="font-heading text-2xl md:text-3xl font-extrabold text-white tracking-tight">
              {board.contestTitle}
            </h2>
            <p className="text-cyber-textSecondary text-sm md:text-base">
              Live Contest Standings Scoreboard
            </p>
          </div>
        </div>
      </div>

      {/* Podium Display (Top 3) */}
      {podiumEntries.length > 0 && (
        <div className="flex flex-col items-center justify-center p-6 glass rounded-3xl bg-slate-900/10">
          <div className="text-center mb-8">
            <h3 className="font-heading text-lg font-bold text-white flex items-center gap-2 justify-center">
              <Trophy className="w-5 h-5 text-yellow-400 animate-bounce" />
              <span>Current Standings Leaders</span>
            </h3>
          </div>

          <div className="flex items-end justify-center gap-4 md:gap-8 max-w-2xl w-full">
            {podiumItems.map((p) => (
              <div key={p.rank} className="flex flex-col items-center flex-1 max-w-[180px] group">
                {/* Profile Avatar / Badge */}
                <div className="relative mb-3 flex flex-col items-center">
                  <div className={`p-4 rounded-full border-2 ${
                    p.rank === 1 ? 'border-yellow-400 shadow-lg shadow-yellow-500/10' :
                    p.rank === 2 ? 'border-slate-400' : 'border-amber-600'
                  } bg-[#0c0f1a] relative z-10 group-hover:scale-105 transition-all duration-300`}>
                    {p.rank === 1 ? (
                      <Star className="w-7 h-7 text-yellow-400 fill-yellow-400" />
                    ) : (
                      <Award className={`w-7 h-7 ${p.rank === 2 ? 'text-slate-400' : 'text-amber-600'}`} />
                    )}
                  </div>
                  <div className={`absolute -bottom-2 z-20 px-2 py-0.5 rounded-full text-[9px] font-bold border ${
                    p.rank === 1 ? 'bg-yellow-400 border-yellow-500 text-black' :
                    p.rank === 2 ? 'bg-slate-450 border-slate-500 text-black' : 'bg-amber-600 border-amber-700 text-white'
                  }`}>
                    Rank {p.rank}
                  </div>
                </div>

                {/* Username */}
                <div className="text-center mb-4 max-w-full">
                  <div className="text-sm font-bold text-white truncate px-1">{p.userName}</div>
                  <div className="text-[10px] text-cyber-textSecondary font-medium uppercase mt-0.5">{p.solvedCount} Solved</div>
                </div>

                {/* Score Column Block */}
                <div className={`w-full ${p.height} rounded-t-2xl flex flex-col justify-end p-4 text-center border-t border-x ${
                  p.rank === 1 ? 'bg-yellow-500/10 border-yellow-500/20' :
                  p.rank === 2 ? 'bg-slate-500/10 border-slate-500/20' : 'bg-amber-600/10 border-amber-600/20'
                }`}>
                  <span className={`text-lg md:text-xl font-extrabold ${
                    p.rank === 1 ? 'text-yellow-400' :
                    p.rank === 2 ? 'text-slate-350' : 'text-amber-500'
                  }`}>
                    {p.totalScore}
                  </span>
                  <span className="text-[9px] font-bold text-cyber-textMuted uppercase mt-1">Pts</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Standings Filter */}
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between glass p-4 rounded-2xl bg-slate-900/10">
        <h3 className="font-heading font-bold text-white pl-1">All Participants</h3>
        <div className="relative w-full md:w-80">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-cyber-textMuted" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-[#080b12] border border-cyber-border rounded-xl py-2 pl-10 pr-4 text-xs text-white placeholder-cyber-textMuted focus:outline-none focus:border-cyber-primary/70 transition-all font-sans"
            placeholder="Search participant..."
          />
        </div>
      </div>

      {/* Standings List Table */}
      {tableEntries.length === 0 ? (
        <div className="text-center py-12 glass rounded-2xl">
          <p className="text-cyber-textSecondary text-sm">No submissions recorded for this contest.</p>
        </div>
      ) : (
        <div className="glass rounded-2xl overflow-hidden border border-cyber-border/60 shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-white/[0.02] border-b border-cyber-border">
                  <th className="py-4 px-6 text-xs font-semibold text-cyber-textSecondary uppercase tracking-wider w-24">Rank</th>
                  <th className="py-4 px-6 text-xs font-semibold text-cyber-textSecondary uppercase tracking-wider">Participant Name</th>
                  <th className="py-4 px-6 text-xs font-semibold text-cyber-textSecondary uppercase tracking-wider">Problems Solved</th>
                  <th className="py-4 px-6 text-xs font-semibold text-cyber-textSecondary uppercase tracking-wider">Total Score</th>
                  <th className="py-4 px-6 text-xs font-semibold text-cyber-textSecondary uppercase tracking-wider">Time / Penalty</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-cyber-border/40 font-sans">
                {tableEntries.map((e) => {
                  const isPodium = e.rank <= 3;
                  const pillColor = getRankBadgeColor(e.rank);

                  return (
                    <tr key={e.rank} className="hover:bg-white/[0.01] transition-colors group">
                      <td className="py-4 px-6">
                        <span className={`inline-flex items-center justify-center w-7 h-7 rounded-full text-xs font-bold border ${pillColor}`}>
                          {e.rank}
                        </span>
                      </td>
                      <td className="py-4 px-6">
                        <span className="text-sm font-semibold text-white group-hover:text-cyber-secondary transition-all">
                          {e.userName}
                        </span>
                      </td>
                      <td className="py-4 px-6">
                        <span className="text-sm font-bold text-cyber-success">
                          {e.solvedCount}
                        </span>
                      </td>
                      <td className="py-4 px-6">
                        <span className="text-sm font-bold text-cyber-secondary">
                          {e.totalScore}
                        </span>
                      </td>
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-1.5 text-xs text-cyber-textSecondary font-mono">
                          <Clock className="w-3.5 h-3.5 text-cyber-textMuted" />
                          <span>{e.submissionTimeMinutes} mins</span>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
