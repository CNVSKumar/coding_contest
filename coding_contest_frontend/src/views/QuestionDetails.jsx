import React, { useState, useEffect } from 'react';
import Editor from '@monaco-editor/react';
import { ArrowLeft, Play, Terminal, HelpCircle, Code, Cpu, Award } from 'lucide-react';
import { toast } from 'react-toastify';
import api from '../api';
import LoadingSkeleton from '../components/LoadingSkeleton';

const templates = {
  PYTHON: `# Write your Python solution here\n# Input is read from standard input\nimport sys\n\ndef main():\n    # read input data\n    # line = sys.stdin.readline()\n    pass\n\nif __name__ == "__main__":\n    main()`,
  JAVA: `// Write your Java solution here\n// The class name must be Main\nimport java.util.Scanner;\n\npublic class Main {\n    public static void main(String[] args) {\n        Scanner scanner = new Scanner(System.in);\n        // Write logic here\n    }\n}`
};

export default function QuestionDetails({ questionId, navigateTo }) {
  const [question, setQuestion] = useState(null);
  const [loading, setLoading] = useState(true);
  const [language, setLanguage] = useState('PYTHON');
  const [code, setCode] = useState(templates.PYTHON);
  const [evaluationStatus, setEvaluationStatus] = useState('idle'); // 'idle', 'evaluating', 'success', 'error'
  const [submissionResult, setSubmissionResult] = useState(null);

  useEffect(() => {
    async function fetchQuestionDetails() {
      try {
        const qData = await api.getQuestion(questionId);
        setQuestion(qData);
        // Load correct language default template
        setCode(templates[language]);
      } catch (err) {
        toast.error('Failed to load problem: ' + err.message);
      } finally {
        setLoading(false);
      }
    }
    fetchQuestionDetails();
  }, [questionId]);

  const handleLanguageChange = (e) => {
    const newLang = e.target.value;
    setLanguage(newLang);
    setCode(templates[newLang]);
  };

  const handleSubmit = async () => {
    setEvaluationStatus('evaluating');
    setSubmissionResult(null);

    try {
      const result = await api.submitSolution(code, language, questionId);
      setSubmissionResult(result);
      if (result.status === 'ACCEPTED') {
        setEvaluationStatus('success');
        toast.success(`Solution accepted! +${result.score} points.`);
      } else {
        setEvaluationStatus('error');
        toast.error(`Solution failed: ${result.status}`);
      }
    } catch (err) {
      setEvaluationStatus('error');
      setSubmissionResult({
        status: 'SUBMISSION FAILED',
        errorMessage: err.message,
        executionTimeMs: 0
      });
      toast.error('Error submitting code: ' + err.message);
    }
  };

  if (loading) {
    return <LoadingSkeleton type="table" />;
  }

  if (!question) {
    return (
      <div className="text-center py-16 glass max-w-xl mx-auto rounded-3xl border border-red-500/20 bg-red-500/5">
        <h3 className="text-xl font-bold text-red-400 mb-2">Problem Not Found</h3>
        <p className="text-cyber-textSecondary mb-6">The requested problem could not be found or has been deleted.</p>
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

  return (
    <div className="flex flex-col gap-6 animate-fadeIn h-full">
      {/* Top Banner Navigation */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-cyber-border/40 pb-4">
        <button
          onClick={() => navigateTo(`#/contests/${question.contestId}`)}
          className="group inline-flex items-center gap-2 text-xs font-semibold text-cyber-textSecondary hover:text-white transition-colors py-1.5 px-3 bg-white/[0.02] hover:bg-white/[0.06] border border-cyber-border rounded-xl"
        >
          <ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-0.5 transition-transform" />
          <span>Back to Contest</span>
        </button>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 px-3 py-1 bg-cyber-secondary/10 border border-cyber-secondary/20 rounded-lg text-cyber-secondary text-xs font-bold">
            <Award className="w-4.5 h-4.5" />
            <span>{question.points} Points</span>
          </div>
        </div>
      </div>

      {/* Resizable Two Pane IDE Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 min-h-[550px] lg:h-[calc(100vh-210px)]">
        
        {/* Left Pane: Description & Specifications */}
        <div className="glass rounded-2xl flex flex-col overflow-hidden border border-cyber-border/60">
          <div className="bg-white/[0.02] border-b border-cyber-border px-5 py-3.5 flex items-center justify-between">
            <h3 className="font-heading text-sm font-bold text-white flex items-center gap-2">
              <HelpCircle className="w-4 h-4 text-cyber-primary" />
              <span>Problem Description</span>
            </h3>
            <span className="text-xs font-semibold text-cyber-textMuted uppercase">
              {question.title}
            </span>
          </div>
          
          <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scroll select-text">
            {/* Description Text */}
            <div className="space-y-4">
              <h4 className="text-sm font-bold text-white border-b border-cyber-border/30 pb-1.5">Overview</h4>
              <p className="text-sm text-cyber-textSecondary leading-relaxed whitespace-pre-line">
                {question.description}
              </p>
            </div>

            {/* Input Format */}
            {question.inputFormat && (
              <div className="space-y-2 bg-[#080a13] p-4 rounded-xl border border-cyber-border/40">
                <h4 className="text-xs font-bold uppercase tracking-wider text-cyber-secondary">Input Format</h4>
                <p className="text-xs text-cyber-textSecondary leading-relaxed whitespace-pre-line font-mono">
                  {question.inputFormat}
                </p>
              </div>
            )}

            {/* Output Format */}
            {question.outputFormat && (
              <div className="space-y-2 bg-[#080a13] p-4 rounded-xl border border-cyber-border/40">
                <h4 className="text-xs font-bold uppercase tracking-wider text-cyber-secondary">Output Format</h4>
                <p className="text-xs text-cyber-textSecondary leading-relaxed whitespace-pre-line font-mono">
                  {question.outputFormat}
                </p>
              </div>
            )}

            {/* Constraints */}
            {question.constraints && (
              <div className="space-y-2 bg-[#080a13] p-4 rounded-xl border border-cyber-border/40">
                <h4 className="text-xs font-bold uppercase tracking-wider text-cyber-secondary">Constraints</h4>
                <p className="text-xs text-cyber-textSecondary leading-relaxed whitespace-pre-line font-mono">
                  {question.constraints}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Right Pane: Code Editor IDE */}
        <div className="glass rounded-2xl flex flex-col overflow-hidden border border-cyber-border/60">
          
          {/* Header IDE Controls */}
          <div className="bg-white/[0.02] border-b border-cyber-border px-5 py-3 flex items-center justify-between">
            <h3 className="font-heading text-sm font-bold text-white flex items-center gap-2">
              <Code className="w-4 h-4 text-cyber-secondary" />
              <span>Source Code Editor</span>
            </h3>
            
            <div className="flex items-center gap-3">
              <select
                value={language}
                onChange={handleLanguageChange}
                className="bg-[#080a12] border border-cyber-border rounded-lg text-xs font-bold text-cyber-textSecondary py-1.5 px-3 focus:outline-none focus:border-cyber-primary/70 font-sans"
              >
                <option value="PYTHON">Python</option>
                <option value="JAVA">Java</option>
              </select>
            </div>
          </div>

          {/* Monaco Editor Wrapper */}
          <div className="flex-1 relative bg-[#1e1e1e] overflow-hidden min-h-[300px]">
            <Editor
              height="100%"
              defaultLanguage="python"
              language={language.toLowerCase()}
              theme="vs-dark"
              value={code}
              onChange={(val) => setCode(val || '')}
              options={{
                fontSize: 14,
                minimap: { enabled: false },
                lineNumbers: 'on',
                fontFamily: 'Fira Code, monospace',
                tabSize: 4,
                scrollBeyondLastLine: false,
                automaticLayout: true,
                padding: { top: 12, bottom: 12 }
              }}
            />
          </div>

          {/* Console Output Terminal */}
          <div className="h-44 bg-[#04060c] border-t border-cyber-border/80 flex flex-col select-text font-mono">
            {/* Console Tabs */}
            <div className="flex items-center px-4 py-2 border-b border-cyber-border/50 bg-[#060811] text-[10px] uppercase font-bold text-cyber-textMuted gap-2 select-none">
              <Terminal className="w-3.5 h-3.5" />
              <span>Submission Status Logs</span>
            </div>

            {/* Console Log Area */}
            <div className="flex-1 p-4 overflow-y-auto text-xs custom-scroll">
              {evaluationStatus === 'idle' && (
                <span className="text-cyber-textMuted font-mono">
                  Ready to test. Logs will compile here after submission...
                </span>
              )}

              {evaluationStatus === 'evaluating' && (
                <div className="flex items-center gap-3 text-amber-400 py-1">
                  <div className="w-4 h-4 border-2 border-amber-400/30 border-t-amber-400 rounded-full animate-spin shrink-0" />
                  <span className="font-semibold uppercase tracking-wider animate-pulse">
                    Evaluating Solution against Test Cases...
                  </span>
                </div>
              )}

              {evaluationStatus === 'success' && submissionResult && (
                <div className="space-y-2 text-cyber-success">
                  <div className="flex items-center gap-2 font-bold text-sm">
                    <span>✓</span>
                    <span>ACCEPTED</span>
                  </div>
                  <div className="h-[1px] bg-cyber-success/20 my-2" />
                  <div className="grid grid-cols-2 gap-y-1 text-cyber-textSecondary font-mono text-[11px]">
                    <div className="text-cyber-textMuted uppercase font-semibold">Points Awarded:</div>
                    <div className="text-cyber-success font-bold">+{submissionResult.score} Points</div>
                    <div className="text-cyber-textMuted uppercase font-semibold">Execution Time:</div>
                    <div>{submissionResult.executionTimeMs} ms</div>
                  </div>
                </div>
              )}

              {evaluationStatus === 'error' && submissionResult && (
                <div className="space-y-2 text-cyber-danger">
                  <div className="flex items-center gap-2 font-bold text-sm">
                    <span>✕</span>
                    <span>{submissionResult.status}</span>
                  </div>
                  <div className="h-[1px] bg-cyber-danger/20 my-2" />
                  <p className="text-cyber-textSecondary text-[11px] whitespace-pre-wrap leading-relaxed max-h-[70px] overflow-y-auto">
                    {submissionResult.errorMessage || 'Wrong Answer'}
                  </p>
                  <div className="grid grid-cols-2 gap-y-1 text-cyber-textSecondary font-mono text-[11px]">
                    <div className="text-cyber-textMuted uppercase font-semibold">Execution Time:</div>
                    <div>{submissionResult.executionTimeMs} ms</div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* IDE Footer Actions */}
          <div className="bg-white/[0.01] border-t border-cyber-border/70 px-5 py-3 flex items-center justify-between">
            <button
              onClick={() => navigateTo(`#/contests/${question.contestId}`)}
              className="py-2 px-4 rounded-xl text-xs font-semibold text-cyber-textSecondary hover:text-white bg-white/[0.02] hover:bg-white/[0.06] border border-cyber-border transition-colors font-sans"
            >
              Back
            </button>

            <button
              onClick={handleSubmit}
              disabled={evaluationStatus === 'evaluating'}
              className="inline-flex items-center gap-2 py-2 px-5 text-xs font-bold text-white bg-cyber-primary hover:bg-cyber-primaryHover disabled:opacity-50 transition-all rounded-xl shadow-glow-primary hover:scale-[1.03] active:scale-[0.98]"
            >
              <Cpu className="w-4 h-4 shrink-0" />
              <span>Submit Solution</span>
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}
