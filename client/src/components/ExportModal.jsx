import React, { useState, useEffect } from 'react';
import { 
  Download, 
  Copy, 
  Check, 
  X, 
  FileText, 
  Code
} from 'lucide-react';

export default function ExportModal({ isOpen, onClose, snapshot }) {
  const [copied, setCopied] = useState(false);
  const [exportFormat, setExportFormat] = useState('markdown');

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen || !snapshot) return null;

  const { primaryCompany, competitors = [], comparison = {}, targetUrl, timestamp } = snapshot;

  const generateMarkdownReport = () => {
    return `# RivalRadar Competitive Intelligence Report
**Target Company:** ${primaryCompany?.company_name} (${targetUrl})
**Observation Date:** ${new Date(timestamp).toUTCString()}
**Discovered Rivals:** ${competitors.map(c => c.company_name).join(', ')}

---

## 1. Executive Summary & Verdict
${comparison.executive_summary || primaryCompany?.product_summary || 'N/A'}

## 2. Core Differentiators & Moats
${(comparison.differentiators || []).map(d => `- ${d}`).join('\n')}

## 3. Product & Feature Comparison
| Capability | ${primaryCompany?.company_name} | ${competitors[0]?.company_name || 'Rival 1'} | ${competitors[1]?.company_name || 'Rival 2'} |
| :--- | :---: | :---: | :---: |
${(comparison.feature_matrix || []).map(f => `| ${f.feature} | ${f.primarySupported ? 'Confirmed' : 'Not Found'} | ${f.comp1Supported ? 'Confirmed' : 'Not Found'} | ${f.comp2Supported ? 'Confirmed' : 'Not Found'} |`).join('\n')}

## 4. Pricing & Packaging Architecture
### ${primaryCompany?.company_name} (Target)
${(primaryCompany?.pricing || []).map(p => `- **${p.plan_name}**: ${p.price} (${p.billing_cycle || ''}) - ${p.details || ''}`).join('\n')}

${competitors.map(c => `### ${c.company_name}
${(c.pricing || []).map(p => `- **${p.plan_name}**: ${p.price} (${p.billing_cycle || ''}) - ${p.details || ''}`).join('\n')}`).join('\n\n')}

## 5. Verified Primary Sources
- ${primaryCompany?.company_name}: ${(primaryCompany?.evidence_urls || []).join(', ')}
${competitors.map(c => `- ${c.company_name}: ${(c.evidence_urls || []).join(', ')}`).join('\n')}

---
*Report synthesized by RivalRadar using TinyFish Autonomous Web Agents.*
`;
  };

  const markdownContent = generateMarkdownReport();
  const jsonContent = JSON.stringify(snapshot, null, 2);
  const activeContent = exportFormat === 'markdown' ? markdownContent : jsonContent;

  const handleCopy = () => {
    navigator.clipboard.writeText(activeContent);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const ext = exportFormat === 'markdown' ? 'md' : 'json';
    const type = exportFormat === 'markdown' ? 'text/markdown' : 'application/json';
    const blob = new Blob([activeContent], { type });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `rivalradar_${primaryCompany?.company_name?.toLowerCase() || 'report'}_${Date.now()}.${ext}`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#202522]/40 backdrop-blur-xs animate-in fade-in duration-150">
      <div 
        className="w-full max-w-2xl rounded-sm border border-[#E3E0D7] bg-white p-6 shadow-lg flex flex-col max-h-[85vh] relative"
        role="dialog"
        aria-modal="true"
        aria-labelledby="export-modal-title"
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-[#E3E0D7] shrink-0">
          <div className="flex items-center space-x-2">
            <Download className="h-4 w-4 text-[#68745C]" />
            <div>
              <h3 id="export-modal-title" className="font-serif-editorial text-base font-semibold text-[#202522]">
                Export Intelligence Dossier
              </h3>
              <p className="font-mono-technical text-[10px] text-[#73766E]">
                Format study for executive distribution or stakeholder briefing
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-sm p-1 text-[#73766E] hover:bg-[#ECE9E0] hover:text-[#202522] transition cursor-pointer"
            aria-label="Close modal"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Format Selector Bar */}
        <div className="flex items-center justify-between my-3 shrink-0 gap-2 flex-wrap">
          <div className="flex items-center space-x-1 bg-[#ECE9E0] p-1 rounded-sm">
            <button
              onClick={() => setExportFormat('markdown')}
              className={`flex items-center space-x-1.5 rounded-sm px-3 py-1 text-xs font-medium transition cursor-pointer ${
                exportFormat === 'markdown'
                  ? 'bg-white text-[#202522] shadow-xs font-semibold'
                  : 'text-[#73766E] hover:text-[#202522]'
              }`}
            >
              <FileText className="h-3 w-3 text-[#68745C]" />
              <span>Markdown Report</span>
            </button>
            <button
              onClick={() => setExportFormat('json')}
              className={`flex items-center space-x-1.5 rounded-sm px-3 py-1 text-xs font-medium transition cursor-pointer ${
                exportFormat === 'json'
                  ? 'bg-white text-[#202522] shadow-xs font-semibold'
                  : 'text-[#73766E] hover:text-[#202522]'
              }`}
            >
              <Code className="h-3 w-3 text-[#68745C]" />
              <span>Raw JSON Data</span>
            </button>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={handleCopy}
              className="flex items-center space-x-1.5 rounded-sm border border-[#E3E0D7] bg-white px-3 py-1 text-xs font-medium text-[#202522] hover:bg-[#ECE9E0] transition cursor-pointer"
            >
              {copied ? <Check className="h-3 w-3 text-[#2D6A4F]" /> : <Copy className="h-3 w-3 text-[#73766E]" />}
              <span>{copied ? 'Copied' : 'Copy'}</span>
            </button>
            <button
              onClick={handleDownload}
              className="flex items-center space-x-1.5 rounded-sm bg-[#68745C] px-3 py-1 text-xs font-medium text-white hover:bg-[#526047] transition cursor-pointer"
            >
              <Download className="h-3 w-3" />
              <span>Download File</span>
            </button>
          </div>
        </div>

        {/* Preview Content */}
        <div className="flex-1 overflow-y-auto rounded-xs border border-[#E3E0D7] bg-[#F5F3ED] p-4 font-mono-technical text-xs text-[#202522] leading-relaxed">
          <pre className="whitespace-pre-wrap">{activeContent}</pre>
        </div>

      </div>
    </div>
  );
}
