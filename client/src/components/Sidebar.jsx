import React from 'react';
import { 
  Radar, 
  History, 
  Key, 
  ChevronLeft, 
  ChevronRight, 
  Sliders, 
  BookmarkCheck,
  Building,
  ArrowUpRight
} from 'lucide-react';
import RadarMark from './RadarMark';

const PRESET_QUICK_TARGETS = [
  { name: 'Linear', domain: 'linear.app', sector: 'Issue Tracking' },
  { name: 'Resend', domain: 'resend.com', sector: 'Developer Email' },
  { name: 'Supabase', domain: 'supabase.com', sector: 'Data Platform' },
  { name: 'Notion', domain: 'notion.so', sector: 'Knowledge Base' },
];

export default function Sidebar({
  isCollapsed,
  onToggleCollapse,
  activeTab,
  setActiveTab,
  onOpenHistory,
  historyCount = 0,
  tinyfishConfigured,
  onOpenSettings,
  onSelectStudy,
  isScanning,
}) {
  return (
    <aside
      className={`hidden md:flex flex-col border-r border-[#E3E0D7] bg-[#F5F3ED] transition-all duration-200 ease-in-out shrink-0 sticky top-0 h-screen z-30 select-none ${
        isCollapsed ? 'w-16' : 'w-60'
      }`}
    >
      {/* Brand Header */}
      <div className="h-14 flex items-center px-4 border-b border-[#E3E0D7] justify-between bg-[#F5F3ED]">
        <div 
          onClick={() => setActiveTab('scanner')} 
          className="flex items-center gap-2.5 cursor-pointer overflow-hidden group"
          title="RivalRadar — Market Intelligence"
        >
          <RadarMark size={20} />
          {!isCollapsed && (
            <div className="flex flex-col">
              <span className="font-serif-editorial text-[17px] font-semibold tracking-tight text-[#202522] leading-none">
                RivalRadar
              </span>
              <span className="text-[10px] text-[#73766E] uppercase tracking-wider font-mono-technical mt-0.5">
                Market Intelligence
              </span>
            </div>
          )}
        </div>

        {/* Collapse Toggle Button */}
        <button
          onClick={onToggleCollapse}
          className="h-6 w-6 rounded-sm border border-[#E3E0D7] bg-white text-[#73766E] hover:text-[#202522] hover:border-[#C8C4B7] flex items-center justify-center transition cursor-pointer"
          title={isCollapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
          aria-label={isCollapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
        >
          {isCollapsed ? <ChevronRight className="h-3 w-3" /> : <ChevronLeft className="h-3 w-3" />}
        </button>
      </div>

      {/* Main Navigation Items */}
      <div className="flex-1 py-4 px-2 space-y-1 overflow-y-auto">
        <div className={`px-2 pb-1 text-[9px] font-mono-technical uppercase tracking-wider text-[#73766E] ${isCollapsed ? 'text-center' : ''}`}>
          {isCollapsed ? '—' : 'Workspace'}
        </div>

        {/* Market Radar Tab */}
        <button
          onClick={() => setActiveTab('scanner')}
          className={`w-full flex items-center gap-2.5 px-2.5 py-2 rounded-sm text-xs font-medium transition cursor-pointer text-left ${
            activeTab === 'scanner'
              ? 'bg-[#ECE9E0] text-[#202522] border-l-2 border-[#68745C] font-semibold'
              : 'text-[#73766E] hover:text-[#202522] hover:bg-[#ECE9E0]/60'
          }`}
          title="Market Radar Analysis"
        >
          <Radar className={`h-3.5 w-3.5 shrink-0 ${activeTab === 'scanner' ? 'text-[#68745C]' : 'text-[#73766E]'}`} />
          {!isCollapsed && <span>Market Radar</span>}
        </button>

        {/* Research Archive / Snapshots */}
        <button
          onClick={onOpenHistory}
          className="w-full flex items-center justify-between px-2.5 py-2 rounded-sm text-xs font-medium text-[#73766E] hover:text-[#202522] hover:bg-[#ECE9E0]/60 transition text-left cursor-pointer"
          title="Research Archive"
        >
          <div className="flex items-center gap-2.5">
            <History className="h-3.5 w-3.5 shrink-0 text-[#73766E]" />
            {!isCollapsed && <span>Research Archive</span>}
          </div>
          {!isCollapsed && historyCount > 0 && (
            <span className="rounded-sm bg-[#ECE9E0] px-1.5 py-0.2 text-[10px] font-mono-technical font-medium text-[#73766E] border border-[#E3E0D7]">
              {historyCount}
            </span>
          )}
          {isCollapsed && historyCount > 0 && (
            <span className="h-1.5 w-1.5 rounded-full bg-[#68745C]" />
          )}
        </button>

        {/* Curated Research Shortcuts */}
        {!isCollapsed && (
          <div className="pt-5 pb-2">
            <div className="px-2 pb-1.5 text-[9px] font-mono-technical uppercase tracking-wider text-[#73766E]">
              Study Library
            </div>
            <div className="space-y-0.5">
              {PRESET_QUICK_TARGETS.map((target) => (
                <button
                  key={target.domain}
                  onClick={() => onSelectStudy?.(target.domain)}
                  disabled={isScanning}
                  className="w-full flex items-center justify-between px-2.5 py-1.5 rounded-sm text-xs text-[#73766E] hover:text-[#202522] hover:bg-[#ECE9E0]/70 transition disabled:opacity-50 text-left cursor-pointer group"
                >
                  <span className="font-normal group-hover:underline truncate">{target.name}</span>
                  <span className="text-[10px] font-mono-technical text-[#73766E] shrink-0">{target.domain}</span>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Footer / Engine Status */}
      <div className="p-3 border-t border-[#E3E0D7] space-y-2 bg-[#F5F3ED]">
        {/* Research Agent Status Pill */}
        <div
          onClick={onOpenSettings}
          className="rounded-sm p-2 border border-[#E3E0D7] bg-white transition cursor-pointer hover:border-[#C8C4B7]"
          title={tinyfishConfigured ? 'TinyFish Agent: Live' : 'Demo Fixture Mode: Configure Key'}
        >
          <div className="flex items-center gap-2">
            <span className={`h-2 w-2 rounded-full shrink-0 ${tinyfishConfigured ? 'bg-[#2D6A4F]' : 'bg-[#9A6B2F]'}`} />
            {!isCollapsed && (
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-medium text-[#202522] truncate">
                    {tinyfishConfigured ? 'TinyFish Agent' : 'Demo Archive'}
                  </span>
                  <span className={`text-[9px] font-mono-technical uppercase px-1 py-0.2 rounded-xs ${
                    tinyfishConfigured ? 'text-[#2D6A4F] bg-[#EAF2EC]' : 'text-[#9A6B2F] bg-[#F9F3EA]'
                  }`}>
                    {tinyfishConfigured ? 'Live' : 'Demo'}
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Settings button */}
        <button
          onClick={onOpenSettings}
          className="w-full flex items-center justify-center gap-2 px-2.5 py-1.5 rounded-sm text-xs font-medium text-[#73766E] hover:text-[#202522] hover:bg-[#ECE9E0] transition border border-[#E3E0D7] bg-white cursor-pointer"
          title="API Key Settings"
        >
          <Key className="h-3 w-3" />
          {!isCollapsed && <span>API Settings</span>}
        </button>
      </div>
    </aside>
  );
}
