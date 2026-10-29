import React from 'react';
import { ArrowRight } from '@phosphor-icons/react';
import { CustomizationTier } from '../types';
import { TIER_OPTIONS } from '../data/tiers';
import { arrowNudge, btnPrimarySm } from './ui';

interface MobileStickyBarProps {
  tier: CustomizationTier;
  onFinishDesign: () => void;
}

export const MobileStickyBar: React.FC<MobileStickyBarProps> = ({
  tier,
  onFinishDesign
}) => {
  return (
    <div className="fixed inset-x-3 bottom-4 z-40 flex items-center justify-between gap-3 rounded-2xl border border-black/5 bg-white/85 p-2 pl-4 shadow-[0_16px_40px_-16px_rgba(20,20,20,0.3)] backdrop-blur-xl lg:hidden">
      <div className="min-w-0">
        <span className="block font-mono text-xs font-semibold text-black/40">{tier}</span>
        <span className="block truncate text-sm font-semibold text-ink">{TIER_OPTIONS[tier].name}</span>
      </div>
      <button onClick={onFinishDesign} className={btnPrimarySm}>
        完成設計
        <ArrowRight weight="bold" className={arrowNudge} />
      </button>
    </div>
  );
};
