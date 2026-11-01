import React, { useEffect, useState } from 'react';
import { Menu, X, ArrowRight } from 'lucide-react';
import { CustomizationTier } from '../types';

export type AppView = 'home' | 'tiers' | 'customizer' | 'confirmation' | 'about' | 'success' | 'admin';
interface NavbarProps { currentView: AppView; onNavigate: (view: AppView) => void; tier: CustomizationTier; onFinishDesign?: () => void }
export const Navbar: React.FC<NavbarProps> = ({ currentView, onNavigate, tier }) => {
  const [open, setOpen] = useState(false);
  useEffect(() => {
    const close = (e: KeyboardEvent) => { if (e.key === 'Escape') setOpen(false); };
    window.addEventListener('keydown', close);
    return () => window.removeEventListener('keydown', close);
  }, []);
  const go = (view: AppView) => { setOpen(false); onNavigate(view); };
  const inspiration = () => {
    go('home');
    window.setTimeout(() => document.getElementById('inspiration')?.scrollIntoView({ behavior: 'smooth' }), 100);
  };
  return <header className="site-header"><div className="page-width nav-inner">
    <button onClick={() => go('home')} aria-label="ONLYFRAME 首頁" className="group shrink-0 rounded-lg"><img src="/logo-combination.png" alt="ONLYFRAME" className="h-7 w-auto object-contain transition-transform duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[1.02] sm:h-8" /></button>
    <nav aria-label="主要導覽" className="hidden md:flex items-center gap-8 text-sm font-medium">
      <button onClick={inspiration}>設計靈感</button>
      <button onClick={() => go('tiers')} aria-current={currentView === 'tiers' ? 'page' : undefined}>開始設計</button>
      <button onClick={() => go('about')} aria-current={currentView === 'about' ? 'page' : undefined}>關於 ONLYFRAME</button>
    </nav>
    <div className="flex items-center gap-3">
      {currentView === 'customizer' ? <span className="editor-tier-label">{tier} / 設計中</span> : <button className="nav-cta" onClick={() => go('tiers')}>開始創作 <ArrowRight size={15} /></button>}
      <button className="md:hidden p-2" onClick={() => setOpen(!open)} aria-label={open ? '關閉選單' : '開啟選單'} aria-expanded={open} aria-controls="mobile-navigation">{open ? <X size={21} /> : <Menu size={21} />}</button>
    </div>
  </div>{open && <nav id="mobile-navigation" aria-label="行動版導覽" className="mobile-navigation"><button onClick={inspiration}>設計靈感</button><button onClick={() => go('tiers')}>開始設計</button><button onClick={() => go('about')}>關於 ONLYFRAME</button></nav>}</header>;
};
