import React, { useState } from 'react';
import { X, Sparkles, Terminal, Copy, Check, ShieldAlert, Send } from 'lucide-react';

export default function AiCopilotModal({ finding, onClose, onAskAi }) {
  const [copied, setCopied] = useState(false);
  const [chatQuestion, setChatQuestion] = useState('');
  const [chatAnswer, setChatAnswer] = useState(null);
  const [isAsking, setIsAsking] = useState(false);

  if (!finding) return null;

  const handleCopy = () => {
    navigator.clipboard.writeText(finding.cli_command);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSendChat = async (e) => {
    e.preventDefault();
    if (!chatQuestion.trim()) return;
    setIsAsking(true);
    try {
      const res = await onAskAi(chatQuestion);
      setChatAnswer(res);
    } finally {
      setIsAsking(false);
      setChatQuestion('');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in">
      <div className="w-full max-w-2xl rounded-2xl bg-slate-900 border border-slate-800 shadow-2xl p-6 space-y-6 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-start justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-500 flex items-center justify-center shadow-lg shadow-emerald-950/40">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">{finding.title}</h3>
              <p className="text-xs text-slate-400 font-mono mt-0.5">{finding.resource_id}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Impact & Analysis */}
        <div className="grid grid-cols-2 gap-4">
          <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 space-y-1">
            <span className="text-xs text-slate-400 uppercase tracking-wider font-semibold">Immediate Monthly Savings</span>
            <div className="text-2xl font-extrabold text-emerald-400 font-mono">
              +${finding.potential_monthly_savings.toFixed(2)}/mo
            </div>
            <span className="text-[11px] text-slate-500 block">
              Annual impact: ${(finding.potential_monthly_savings * 12).toFixed(2)}/yr
            </span>
          </div>

          <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 space-y-1">
            <span className="text-xs text-slate-400 uppercase tracking-wider font-semibold">Safety & Risk Assessment</span>
            <div className="text-lg font-bold text-white flex items-center gap-2 mt-1">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400"></span>
              {finding.risk}
            </div>
            <span className="text-[11px] text-slate-400 block">
              {finding.risk === 'Safe' ? 'No impact on active traffic or servers.' : 'Non-disruptive cloud modification.'}
            </span>
          </div>
        </div>

        {/* Detailed Explanation */}
        <div className="space-y-2">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">Root Cause & Analysis</h4>
          <p className="text-sm text-slate-300 leading-relaxed bg-slate-950/50 p-4 rounded-xl border border-slate-850">
            {finding.description}
          </p>
        </div>

        {/* Executable CLI Command */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <Terminal className="w-3.5 h-3.5 text-teal-400" />
              1-Click Remediation Command
            </h4>
            <button
              onClick={handleCopy}
              className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-400 hover:text-emerald-300"
            >
              {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              {copied ? 'Copied to Clipboard' : 'Copy AWS CLI'}
            </button>
          </div>
          <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 font-mono text-xs text-slate-200 overflow-x-auto selection:bg-emerald-500 selection:text-white">
            {finding.cli_command}
          </div>
        </div>

        {/* AI Copilot Interactive Inquiry */}
        <div className="pt-2 border-t border-slate-800 space-y-3">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
            Ask AI FinOps Copilot
          </h4>

          {chatAnswer && (
            <div className="p-4 rounded-xl bg-emerald-950/20 border border-emerald-500/30 text-xs text-slate-200 whitespace-pre-line leading-relaxed font-sans">
              {chatAnswer}
            </div>
          )}

          <form onSubmit={handleSendChat} className="flex gap-2">
            <input
              type="text"
              placeholder="e.g. Can I convert this to Terraform? Or will this cause downtime?"
              value={chatQuestion}
              onChange={(e) => setChatQuestion(e.target.value)}
              className="flex-1 rounded-xl bg-slate-950 border border-slate-800 px-3.5 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
            />
            <button
              type="submit"
              disabled={isAsking}
              className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold flex items-center gap-1.5 transition disabled:opacity-50"
            >
              <Send className="w-3 h-3" />
              {isAsking ? 'Thinking...' : 'Ask'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
