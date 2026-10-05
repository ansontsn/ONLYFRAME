import React from 'react';
import { CustomizationTier } from '../types';
import { TIER_OPTIONS } from '../data/tiers';
import { ArrowRight } from 'lucide-react';

interface MobileStickyBarProps {
  tier: CustomizationTier;
  onFinishDesign: () => void;
}

export const MobileStickyBar: React.FC<MobileStickyBarProps> = ({
  tier,
  onFinishDesign
}) => {
  return (
    <div className="lg:hidden fixed bottom-14 sm:bottom-12 inset-x-3 z-40 bg-white/95 border border-pink-500/30 p-3 rounded-2xl backdrop-blur-xl flex items-center justify-between shadow-[0_10px_35px_rgba(0,0,0,0.12)]">
      <div className="pl-1.5">
        <span className="text-[10px] text-slate-500 uppercase font-mono block tracking-wider font-semibold">
          {tier} · {TIER_OPTIONS[tier].level}
        </span>
        <div className="text-base font-black text-pink-600 leading-none mt-0.5">
          {TIER_OPTIONS[tier].name}
        </div>
      </div>

      <button
        onClick={onFinishDesign}
        className="py-2.5 px-4 sm:px-5 rounded-xl text-xs sm:text-sm font-bold bg-gradient-to-r from-pink-500 via-rose-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white shadow-lg shadow-pink-500/30 flex items-center gap-2 active:scale-95 transition-all"
      >
        <img src="/logo.png" alt="ONLYFRAME" className="w-3.5 h-3.5 rounded-sm object-contain" />
        <span>完成設計</span>
        <ArrowRight className="w-3.5 h-3.5" />
      </button>
    </div>
  );
};
