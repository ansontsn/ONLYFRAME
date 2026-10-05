import React, { useState } from 'react';
import { CustomizationTier, CustomizerState, TextConfig } from './types';
import { PRESET_PHOTOCARDS, INITIAL_TEXT_CONFIG } from './data/options';
import { TIER_OPTIONS, getTierSwitchWarning, normalizeDesignForTier } from './data/tiers';
import { AppView, Navbar } from './components/Navbar';
import { HeroSection } from './components/HeroSection';
import { TierSelector } from './components/TierSelector';
import { CustomizerTools } from './components/CustomizerTools';
import { AcrylicFramePreview } from './components/AcrylicFramePreview';
import { DesignSummary } from './components/DesignSummary';
import { DesignConfirmation } from './components/DesignConfirmation';
import { HowItWorksModal } from './components/HowItWorksModal';
import { AboutSection } from './components/AboutSection';
import { MobileStickyBar } from './components/MobileStickyBar';
import { DesignProgress } from './components/DesignProgress';
import { SubmitDesignModal } from './components/SubmitDesignModal';
import { SubmissionSuccessView } from './components/SubmissionSuccessView';
import { AdminDashboard } from './components/admin/AdminDashboard';
import { DesignSubmission } from './types';
import { Download, Loader2 } from 'lucide-react';
import { toPng } from 'html-to-image';
import { getCardAnchorMm, isCardSizeSupported } from './utils/dimensions';

export const App: React.FC = () => {
  // Navigation View State (URL Sync)
  const getInitialView = (): AppView => {
    if (typeof window !== 'undefined') {
      if (window.location.pathname.startsWith('/admin') || window.location.hash === '#admin') {
        return 'admin';
      }
    }
    return 'home';
  };

  const [currentView, setCurrentView] = useState<AppView>(getInitialView);
  const [isHowItWorksOpen, setIsHowItWorksOpen] = useState(false);
  const [isSubmitModalOpen, setIsSubmitModalOpen] = useState(false);
  const [lastSubmission, setLastSubmission] = useState<DesignSubmission | null>(null);

  // Sync URL with browser back/forward
  React.useEffect(() => {
    const onPopState = () => {
      if (window.location.pathname.startsWith('/admin') || window.location.hash === '#admin') {
        setCurrentView('admin');
      } else if (currentView === 'admin') {
        setCurrentView('home');
      }
    };
    window.addEventListener('popstate', onPopState);
    return () => window.removeEventListener('popstate', onPopState);
  }, [currentView]);

  const handleNavigate = (view: AppView) => {
    if ((view === 'confirmation') && !isCardSizeSupported(customizerState.cardWidthMm, customizerState.cardHeightMm)) {
      alert('此尺寸超出 ONLYFRAME 標準框目前建議支援範圍，請先調整小卡尺寸。');
      return;
    }
    setCurrentView(view);
    if (view === 'admin') {
      if (window.location.pathname !== '/admin') {
        window.history.pushState(null, '', '/admin');
      }
    } else {
      if (window.location.pathname === '/admin') {
        window.history.pushState(null, '', '/');
      }
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Core Customizer State
  const [customizerState, setCustomizerState] = useState<CustomizerState>({
    cardWidthMm: 55,
    cardHeightMm: 85,
    cardSizePreset: '55 × 85 mm',
    tier: 'CUSTOM',
    frameStyleId: 'acrylic-classic',
    frameColorId: 'clear',
    backgroundId: 'bg-transparent',
    customBgUrl: null,
    photocardUrl: PRESET_PHOTOCARDS[0].url,
    photocardName: PRESET_PHOTOCARDS[0].name,
    isCustomPhoto: false,
    stickers: [],
    text: INITIAL_TEXT_CONFIG
  });

  // Active selected sticker for rotation/size inspector
  const [selectedStickerId, setSelectedStickerId] = useState<string | null>(null);
  const [isTextSelected, setIsTextSelected] = useState(false);
  const handleSelectText = () => {
    setIsTextSelected(true);
    setSelectedStickerId(null);
  };
  const handleSelectSticker = (id: string | null) => {
    setSelectedStickerId(id);
    setIsTextSelected(false);
  };

  // State update handlers
  const handleUpdateState = (updates: Partial<CustomizerState>) => {
    if (updates.text) {
      setIsTextSelected(Boolean(updates.text.content));
      setSelectedStickerId(null);
    }
    setCustomizerState((prev) => {
      const next = { ...prev, ...updates };
      if (updates.cardWidthMm !== undefined || updates.cardHeightMm !== undefined) {
        const widthMm = next.cardWidthMm;
        const heightMm = next.cardHeightMm;
        const reposition = <T extends { anchorTarget?: 'card' | 'frame'; anchorPosition?: import('./utils/dimensions').CardAnchor; offsetXmm?: number; offsetYmm?: number; xMm: number; yMm: number }>(item: T): T => {
          if (item.anchorTarget !== 'card' || !item.anchorPosition) return item;
          const anchor = getCardAnchorMm(item.anchorPosition, widthMm, heightMm);
          return { ...item, xMm: anchor.xMm + (item.offsetXmm || 0), yMm: anchor.yMm + (item.offsetYmm || 0) };
        };
        next.stickers = next.stickers.map(reposition);
        next.text = reposition(next.text);
      }
      return normalizeDesignForTier(next);
    });
  };

  const handleUpdateStickerPosition = (id: string, xMm: number, yMm: number, anchorPosition?: import('./utils/dimensions').CardAnchor) => {
    setCustomizerState((prev) => normalizeDesignForTier({
      ...prev,
      stickers: prev.stickers.map((s) => (s.id === id ? { ...s, xMm, yMm, anchorTarget: anchorPosition ? 'card' : 'frame', anchorPosition, offsetXmm: anchorPosition ? 0 : undefined, offsetYmm: anchorPosition ? 0 : undefined } : s))
    }));
  };

  const handleUpdateTextPosition = (xMm: number, yMm: number, anchorPosition?: import('./utils/dimensions').CardAnchor) => {
    setCustomizerState((prev) => normalizeDesignForTier({
      ...prev,
      text: { ...prev.text, xMm, yMm, anchorTarget: anchorPosition ? 'card' : 'frame', anchorPosition, offsetXmm: anchorPosition ? 0 : undefined, offsetYmm: anchorPosition ? 0 : undefined }
    }));
  };

  const handleUpdateTextBox = (updates: Partial<TextConfig>) => {
    setCustomizerState(prev => normalizeDesignForTier({ ...prev, text: { ...prev.text, ...updates } }));
  };

  const handleSelectTier = (tier: CustomizationTier) => {
    const warning = getTierSwitchWarning(customizerState.tier, tier);
    if (warning && !window.confirm(warning)) return;
    setCustomizerState((prev) => normalizeDesignForTier({ ...prev, tier }));
    setSelectedStickerId(null);
    setIsTextSelected(false);
    setCurrentView('customizer');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const [isDownloadingLive, setIsDownloadingLive] = useState(false);

  const handleDownloadLiveMockup = async () => {
    setSelectedStickerId(null);
    setIsTextSelected(false);
    setIsDownloadingLive(true);
    try {
      await new Promise(r => setTimeout(r, 120));
      const node = document.getElementById('acrylic-display-frame');
      if (!node) {
        alert('找不到展示框元件，請重新整理頁面。');
        return;
      }

      const dataUrl = await toPng(node, {
        quality: 0.98,
        pixelRatio: 2.5,
        cacheBust: true,
      });

      const link = document.createElement('a');
      link.download = `ONLYFRAME-${customizerState.tier}-${Date.now()}.png`;
      link.href = dataUrl;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err) {
      console.error('Download live error:', err);
      alert('圖片生成失敗，請稍候重試！');
    } finally {
      setIsDownloadingLive(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FAF8F5] text-slate-800 flex flex-col selection:bg-pink-500 selection:text-white pb-32 lg:pb-0">
      
      {/* Top Navigation (Hidden in Admin view to allow dedicated admin layout) */}
      {currentView !== 'admin' && (
        <Navbar
          currentView={currentView}
          onNavigate={handleNavigate}
          tier={customizerState.tier}
          onFinishDesign={() => handleNavigate('confirmation')}
        />
      )}

      {/* Main View Router */}
      <main className="flex-1">
        
        {/* VIEW 1: HOME LANDING PAGE */}
        {currentView === 'home' && (
          <HeroSection
            onStartCustomizing={() => handleNavigate('tiers')}
            onOpenHowItWorks={() => setIsHowItWorksOpen(true)}
          />
        )}

        {/* VIEW 2: TIER SELECTOR */}
        {currentView === 'tiers' && (
          <>
            <div className="mx-auto max-w-7xl px-4 pt-6 sm:px-6 lg:px-8"><DesignProgress activeStep={1} /></div>
            <TierSelector
              currentTier={customizerState.tier}
              onSelectTier={handleSelectTier}
              onBackToHome={() => handleNavigate('home')}
            />
          </>
        )}

        {/* VIEW 3: CORE CUSTOMIZER (3-COLUMN DESKTOP / STACKED MOBILE) */}
        {currentView === 'customizer' && (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
            
            {/* Top customizer breadcrumb bar */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-3.5 rounded-2xl bg-white/80 border border-stone-200/80 shadow-sm">
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono px-2.5 py-1 rounded-md bg-pink-500/10 text-pink-600 font-bold border border-pink-500/20">
                  {customizerState.tier} 方案
                </span>
                <span className="text-xs text-slate-700 font-medium">
                  {TIER_OPTIONS[customizerState.tier].name}：{TIER_OPTIONS[customizerState.tier].summary}
                </span>
              </div>

              <button
                onClick={() => handleNavigate('tiers')}
                className="text-xs text-slate-500 hover:text-pink-600 transition-colors underline underline-offset-4"
              >
                更換客製化程度方案 →
              </button>
            </div>

            <DesignProgress activeStep={2} />

            {/* Main 3-Column Studio Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              
              {/* Column 1: Left Tools (4 cols) */}
              <div className="lg:col-span-4 order-2 lg:order-1 h-[620px] lg:sticky lg:top-24">
                <CustomizerTools
                  state={customizerState}
                  onUpdateState={handleUpdateState}
                  onUpgradeTier={handleSelectTier}
                  selectedStickerId={selectedStickerId}
                  onSelectSticker={handleSelectSticker}
                />
              </div>

              {/* Column 2: Center Acrylic Frame Live Preview (4 cols) */}
              <div className="lg:col-span-4 order-1 lg:order-2 flex flex-col items-center justify-center min-h-[500px] lg:sticky lg:top-24">
                <AcrylicFramePreview
                  state={customizerState}
                  onUpdateStickerPosition={handleUpdateStickerPosition}
                  selectedStickerId={selectedStickerId}
                  onSelectSticker={handleSelectSticker}
                  onUpdateTextPosition={handleUpdateTextPosition}
                  onUpdateTextBox={handleUpdateTextBox}
                  isTextSelected={isTextSelected}
                  onSelectText={handleSelectText}
                  onDeselect={() => { setIsTextSelected(false); setSelectedStickerId(null); }}
                  interactive={true}
                />
                <div className="flex flex-wrap items-center justify-center gap-2.5 mt-3.5 w-full max-w-sm px-2">
                  <button
                    onClick={handleDownloadLiveMockup}
                    disabled={isDownloadingLive}
                    className="flex-1 py-2.5 px-3 rounded-xl text-xs font-semibold bg-white/85 hover:bg-white text-slate-700 hover:text-slate-900 border border-stone-200/80 hover:border-pink-500/40 transition-all flex items-center justify-center gap-1.5 shadow-sm disabled:opacity-50"
                    title="匯出當前卡框高畫質 PNG 圖片"
                  >
                    {isDownloadingLive ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin text-pink-500" />
                        <span>生成相片中...</span>
                      </>
                    ) : (
                      <>
                        <Download className="w-3.5 h-3.5 text-pink-500" />
                        <span>下載相片 (PNG)</span>
                      </>
                    )}
                  </button>

                  <button
                    onClick={() => handleNavigate('confirmation')}
                    className="flex-1 py-2.5 px-3 rounded-xl text-xs font-bold bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white shadow-md shadow-pink-500/20 transition-all flex items-center justify-center gap-2 active:scale-95"
                  >
                    <img src="/logo.png" alt="ONLYFRAME" className="w-3.5 h-3.5 rounded-sm object-contain" />
                    <span>完成設計 ➔</span>
                  </button>
                </div>
              </div>

              {/* Column 3: Right Design Summary (4 cols) */}
              <div className="hidden lg:block lg:col-span-4 order-3 h-[580px] lg:sticky lg:top-24">
                <DesignSummary
                  state={customizerState}
                  onFinishDesign={() => handleNavigate('confirmation')}
                />
              </div>

            </div>

            {/* Mobile Bottom Sticky Bar */}
            <MobileStickyBar
              tier={customizerState.tier}
              onFinishDesign={() => handleNavigate('confirmation')}
            />

          </div>
        )}

        {/* VIEW 4: DESIGN CONFIRMATION & MOCKUP SHOWCASE */}
        {currentView === 'confirmation' && (
          <>
            <div className="mx-auto max-w-5xl px-4 pt-6 sm:px-6 lg:px-8"><DesignProgress activeStep={3} /></div>
            <DesignConfirmation
              state={customizerState}
              onModifyDesign={() => handleNavigate('customizer')}
              onChangeTier={() => handleNavigate('tiers')}
              onSubmitDesign={() => setIsSubmitModalOpen(true)}
            />
          </>
        )}

        {/* VIEW 5: ABOUT & PROTOTYPE CONCEPT */}
        {currentView === 'about' && (
          <AboutSection
            onStartCustomizing={() => handleNavigate('tiers')}
          />
        )}

        {/* VIEW 6: SUBMISSION SUCCESS SCREEN */}
        {currentView === 'success' && lastSubmission && (
          <SubmissionSuccessView
            submission={lastSubmission}
            onReset={() => {
              setLastSubmission(null);
              handleNavigate('home');
            }}
          />
        )}

        {/* VIEW 7: ADMIN DASHBOARD */}
        {currentView === 'admin' && (
          <AdminDashboard onBackToStore={() => handleNavigate('home')} />
        )}

      </main>

      {/* Submit Design Modal Dialog */}
      <SubmitDesignModal
        isOpen={isSubmitModalOpen}
        onClose={() => setIsSubmitModalOpen(false)}
        state={customizerState}
        onSuccess={(submission) => {
          setLastSubmission(submission);
          handleNavigate('success');
        }}
      />

      {/* How it works guide modal */}
      <HowItWorksModal
        isOpen={isHowItWorksOpen}
        onClose={() => setIsHowItWorksOpen(false)}
        onStartCustomizing={() => {
          setIsHowItWorksOpen(false);
          handleNavigate('tiers');
        }}
      />

      {/* Clean Footer (Hidden in Admin view) */}
      {currentView !== 'admin' && (
        <footer className="mt-auto border-t border-stone-200 bg-[#FAF8F5]/80 py-8 text-center text-xs text-slate-500">
          <div className="max-w-7xl mx-auto px-4 space-y-2">
            <p className="font-semibold text-slate-700">
              ONLYFRAME · K-pop / 二次元收藏小卡客製化展示框互動平台
            </p>
            <p className="text-[11px] text-slate-500">
              企管系畢業專題 MVP 研究 Prototype ‧ 專利打樣與展示概念 ‧ 網站功能與產品規格為研究 Prototype 測試內容
            </p>
            <div className="pt-2 flex items-center justify-center gap-3 text-[11px] text-slate-400">
              <span>© 2026 ONLYFRAME 畢業專題研究團隊</span>
              <span>•</span>
              <button
                onClick={() => handleNavigate('admin')}
                className="text-slate-500 hover:text-purple-600 underline underline-offset-2 transition-colors font-medium"
              >
                管理者後台 (/admin)
              </button>
            </div>
          </div>
        </footer>
      )}

    </div>
  );
};
export default App;
