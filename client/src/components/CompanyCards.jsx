import React from 'react';
import { 
  Building2, 
  Check, 
  ArrowUpRight, 
  HelpCircle, 
  ShieldCheck, 
  Globe
} from 'lucide-react';

export default function CompanyCards({ primaryCompany, competitors = [], isDemo = false }) {
  const allCompanies = [
    { ...primaryCompany, isPrimary: true },
    ...(competitors.map((c, i) => ({ ...c, isPrimary: false, rivalNumber: i + 1 })))
  ];

  return (
    <div className="mt-8">
      {/* Section Masthead */}
      <div className="flex items-baseline justify-between mb-4 pb-2 border-b border-[#E3E0D7]">
        <div>
          <h3 className="font-serif-editorial text-xl font-normal text-[#202522]">
            Subject Profiles & Intelligence Dossiers
          </h3>
          <p className="font-mono-technical text-[11px] text-[#73766E] mt-0.5">
            {isDemo
              ? 'Archived synthetic intelligence profile for illustrative review'
              : 'Autonomous data extracted directly from public company pages via TinyFish'}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {allCompanies.map((comp, idx) => {
          if (!comp.company_name) return null;

          return (
            <div
              key={idx}
              className={`bg-white border rounded-sm flex flex-col justify-between transition ${
                comp.isPrimary
                  ? 'border-[#68745C] shadow-xs'
                  : 'border-[#E3E0D7] hover:border-[#C8C4B7]'
              }`}
            >
              {/* Top Accent Line for Primary */}
              {comp.isPrimary && (
                <div className="h-1 w-full bg-[#68745C]" />
              )}

              <div className="p-5 flex-1 flex flex-col">
                {/* Header */}
                <div className="flex items-start justify-between gap-2 mb-3 pb-3 border-b border-[#E3E0D7]/70">
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="font-serif-editorial text-lg font-semibold text-[#202522]">
                        {comp.company_name}
                      </h4>
                      {comp.isPrimary ? (
                        <span className="font-mono-technical text-[9px] uppercase tracking-wider text-[#68745C] bg-[#ECE9E0] px-1.5 py-0.2 rounded-xs font-semibold">
                          Target
                        </span>
                      ) : (
                        <span className="font-mono-technical text-[9px] uppercase tracking-wider text-[#73766E] bg-[#ECE9E0]/60 px-1.5 py-0.2 rounded-xs">
                          Rival #{comp.rivalNumber}
                        </span>
                      )}
                    </div>

                    {comp.website_url && (
                      <a
                        href={comp.website_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 font-mono-technical text-[11px] text-[#68745C] hover:text-[#526047] hover:underline mt-0.5"
                      >
                        <span>{comp.website_url.replace(/^https?:\/\//, '')}</span>
                        <ArrowUpRight className="h-2.5 w-2.5" />
                      </a>
                    )}
                  </div>

                  {isDemo ? (
                    <span className="font-mono-technical text-[9px] text-[#9A6B2F] bg-[#F9F3EA] border border-[#E8D7BE] px-1.5 py-0.2 rounded-xs shrink-0">
                      Demo
                    </span>
                  ) : (
                    <span className="font-mono-technical text-[9px] text-[#2D6A4F] bg-[#EAF2EC] border border-[#C3DCC8] px-1.5 py-0.2 rounded-xs shrink-0 flex items-center gap-1">
                      <ShieldCheck className="h-2.5 w-2.5" />
                      Live Web Data
                    </span>
                  )}
                </div>

                {/* Positioning / Summary */}
                <div className="mb-4">
                  <span className="font-mono-technical text-[9px] uppercase tracking-wider text-[#73766E] font-semibold block mb-1">
                    Value Proposition & Market Stance
                  </span>
                  <p className="text-xs text-[#202522] leading-relaxed min-h-[54px] bg-[#F5F3ED] p-3 rounded-xs border border-[#E3E0D7]/60">
                    {comp.product_summary || 'No public narrative extracted on crawled pages.'}
                  </p>
                </div>

                {/* Target Audience */}
                <div className="mb-4">
                  <span className="font-mono-technical text-[9px] uppercase tracking-wider text-[#73766E] font-semibold block mb-1">
                    Target Customer Persona
                  </span>
                  <p className="text-xs text-[#202522] bg-white px-2.5 py-1.5 rounded-xs border border-[#E3E0D7]">
                    {comp.target_customers || 'Not explicitly stated'}
                  </p>
                </div>

                {/* Verified Capabilities */}
                <div className="flex-1">
                  <span className="font-mono-technical text-[9px] uppercase tracking-wider text-[#73766E] font-semibold block mb-2">
                    Verified Capabilities ({comp.features?.length || 0})
                  </span>
                  <ul className="space-y-1.5">
                    {(comp.features || []).slice(0, 5).map((feature, fIdx) => (
                      <li key={fIdx} className="flex items-start gap-2 text-xs text-[#202522]">
                        <Check className="h-3 w-3 mt-0.5 shrink-0 text-[#2D6A4F]" />
                        <span className="line-clamp-2">{feature}</span>
                      </li>
                    ))}
                    {(comp.features || []).length > 5 && (
                      <li className="font-mono-technical text-[10px] text-[#73766E] pl-5">
                        +{comp.features.length - 5} additional capabilities documented
                      </li>
                    )}
                    {(!comp.features || comp.features.length === 0) && (
                      <li className="text-xs text-[#73766E] italic">No public feature list extracted.</li>
                    )}
                  </ul>
                </div>

                {/* Information Gaps / Unknowns */}
                {(comp.unknowns || []).length > 0 && (
                  <div className="mt-4 pt-3 border-t border-[#E3E0D7]/70">
                    <span className="font-mono-technical text-[9px] uppercase tracking-wider text-[#73766E] font-semibold flex items-center gap-1 mb-1.5">
                      <HelpCircle className="h-2.5 w-2.5 text-[#9A6B2F]" />
                      Information Gaps ({comp.unknowns.length})
                    </span>
                    <ul className="space-y-1 text-[11px] text-[#73766E] font-mono-technical">
                      {comp.unknowns.map((unk, uIdx) => (
                        <li key={uIdx} className="line-clamp-1 italic">• {unk}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>

              {/* Footer Evidence URLs */}
              <div className="border-t border-[#E3E0D7] bg-[#F5F3ED] p-3.5 rounded-b-sm">
                <span className="font-mono-technical text-[9px] uppercase tracking-wider text-[#73766E] font-semibold block mb-1.5">
                  Verified Primary Sources ({comp.evidence_urls?.length || 0})
                </span>
                <div className="flex flex-wrap gap-1">
                  {(comp.evidence_urls || []).slice(0, 4).map((url, uIdx) => {
                    let label = url;
                    try {
                      const parsed = new URL(url);
                      label = parsed.pathname === '/' || !parsed.pathname ? parsed.hostname : `${parsed.hostname}${parsed.pathname}`;
                    } catch {
                      label = url;
                    }
                    return (
                      <a
                        key={uIdx}
                        href={url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 bg-white border border-[#E3E0D7] px-2 py-0.5 font-mono-technical text-[10px] text-[#68745C] hover:text-[#526047] hover:border-[#68745C] transition truncate max-w-[190px]"
                        title={url}
                      >
                        <span className="truncate">{label}</span>
                        <ArrowUpRight className="h-2.5 w-2.5 shrink-0" />
                      </a>
                    );
                  })}
                  {(!comp.evidence_urls || comp.evidence_urls.length === 0) && (
                    <span className="text-[11px] text-[#73766E] italic font-mono-technical">No source URLs logged</span>
                  )}
                </div>
              </div>

            </div>
          );
        })}
      </div>
    </div>
  );
}
