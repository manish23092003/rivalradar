import React from 'react';
import { 
  Download, 
  RefreshCw, 
  ExternalLink,
  ShieldCheck,
  AlertTriangle,
  ArrowUpRight
} from 'lucide-react';

export default function OverviewCard({
  snapshot,
  diff,
  onRescan,
  onExport,
  isScanning,
}) {
  if (!snapshot) return null;

  const { primaryCompany, competitors = [], comparison = {}, targetUrl, timestamp, isDemo } = snapshot;
  const formattedDate = new Date(timestamp).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  return (
    <article className="bg-white border border-[#E3E0D7] p-6 sm:p-8 rounded-sm shadow-xs relative">
      
      {/* Top Meta Bar */}
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 pb-6 border-b border-[#E3E0D7]">
        <div>
          <div className="flex flex-wrap items-center gap-2 mb-2">
            <span className="font-mono-technical text-[10px] uppercase tracking-wider text-[#68745C] font-semibold bg-[#ECE9E0] px-1.5 py-0.5 rounded-xs">
              Primary Subject
            </span>

            <span className="font-mono-technical text-[10px] uppercase tracking-wider text-[#73766E] bg-[#ECE9E0] border border-[#E3E0D7] px-1.5 py-0.5 rounded-xs flex items-center gap-1">
              <span>Saved Archive Record</span>
            </span>

            {isDemo ? (
              <span className="font-mono-technical text-[10px] text-[#9A6B2F] bg-[#F9F3EA] border border-[#E8D7BE] px-1.5 py-0.5 rounded-xs flex items-center gap-1">
                <AlertTriangle className="h-2.5 w-2.5" />
                <span>Synthetic Demo Fixture</span>
              </span>
            ) : (
              <span className="font-mono-technical text-[10px] text-[#2D6A4F] bg-[#EAF2EC] border border-[#C3DCC8] px-1.5 py-0.5 rounded-xs flex items-center gap-1">
                <ShieldCheck className="h-2.5 w-2.5" />
                <span>Genuine Live Research (TinyFish)</span>
              </span>
            )}

            <span className="font-mono-technical text-[11px] text-[#73766E]">
              Recorded: {formattedDate}
            </span>
          </div>

          <h2 className="font-serif-editorial text-2xl sm:text-3xl md:text-[34px] font-normal text-[#202522] leading-tight tracking-tight">
            <span>{primaryCompany?.company_name || 'Target Company'}</span>
            <span className="text-[#73766E] font-serif-editorial italic font-normal mx-2 text-2xl">versus</span>
            <span>{competitors.map(c => c.company_name).join(' & ') || 'Direct Competitors'}</span>
          </h2>

          {targetUrl && (
            <a
              href={targetUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 font-mono-technical text-xs text-[#68745C] hover:text-[#526047] hover:underline mt-1.5"
            >
              <span>{targetUrl}</span>
              <ArrowUpRight className="h-3 w-3" />
            </a>
          )}
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            id="btn-export-report"
            onClick={onExport}
            className="flex items-center space-x-1.5 rounded-sm border border-[#E3E0D7] bg-white px-3 py-1.5 text-xs font-medium text-[#202522] hover:bg-[#ECE9E0] transition cursor-pointer"
          >
            <Download className="h-3 w-3 text-[#73766E]" />
            <span>Export Report</span>
          </button>
          <button
            id="btn-rescan"
            onClick={onRescan}
            disabled={isScanning}
            className="flex items-center space-x-1.5 rounded-sm bg-[#68745C] px-3.5 py-1.5 text-xs font-medium text-white hover:bg-[#526047] transition disabled:opacity-40 cursor-pointer"
          >
            <RefreshCw className={`h-3 w-3 ${isScanning ? 'animate-spin' : ''}`} />
            <span>Re-Scan Target</span>
          </button>
        </div>
      </div>

      {/* Executive Intelligence Brief */}
      <div className="mt-6">
        <h3 className="font-mono-technical text-[10px] uppercase tracking-wider text-[#73766E] mb-2 font-semibold">
          Executive Market Brief & Synthesis
        </h3>
        <div className="bg-[#F5F3ED] p-4 sm:p-5 rounded-xs border-l-2 border-[#68745C]">
          <p className="text-sm sm:text-[15px] text-[#202522] leading-relaxed font-normal">
            {comparison.executive_summary || primaryCompany?.product_summary || 'Autonomous agent analysis completed. Review detailed company findings below.'}
          </p>
        </div>
      </div>

      {/* 3-Column Editorial Comparison Row */}
      <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-6 pt-6 border-t border-[#E3E0D7]">
        {/* Core Competitive Moats */}
        <div>
          <h4 className="font-mono-technical text-[10px] uppercase tracking-wider text-[#73766E] font-semibold mb-2.5">
            Key Verified Moats
          </h4>
          <ul className="space-y-2 text-xs">
            {(comparison.primary_strengths || (primaryCompany?.features || []).slice(0, 3)).map((strength, i) => (
              <li key={i} className="flex items-start gap-2 text-[#202522]">
                <span className="text-[#68745C] font-mono-technical text-xs font-bold leading-none mt-0.5">•</span>
                <span className="leading-snug">{strength}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Pricing Positioning */}
        <div>
          <h4 className="font-mono-technical text-[10px] uppercase tracking-wider text-[#73766E] font-semibold mb-2.5">
            Published Entry Pricing
          </h4>
          <div className="space-y-1.5 text-xs">
            <div className="flex justify-between items-baseline py-1 border-b border-[#E3E0D7]/60">
              <span className="font-medium text-[#202522]">{primaryCompany?.company_name}:</span>
              <span className="font-mono-technical font-semibold text-[#2D6A4F]">
                {comparison.pricing_overview?.primary?.entryPrice || 'Free tier available'}
              </span>
            </div>
            {competitors[0] && (
              <div className="flex justify-between items-baseline py-1 border-b border-[#E3E0D7]/60 text-[#73766E]">
                <span>{competitors[0].company_name}:</span>
                <span className="font-mono-technical text-[#202522]">{comparison.pricing_overview?.comp1?.entryPrice || 'N/A'}</span>
              </div>
            )}
            {competitors[1] && (
              <div className="flex justify-between items-baseline py-1 text-[#73766E]">
                <span>{competitors[1].company_name}:</span>
                <span className="font-mono-technical text-[#202522]">{comparison.pricing_overview?.comp2?.entryPrice || 'N/A'}</span>
              </div>
            )}
          </div>
        </div>

        {/* Target Audience Positioning */}
        <div>
          <h4 className="font-mono-technical text-[10px] uppercase tracking-wider text-[#73766E] font-semibold mb-2.5">
            Target Customer Segment
          </h4>
          <p className="text-xs text-[#202522] leading-relaxed bg-[#ECE9E0]/50 p-3 rounded-xs border border-[#E3E0D7]">
            {primaryCompany?.target_customers || 'High-growth technology teams, engineering leaders, and software builders.'}
          </p>
        </div>
      </div>
    </article>
  );
}
