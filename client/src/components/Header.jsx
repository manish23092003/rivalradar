import React, { useState } from 'react';
import { 
  Key, 
  History, 
  Menu, 
  X, 
  Globe, 
  Radar,
  ArrowUpRight
} from 'lucide-react';
import RadarMark from './RadarMark';

export default function Header({
  tinyfishConfigured,
  onOpenSettings,
  onOpenHistory,
  historyCount = 0,
  activeTab,
  setActiveTab,
  currentTargetUrl,
  currentTargetName,
  onSelectStudy,
}) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 w-full border-b border-[#E3E0D7] bg-[#F5F3ED]">
      <div className="flex h-14 items-center justify-between px-4 sm:px-6 lg:px-8">
        
        {/* Left: Mobile Brand & Desktop Breadcrumbs */}
        <div className="flex items-center gap-3">
          {/* Mobile Brand (visible only below md) */}
          <div 
            onClick={() => setActiveTab('scanner')} 
            className="flex md:hidden cursor-pointer items-center space-x-2 transition"
          >
            <RadarMark size={18} />
            <span className="font-serif-editorial text-lg font-semibold tracking-tight text-[#202522]">
              RivalRadar
            </span>
          </div>

          {/* Desktop Research Context / Breadcrumb */}
          <div className="hidden md:flex items-center gap-2 text-xs">
            <span className="text-[#73766E] uppercase font-mono-technical tracking-wider text-[10px]">
              Active Dossier:
            </span>
            {currentTargetName ? (
              <div className="flex items-center gap-1.5 bg-white border border-[#E3E0D7] px-2 py-0.5 rounded-sm">
                <span className="font-serif-editorial font-semibold text-[#202522] text-sm">
                  {currentTargetName}
                </span>
                {currentTargetUrl && (
                  <span className="text-[#73766E] font-mono-technical text-[11px] truncate max-w-[220px]">
                    — {currentTargetUrl}
                  </span>
                )}
              </div>
            ) : (
              <span className="text-[#73766E] italic text-xs">
                No active company study selected
              </span>
            )}
          </div>
        </div>

        {/* Right Controls */}
        <div className="flex items-center space-x-2">
          {/* Snapshots Archive Button */}
          <button
            id="btn-snapshots"
            onClick={onOpenHistory}
            className={`flex items-center space-x-1.5 rounded-sm px-2.5 py-1 text-xs font-medium transition cursor-pointer border ${
              activeTab === 'history'
                ? 'bg-white text-[#202522] border-[#C8C4B7]'
                : 'text-[#202522] bg-white hover:bg-[#ECE9E0] border-[#E3E0D7]'
            }`}
          >
            <History className="h-3.5 w-3.5 text-[#73766E]" />
            <span className="hidden sm:inline">Archive</span>
            {historyCount > 0 && (
              <span className="rounded-sm bg-[#ECE9E0] px-1 py-0.2 text-[10px] font-mono-technical text-[#73766E]">
                {historyCount}
              </span>
            )}
          </button>

          {/* TinyFish Status Indicator Badge */}
          <button
            id="btn-status-indicator"
            onClick={onOpenSettings}
            className={`flex items-center space-x-1.5 rounded-sm px-2.5 py-1 text-xs border transition cursor-pointer ${
              tinyfishConfigured
                ? 'bg-[#EAF2EC] border-[#C3DCC8] text-[#2D6A4F] hover:bg-[#D8ECDD]'
                : 'bg-[#F9F3EA] border-[#E8D7BE] text-[#9A6B2F] hover:bg-[#F3E7D3]'
            }`}
            title="Configure Research Agent"
          >
            <span className={`h-1.5 w-1.5 rounded-full ${tinyfishConfigured ? 'bg-[#2D6A4F]' : 'bg-[#9A6B2F]'}`} />
            <span className="hidden sm:inline font-mono-technical text-[11px] font-medium">
              {tinyfishConfigured ? 'Agent Live' : 'Demo Mode'}
            </span>
          </button>

          {/* Settings button */}
          <button
            id="btn-settings"
            onClick={onOpenSettings}
            className="flex h-7 w-7 items-center justify-center rounded-sm border border-[#E3E0D7] bg-white text-[#73766E] hover:text-[#202522] hover:border-[#C8C4B7] transition cursor-pointer"
            title="Settings"
            aria-label="Settings"
          >
            <Key className="h-3 w-3" />
          </button>

          {/* Mobile Menu Toggle Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden flex h-7 w-7 items-center justify-center rounded-sm border border-[#E3E0D7] bg-white text-[#73766E] hover:text-[#202522] cursor-pointer"
            aria-label="Toggle navigation menu"
          >
            {mobileMenuOpen ? <X className="h-3.5 w-3.5" /> : <Menu className="h-3.5 w-3.5" />}
          </button>
        </div>

      </div>

      {/* Mobile Slide-down Navigation Panel */}
      {mobileMenuOpen && (
        <div className="md:hidden border-b border-[#E3E0D7] bg-white p-4 space-y-3">
          <div className="flex flex-col space-y-1">
            <button
              onClick={() => {
                setActiveTab('scanner');
                setMobileMenuOpen(false);
              }}
              className="flex items-center gap-2 p-2 rounded-sm text-xs font-semibold text-[#202522] bg-[#ECE9E0]"
            >
              <Radar className="h-3.5 w-3.5 text-[#68745C]" />
              <span>Market Radar Workspace</span>
            </button>
            <button
              onClick={() => {
                onOpenHistory();
                setMobileMenuOpen(false);
              }}
              className="flex items-center justify-between p-2 rounded-sm text-xs font-medium text-[#73766E] hover:bg-[#ECE9E0]"
            >
              <div className="flex items-center gap-2">
                <History className="h-3.5 w-3.5 text-[#73766E]" />
                <span>Research Archive</span>
              </div>
              {historyCount > 0 && (
                <span className="font-mono-technical text-[10px] text-[#73766E] bg-[#ECE9E0] px-1 rounded-sm">
                  {historyCount}
                </span>
              )}
            </button>
            <button
              onClick={() => {
                onOpenSettings();
                setMobileMenuOpen(false);
              }}
              className="flex items-center gap-2 p-2 rounded-sm text-xs font-medium text-[#73766E] hover:bg-[#ECE9E0]"
            >
              <Key className="h-3.5 w-3.5 text-[#73766E]" />
              <span>Configure TinyFish API Key</span>
            </button>
          </div>

          {/* Quick Targets in Mobile Menu */}
          <div className="pt-2 border-t border-[#E3E0D7]">
            <span className="text-[10px] uppercase font-mono-technical text-[#73766E] block mb-1">
              Curated Studies
            </span>
            <div className="grid grid-cols-2 gap-1.5">
              {[
                { name: 'Linear', domain: 'linear.app' },
                { name: 'Resend', domain: 'resend.com' },
                { name: 'Supabase', domain: 'supabase.com' },
                { name: 'Notion', domain: 'notion.so' },
              ].map((item) => (
                <button
                  key={item.domain}
                  onClick={() => {
                    onSelectStudy?.(item.domain);
                    setMobileMenuOpen(false);
                  }}
                  className="p-1.5 rounded-sm bg-[#F5F3ED] border border-[#E3E0D7] text-left text-xs text-[#202522] hover:border-[#68745C] truncate"
                >
                  <span className="font-medium block truncate">{item.name}</span>
                  <span className="text-[10px] text-[#73766E] font-mono-technical block truncate">{item.domain}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
