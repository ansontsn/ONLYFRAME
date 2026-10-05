import React from 'react';
import { Layers, ShieldCheck } from 'lucide-react';
import { CustomizationTier } from '../types';
import { TIER_OPTIONS } from '../data/tiers';

export type AppView = 'home' | 'tiers' | 'customizer' | 'confirmation' | 'about' | 'success' | 'admin';

interface NavbarProps {
  currentView: AppView;
  onNavigate: (view: AppView) => void;
  tier: CustomizationTier;
  onFinishDesign?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentView,
  onNavigate,
  tier,
  onFinishDesign
}) => {
  return (
    <header className="sticky top-0 z-50 w-full bg-[#FAF8F5]/90 backdrop-blur-xl border-b border-stone-200/80 shadow-sm transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 sm:h-20 flex items-center justify-between">
        
        {/* Brand Logo */}
        <div 
          onClick={() => onNavigate('home')} 
          className="flex items-center gap-2.5 sm:gap-3 cursor-pointer group py-1"
        >
          <img 
            src="/logo-combination.png" 
            alt="ONLYFRAME" 
            className="h-9 sm:h-11 md:h-12 w-auto object-contain max-w-[min(210px,calc(100vw-9rem))] sm:max-w-none transition-transform duration-200 group-hover:scale-[1.02]"
          />
          <span className="hidden sm:inline-block text-[10px] uppercase font-bold tracking-widest px-2 py-0.5 rounded-full bg-pink-500/10 text-pink-600 border border-pink-500/20">
            PROTOTYPE
          </span>
        </div>

        {/* Navigation Links */}
        <nav className="hidden md:flex items-center gap-1 bg-stone-200/60 p-1 rounded-full border border-stone-300/60 text-xs font-medium">
          <button
            onClick={() => onNavigate('home')}
            className={`px-4 py-1.5 rounded-full transition-all ${
              currentView === 'home'
                ? 'bg-white text-slate-900 font-bold shadow-sm'
                : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
            }`}
          >
            首頁
          </button>
          <button
            onClick={() => onNavigate('tiers')}
            className={`px-4 py-1.5 rounded-full transition-all ${
              currentView === 'tiers'
                ? 'bg-white text-slate-900 font-bold shadow-sm'
                : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
            }`}
          >
            方案選擇
          </button>
          <button
            onClick={() => onNavigate('customizer')}
            className={`px-4 py-1.5 rounded-full transition-all flex items-center gap-1.5 ${
              currentView === 'customizer'
                ? 'bg-white text-pink-600 font-bold shadow-sm border border-pink-200'
                : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
            }`}
          >
            <Layers className="w-3.5 h-3.5 text-pink-500" />
            客製化編輯器
          </button>
          <button
            onClick={() => onNavigate('about')}
            className={`px-4 py-1.5 rounded-full transition-all ${
              currentView === 'about'
                ? 'bg-white text-slate-900 font-bold shadow-sm'
                : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
            }`}
          >
            關於概念
          </button>
          <button
            onClick={() => onNavigate('admin')}
            className={`px-3.5 py-1.5 rounded-full transition-all flex items-center gap-1 ${
              currentView === 'admin'
                ? 'bg-white text-purple-600 font-bold shadow-sm border border-purple-200'
                : 'text-slate-500 hover:text-purple-600 hover:bg-white/60'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>管理後台</span>
          </button>
        </nav>

        {/* Action Button & Status */}
        <div className="flex items-center gap-2.5 sm:gap-3">
          {currentView === 'customizer' && (
            <div className="hidden sm:flex flex-col items-end mr-2">
              <span className="text-[10px] uppercase tracking-wider text-pink-600 font-mono font-bold">
                {tier} 方案
              </span>
              <span className="text-sm font-extrabold text-slate-900">{TIER_OPTIONS[tier].name}</span>
            </div>
          )}

          <button
            onClick={() => {
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
            }}
            className="px-3.5 py-2 sm:px-4 sm:py-2.5 rounded-xl text-xs sm:text-sm font-bold bg-gradient-to-r from-pink-500 via-rose-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white shadow-lg shadow-pink-500/25 hover:shadow-pink-500/40 transition-all duration-200 active:scale-95 flex items-center gap-2"
          >
            <img 
              src="/logo.png" 
              alt="ONLYFRAME" 
              className="w-4 h-4 sm:w-5 sm:h-5 rounded-sm object-contain flex-shrink-0" 
              style={{ width: '16px', height: '16px' }}
            />
            <span className="whitespace-nowrap">{currentView === 'customizer' ? '確認設計' : '開始設計'}</span>
          </button>
        </div>

      </div>
    </header>
  );
};
