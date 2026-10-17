import React from 'react';
import { 
  Check, 
  Minus, 
  HelpCircle, 
  SplitSquareVertical, 
  Info
} from 'lucide-react';

export default function FeatureMatrix({ comparison, primaryCompany, competitors = [] }) {
  const featureMatrix = comparison?.feature_matrix || [];
  const comp1 = competitors[0];
  const comp2 = competitors[1];

  if (!featureMatrix.length) return null;

  const renderSupportCell = (isSupported, isTarget = false) => {
    if (isSupported === true) {
      return (
        <span 
          className="inline-flex items-center gap-1 font-mono-technical text-[11px] font-medium text-[#2D6A4F]"
          title="Verified on public surfaces"
        >
          <Check className="h-3.5 w-3.5 text-[#2D6A4F] shrink-0" />
          <span>Confirmed</span>
        </span>
      );
    }
    if (isSupported === false) {
      return (
        <span 
          className="inline-flex items-center gap-1 font-mono-technical text-[11px] text-[#73766E]"
          title="Not explicitly found on analyzed pages"
        >
          <span className="text-[#C8C4B7] font-bold">—</span>
          <span>Not Found</span>
        </span>
      );
    }
    return (
      <span 
        className="inline-flex items-center gap-1 font-mono-technical text-[11px] text-[#9A6B2F]"
        title="Unverified / Information not publicly stated"
      >
        <HelpCircle className="h-3 w-3 text-[#9A6B2F] shrink-0" />
        <span>Unverified</span>
      </span>
    );
  };

  return (
    <div className="mt-8 bg-white border border-[#E3E0D7] p-6 rounded-sm shadow-xs">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-2 mb-4 pb-3 border-b border-[#E3E0D7]">
        <div>
          <h3 className="font-serif-editorial text-xl font-normal text-[#202522]">
            Capability & Feature Comparison Matrix
          </h3>
          <p className="font-mono-technical text-[11px] text-[#73766E] mt-0.5">
            Direct capability alignment recorded across product documentation, APIs, and landing pages
          </p>
        </div>

        <div className="flex items-center gap-4 text-xs font-mono-technical text-[#73766E]">
          <div className="flex items-center gap-1">
            <Check className="h-3 w-3 text-[#2D6A4F]" />
            <span className="text-[#202522]">Confirmed</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="text-[#C8C4B7] font-bold">—</span>
            <span>Not Found</span>
          </div>
          <div className="flex items-center gap-1">
            <HelpCircle className="h-3 w-3 text-[#9A6B2F]" />
            <span>Unverified</span>
          </div>
        </div>
      </div>

      {/* Table Container */}
      <div className="overflow-x-auto border border-[#E3E0D7] rounded-xs">
        <table className="w-full text-left text-xs min-w-[620px] border-collapse">
          <thead>
            <tr className="border-b border-[#E3E0D7] bg-[#F5F3ED] text-[#73766E] font-mono-technical text-[10px] uppercase tracking-wider sticky top-0 z-10">
              <th className="py-3 px-4 w-2/5 font-semibold">Capability Area</th>
              <th className="py-3 px-4 w-1/5 text-center font-semibold text-[#202522] bg-[#ECE9E0]/60 border-x border-[#E3E0D7]">
                <div className="flex items-center justify-center gap-1.5">
                  <span className="truncate max-w-[130px] font-serif-editorial text-xs">{primaryCompany?.company_name}</span>
                  <span className="text-[9px] uppercase px-1 py-0.2 bg-[#68745C] text-white rounded-xs">Target</span>
                </div>
              </th>
              <th className="py-3 px-4 w-1/5 text-center font-semibold text-[#202522] truncate font-serif-editorial text-xs">
                {comp1?.company_name || 'Rival 1'}
              </th>
              <th className="py-3 px-4 w-1/5 text-center font-semibold text-[#202522] truncate font-serif-editorial text-xs">
                {comp2?.company_name || 'Rival 2'}
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#E3E0D7]">
            {featureMatrix.map((item, idx) => (
              <tr key={idx} className="hover:bg-[#F5F3ED]/50 transition-colors">
                <td className="py-3 px-4 font-normal text-[#202522] text-xs">
                  {item.feature}
                </td>
                <td className="py-3 px-4 text-center bg-[#ECE9E0]/20 border-x border-[#E3E0D7]">
                  {renderSupportCell(item.primarySupported, true)}
                </td>
                <td className="py-3 px-4 text-center">
                  {renderSupportCell(item.comp1Supported, false)}
                </td>
                <td className="py-3 px-4 text-center">
                  {renderSupportCell(item.comp2Supported, false)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-2.5 text-[11px] text-[#73766E] font-mono-technical flex items-center justify-between">
        <span>* "Not Found" indicates information was not documented on crawled pages. It is not inferred to be missing.</span>
        <span>Source: TinyFish Multi-Domain Crawl</span>
      </div>

      {/* Strategic Differentiators */}
      {comparison?.differentiators?.length > 0 && (
        <div className="mt-6 pt-5 border-t border-[#E3E0D7]">
          <h4 className="font-mono-technical text-[10px] uppercase tracking-wider text-[#68745C] font-semibold mb-3">
            Identified Strategic Moats
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {comparison.differentiators.map((diff, i) => (
              <div 
                key={i} 
                className="bg-[#F5F3ED] p-3.5 rounded-xs border border-[#E3E0D7]"
              >
                <span className="font-mono-technical text-[9px] uppercase tracking-wider text-[#73766E] block mb-1">
                  Differentiator #{i + 1}
                </span>
                <p className="text-xs text-[#202522] leading-relaxed">{diff}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
