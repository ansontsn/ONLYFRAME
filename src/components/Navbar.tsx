import React, { useEffect, useState } from 'react';
import { ArrowRight } from '@phosphor-icons/react';
import { CustomizationTier } from '../types';
import { TIER_OPTIONS } from '../data/tiers';

export type AppView = 'home' | 'tiers' | 'customizer' | 'confirmation' | 'about' | 'success' | 'admin';

interface NavbarProps {
  currentView: AppView;
  onNavigate: (view: AppView) => void;
  tier: CustomizationTier;
  onFinishDesign?: () => void;
}

const NAV_LINKS: { view: AppView; label: string }[] = [
  { view: 'home', label: '首頁' },
  { view: 'tiers', label: '方案選擇' },
  { view: 'customizer', label: '客製化編輯器' },
  { view: 'about', label: '關於概念' },
  { view: 'admin', label: '管理後台' },
];

const focusRing = 'focus:outline-none focus-visible:ring-2 focus-visible:ring-ink focus-visible:ring-offset-2 focus-visible:ring-offset-paper';

export const Navbar: React.FC<NavbarProps> = ({
  currentView,
  onNavigate,
  tier,
  onFinishDesign
}) => {
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    document.body.style.overflow = menuOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [menuOpen]);

  useEffect(() => {
    if (!menuOpen) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setMenuOpen(false); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [menuOpen]);

  const go = (view: AppView) => {
    setMenuOpen(false);
    onNavigate(view);
  };

  // Same routing as the original header CTA: it advances the visitor one step.
  const handlePrimary = () => {
    setMenuOpen(false);
    if (currentView === 'customizer') {
      if (onFinishDesign) onFinishDesign();
      else onNavigate('confirmation');
    } else if (currentView === 'home') {
      onNavigate('tiers');
    } else if (currentView === 'tiers') {
      onNavigate('customizer');
    } else {
      onNavigate('tiers');
    }
  };
  const primaryLabel = currentView === 'customizer' ? '確認設計' : '開始設計';

  return (
    <header className="sticky top-0 z-50 px-4 pt-3 sm:px-6">
      <div className="relative z-10 mx-auto flex w-full max-w-5xl items-center justify-between gap-3 rounded-2xl border border-black/5 bg-white/75 py-2 pl-4 pr-2 shadow-[0_8px_32px_-12px_rgba(20,20,20,0.18)] backdrop-blur-xl lg:w-fit lg:gap-8">
        <button
          onClick={() => go('home')}
          className={`group flex shrink-0 items-center gap-2 rounded-lg ${focusRing}`}
          aria-label="ONLYFRAME 首頁"
        >
          <img
            src="/logo-combination.png"
            alt="ONLYFRAME"
            className="h-8 w-auto object-contain transition-transform duration-300 ease-out group-hover:scale-[1.02]"
          />
          <span className="hidden rounded-full border border-black/10 px-2 text-xs font-semibold text-black/50 sm:inline-block">
            Prototype
          </span>
        </button>

        <nav aria-label="主要導覽" className="hidden items-center gap-1 lg:flex">
          {NAV_LINKS.map(({ view, label }) => {
            const active = currentView === view;
            return (
              <button
                key={view}
                onClick={() => go(view)}
                aria-current={active ? 'page' : undefined}
                className={`relative rounded-lg px-3 py-2 text-sm font-medium transition-colors duration-300 ease-out ${focusRing} ${
                  active ? 'bg-ink/5 text-ink' : 'text-black/55 hover:bg-black/5 hover:text-ink'
                }`}
              >
                {label}
                {active && <span className="absolute bottom-1 left-1/2 h-0.5 w-4 -translate-x-1/2 rounded-full bg-brand" aria-hidden="true" />}
              </button>
            );
          })}
        </nav>

        <div className="flex items-center gap-2">
          {currentView === 'customizer' && (
            <div className="hidden flex-col items-end sm:flex">
              <span className="font-mono text-xs font-semibold text-brand">{tier} 方案</span>
              <span className="text-sm font-semibold text-ink">{TIER_OPTIONS[tier].name}</span>
            </div>
          )}

          <button
            onClick={handlePrimary}
            className={`group inline-flex items-center gap-2 whitespace-nowrap rounded-xl bg-ink px-3 py-2 text-sm font-semibold text-white transition duration-300 ease-out hover:bg-black active:scale-[0.98] ${focusRing}`}
          >
            {primaryLabel}
            <ArrowRight weight="bold" className="h-4 w-4 transition-transform duration-300 ease-out group-hover:translate-x-0.5" />
          </button>

          <button
            onClick={() => setMenuOpen((open) => !open)}
            className={`relative grid h-10 w-10 place-items-center rounded-xl text-ink transition-colors duration-300 ease-out hover:bg-black/5 lg:hidden ${focusRing}`}
            aria-label={menuOpen ? '關閉選單' : '開啟選單'}
            aria-expanded={menuOpen}
            aria-controls="mobile-menu"
          >
            <span className={`absolute h-0.5 w-4 rounded-full bg-current transition-transform duration-500 ease-out ${menuOpen ? 'rotate-45' : '-translate-y-1'}`} />
            <span className={`absolute h-0.5 w-4 rounded-full bg-current transition-transform duration-500 ease-out ${menuOpen ? '-rotate-45' : 'translate-y-1'}`} />
          </button>
        </div>
      </div>

      {/* Mobile menu: full height panel, links arrive in reading order */}
      <div
        id="mobile-menu"
        className={`fixed inset-0 bg-paper/95 backdrop-blur-2xl transition-opacity duration-500 ease-out lg:hidden ${
          menuOpen ? 'opacity-100' : 'pointer-events-none opacity-0'
        }`}
        aria-hidden={!menuOpen}
      >
        <nav aria-label="行動版導覽" className="flex h-full flex-col justify-center gap-2 px-6">
          {NAV_LINKS.map(({ view, label }, idx) => {
            const active = currentView === view;
            return (
              <button
                key={view}
                onClick={() => go(view)}
                tabIndex={menuOpen ? 0 : -1}
                aria-current={active ? 'page' : undefined}
                style={{ transitionDelay: menuOpen ? `${Math.min(idx * 60, 340)}ms` : '0ms' }}
                className={`flex items-center justify-between rounded-xl px-3 py-3 text-left text-3xl font-semibold transition duration-500 ease-out ${focusRing} ${
                  menuOpen ? 'translate-y-0 opacity-100' : 'translate-y-6 opacity-0'
                } ${active ? 'text-ink' : 'text-black/40 hover:text-ink'}`}
              >
                {label}
                {active && <span className="h-2 w-2 rounded-full bg-brand" aria-hidden="true" />}
              </button>
            );
          })}
        </nav>
      </div>
    </header>
  );
};
