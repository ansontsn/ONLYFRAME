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
import { ArrowRight, DownloadSimple } from '@phosphor-icons/react';
import { arrowNudge, btnPrimarySm, btnSecondarySm } from './components/ui';
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
    <div className="min-h-screen bg-paper text-ink flex flex-col pb-32 lg:pb-0">
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[70] focus:rounded-xl focus:bg-ink focus:px-3 focus:py-2 focus:text-sm focus:font-semibold focus:text-white"
      >
        跳到主要內容
      </a>

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
      <main id="main-content" tabIndex={-1} className="flex-1 focus:outline-none">
        
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
            <div className="flex flex-col items-start justify-between gap-3 sm:flex-row sm:items-center">
              <div className="flex flex-wrap items-center gap-3">
                <span className="rounded-full bg-ink px-2 py-1 font-mono text-xs font-semibold text-white">
                  {customizerState.tier}
                </span>
                <span className="text-sm text-black/60">
                  <span className="font-semibold text-ink">{TIER_OPTIONS[customizerState.tier].name}</span>
                  ：{TIER_OPTIONS[customizerState.tier].summary}
                </span>
              </div>

              <button
                onClick={() => handleNavigate('tiers')}
                className="rounded-lg px-3 py-2 text-sm font-medium text-black/55 transition-colors duration-300 ease-out hover:bg-black/5 hover:text-ink focus:outline-none focus-visible:ring-2 focus-visible:ring-ink"
              >
                更換方案
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
                <div className="mt-4 flex w-full max-w-sm items-center justify-center gap-2 px-2">
                  <button
                    onClick={handleDownloadLiveMockup}
                    disabled={isDownloadingLive}
                    aria-busy={isDownloadingLive}
                    className={`flex-1 ${btnSecondarySm}`}
                    title="匯出當前卡框高畫質 PNG 圖片"
                  >
                    {isDownloadingLive ? (
                      <span className="inline-flex items-center gap-2">
                        <span className="h-4 w-4 animate-pulse rounded bg-black/10" aria-hidden="true" />
                        正在產生圖片
                      </span>
                    ) : (
                      <>
                        <DownloadSimple weight="bold" className="h-4 w-4" />
                        下載 PNG
                      </>
                    )}
                  </button>

                  <button
                    onClick={() => handleNavigate('confirmation')}
                    className={`flex-1 ${btnPrimarySm}`}
                  >
                    完成設計
                    <ArrowRight weight="bold" className={arrowNudge} />
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
        <footer className="mt-auto border-t border-black/5 bg-paper">
          <div className="mx-auto flex max-w-6xl flex-col gap-8 px-4 py-12 sm:px-6 md:flex-row md:items-start md:justify-between">
            <div className="max-w-sm">
              <img src="/logo-combination.png" alt="ONLYFRAME" className="h-8 w-auto object-contain" />
              <p className="mt-4 text-sm text-black/55">
                K-pop 與二次元收藏小卡客製化展示框互動平台。
              </p>
              <p className="mt-2 text-xs text-black/40">
                企管系畢業專題研究原型 · 網站功能與產品規格為研究測試內容
              </p>
            </div>
            <nav aria-label="頁尾導覽" className="grid grid-cols-2 gap-x-12 gap-y-3 text-sm">
              {([
                ['home', '首頁'],
                ['tiers', '方案選擇'],
                ['customizer', '客製化編輯器'],
                ['about', '關於概念'],
                ['admin', '管理後台'],
              ] as const).map(([view, label]) => (
                <button
                  key={view}
                  onClick={() => handleNavigate(view)}
                  aria-current={currentView === view ? 'page' : undefined}
                  className="justify-self-start rounded text-black/55 transition-colors duration-300 ease-out hover:text-ink focus:outline-none focus-visible:ring-2 focus-visible:ring-ink focus-visible:ring-offset-2 focus-visible:ring-offset-paper aria-[current=page]:font-semibold aria-[current=page]:text-ink"
                >
                  {label}
                </button>
              ))}
            </nav>
          </div>
          <div className="border-t border-black/5">
            <p className="mx-auto max-w-6xl px-4 py-6 text-xs text-black/40 sm:px-6">© 2026 ONLYFRAME 畢業專題研究團隊</p>
          </div>
        </footer>
      )}

    </div>
  );
};
export default App;
