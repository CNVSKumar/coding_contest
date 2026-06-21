import React, { useState, useEffect } from 'react';
import { ArrowLeft, Trophy, HelpCircle, Calendar, Sparkles, Code } from 'lucide-react';
import { toast } from 'react-toastify';
import api from '../api';
import CountdownTimer from '../components/CountdownTimer';
import LoadingSkeleton from '../components/LoadingSkeleton';

export default function ContestDetails({ contestId, navigateTo }) {
  const [contest, setContest] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchContestDetails() {
      try {
        const contestData = await api.getContest(contestId);
        const questionsData = await api.getQuestions(contestId);
        setContest(contestData);
        setQuestions(questionsData || []);
      } catch (err) {
        toast.error('Failed to load contest details: ' + err.message);
      } finally {
        setLoading(false);
      }
    }
    fetchContestDetails();
  }, [contestId]);

  if (loading) {
    return <LoadingSkeleton type="table" />;
  }

  if (!contest) {
    return (
      <div className="text-center py-16 glass max-w-xl mx-auto rounded-3xl border border-red-500/20 bg-red-500/5">
        <h3 className="text-xl font-bold text-red-400 mb-2">Contest Not Found</h3>
        <p className="text-cyber-textSecondary mb-6">The requested contest could not be found or has been deleted.</p>
        <button
          onClick={() => navigateTo('#/contests')}
          className="inline-flex items-center gap-2 py-2.5 px-5 bg-white/5 border border-cyber-border rounded-xl text-sm font-semibold hover:bg-white/10"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Contests</span>
        </button>
      </div>
    );
  }

  const isCompleted = contest.status === 'COMPLETED';
  const isUpcoming = contest.status === 'UPCOMING';
  const isActive = contest.status === 'ACTIVE';

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 border-b border-cyber-border/40 pb-6">
        <div className="space-y-3">
          <button
            onClick={() => navigateTo('#/contests')}
            className="group inline-flex items-center gap-2 text-xs font-semibold text-cyber-textSecondary hover:text-white transition-colors py-1.5 px-3 bg-white/[0.02] hover:bg-white/[0.06] border border-cyber-border rounded-xl"
          >
            <ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-0.5 transition-transform" />
            <span>Back to Contests</span>
          </button>
          
          <div className="flex flex-wrap items-center gap-3">
            <h2 className="font-heading text-2xl md:text-3xl font-extrabold text-white tracking-tight">
              {contest.title}
            </h2>
            <span
              className={`text-[10px] font-bold px-2 py-0.5 rounded-full tracking-wider uppercase border ${
                isActive
                  ? 'bg-cyber-success/10 border-cyber-success/20 text-cyber-success glow-pulse-success'
                  : isUpcoming
                  ? 'bg-amber-500/10 border-amber-500/20 text-amber-400'
                  : 'bg-white/5 border-white/10 text-cyber-textSecondary'
              }`}
            >
              {contest.status}
            </span>
          </div>
        </div>

        {/* Action Controls & Realtime countdown */}
        <div className="flex flex-wrap items-center gap-4 w-full md:w-auto">
          <div className="bg-[#0e1220] border border-cyber-border/70 rounded-xl px-4 py-2 flex items-center gap-2">
            <CountdownTimer startTime={contest.startTime} endTime={contest.endTime} status={contest.status} size="sm" />
          </div>

          <button
            onClick={() => navigateTo(`#/contests/${contest.id}/leaderboard`)}
            className="w-full md:w-auto inline-flex items-center justify-center gap-2 text-sm font-semibold text-white bg-cyber-secondary/15 hover:bg-cyber-secondary/25 border border-cyber-secondary/35 hover:border-cyber-secondary/60 py-2.5 px-5 rounded-xl transition-all shadow-glow-secondary"
          >
            <Trophy className="w-4 h-4 text-cyber-secondary" />
            <span>Scoreboard</span>
          </button>
        </div>
      </div>

      {/* Main Details and Problems list Split Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column: Description & Metadata */}
        <div className="lg:col-span-1 space-y-6">
          <div className="glass p-6 rounded-2xl space-y-4">
            <h3 className="font-heading text-lg font-bold text-white flex items-center gap-2">
              <Sparkles className="w-4.5 h-4.5 text-cyber-primary" />
              <span>Contest Overview</span>
            </h3>
            <p className="text-cyber-textSecondary text-sm leading-relaxed whitespace-pre-line">
              {contest.description || 'No description provided for this contest.'}
            </p>
          </div>

          <div className="glass p-6 rounded-2xl space-y-3.5 text-sm">
            <h4 className="font-heading font-semibold text-white">Event Details</h4>
            
            <div className="flex items-center gap-3 text-cyber-textSecondary">
              <Calendar className="w-4 h-4 text-cyber-textMuted shrink-0" />
              <div>
                <div className="text-[10px] uppercase font-semibold text-cyber-textMuted leading-tight">Start Time</div>
                <div className="text-xs mt-0.5 text-cyber-textPrimary">{new Date(contest.startTime).toLocaleString()}</div>
              </div>
            </div>

            <div className="flex items-center gap-3 text-cyber-textSecondary">
              <Calendar className="w-4 h-4 text-cyber-textMuted shrink-0" />
              <div>
                <div className="text-[10px] uppercase font-semibold text-cyber-textMuted leading-tight">End Time</div>
                <div className="text-xs mt-0.5 text-cyber-textPrimary">{new Date(contest.endTime).toLocaleString()}</div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Problems Table */}
        <div className="lg:col-span-2 space-y-4">
          <h3 className="font-heading text-xl font-bold text-white flex items-center gap-2.5">
            <Code className="w-5 h-5 text-cyber-secondary" />
            <span>Challenge Problems</span>
          </h3>

          {questions.length === 0 ? (
            <div className="glass p-12 text-center rounded-2xl border border-cyber-border/40">
              <HelpCircle className="w-10 h-10 text-cyber-textMuted mx-auto mb-3" />
              <p className="text-cyber-textSecondary text-sm">No programming questions have been assigned to this contest yet.</p>
            </div>
          ) : (
            <div className="glass rounded-2xl overflow-hidden border border-cyber-border/60">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-white/[0.02] border-b border-cyber-border">
                      <th className="py-4 px-6 text-xs font-semibold text-cyber-textSecondary uppercase tracking-wider">Problem Title</th>
                      <th className="py-4 px-6 text-xs font-semibold text-cyber-textSecondary uppercase tracking-wider">Points</th>
                      <th className="py-4 px-6 text-xs font-semibold text-cyber-textSecondary uppercase tracking-wider text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-cyber-border/50">
                    {questions.map((q) => (
                      <tr key={q.id} className="hover:bg-white/[0.01] transition-colors group">
                        <td className="py-4.5 px-6">
                          <span className="text-sm font-semibold text-white group-hover:text-cyber-secondary transition-colors">
                            {q.title}
                          </span>
                        </td>
                        <td className="py-4.5 px-6">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-cyber-secondary/10 border border-cyber-secondary/20 text-cyber-secondary">
                            +{q.points} pts
                          </span>
                        </td>
                        <td className="py-4.5 px-6 text-right">
                          <button
                            onClick={() => navigateTo(`#/questions/${q.id}`)}
                            disabled={isUpcoming}
                            className={`inline-flex items-center gap-1.5 py-1.5 px-4 rounded-lg text-xs font-bold transition-all ${
                              isUpcoming
                                ? 'bg-white/5 border border-cyber-border text-cyber-textMuted cursor-not-allowed'
                                : 'bg-cyber-primary hover:bg-cyber-primaryHover text-white shadow-glow-primary hover:scale-[1.02] active:scale-[0.98]'
                            }`}
                          >
                            <span>{isUpcoming ? 'Locked' : 'Solve'}</span>
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
