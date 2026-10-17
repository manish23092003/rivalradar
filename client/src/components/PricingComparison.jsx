import React from 'react';
import { ArrowUpRight, HelpCircle } from 'lucide-react';

export default function PricingComparison({ primaryCompany, competitors = [] }) {
  const allCompanies = [
    { ...primaryCompany, isPrimary: true },
    ...(competitors.map((c, i) => ({ ...c, isPrimary: false, rivalNumber: i + 1 })))
  ];

  return (
    <div className="mt-8">
      {/* Masthead */}
      <div className="flex items-baseline justify-between mb-4 pb-2 border-b border-[#E3E0D7]">
        <div>
          <h3 className="font-serif-editorial text-xl font-normal text-[#202522]">
            Pricing Architecture & Packaging Breakdown
          </h3>
          <p className="font-mono-technical text-[11px] text-[#73766E] mt-0.5">
            Verified subscription tiers, seat limits, and billing structures published on official pricing pages
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {allCompanies.map((comp, cIdx) => {
          const plans = comp.pricing || [];
          const pricingUrl = (comp.evidence_urls || []).find(u => u.toLowerCase().includes('pricing')) || comp.evidence_urls?.[0];

          return (
            <div
              key={cIdx}
              className={`bg-white border rounded-sm p-5 flex flex-col justify-between ${
                comp.isPrimary ? 'border-[#68745C]' : 'border-[#E3E0D7]'
              }`}
            >
              <div>
                {/* Header */}
                <div className="flex items-baseline justify-between pb-3 mb-4 border-b border-[#E3E0D7]">
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="font-serif-editorial text-base font-semibold text-[#202522]">
                        {comp.company_name}
                      </h4>
                      {comp.isPrimary && (
                        <span className="font-mono-technical text-[9px] uppercase px-1 py-0.2 bg-[#ECE9E0] text-[#68745C] font-semibold rounded-xs">
                          Target
                        </span>
                      )}
                    </div>
                    <span className="font-mono-technical text-[10px] text-[#73766E] mt-0.5 block">
                      {plans.length} published {plans.length === 1 ? 'tier' : 'tiers'}
                    </span>
                  </div>

                  {pricingUrl && (
                    <a
                      href={pricingUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 font-mono-technical text-[10px] text-[#68745C] hover:text-[#526047] hover:underline"
                      title="View Primary Source"
                    >
                      <span>Pricing Page</span>
                      <ArrowUpRight className="h-2.5 w-2.5" />
                    </a>
                  )}
                </div>

                {/* Plans List */}
                {plans.length === 0 ? (
                  <div className="p-5 text-center text-xs text-[#73766E] bg-[#F5F3ED] border border-dashed border-[#E3E0D7] rounded-xs font-mono-technical">
                    <p className="font-medium text-[#202522]">No public self-serve tiers found.</p>
                    <p className="text-[10px] text-[#73766E] mt-1">Enterprise quote or custom contract model only.</p>
                  </div>
                ) : (
                  <div className="space-y-2.5">
                    {plans.map((plan, pIdx) => {
                      const lowerPrice = (plan.price || '').toLowerCase();
                      const lowerName = (plan.plan_name || '').toLowerCase();
                      const isFree = lowerPrice.includes('$0') || lowerName.includes('free');
                      const isEnterprise = lowerName.includes('enterprise') || lowerPrice.includes('custom') || lowerPrice.includes('contact');

                      return (
                        <div
                          key={pIdx}
                          className={`p-3.5 rounded-xs border transition ${
                            isFree
                              ? 'border-[#C3DCC8] bg-[#EAF2EC]/40'
                              : isEnterprise
                              ? 'border-[#E3E0D7] bg-[#ECE9E0]/40'
                              : 'border-[#E3E0D7] bg-white'
                          }`}
                        >
                          <div className="flex items-baseline justify-between gap-2 mb-1">
                            <span className="font-serif-editorial font-semibold text-xs text-[#202522]">
                              {plan.plan_name}
                            </span>
                            <span className={`font-mono-technical font-semibold text-xs ${
                              isFree ? 'text-[#2D6A4F]' : 'text-[#202522]'
                            }`}>
                              {plan.price || 'Contact Sales'}
                            </span>
                          </div>

                          {plan.billing_cycle && (
                            <span className="font-mono-technical text-[10px] text-[#73766E] block mb-1">
                              Billed: {plan.billing_cycle}
                            </span>
                          )}

                          {plan.details && (
                            <p className="text-[11px] text-[#73766E] leading-relaxed pt-1.5 border-t border-[#E3E0D7]/60">
                              {plan.details}
                            </p>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
