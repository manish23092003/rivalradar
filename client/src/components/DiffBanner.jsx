import React from 'react';
import { 
  ArrowRight, 
  AlertTriangle, 
  CheckCircle,
  Clock,
  Plus,
  Minus
} from 'lucide-react';

export default function DiffBanner({ diff }) {
  if (!diff) return null;

  const {
    previousTimestamp,
    currentTimestamp,
    daysBetween,
    changesDetected,
    isDemoComparison,
    demoNotice,
    features = { added: [], removed: [], notice: null },
    pricing = { addedPlans: [], removedPlans: [], modifiedPlans: [], notice: null },
    targetAudienceShift,
  } = diff;

  const prevDate = new Date(previousTimestamp).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  return (
    <section className={`mt-6 bg-white border border-[#E3E0D7] p-5 rounded-sm shadow-xs ${
      changesDetected ? 'border-l-3 border-l-[#B66A45]' : 'border-l-2 border-l-[#2D6A4F]'
    }`}>
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-[#E3E0D7]">
        <div className="flex items-center gap-2.5">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-serif-editorial text-base font-semibold text-[#202522]">
                Historical Observation Diff
              </h3>
              {isDemoComparison ? (
                <span className="font-mono-technical text-[10px] text-[#9A6B2F] bg-[#F9F3EA] border border-[#E8D7BE] px-1.5 py-0.2 rounded-xs">
                  Demo Fixture Comparison
                </span>
              ) : changesDetected ? (
                <span className="font-mono-technical text-[10px] text-[#B66A45] bg-[#FBF1EC] border border-[#F3D7CA] px-1.5 py-0.2 rounded-xs font-semibold">
                  Market Shifts Detected
                </span>
              ) : (
                <span className="font-mono-technical text-[10px] text-[#2D6A4F] bg-[#EAF2EC] border border-[#C3DCC8] px-1.5 py-0.2 rounded-xs">
                  Stable / No Shifts
                </span>
              )}
            </div>
            <p className="font-mono-technical text-[11px] text-[#73766E] mt-0.5">
              Comparing against record from {prevDate} ({daysBetween === 0 ? 'same day' : `${daysBetween} days elapsed`})
            </p>
          </div>
        </div>
      </div>

      {/* Demo comparison disclaimer */}
      {isDemoComparison && (
        <div className="mt-3 text-xs text-[#9A6B2F] bg-[#F9F3EA] border border-[#E8D7BE] p-3 rounded-xs font-mono-technical">
          <p className="font-semibold">Notice regarding synthetic history:</p>
          <p className="mt-0.5 leading-relaxed text-[11px]">
            {demoNotice || 'This comparison involves synthetic demo data and cannot be presented as a real historical observation.'}
          </p>
        </div>
      )}

      {/* Research limitation notices (e.g. unlisted pricing not treated as removed) */}
      {(pricing.notice || features.notice) && (
        <div className="mt-2.5 space-y-1">
          {pricing.notice && (
            <div className="text-[11px] text-[#73766E] bg-[#ECE9E0]/60 p-2 rounded-xs font-mono-technical border border-[#E3E0D7]">
              ℹ {pricing.notice}
            </div>
          )}
          {features.notice && (
            <div className="text-[11px] text-[#73766E] bg-[#ECE9E0]/60 p-2 rounded-xs font-mono-technical border border-[#E3E0D7]">
              ℹ {features.notice}
            </div>
          )}
        </div>
      )}

      {/* No Changes State */}
      {!changesDetected ? (
        <div className="mt-3 text-xs text-[#2D6A4F] bg-[#EAF2EC] p-3 rounded-xs border border-[#C3DCC8] flex items-center gap-2">
          <CheckCircle className="h-3.5 w-3.5 text-[#2D6A4F] shrink-0" />
          <span>Product capabilities, published subscription tiers, and target positioning remained stable between observations.</span>
        </div>
      ) : (
        /* Changes Detected Breakdown */
        <div className="mt-4 space-y-3 text-xs">
          
          {/* Pricing Adjustments */}
          {(pricing.modifiedPlans?.length > 0 || pricing.addedPlans?.length > 0 || pricing.removedPlans?.length > 0) && (
            <div className="p-3 bg-[#F5F3ED] rounded-xs border border-[#E3E0D7]">
              <span className="font-mono-technical text-[10px] uppercase tracking-wider text-[#B66A45] font-semibold block mb-2">
                Subscription Plan Modifications
              </span>

              {/* Modified prices */}
              {pricing.modifiedPlans?.map((mod, i) => (
                <div key={i} className="flex items-center justify-between py-1 border-b border-[#E3E0D7] last:border-0">
                  <span className="font-medium text-[#202522]">{mod.plan_name}:</span>
                  <div className="flex items-center gap-2 font-mono-technical">
                    <span className="text-[#73766E] line-through">{mod.oldPrice}</span>
                    <ArrowRight className="h-3 w-3 text-[#B66A45]" />
                    <span className="text-[#B66A45] font-semibold">{mod.newPrice}</span>
                  </div>
                </div>
              ))}

              {/* Added plans */}
              {pricing.addedPlans?.map((p, i) => (
                <div key={i} className="flex items-center gap-1.5 py-1 text-[#2D6A4F] font-mono-technical">
                  <Plus className="h-3 w-3 shrink-0" />
                  <span>Introduced: <strong>{p.plan_name}</strong> ({p.price})</span>
                </div>
              ))}

              {/* Removed plans */}
              {pricing.removedPlans?.map((p, i) => (
                <div key={i} className="flex items-center gap-1.5 py-1 text-[#9E3A33] font-mono-technical">
                  <Minus className="h-3 w-3 shrink-0" />
                  <span>Discontinued: <span className="line-through">{p.plan_name}</span></span>
                </div>
              ))}
            </div>
          )}

          {/* Feature Additions & Removals */}
          {(features.added?.length > 0 || features.removed?.length > 0) && (
            <div className="p-3 bg-[#F5F3ED] rounded-xs border border-[#E3E0D7]">
              <span className="font-mono-technical text-[10px] uppercase tracking-wider text-[#68745C] font-semibold block mb-2">
                Capability Shifts
              </span>

              {features.added?.length > 0 && (
                <div className="mb-2">
                  <span className="text-[11px] text-[#2D6A4F] font-semibold block mb-1">Newly Detected Capabilities:</span>
                  <div className="flex flex-wrap gap-1.5">
                    {features.added.map((feat, i) => (
                      <span key={i} className="inline-flex items-center gap-1 bg-[#EAF2EC] border border-[#C3DCC8] px-2 py-0.5 text-[11px] text-[#2D6A4F] rounded-xs">
                        + {feat}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {features.removed?.length > 0 && (
                <div>
                  <span className="text-[11px] text-[#9E3A33] font-semibold block mb-1">Unlisted or Removed Capabilities:</span>
                  <div className="flex flex-wrap gap-1.5">
                    {features.removed.map((feat, i) => (
                      <span key={i} className="inline-flex items-center gap-1 bg-[#F8ECEB] border border-[#E9C0BC] px-2 py-0.5 text-[11px] text-[#9E3A33] line-through rounded-xs">
                        - {feat}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Target Audience Shift */}
          {targetAudienceShift && (
            <div className="p-3 bg-[#F5F3ED] rounded-xs border border-[#E3E0D7]">
              <span className="font-mono-technical text-[10px] uppercase tracking-wider text-[#73766E] font-semibold block mb-1.5">
                Target Positioning Realignment
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div className="p-2.5 bg-white border border-[#E3E0D7] rounded-xs">
                  <span className="text-[#73766E] text-[10px] font-mono-technical block mb-0.5">Prior Focus:</span>
                  <p className="text-[#202522]">{targetAudienceShift.before}</p>
                </div>
                <div className="p-2.5 bg-white border border-[#B66A45]/40 rounded-xs">
                  <span className="text-[#B66A45] text-[10px] font-mono-technical block mb-0.5 font-semibold">Current Focus:</span>
                  <p className="text-[#202522]">{targetAudienceShift.after}</p>
                </div>
              </div>
            </div>
          )}

        </div>
      )}
    </section>
  );
}
