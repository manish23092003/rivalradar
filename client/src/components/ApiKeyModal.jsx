import React, { useState, useEffect } from 'react';
import { 
  Key, 
  ShieldCheck, 
  AlertCircle, 
  X, 
  CheckCircle2, 
  ArrowUpRight,
  Eye,
  EyeOff
} from 'lucide-react';

export default function ApiKeyModal({
  isOpen,
  onClose,
  tinyfishConfigured,
  onSaveKey,
}) {
  const [apiKey, setApiKey] = useState('');
  const [showKey, setShowKey] = useState(false);
  const [saving, setSaving] = useState(false);
  const [statusMessage, setStatusMessage] = useState(null);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleSave = async (e) => {
    e.preventDefault();
    if (!apiKey.trim()) return;

    setSaving(true);
    setStatusMessage(null);
    try {
      await onSaveKey(apiKey.trim());
      setStatusMessage({ type: 'success', text: 'TinyFish API Key configured and active in server environment.' });
      setTimeout(() => {
        onClose();
      }, 1000);
    } catch (err) {
      setStatusMessage({ type: 'error', text: err.message || 'Failed to update API key.' });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#202522]/40 backdrop-blur-xs animate-in fade-in duration-150">
      <div 
        className="w-full max-w-md rounded-sm border border-[#E3E0D7] bg-white p-6 shadow-lg relative"
        role="dialog"
        aria-modal="true"
        aria-labelledby="api-key-modal-title"
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-[#E3E0D7]">
          <div className="flex items-center space-x-2">
            <Key className="h-4 w-4 text-[#68745C]" />
            <div>
              <h3 id="api-key-modal-title" className="font-serif-editorial text-base font-semibold text-[#202522]">
                TinyFish Engine Configuration
              </h3>
              <p className="font-mono-technical text-[10px] text-[#73766E]">Autonomous Web Agent Credentials</p>
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

        {/* Current Status Pill */}
        <div className="mt-4 p-3 rounded-xs border text-xs bg-[#F5F3ED] border-[#E3E0D7] font-mono-technical">
          {tinyfishConfigured ? (
            <div className="flex items-center space-x-2 text-[#2D6A4F]">
              <ShieldCheck className="h-4 w-4 shrink-0 text-[#2D6A4F]" />
              <span>Active TinyFish API key detected in server environment.</span>
            </div>
          ) : (
            <div className="flex items-center space-x-2 text-[#9A6B2F]">
              <AlertCircle className="h-4 w-4 shrink-0 text-[#9A6B2F]" />
              <span>No API key found in server/.env — Using curated demo snapshots.</span>
            </div>
          )}
        </div>

        {/* Form */}
        <form onSubmit={handleSave} className="mt-4 space-y-4">
          <div>
            <label htmlFor="input-api-key" className="block text-xs font-medium text-[#202522] mb-1">
              TinyFish API Secret Key
            </label>
            <div className="relative">
              <input
                id="input-api-key"
                type={showKey ? 'text' : 'password'}
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder="tinyfish_..."
                className="w-full rounded-sm border border-[#E3E0D7] bg-white px-3 py-2 pr-9 text-xs text-[#202522] placeholder-[#73766E]/50 focus:border-[#68745C] focus:outline-none font-mono-technical"
              />
              <button
                type="button"
                onClick={() => setShowKey(!showKey)}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#73766E] hover:text-[#202522] cursor-pointer"
                title={showKey ? 'Hide key' : 'Show key'}
              >
                {showKey ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
              </button>
            </div>
            <p className="mt-1 text-[11px] text-[#73766E]">
              Keys can be generated at{' '}
              <a
                href="https://agent.tinyfish.ai/api-keys"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#68745C] hover:underline inline-flex items-center gap-0.5 font-medium"
              >
                agent.tinyfish.ai <ArrowUpRight className="h-2.5 w-2.5" />
              </a>
            </p>
          </div>

          {statusMessage && (
            <div
              className={`p-2.5 rounded-xs text-xs font-mono-technical flex items-center gap-2 ${
                statusMessage.type === 'success'
                  ? 'bg-[#EAF2EC] text-[#2D6A4F] border border-[#C3DCC8]'
                  : 'bg-[#F8ECEB] text-[#9E3A33] border border-[#E9C0BC]'
              }`}
            >
              {statusMessage.type === 'success' ? (
                <CheckCircle2 className="h-3.5 w-3.5 shrink-0 text-[#2D6A4F]" />
              ) : (
                <AlertCircle className="h-3.5 w-3.5 shrink-0 text-[#9E3A33]" />
              )}
              <span>{statusMessage.text}</span>
            </div>
          )}

          <div className="flex items-center justify-end space-x-2 pt-3 border-t border-[#E3E0D7]">
            <button
              id="btn-close-key-modal"
              type="button"
              onClick={onClose}
              className="rounded-sm border border-[#E3E0D7] bg-white px-3.5 py-1.5 text-xs font-medium text-[#202522] hover:bg-[#ECE9E0] cursor-pointer"
            >
              Cancel
            </button>
            <button
              id="btn-save-key"
              type="submit"
              disabled={saving || !apiKey.trim()}
              className="rounded-sm bg-[#68745C] px-4 py-1.5 text-xs font-medium text-white hover:bg-[#526047] transition disabled:opacity-40 cursor-pointer"
            >
              {saving ? 'Testing key...' : 'Save & Activate'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
