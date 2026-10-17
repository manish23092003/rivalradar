import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import ScanInput from './components/ScanInput';
import LiveScanModal from './components/LiveScanModal';
import OverviewCard from './components/OverviewCard';
import CompanyCards from './components/CompanyCards';
import FeatureMatrix from './components/FeatureMatrix';
import PricingComparison from './components/PricingComparison';
import DiffBanner from './components/DiffBanner';
import SnapshotsDrawer from './components/SnapshotsDrawer';
import ApiKeyModal from './components/ApiKeyModal';
import ExportModal from './components/ExportModal';
import RadarMark from './components/RadarMark';
import { Loader2 } from 'lucide-react';
import { API_BASE, apiUrl } from './api/config';

export default function App() {
  const [tinyfishConfigured, setTinyfishConfigured] = useState(false);
  const [snapshots, setSnapshots] = useState([]);
  const [currentSnapshot, setCurrentSnapshot] = useState(null);
  const [currentDiff, setCurrentDiff] = useState(null);

  // Snapshot Loading State (Dedicated for reading saved records, separate from live scanning)
  const [isLoadingSnapshot, setIsLoadingSnapshot] = useState(false);
  const [loadingSnapshotId, setLoadingSnapshotId] = useState(null);
  const [prefillUrl, setPrefillUrl] = useState('');

  // Layout State: Collapsible Sidebar on Desktop
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  // Scanning State (Dedicated exclusively for live TinyFish crawls)
  const [isScanning, setIsScanning] = useState(false);
  const [scanTargetUrl, setScanTargetUrl] = useState('');
  const [scanProgress, setScanProgress] = useState({ stage: 'init', message: '', percent: 0 });
  const [scanLogs, setScanLogs] = useState([]);

  // Modals & Drawers
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [isExportOpen, setIsExportOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('scanner'); // 'scanner' | 'history'

  // Error notifications
  const [errorMessage, setErrorMessage] = useState(null);

  // 1. Check health on mount
  const checkHealth = async () => {
    try {
      const res = await fetch(apiUrl('/api/health'));
      if (res.ok) {
        const data = await res.json();
        setTinyfishConfigured(Boolean(data.tinyfishConfigured));
      }
    } catch (err) {
      console.warn('Backend server not reachable yet:', err);
    }
  };

  // 2. Fetch snapshots list
  const fetchSnapshots = async () => {
    try {
      const res = await fetch(apiUrl('/api/snapshots'));
      if (res.ok) {
        const data = await res.json();
        const loadedSnapshots = data.snapshots || [];
        setSnapshots(loadedSnapshots);

        // Load most recent snapshot into view on initial mount if none loaded
        if (!currentSnapshot && loadedSnapshots.length > 0) {
          selectHistoricalSnapshot(loadedSnapshots[0].id);
        }
      }
    } catch (err) {
      console.warn('Failed to load snapshots list:', err);
    }
  };

  useEffect(() => {
    checkHealth();
    fetchSnapshots();
  }, []);

  // 3. SELECT HISTORICAL SNAPSHOT (Pure read operation - NEVER invokes research/scanning)
  const selectHistoricalSnapshot = async (snapshotId) => {
    if (!snapshotId) return;

    // Prevent duplicate fetch if already viewing this record
    if (currentSnapshot?.id === snapshotId) {
      setIsHistoryOpen(false);
      return;
    }

    if (isLoadingSnapshot) return;

    setIsLoadingSnapshot(true);
    setLoadingSnapshotId(snapshotId);
    setErrorMessage(null);
    setIsHistoryOpen(false);

    try {
      const res = await fetch(apiUrl(`/api/snapshots/${snapshotId}`));
      if (!res.ok) {
        throw new Error(`Archived record not found (HTTP ${res.status})`);
      }
      const data = await res.json();
      setCurrentSnapshot(data.snapshot);
      setCurrentDiff(data.diff);
      if (data.snapshot?.targetUrl) {
        setPrefillUrl(data.snapshot.targetUrl);
      }
    } catch (err) {
      console.error('Failed to load snapshot details:', err);
      setErrorMessage(err.message || 'Failed to load archived snapshot.');
    } finally {
      setIsLoadingSnapshot(false);
      setLoadingSnapshotId(null);
    }
  };

  // 4. Handle Study/Preset Click from Navigation (loads existing record if archived; never auto-scans)
  const handleSelectStudy = (domain) => {
    if (!domain) return;
    const clean = domain.toLowerCase().trim();
    
    // Check if an existing snapshot matches this domain or company
    const matched = snapshots.find(
      (s) =>
        s.targetDomain?.toLowerCase() === clean ||
        s.targetUrl?.toLowerCase().includes(clean) ||
        s.companyName?.toLowerCase() === clean.split('.')[0]
    );

    if (matched) {
      // Immediately load the saved historical record without scanning
      selectHistoricalSnapshot(matched.id);
    } else {
      // If no record exists yet, simply prefill the search bar so the user can review and click "Analyze Market"
      setPrefillUrl(domain);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  // 5. START NEW SCAN (Invoked ONLY by explicit user submit on "Analyze Market" or "Re-Scan")
  const startNewScan = async ({ url, manualCompetitors = [], forceMock = false }) => {
    setIsScanning(true);
    setScanTargetUrl(url);
    setErrorMessage(null);
    setScanLogs([`[Init] Target registered: ${url}`, `[Config] Checking TinyFish agent availability...`]);
    setScanProgress({ stage: 'primary', message: 'Deploying intelligence agents...', percent: 15 });

    try {
      const queryParams = new URLSearchParams({
        url,
        forceMock: String(Boolean(forceMock)),
        competitors: manualCompetitors.join(','),
      });

      const eventSource = new EventSource(apiUrl(`/api/scan/stream?${queryParams.toString()}`));

      eventSource.addEventListener('progress', (e) => {
        try {
          const data = JSON.parse(e.data);
          setScanProgress({
            stage: data.stage,
            message: data.message,
            percent: data.percent,
          });
          setScanLogs((prev) => [...prev, `[${new Date().toLocaleTimeString()}] ${data.message}`]);
        } catch (err) {
          console.error('Progress event parse error:', err);
        }
      });

      eventSource.addEventListener('complete', (e) => {
        try {
          const data = JSON.parse(e.data);
          eventSource.close();
          setIsScanning(false);
          setCurrentSnapshot(data.snapshot);
          setCurrentDiff(data.diff);
          fetchSnapshots();
        } catch (err) {
          console.error('Complete event parse error:', err);
          setIsScanning(false);
        }
      });

      eventSource.addEventListener('error', (e) => {
        console.warn('SSE stream error, trying fallback standard POST /api/scan:', e);
        eventSource.close();
        
        fetch(apiUrl('/api/scan'), {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ url, forceMock: Boolean(forceMock), manualCompetitors }),
        })
          .then((res) => {
            if (!res.ok) return res.json().then(errData => { throw new Error(errData.error || 'Scan failed'); });
            return res.json();
          })
          .then((data) => {
            setIsScanning(false);
            setCurrentSnapshot(data.snapshot);
            setCurrentDiff(data.diff);
            fetchSnapshots();
          })
          .catch((err) => {
            setIsScanning(false);
            setErrorMessage(err.message || 'Competitive scan failed. Check server logs.');
          });
      });
    } catch (err) {
      setIsScanning(false);
      setErrorMessage(err.message || 'Failed to start scan.');
    }
  };

  // 6. Compare two snapshots directly
  const handleCompareSnapshots = async (id1, id2) => {
    try {
      const res = await fetch(apiUrl(`/api/snapshots/compare?id1=${id1}&id2=${id2}`));
      if (res.ok) {
        const data = await res.json();
        setCurrentSnapshot(data.newer);
        setCurrentDiff(data.diff);
      }
    } catch (err) {
      setErrorMessage('Failed to compare snapshots.');
    }
  };

  // 7. Delete snapshot
  const handleDeleteSnapshot = async (id) => {
    try {
      await fetch(apiUrl(`/api/snapshots/${id}`), { method: 'DELETE' });
      fetchSnapshots();
      if (currentSnapshot?.id === id) {
        setCurrentSnapshot(null);
        setCurrentDiff(null);
      }
    } catch (err) {
      console.error('Failed to delete snapshot:', err);
    }
  };

  // 8. Save TinyFish Key
  const handleSaveApiKey = async (apiKey) => {
    const res = await fetch(apiUrl('/api/settings/key'), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ apiKey }),
    });
    if (!res.ok) {
      const data = await res.json();
      throw new Error(data.error || 'Failed to save API key');
    }
    await checkHealth();
  };

  return (
    <div className="min-h-screen bg-[#F5F3ED] text-[#202522] flex flex-row font-['Inter'] antialiased">
      
      {/* 1. Desktop Understated Sidebar */}
      <Sidebar
        isCollapsed={sidebarCollapsed}
        onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenHistory={() => setIsHistoryOpen(true)}
        historyCount={snapshots.length}
        tinyfishConfigured={tinyfishConfigured}
        onOpenSettings={() => setIsSettingsOpen(true)}
        onSelectStudy={handleSelectStudy}
        isScanning={isScanning}
      />

      {/* 2. Main Application Area */}
      <div className="flex-1 flex flex-col min-w-0 min-h-screen">
        
        {/* Top Header */}
        <Header
          tinyfishConfigured={tinyfishConfigured}
          onOpenSettings={() => setIsSettingsOpen(true)}
          onOpenHistory={() => setIsHistoryOpen(true)}
          historyCount={snapshots.length}
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          currentTargetUrl={currentSnapshot?.targetUrl}
          currentTargetName={currentSnapshot?.primaryCompany?.company_name}
          onSelectStudy={handleSelectStudy}
        />

        {/* Main Content Body */}
        <main className="flex-1 pb-16 px-4 sm:px-6 lg:px-8">
          
          {/* Error notification banner if any */}
          {errorMessage && (
            <div className="mx-auto max-w-3xl mt-4">
              <div className="rounded-xs border border-[#E9C0BC] bg-[#F8ECEB] p-3.5 text-xs text-[#9E3A33] flex items-center justify-between font-mono-technical">
                <span>{errorMessage}</span>
                <button
                  onClick={() => setErrorMessage(null)}
                  className="text-[#9E3A33] hover:underline font-bold ml-4 cursor-pointer"
                >
                  Dismiss
                </button>
              </div>
            </div>
          )}

          {/* Hero Scan Input & Preset Bar */}
          <ScanInput
            onStartScan={startNewScan}
            onSelectPresetDomain={handleSelectStudy}
            isScanning={isScanning}
            tinyfishConfigured={tinyfishConfigured}
            externalUrl={prefillUrl}
          />

          {/* Brief loading banner during archived record fetch */}
          {isLoadingSnapshot && (
            <div className="mx-auto max-w-5xl mt-3 p-3 bg-white border border-[#E3E0D7] rounded-sm flex items-center justify-between text-xs font-mono-technical text-[#73766E] shadow-xs">
              <div className="flex items-center gap-2 text-[#202522]">
                <Loader2 className="h-4 w-4 text-[#68745C] animate-spin" />
                <span className="font-medium">Retrieving saved research record...</span>
              </div>
              <span className="text-[11px] text-[#73766E]">Reading archived snapshot from server ledger</span>
            </div>
          )}

          {/* If Current Snapshot is loaded: render editorial intelligence report */}
          {currentSnapshot ? (
            <div className="mx-auto max-w-5xl mt-4 space-y-6">
              
              {/* Executive Overview & Verdict */}
              <OverviewCard
                snapshot={currentSnapshot}
                diff={currentDiff}
                onRescan={() =>
                  startNewScan({
                    url: currentSnapshot.targetUrl,
                    manualCompetitors: (currentSnapshot.competitors || []).map((c) => c.website_url).filter(Boolean),
                    forceMock: Boolean(currentSnapshot.isDemo),
                  })
                }
                onExport={() => setIsExportOpen(true)}
                isScanning={isScanning}
              />

              {/* Historical Change Detection Banner */}
              <DiffBanner diff={currentDiff} />

              {/* 3-Company Structured Profiles */}
              <CompanyCards
                primaryCompany={currentSnapshot.primaryCompany}
                competitors={currentSnapshot.competitors}
                isDemo={Boolean(currentSnapshot.isDemo)}
              />

              {/* Feature Comparison Matrix */}
              <FeatureMatrix
                comparison={currentSnapshot.comparison}
                primaryCompany={currentSnapshot.primaryCompany}
                competitors={currentSnapshot.competitors}
              />

              {/* Pricing Architecture Breakdown */}
              <PricingComparison
                primaryCompany={currentSnapshot.primaryCompany}
                competitors={currentSnapshot.competitors}
              />
            </div>
          ) : (
            /* Empty State: Workspace Ready */
            <div className="mx-auto max-w-3xl mt-8">
              <div className="bg-white border border-[#E3E0D7] p-8 text-center rounded-sm">
                <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-[#ECE9E0] mb-3">
                  <RadarMark size={22} />
                </div>

                <h3 className="font-serif-editorial text-xl font-normal text-[#202522] mb-1">
                  Awaiting Target Coordinates
                </h3>
                <p className="text-xs text-[#73766E] max-w-md mx-auto mb-6 leading-relaxed">
                  Enter a target SaaS website above or select an archived study to initiate autonomous market research.
                </p>

                {/* 3 Research Pillars */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-left border-t border-[#E3E0D7] pt-5">
                  <div className="p-3 bg-[#F5F3ED] rounded-xs border border-[#E3E0D7]">
                    <span className="font-mono-technical text-[9px] uppercase tracking-wider text-[#68745C] font-semibold block mb-1">
                      01 · Discovery
                    </span>
                    <h4 className="font-serif-editorial text-sm font-semibold text-[#202522] mb-1">
                      Rival Identification
                    </h4>
                    <p className="text-[11px] text-[#73766E] leading-relaxed">
                      Identifies genuine direct market competitors without manual listing requirements.
                    </p>
                  </div>

                  <div className="p-3 bg-[#F5F3ED] rounded-xs border border-[#E3E0D7]">
                    <span className="font-mono-technical text-[9px] uppercase tracking-wider text-[#68745C] font-semibold block mb-1">
                      02 · Extraction
                    </span>
                    <h4 className="font-serif-editorial text-sm font-semibold text-[#202522] mb-1">
                      Live Web Inspection
                    </h4>
                    <p className="text-[11px] text-[#73766E] leading-relaxed">
                      Crawls public product and pricing pages to extract verified subscription tiers and features.
                    </p>
                  </div>

                  <div className="p-3 bg-[#F5F3ED] rounded-xs border border-[#E3E0D7]">
                    <span className="font-mono-technical text-[9px] uppercase tracking-wider text-[#68745C] font-semibold block mb-1">
                      03 · Auditing
                    </span>
                    <h4 className="font-serif-editorial text-sm font-semibold text-[#202522] mb-1">
                      Historical Diffing
                    </h4>
                    <p className="text-[11px] text-[#73766E] leading-relaxed">
                      Stores research snapshots and surfaces documented changes between scans.
                    </p>
                  </div>
                </div>

              </div>
            </div>
          )}
        </main>

        {/* Editorial Footer */}
        <footer className="border-t border-[#E3E0D7] bg-[#F5F3ED] py-5 text-xs text-[#73766E]">
          <div className="mx-auto max-w-5xl px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
            <div className="flex items-center space-x-2">
              <span className="font-serif-editorial font-semibold text-[#202522]">RivalRadar</span>
              <span className="text-[#C8C4B7]">·</span>
              <span className="font-mono-technical text-[11px]">Autonomous Market Intelligence</span>
            </div>
            <div className="flex items-center space-x-3 text-[#73766E] font-mono-technical text-[10px]">
              <span>Powered by TinyFish Web Agents</span>
              <span>·</span>
              <span>React + Vite</span>
              <span>·</span>
              <span>Verifiable Web Evidence</span>
            </div>
          </div>
        </footer>

        {/* Dialogs and Modals */}
        <LiveScanModal
          isOpen={isScanning}
          progress={scanProgress}
          logs={scanLogs}
          targetUrl={scanTargetUrl}
          errorMessage={errorMessage}
          onRetry={() => startNewScan({ url: scanTargetUrl, forceMock: false })}
          onCancel={() => setIsScanning(false)}
        />

        <SnapshotsDrawer
          isOpen={isHistoryOpen}
          onClose={() => setIsHistoryOpen(false)}
          snapshots={snapshots}
          currentSnapshotId={currentSnapshot?.id}
          loadingSnapshotId={loadingSnapshotId}
          onSelectSnapshot={selectHistoricalSnapshot}
          onCompareSnapshots={handleCompareSnapshots}
          onDeleteSnapshot={handleDeleteSnapshot}
        />

        <ApiKeyModal
          isOpen={isSettingsOpen}
          onClose={() => setIsSettingsOpen(false)}
          tinyfishConfigured={tinyfishConfigured}
          onSaveKey={handleSaveApiKey}
        />

        <ExportModal
          isOpen={isExportOpen}
          onClose={() => setIsExportOpen(false)}
          snapshot={currentSnapshot}
        />

      </div>
    </div>
  );
}
