import React, { useState } from 'react';
import { 
  History, 
  Calendar, 
  Trash2, 
  ArrowRight, 
  Split, 
  X, 
  Search,
  Check,
  Loader2
} from 'lucide-react';

export default function SnapshotsDrawer({
  isOpen,
  onClose,
  snapshots = [],
  currentSnapshotId = null,
  loadingSnapshotId = null,
  onSelectSnapshot,
  onCompareSnapshots,
  onDeleteSnapshot,
}) {
  const [selectedForCompare, setSelectedForCompare] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');

  if (!isOpen) return null;

  const toggleSelectForCompare = (e, id) => {
    e.stopPropagation();
    if (selectedForCompare.includes(id)) {
      setSelectedForCompare(selectedForCompare.filter(item => item !== id));
    } else {
      if (selectedForCompare.length >= 2) {
        setSelectedForCompare([selectedForCompare[1], id]);
      } else {
        setSelectedForCompare([...selectedForCompare, id]);
      }
    }
  };

  const handleRunCompare = (e) => {
    e?.stopPropagation();
    if (selectedForCompare.length === 2) {
      onCompareSnapshots(selectedForCompare[0], selectedForCompare[1]);
      onClose();
    }
  };

  const handleDelete = (e, id) => {
    e.stopPropagation();
    onDeleteSnapshot(id);
  };

  const handleCardClick = (id) => {
    onSelectSnapshot(id);
    onClose();
  };

  const filteredSnapshots = snapshots.filter(snap => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      (snap.companyName && snap.companyName.toLowerCase().includes(q)) ||
      (snap.targetDomain && snap.targetDomain.toLowerCase().includes(q)) ||
      (snap.competitorNames && snap.competitorNames.some(c => c.toLowerCase().includes(q)))
    );
  });

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-[#202522]/40 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="w-full max-w-md h-full bg-[#F5F3ED] border-l border-[#E3E0D7] p-6 flex flex-col justify-between shadow-lg animate-in slide-in-from-right duration-200">
        
        <div className="flex-1 flex flex-col min-h-0">
          {/* Masthead */}
          <div className="flex items-center justify-between pb-4 border-b border-[#E3E0D7] shrink-0">
            <div className="flex items-center space-x-2">
              <History className="h-4 w-4 text-[#68745C]" />
              <div>
                <h3 className="font-serif-editorial text-lg font-semibold text-[#202522]">
                  Research Archive Ledger
                </h3>
                <span className="font-mono-technical text-[10px] text-[#73766E]">
                  {snapshots.length} persisted study dossiers
                </span>
              </div>
            </div>
            <button
              id="btn-close-drawer"
              onClick={onClose}
              className="rounded-sm p-1 text-[#73766E] hover:bg-[#ECE9E0] hover:text-[#202522] transition cursor-pointer"
              title="Close Drawer"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* Search Filter Input */}
          <div className="mt-3 relative shrink-0">
            <Search className="h-3.5 w-3.5 text-[#73766E] absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Filter studies by company or domain..."
              className="w-full rounded-sm border border-[#E3E0D7] bg-white pl-8 pr-3 py-1.5 text-xs text-[#202522] placeholder-[#73766E]/60 focus:border-[#68745C] focus:outline-none"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#73766E] hover:text-[#202522] text-xs font-mono-technical"
              >
                Clear
              </button>
            )}
          </div>

          {/* Compare Selector Bar */}
          {selectedForCompare.length > 0 && (
            <div className="mt-2.5 p-2.5 rounded-sm bg-[#ECE9E0] border border-[#E3E0D7] flex items-center justify-between text-xs shrink-0 font-mono-technical">
              <span className="text-[#202522] text-[11px]">
                {selectedForCompare.length}/2 selected for diffing
              </span>
              {selectedForCompare.length === 2 ? (
                <button
                  onClick={handleRunCompare}
                  className="flex items-center space-x-1 rounded-sm bg-[#68745C] px-2.5 py-1 text-white font-medium hover:bg-[#526047] transition cursor-pointer text-xs"
                >
                  <Split className="h-3 w-3" />
                  <span>Execute Diff</span>
                </button>
              ) : (
                <span className="text-[10px] text-[#73766E]">Pick second study</span>
              )}
            </div>
          )}

          {/* Snapshots Ledger List */}
          <div className="mt-3.5 space-y-2.5 overflow-y-auto flex-1 pr-1">
            {filteredSnapshots.length === 0 ? (
              <div className="p-6 text-center text-xs text-[#73766E] border border-dashed border-[#E3E0D7] rounded-sm font-mono-technical">
                {searchQuery ? 'No dossiers match your filter criteria.' : 'Archive empty. Execute a scan to save your first market intelligence snapshot.'}
              </div>
            ) : (
              filteredSnapshots.map((snap) => {
                const isSelectedForCompare = selectedForCompare.includes(snap.id);
                const isCurrentlyActive = currentSnapshotId === snap.id;
                const isLoadingThis = loadingSnapshotId === snap.id;
                const date = new Date(snap.timestamp).toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric',
                });

                return (
                  <div
                    key={snap.id}
                    onClick={() => handleCardClick(snap.id)}
                    className={`rounded-sm border p-3 transition flex flex-col justify-between cursor-pointer ${
                      isLoadingThis
                        ? 'border-[#68745C] bg-[#ECE9E0]/60 opacity-80'
                        : isCurrentlyActive
                        ? 'border-[#68745C] bg-white shadow-xs ring-1 ring-[#68745C]/30'
                        : isSelectedForCompare
                        ? 'border-[#68745C] bg-white shadow-xs'
                        : 'border-[#E3E0D7] bg-white hover:border-[#68745C] hover:bg-[#FDFCF9]'
                    }`}
                  >
                    <div>
                      {/* Top Row */}
                      <div className="flex items-start justify-between gap-2 mb-1.5">
                        <div>
                          <div className="flex items-center gap-1.5">
                            <h4 className="font-serif-editorial font-semibold text-[#202522] text-sm">
                              {snap.companyName}
                            </h4>
                            {isCurrentlyActive && (
                              <span className="font-mono-technical text-[9px] text-[#68745C] bg-[#ECE9E0] border border-[#68745C]/30 px-1 py-0.2 rounded-xs font-semibold">
                                Active
                              </span>
                            )}
                            {snap.isDemo ? (
                              <span className="font-mono-technical text-[9px] text-[#9A6B2F] bg-[#F9F3EA] border border-[#E8D7BE] px-1 py-0.2 rounded-xs">
                                Demo
                              </span>
                            ) : (
                              <span className="font-mono-technical text-[9px] text-[#2D6A4F] bg-[#EAF2EC] border border-[#C3DCC8] px-1 py-0.2 rounded-xs">
                                Live
                              </span>
                            )}
                          </div>
                          <span className="font-mono-technical text-[10px] text-[#73766E] block mt-0.5">
                            {snap.targetDomain}
                          </span>
                        </div>

                        {/* Action buttons */}
                        <div className="flex items-center space-x-1 shrink-0" onClick={(e) => e.stopPropagation()}>
                          <button
                            onClick={(e) => toggleSelectForCompare(e, snap.id)}
                            className={`p-1 rounded-sm text-xs transition cursor-pointer ${
                              isSelectedForCompare
                                ? 'bg-[#68745C] text-white'
                                : 'text-[#73766E] hover:bg-[#ECE9E0] hover:text-[#202522]'
                            }`}
                            title={isSelectedForCompare ? 'Deselect' : 'Select for comparative diff'}
                          >
                            <Split className="h-3 w-3" />
                          </button>
                          <button
                            onClick={(e) => handleDelete(e, snap.id)}
                            className="p-1 rounded-sm text-[#73766E] hover:text-[#9E3A33] hover:bg-[#ECE9E0] transition cursor-pointer"
                            title="Delete record from server"
                          >
                            <Trash2 className="h-3 w-3" />
                          </button>
                        </div>
                      </div>

                      {/* Rivals List */}
                      <div className="text-[11px] text-[#73766E] mb-2 truncate">
                        Rivals: <span className="text-[#202522]">{snap.competitorNames?.join(', ') || 'N/A'}</span>
                      </div>

                      {/* Footer Row */}
                      <div className="flex items-center justify-between text-[10px] font-mono-technical text-[#73766E] pt-2 border-t border-[#E3E0D7]/70">
                        <span className="flex items-center gap-1">
                          <Calendar className="h-2.5 w-2.5" />
                          {date}
                        </span>
                        
                        {isLoadingThis ? (
                          <span className="flex items-center gap-1 text-[#68745C] font-semibold">
                            <Loader2 className="h-2.5 w-2.5 animate-spin" />
                            <span>Loading record...</span>
                          </span>
                        ) : isCurrentlyActive ? (
                          <span className="text-[#2D6A4F] font-semibold">
                            Viewing Now
                          </span>
                        ) : (
                          <span className="flex items-center gap-1 text-[#68745C] hover:text-[#526047] font-semibold">
                            <span>View Saved Study</span>
                            <ArrowRight className="h-2.5 w-2.5" />
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Footer info note */}
        <div className="pt-3 border-t border-[#E3E0D7] text-[10px] font-mono-technical text-[#73766E] text-center shrink-0">
          JSON research ledger stored in <code>server/data/snapshots</code>
        </div>

      </div>
    </div>
  );
}
