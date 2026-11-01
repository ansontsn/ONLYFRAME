import React, { useState } from 'react';
import { CustomizationTier, CustomizerState, TextConfig } from './types';
import { PRESET_PHOTOCARDS, INITIAL_TEXT_CONFIG } from './data/options';
import { getTierSwitchWarning, normalizeDesignForTier } from './data/tiers';
import { AppView, Navbar } from './components/Navbar';
import { HeroSection, LandingStart } from './components/HeroSection';
import { TierSelector } from './components/TierSelector';
import { CustomizerTools } from './components/CustomizerTools';
import { AcrylicFramePreview } from './components/AcrylicFramePreview';
import { DesignSummary } from './components/DesignSummary';
import { DesignConfirmation } from './components/DesignConfirmation';
import { HowItWorksModal } from './components/HowItWorksModal';
import { AboutSection } from './components/AboutSection';
import { DesignProgress } from './components/DesignProgress';
import { SubmitDesignModal } from './components/SubmitDesignModal';
import { SubmissionSuccessView } from './components/SubmissionSuccessView';
import { AdminDashboard } from './components/admin/AdminDashboard';
import { DesignSubmission } from './types';
import { Download, Loader2, ArrowRight } from 'lucide-react';
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
    text: { ...INITIAL_TEXT_CONFIG, color: '#141414' }
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

  // Landing presets replace the current design. With a tier the editor opens directly;
  // without one the visitor still picks a plan, and the tier page warns before dropping content.
  const handleStartFromLanding = (start?: LandingStart) => {
    if (start?.state) {
      const tier = start.tier ?? start.state.tier;
      setCustomizerState(normalizeDesignForTier({ ...start.state, tier }));
      setSelectedStickerId(null);
      setIsTextSelected(false);
    }
    if (start?.tier) {
      setCurrentView('customizer');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      handleNavigate('tiers');
    }
  };

  const [isDownloadingLive, setIsDownloadingLive] = useState(false);

  const handleDownloadLiveMockup = async () => {
    setSelectedStickerId(null);
    setIsTextSelected(false);
    setIsDownloadingLive(true);
    try {
      await new Promise(r => setTimeout(r, 120));
      await document.fonts.ready;
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
    <div className="min-h-screen bg-paper text-ink flex flex-col">
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
            onStart={handleStartFromLanding}
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

        {currentView === 'customizer' && (
          <div className="page-width studio-page">
            <DesignProgress activeStep={2} />
            <div className="studio-heading"><div><p className="eyebrow">YOUR PERSONAL FRAME STUDIO</p><h1>把喜歡，放進框裡。</h1></div><button className="text-link" onClick={() => handleNavigate('tiers')}>{customizerState.tier} · 更換方案 →</button></div>
            <div className="studio-grid">
              <section id="studio-preview" className="studio-preview" aria-label="即時設計預覽">
                <div className="preview-heading"><span><span className="brand-dot" /> LIVE PREVIEW</span><span>隨著每一步，即時呈現</span></div>
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
                  exporting={isDownloadingLive}
                />
                <p className="preview-hint">在編輯模式中，點選文字或貼飾即可拖曳調整。</p>
                <a href="#studio-tools" className="mobile-jump">前往目前工具 ↓</a>
              </section>
              <div id="studio-tools" className="studio-tools-column">
                <div className="tool-panel-wrap"><CustomizerTools
                  state={customizerState}
                  onUpdateState={handleUpdateState}
                  onUpgradeTier={handleSelectTier}
                  selectedStickerId={selectedStickerId}
                  onSelectSticker={handleSelectSticker}
                  isTextSelected={isTextSelected}
                  onSelectText={handleSelectText}
                /></div>
                <details className="studio-summary"><summary>目前設計配置 <span>展開查看</span></summary><DesignSummary state={customizerState} /></details>
                <div className="studio-actions">
                  <button onClick={() => handleNavigate('confirmation')} className="btn-primary w-full">預覽並確認 <ArrowRight size={17} /></button>
                  <button onClick={handleDownloadLiveMockup} disabled={isDownloadingLive} className="btn-secondary w-full">{isDownloadingLive ? <Loader2 size={16} className="animate-spin" /> : <Download size={16} />}{isDownloadingLive ? '正在產生圖片…' : '下載設計 PNG'}</button>
                </div>
                <a href="#studio-preview" className="mobile-jump">↑ 返回即時預覽</a>
              </div>
            </div>
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
              <p className="mt-4 text-sm text-stone-600">
                為 K-pop、動漫與遊戲收藏者打造的客製化展示框研究原型。
              </p>
              <p className="mt-2 text-xs text-stone-600">
                非實際販售。畫面皆為概念效果示意；尺寸、材質、製程與適配性仍待實體打樣驗證。
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
                  className="justify-self-start rounded text-stone-600 transition-colors duration-300 ease-out hover:text-ink focus:outline-none focus-visible:ring-2 focus-visible:ring-ink focus-visible:ring-offset-2 focus-visible:ring-offset-paper aria-[current=page]:font-semibold aria-[current=page]:text-ink"
                >
                  {label}
                </button>
              ))}
            </nav>
          </div>
          <div className="border-t border-black/5">
            <p className="mx-auto max-w-6xl px-4 py-6 text-xs text-stone-600 sm:px-6">© 2026 ONLYFRAME 畢業專題研究團隊</p>
          </div>
        </footer>
      )}

    </div>
  );
};
export default App;
