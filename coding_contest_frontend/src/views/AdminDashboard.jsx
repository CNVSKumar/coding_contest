import React, { useState, useEffect } from 'react';
import { Settings, Calendar, Plus, Trash2, HelpCircle, Code, PlusCircle, Database, Check } from 'lucide-react';
import { toast } from 'react-toastify';
import api from '../api';
import Modal from '../components/Modal';
import LoadingSkeleton from '../components/LoadingSkeleton';

export default function AdminDashboard() {
  const [contests, setContests] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modal Open States
  const [isCreateContestOpen, setIsCreateContestOpen] = useState(false);
  const [activeAddQuestionContestId, setActiveAddQuestionContestId] = useState(null);
  const [activeAddTestCaseQuestionId, setActiveAddTestCaseQuestionId] = useState(null);

  // Form Fields - Create Contest
  const [mcTitle, setMcTitle] = useState('');
  const [mcDesc, setMcDesc] = useState('');
  const [mcStart, setMcStart] = useState('');
  const [mcEnd, setMcEnd] = useState('');

  // Form Fields - Add Question
  const [mqTitle, setMqTitle] = useState('');
  const [mqPoints, setMqPoints] = useState(100);
  const [mqDesc, setMqDesc] = useState('');
  const [mqInput, setMqInput] = useState('');
  const [mqOutput, setMqOutput] = useState('');
  const [mqConstraints, setMqConstraints] = useState('');

  // Form Fields - Add Test Case
  const [mtcInput, setMtcInput] = useState('');
  const [mtcOutput, setMtcOutput] = useState('');

  // Fetch data
  const fetchContests = async () => {
    try {
      const data = await api.getContests();
      setContests(data || []);
    } catch (err) {
      toast.error('Failed to load contests: ' + err.message);
    }
  };

  useEffect(() => {
    const init = async () => {
      setLoading(true);
      await fetchContests();
      setLoading(false);
    };
    init();
  }, []);

  // Handlers - Create Contest
  const handleCreateContest = async (e) => {
    e.preventDefault();
    const loadingToast = toast.loading('Creating contest...');
    try {
      await api.createContest({
        title: mcTitle,
        description: mcDesc,
        startTime: mcStart,
        endTime: mcEnd
      });
      toast.update(loadingToast, {
        render: 'Contest created successfully!',
        type: 'success',
        isLoading: false,
        autoClose: 3000,
      });
      setIsCreateContestOpen(false);
      // Reset fields
      setMcTitle('');
      setMcDesc('');
      setMcStart('');
      setMcEnd('');
      await fetchContests();
    } catch (err) {
      toast.update(loadingToast, {
        render: err.message || 'Failed to create contest.',
        type: 'error',
        isLoading: false,
        autoClose: 4000,
      });
    }
  };

  // Handlers - Add Question
  const handleAddQuestion = async (e) => {
    e.preventDefault();
    const loadingToast = toast.loading('Adding problem to contest...');
    try {
      const question = await api.createQuestion(activeAddQuestionContestId, {
        title: mqTitle,
        points: parseInt(mqPoints),
        description: mqDesc,
        inputFormat: mqInput,
        outputFormat: mqOutput,
        constraints: mqConstraints
      });
      toast.update(loadingToast, {
        render: 'Problem added successfully! Now add test cases.',
        type: 'success',
        isLoading: false,
        autoClose: 3000,
      });
      setActiveAddQuestionContestId(null);
      // Reset fields
      setMqTitle('');
      setMqPoints(100);
      setMqDesc('');
      setMqInput('');
      setMqOutput('');
      setMqConstraints('');
      
      // Auto trigger test case configuration for the newly created question
      setActiveAddTestCaseQuestionId(question.id);
    } catch (err) {
      toast.update(loadingToast, {
        render: err.message || 'Failed to add problem.',
        type: 'error',
        isLoading: false,
        autoClose: 4000,
      });
    }
  };

  // Handlers - Add Test Case
  const handleAddTestCase = async (e) => {
    e.preventDefault();
    const loadingToast = toast.loading('Saving test case...');
    try {
      await api.createTestCase(activeAddTestCaseQuestionId, {
        inputData: mtcInput,
        expectedOutput: mtcOutput
      });
      toast.update(loadingToast, {
        render: 'Test case saved successfully! Add more if needed.',
        type: 'success',
        isLoading: false,
        autoClose: 3000,
      });
      // Clear fields
      setMtcInput('');
      setMtcOutput('');
    } catch (err) {
      toast.update(loadingToast, {
        render: err.message || 'Failed to save test case.',
        type: 'error',
        isLoading: false,
        autoClose: 4000,
      });
    }
  };

  // Handlers - Delete Contest
  const handleDeleteContest = async (id, title) => {
    if (confirm(`Are you sure you want to delete "${title}"? This will remove all associated questions and submissions.`)) {
      const loadingToast = toast.loading('Deleting contest...');
      try {
        await api.deleteContest(id);
        toast.update(loadingToast, {
          render: 'Contest deleted successfully!',
          type: 'success',
          isLoading: false,
          autoClose: 3000,
        });
        await fetchContests();
      } catch (err) {
        toast.update(loadingToast, {
          render: err.message || 'Failed to delete contest.',
          type: 'error',
          isLoading: false,
          autoClose: 4000,
        });
      }
    }
  };

  if (loading) {
    return <LoadingSkeleton type="dashboard" />;
  }

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 border-b border-cyber-border/40 pb-6">
        <div>
          <h2 className="font-heading text-3xl font-extrabold text-white tracking-tight flex items-center gap-3">
            <Settings className="w-8 h-8 text-cyber-primary animate-spin-[spin_10s_linear_infinite]" />
            <span>Admin Control Panel</span>
          </h2>
          <p className="text-cyber-textSecondary text-sm md:text-base">
            Configure coding contests, problem challenges, and automatic grading test cases.
          </p>
        </div>

        <button
          onClick={() => setIsCreateContestOpen(true)}
          className="w-full sm:w-auto inline-flex items-center justify-center gap-2 text-sm font-semibold text-white bg-cyber-primary hover:bg-cyber-primaryHover py-2.5 px-6 rounded-xl transition-all shadow-glow-primary hover:scale-[1.02] active:scale-[0.98]"
        >
          <Plus className="w-5 h-5 shrink-0" />
          <span>Create Contest</span>
        </button>
      </div>

      {/* Contests Management Section */}
      <div className="space-y-6">
        <h3 className="font-heading text-xl font-bold text-white pl-1">
          Manage Configured Contests
        </h3>

        {contests.length === 0 ? (
          <div className="glass p-12 text-center rounded-2xl border border-cyber-border/40">
            <HelpCircle className="w-10 h-10 text-cyber-textMuted mx-auto mb-3" />
            <p className="text-cyber-textSecondary text-sm mb-4">No contests have been configured yet.</p>
            <button
              onClick={() => setIsCreateContestOpen(true)}
              className="inline-flex items-center gap-1 text-xs font-bold text-cyber-primary hover:underline"
            >
              Configure first contest now →
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {contests.map((c) => {
              const statusClass = c.status === 'ACTIVE'
                ? 'bg-cyber-success/15 border-cyber-success/20 text-cyber-success'
                : c.status === 'UPCOMING'
                ? 'bg-amber-500/10 border-amber-500/20 text-amber-500'
                : 'bg-white/5 border-white/10 text-cyber-textSecondary';

              return (
                <div
                  key={c.id}
                  className="glass p-5 rounded-2xl border border-cyber-border/50 hover:border-cyber-primary/20 flex flex-col md:flex-row justify-between items-start md:items-center gap-5 transition-all"
                >
                  <div className="space-y-1.5">
                    <div className="flex flex-wrap items-center gap-2.5">
                      <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full border uppercase ${statusClass}`}>
                        {c.status}
                      </span>
                      <h4 className="font-heading font-bold text-white text-base md:text-lg">
                        {c.title}
                      </h4>
                    </div>

                    <p className="text-xs text-cyber-textSecondary line-clamp-2 max-w-2xl leading-relaxed">
                      {c.description || 'No description provided.'}
                    </p>

                    <div className="flex items-center gap-2 text-[10px] text-cyber-textMuted font-mono">
                      <Calendar className="w-3.5 h-3.5" />
                      <span>
                        {new Date(c.startTime).toLocaleString()} — {new Date(c.endTime).toLocaleString()}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 w-full md:w-auto shrink-0 border-t border-cyber-border/20 md:border-none pt-4 md:pt-0">
                    <button
                      onClick={() => setActiveAddQuestionContestId(c.id)}
                      className="flex-1 md:flex-initial inline-flex items-center justify-center gap-1.5 py-2 px-4 rounded-xl text-xs font-semibold text-cyber-secondary border border-cyber-secondary/30 hover:border-cyber-secondary/70 bg-cyber-secondary/5 hover:bg-cyber-secondary/15 transition-all active:scale-[0.98]"
                    >
                      <PlusCircle className="w-4 h-4 shrink-0" />
                      <span>Add Problem</span>
                    </button>

                    <button
                      onClick={() => handleDeleteContest(c.id, c.title)}
                      className="inline-flex items-center justify-center p-2 rounded-xl text-red-400 border border-red-500/10 hover:border-red-500/40 bg-red-500/5 hover:bg-red-500/10 transition-all active:scale-[0.98]"
                      title="Delete Contest"
                    >
                      <Trash2 className="w-4.5 h-4.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ==================================================== */}
      {/* MODAL: CREATE CONTEST */}
      {/* ==================================================== */}
      <Modal
        isOpen={isCreateContestOpen}
        onClose={() => setIsCreateContestOpen(false)}
        title="Create New Contest"
      >
        <form onSubmit={handleCreateContest} className="space-y-4">
          <div className="space-y-1">
            <label className="text-xs font-semibold text-cyber-textSecondary uppercase tracking-wider">Contest Title</label>
            <input
              type="text"
              value={mcTitle}
              onChange={(e) => setMcTitle(e.target.value)}
              className="w-full bg-[#080b12] border border-cyber-border rounded-xl py-2.5 px-4 text-sm text-white focus:outline-none focus:border-cyber-primary/70 transition-all"
              required
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-cyber-textSecondary uppercase tracking-wider">Description</label>
            <textarea
              value={mcDesc}
              onChange={(e) => setMcDesc(e.target.value)}
              className="w-full h-24 bg-[#080b12] border border-cyber-border rounded-xl py-2.5 px-4 text-sm text-white focus:outline-none focus:border-cyber-primary/70 transition-all resize-none"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-cyber-textSecondary uppercase tracking-wider">Start Time</label>
              <input
                type="datetime-local"
                value={mcStart}
                onChange={(e) => setMcStart(e.target.value)}
                className="w-full bg-[#080b12] border border-cyber-border rounded-xl py-2.5 px-4 text-sm text-white focus:outline-none focus:border-cyber-primary/70 transition-all"
                required
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-semibold text-cyber-textSecondary uppercase tracking-wider">End Time</label>
              <input
                type="datetime-local"
                value={mcEnd}
                onChange={(e) => setMcEnd(e.target.value)}
                className="w-full bg-[#080b12] border border-cyber-border rounded-xl py-2.5 px-4 text-sm text-white focus:outline-none focus:border-cyber-primary/70 transition-all"
                required
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 border-t border-cyber-border/40 pt-4 mt-6">
            <button
              type="button"
              onClick={() => setIsCreateContestOpen(false)}
              className="py-2 px-4 rounded-xl text-xs font-semibold text-cyber-textSecondary hover:text-white bg-white/5 border border-cyber-border transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="py-2 px-5 text-xs font-bold text-white bg-cyber-primary hover:bg-cyber-primaryHover rounded-xl shadow-glow-primary transition-all"
            >
              Create Contest
            </button>
          </div>
        </form>
      </Modal>

      {/* ==================================================== */}
      {/* MODAL: ADD PROBLEM */}
      {/* ==================================================== */}
      <Modal
        isOpen={activeAddQuestionContestId !== null}
        onClose={() => setActiveAddQuestionContestId(null)}
        title={`Add Problem to Contest #${activeAddQuestionContestId}`}
      >
        <form onSubmit={handleAddQuestion} className="space-y-4">
          <div className="space-y-1">
            <label className="text-xs font-semibold text-cyber-textSecondary uppercase tracking-wider">Problem Title</label>
            <input
              type="text"
              value={mqTitle}
              onChange={(e) => setMqTitle(e.target.value)}
              className="w-full bg-[#080b12] border border-cyber-border rounded-xl py-2.5 px-4 text-sm text-white focus:outline-none focus:border-cyber-primary/70 transition-all"
              required
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-cyber-textSecondary uppercase tracking-wider">Points Value</label>
            <input
              type="number"
              value={mqPoints}
              onChange={(e) => setMqPoints(e.target.value)}
              className="w-full bg-[#080b12] border border-cyber-border rounded-xl py-2.5 px-4 text-sm text-white focus:outline-none focus:border-cyber-primary/70 transition-all"
              min="0"
              required
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-cyber-textSecondary uppercase tracking-wider">Description</label>
            <textarea
              value={mqDesc}
              onChange={(e) => setMqDesc(e.target.value)}
              className="w-full h-20 bg-[#080b12] border border-cyber-border rounded-xl py-2 px-4 text-sm text-white focus:outline-none focus:border-cyber-primary/70 transition-all resize-none"
              required
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-cyber-textSecondary uppercase tracking-wider">Input Format</label>
            <textarea
              value={mqInput}
              onChange={(e) => setMqInput(e.target.value)}
              className="w-full h-14 bg-[#080b12] border border-cyber-border rounded-xl py-2 px-4 text-sm text-white focus:outline-none focus:border-cyber-primary/70 transition-all resize-none"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-cyber-textSecondary uppercase tracking-wider">Output Format</label>
            <textarea
              value={mqOutput}
              onChange={(e) => setMqOutput(e.target.value)}
              className="w-full h-14 bg-[#080b12] border border-cyber-border rounded-xl py-2 px-4 text-sm text-white focus:outline-none focus:border-cyber-primary/70 transition-all resize-none"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-cyber-textSecondary uppercase tracking-wider">Constraints</label>
            <textarea
              value={mqConstraints}
              onChange={(e) => setMqConstraints(e.target.value)}
              className="w-full h-14 bg-[#080b12] border border-cyber-border rounded-xl py-2 px-4 text-sm text-white focus:outline-none focus:border-cyber-primary/70 transition-all resize-none"
            />
          </div>

          <div className="flex justify-end gap-3 border-t border-cyber-border/40 pt-4 mt-6">
            <button
              type="button"
              onClick={() => setActiveAddQuestionContestId(null)}
              className="py-2 px-4 rounded-xl text-xs font-semibold text-cyber-textSecondary hover:text-white bg-white/5 border border-cyber-border transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="py-2 px-5 text-xs font-bold text-white bg-cyber-primary hover:bg-cyber-primaryHover rounded-xl shadow-glow-primary transition-all"
            >
              Add Problem
            </button>
          </div>
        </form>
      </Modal>

      {/* ==================================================== */}
      {/* MODAL: ADD TEST CASE */}
      {/* ==================================================== */}
      <Modal
        isOpen={activeAddTestCaseQuestionId !== null}
        onClose={() => setActiveAddTestCaseQuestionId(null)}
        title={`Configure Test Cases for Problem #${activeAddTestCaseQuestionId}`}
      >
        <p className="text-xs text-cyber-textSecondary leading-relaxed mb-4">
          Solutions will be automatically graded against these input values and expected outputs. You can add multiple test cases iteratively.
        </p>

        <form onSubmit={handleAddTestCase} className="space-y-4">
          <div className="space-y-1">
            <label className="text-xs font-semibold text-cyber-textSecondary uppercase tracking-wider">Test Input</label>
            <textarea
              value={mtcInput}
              onChange={(e) => setMtcInput(e.target.value)}
              className="w-full h-24 bg-[#080b12] border border-cyber-border rounded-xl py-2.5 px-4 text-xs font-mono text-white focus:outline-none focus:border-cyber-primary/70 transition-all"
              placeholder="e.g. 5\n1 2 3 4 5"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-cyber-textSecondary uppercase tracking-wider">Expected Output</label>
            <textarea
              value={mtcOutput}
              onChange={(e) => setMtcOutput(e.target.value)}
              className="w-full h-24 bg-[#080b12] border border-cyber-border rounded-xl py-2.5 px-4 text-xs font-mono text-white focus:outline-none focus:border-cyber-primary/70 transition-all"
              placeholder="e.g. 15"
              required
            />
          </div>

          <div className="flex justify-between items-center border-t border-cyber-border/40 pt-4 mt-6">
            <button
              type="button"
              onClick={() => setActiveAddTestCaseQuestionId(null)}
              className="py-2 px-4 inline-flex items-center gap-1 text-xs font-bold text-cyber-success hover:underline transition-all bg-cyber-success/5 border border-cyber-success/15 rounded-xl"
            >
              <Check className="w-3.5 h-3.5" />
              <span>Done / Finish Setup</span>
            </button>
            
            <button
              type="submit"
              className="py-2 px-5 inline-flex items-center gap-1.5 text-xs font-bold text-white bg-cyber-primary hover:bg-cyber-primaryHover rounded-xl shadow-glow-primary transition-all"
            >
              <Database className="w-3.5 h-3.5" />
              <span>Save Test Case</span>
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
