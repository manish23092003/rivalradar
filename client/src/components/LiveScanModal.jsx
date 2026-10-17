import React, { useEffect, useRef, useState } from 'react';
import { 
  Check, 
  X, 
  RefreshCw, 
  Clock, 
  Terminal,
  AlertCircle
} from 'lucide-react';
import RadarMark from './RadarMark';

const STAGES = [
  { id: 'primary', label: 'Primary Target Crawl', desc: 'Agent inspecting marketing & documentation pages' },
  { id: 'discovery', label: 'Competitor Discovery', desc: 'Autonomous discovery of 2 direct market rivals' },
  { id: 'competitors', label: 'Rival Pricing & Features', desc: 'Multi-target web extraction of subscription tiers' },
  { id: 'synthesis', label: 'Matrix Synthesis & Diff', desc: 'Aligning comparative data and calculating historical diff' },
];

export default function LiveScanModal({
  isOpen,
  progress = { stage: 'init', message: 'Starting agents...', percent: 0 },
  logs = [],
  onCancel,
  targetUrl = '',
  errorMessage = null,
  onRetry,
}) {
  const terminalEndRef = useRef(null);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);

  useEffect(() => {
    if (!isOpen) {
      setElapsedSeconds(0);
      return;
    }
    const interval = setInterval(() => {
      setElapsedSeconds((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [isOpen]);

  useEffect(() => {
    terminalEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [logs]);

  if (!isOpen) return null;

  const formatElapsed = (sec) => {
    const mins = Math.floor(sec / 60);
    const secs = sec % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const getStageState = (stageId, index) => {
    const stageOrder = ['primary', 'discovery', 'competitors', 'synthesis'];
    const currentStage = progress.stage || 'init';
    
    if (errorMessage) return 'error';
    if (currentStage === 'complete') return 'completed';

    const currentIndex = stageOrder.indexOf(currentStage);
    if (currentIndex === -1) {
      return index === 0 ? 'active' : 'pending';
    }

    if (index < currentIndex) return 'completed';
    if (index === currentIndex) return 'active';
    return 'pending';
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#202522]/50 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="relative w-full max-w-xl bg-white border border-[#E3E0D7] rounded-sm shadow-md overflow-hidden">
        
        {/* Subtle Olive Top Rule */}
        <div className="h-1 w-full bg-[#68745C]" />

        <div className="p-6">
          {/* Header */}
          <div className="flex items-center justify-between pb-4 border-b border-[#E3E0D7]">
            <div className="flex items-center space-x-3">
              <RadarMark size={22} />
              <div>
                <h3 className="font-serif-editorial text-lg font-semibold text-[#202522] flex items-center gap-2">
                  <span>Autonomous Research Protocol</span>
                  {errorMessage ? (
                    <span className="font-mono-technical text-[9px] uppercase px-1.5 py-0.2 bg-[#F8ECEB] text-[#9E3A33] border border-[#E9C0BC] rounded-xs font-semibold">
                      Failed
                    </span>
                  ) : (
                    <span className="font-mono-technical text-[9px] uppercase px-1.5 py-0.2 bg-[#ECE9E0] text-[#68745C] border border-[#E3E0D7] rounded-xs font-semibold">
                      Running
                    </span>
                  )}
                </h3>
                <p className="font-mono-technical text-xs text-[#73766E]">
                  Target: <span className="text-[#202522] font-semibold">{targetUrl}</span>
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1 font-mono-technical text-xs text-[#73766E] bg-[#F5F3ED] px-2 py-0.5 rounded-xs border border-[#E3E0D7]">
                <Clock className="h-3 w-3 text-[#68745C]" />
                <span>{formatElapsed(elapsedSeconds)}</span>
              </div>

              {onCancel && (
                <button
                  onClick={onCancel}
                  className="rounded-sm p-1 text-[#73766E] hover:bg-[#ECE9E0] hover:text-[#202522] transition cursor-pointer"
                  title="Close Dialog"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>
          </div>

          {/* Error Message */}
          {errorMessage ? (
            <div className="mt-4 p-4 rounded-xs border border-[#E9C0BC] bg-[#F8ECEB] text-xs text-[#9E3A33]">
              <div className="flex items-start gap-2">
                <AlertCircle className="h-4 w-4 text-[#9E3A33] shrink-0 mt-0.5" />
                <div className="flex-1 font-mono-technical">
                  <p className="font-semibold text-sm">Research Exception Encountered</p>
                  <p className="mt-1 leading-relaxed text-[11px]">{errorMessage}</p>
                  {onRetry && (
                    <button
                      onClick={onRetry}
                      className="mt-3 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-sm bg-[#9E3A33] hover:bg-[#852E28] text-white font-medium transition cursor-pointer text-xs"
                    >
                      <RefreshCw className="h-3 w-3" />
                      <span>Retry Research Run</span>
                    </button>
                  )}
                </div>
              </div>
            </div>
          ) : (
            /* Live Activity Indicator */
            <div className="mt-4 pb-3 border-b border-[#E3E0D7]">
              <div className="flex items-center justify-between text-xs font-mono-technical">
                <span className="text-[#202522] flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-[#68745C] animate-pulse" />
                  {progress.message || 'Deploying TinyFish web agents...'}
                </span>
                <span className="text-[#73766E] text-[10px] uppercase tracking-wider">
                  Live Feed
                </span>
              </div>
            </div>
          )}

          {/* Vertical Research Timeline */}
          <div className="mt-4 space-y-2.5">
            {STAGES.map((stage, idx) => {
              const state = getStageState(stage.id, idx);
              const isCompleted = state === 'completed';
              const isActive = state === 'active';

              return (
                <div
                  key={stage.id}
                  className={`flex items-start space-x-3 p-2.5 rounded-xs border transition ${
                    isActive
                      ? 'border-[#68745C] bg-[#ECE9E0]/40'
                      : isCompleted
                      ? 'border-[#C3DCC8] bg-[#EAF2EC]/40'
                      : 'border-[#E3E0D7] bg-[#F5F3ED]/40 opacity-60'
                  }`}
                >
                  <div className="mt-0.5 shrink-0">
                    {isCompleted ? (
                      <span className="flex h-4 w-4 items-center justify-center rounded-full bg-[#2D6A4F] text-white">
                        <Check className="h-2.5 w-2.5 stroke-[3]" />
                      </span>
                    ) : isActive ? (
                      <div className="h-4 w-4 rounded-full border-2 border-[#68745C] border-t-transparent animate-spin" />
                    ) : (
                      <span className="font-mono-technical text-[10px] text-[#73766E] flex h-4 w-4 items-center justify-center rounded-full border border-[#E3E0D7] bg-white">
                        {idx + 1}
                      </span>
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className={`text-xs font-medium ${isActive ? 'text-[#202522] font-semibold' : isCompleted ? 'text-[#2D6A4F]' : 'text-[#73766E]'}`}>
                      {stage.label}
                    </p>
                    <p className="text-[11px] text-[#73766E] line-clamp-1">{stage.desc}</p>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Monospaced Evidence Stream Console */}
          <div className="mt-4 rounded-xs border border-[#E3E0D7] bg-[#F5F3ED] p-3 font-mono-technical text-[11px]">
            <div className="flex items-center justify-between pb-1.5 mb-2 border-b border-[#E3E0D7] text-[10px] text-[#73766E] uppercase tracking-wider">
              <span className="flex items-center gap-1.5">
                <Terminal className="h-3 w-3 text-[#68745C]" />
                Agent Execution Ledger
              </span>
              <span className="text-[#2D6A4F] flex items-center gap-1">
                <span className="h-1.5 w-1.5 rounded-full bg-[#2D6A4F]" />
                Connected
              </span>
            </div>

            <div className="h-24 overflow-y-auto space-y-1 pr-1 text-[#73766E]">
              {logs.length === 0 ? (
                <div className="text-[#73766E] italic">Awaiting telemetry from research agent...</div>
              ) : (
                logs.map((log, i) => (
                  <div key={i} className="flex items-start space-x-1.5">
                    <span className="text-[#68745C] select-none font-bold">›</span>
                    <span className={i === logs.length - 1 ? 'text-[#202522] font-medium' : 'text-[#73766E]'}>
                      {log}
                    </span>
                  </div>
                ))
              )}
              <div ref={terminalEndRef} />
            </div>
          </div>

          <p className="mt-3 text-center text-[10px] font-mono-technical text-[#73766E]">
            TinyFish agents autonomously browse and extract real structured data from public DOM elements.
          </p>

        </div>
      </div>
    </div>
  );
}
