import React, { useState } from 'react';
import { 
  Globe, 
  ChevronDown, 
  ChevronUp, 
  ArrowRight,
  SlidersHorizontal,
  AlertCircle
} from 'lucide-react';

const PRESET_SAMPLES = [
  { name: 'Linear', domain: 'linear.app' },
  { name: 'Resend', domain: 'resend.com' },
  { name: 'Supabase', domain: 'supabase.com' },
  { name: 'Notion', domain: 'notion.so' },
];

export default function ScanInput({ onStartScan, onSelectPresetDomain, isScanning, tinyfishConfigured, externalUrl }) {
  const [url, setUrl] = useState('');
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [manualComp1, setManualComp1] = useState('');
  const [manualComp2, setManualComp2] = useState('');
  const [forceMock, setForceMock] = useState(false);
  const [validationError, setValidationError] = useState('');

  // Sync externalUrl if provided
  React.useEffect(() => {
    if (externalUrl) {
      setUrl(externalUrl);
      setValidationError('');
    }
  }, [externalUrl]);

  const validateInput = (input) => {
    const trimmed = input.trim();
    if (!trimmed) {
      setValidationError('');
      return false;
    }
    if (/\s/.test(trimmed)) {
      setValidationError('URL or domain cannot contain spaces.');
      return false;
    }
    const domainRegex = /^(https?:\/\/)?([a-zA-Z0-9-]+\.)+[a-zA-Z]{2,}(\/.*)?$/;
    if (!domainRegex.test(trimmed)) {
      setValidationError('Please enter a valid company domain or URL (e.g. resend.com).');
      return false;
    }
    setValidationError('');
    return true;
  };

  const handleChange = (e) => {
    const val = e.target.value;
    setUrl(val);
    if (val.trim()) {
      validateInput(val);
    } else {
      setValidationError('');
    }
  };

  const handleSubmit = (e) => {
    e?.preventDefault();
    if (!url.trim()) return;
    if (!validateInput(url)) return;

    const manualCompetitors = [manualComp1.trim(), manualComp2.trim()].filter(Boolean);
    onStartScan({
      url: url.trim(),
      manualCompetitors,
      forceMock: Boolean(forceMock),
    });
  };

  const handleSelectPreset = (domain) => {
    setUrl(domain);
    setValidationError('');
    if (onSelectPresetDomain) {
      onSelectPresetDomain(domain);
    }
  };

  return (
    <div className="relative mx-auto max-w-3xl px-4 pt-10 pb-6">
      
      {/* Editorial Headline & Brief */}
      <div className="text-center mb-7">
        <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-sm bg-[#ECE9E0] text-[#68745C] text-[11px] font-mono-technical uppercase tracking-wider mb-3">
          <span>Autonomous Competitive Intelligence</span>
        </div>
        
        <h1 className="font-serif-editorial text-3xl sm:text-4xl md:text-[42px] font-normal text-[#202522] tracking-tight leading-tight">
          Know your competition before they move.
        </h1>
        
        <p className="mt-2.5 text-xs sm:text-sm text-[#73766E] max-w-xl mx-auto leading-relaxed">
          Autonomous TinyFish research agents investigate public web pages to identify market rivals, verify packaging structures, and record verifiable changes.
        </p>
      </div>

      {/* Main Search / Input Container */}
      <form onSubmit={handleSubmit} className="relative">
        <div className="bg-white border border-[#E3E0D7] p-2 rounded-sm shadow-xs transition focus-within:border-[#68745C]">
          <div className="flex flex-col sm:flex-row items-center gap-2">
            
            {/* Input field */}
            <div className="relative flex-1 w-full flex items-center pl-2.5">
              <Globe className="h-4 w-4 text-[#73766E] mr-2 shrink-0" />
              <input
                id="input-company-url"
                type="text"
                value={url}
                onChange={handleChange}
                placeholder="Enter company website (e.g. resend.com or linear.app)..."
                disabled={isScanning}
                className="w-full bg-transparent text-xs sm:text-sm text-[#202522] placeholder-[#73766E]/70 focus:outline-none py-1.5 font-normal"
              />
              {url && (
                <button
                  type="button"
                  onClick={() => { setUrl(''); setValidationError(''); }}
                  className="text-xs text-[#73766E] hover:text-[#202522] px-2 cursor-pointer font-mono-technical"
                >
                  Clear
                </button>
              )}
            </div>

            {/* Primary Action Button: Muted Olive #68745C */}
            <button
              id="btn-scan-submit"
              type="submit"
              disabled={isScanning || !url.trim() || Boolean(validationError)}
              className="w-full sm:w-auto flex items-center justify-center space-x-2 rounded-sm bg-[#68745C] px-5 py-2.5 text-xs font-medium text-white hover:bg-[#526047] transition disabled:opacity-40 disabled:cursor-not-allowed shrink-0 cursor-pointer"
            >
              {isScanning ? (
                <>
                  <div className="h-3.5 w-3.5 rounded-full border-2 border-white/40 border-t-white animate-spin" />
                  <span>Researching...</span>
                </>
              ) : (
                <>
                  <span>Analyze Market</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </>
              )}
            </button>
          </div>

          {/* Validation Error Message */}
          {validationError && (
            <div className="flex items-center gap-1.5 px-2.5 pt-2 text-xs text-[#B66A45] font-mono-technical">
              <AlertCircle className="h-3.5 w-3.5 shrink-0" />
              <span>{validationError}</span>
            </div>
          )}

          {/* Sub-bar toggle */}
          <div className="flex items-center justify-between border-t border-[#E3E0D7] mt-2 pt-1.5 px-1.5 text-[11px] text-[#73766E]">
            <span className="font-mono-technical text-[10px] hidden sm:inline">
              Autonomously extracts primary dossier & 2 direct competitors
            </span>
            <button
              type="button"
              onClick={() => setShowAdvanced(!showAdvanced)}
              className="flex items-center space-x-1 text-[#73766E] hover:text-[#202522] transition ml-auto cursor-pointer"
            >
              <SlidersHorizontal className="h-3 w-3" />
              <span>{showAdvanced ? 'Hide custom options' : 'Custom competitors & settings'}</span>
              {showAdvanced ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
            </button>
          </div>
        </div>

        {/* Advanced Options Accordion */}
        {showAdvanced && (
          <div className="mt-2 rounded-sm p-4 border border-[#E3E0D7] bg-[#ECE9E0]/40">
            <h4 className="text-[10px] font-mono-technical uppercase tracking-wider text-[#73766E] mb-3">
              Optional Competitor Overrides
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
              <div>
                <label className="block text-[11px] text-[#73766E] mb-1">Competitor 1 Domain / Name</label>
                <input
                  type="text"
                  value={manualComp1}
                  onChange={(e) => setManualComp1(e.target.value)}
                  placeholder="e.g. mailgun.com"
                  className="w-full rounded-sm border border-[#E3E0D7] bg-white px-3 py-1.5 text-xs text-[#202522] placeholder-[#73766E]/60 focus:border-[#68745C] focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-[11px] text-[#73766E] mb-1">Competitor 2 Domain / Name</label>
                <input
                  type="text"
                  value={manualComp2}
                  onChange={(e) => setManualComp2(e.target.value)}
                  placeholder="e.g. postmarkapp.com"
                  className="w-full rounded-sm border border-[#E3E0D7] bg-white px-3 py-1.5 text-xs text-[#202522] placeholder-[#73766E]/60 focus:border-[#68745C] focus:outline-none"
                />
              </div>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-2 border-t border-[#E3E0D7] text-xs">
              <label className="flex items-center space-x-2 cursor-pointer text-[#202522] select-none text-[11px]">
                <input
                  type="checkbox"
                  checked={forceMock}
                  onChange={(e) => setForceMock(e.target.checked)}
                  className="rounded-xs border-[#E3E0D7] text-[#68745C] focus:ring-0"
                />
                <span>Demo mode (uses cached intelligence snapshot without API call)</span>
              </label>
              {!tinyfishConfigured && (
                <span className="text-[11px] text-[#9A6B2F] font-mono-technical">
                  No API key in server/.env — Demo mode enabled
                </span>
              )}
            </div>
          </div>
        )}
      </form>

      {/* Discreet Example Shortcuts */}
      <div className="mt-4 flex flex-wrap items-center justify-center gap-x-3 gap-y-1 text-xs text-[#73766E]">
        <span className="font-mono-technical text-[10px] uppercase tracking-wider">
          Curated Studies:
        </span>
        {PRESET_SAMPLES.map((preset, idx) => (
          <React.Fragment key={preset.domain}>
            <button
              onClick={() => handleSelectPreset(preset.domain)}
              disabled={isScanning}
              className="text-[#202522] hover:text-[#68745C] hover:underline cursor-pointer disabled:opacity-50"
            >
              {preset.name}
            </button>
            {idx < PRESET_SAMPLES.length - 1 && <span className="text-[#E3E0D7]">·</span>}
          </React.Fragment>
        ))}
      </div>
    </div>
  );
}
