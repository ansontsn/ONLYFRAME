import React from 'react';
import { ArrowLeft, ArrowRight, Check, X } from '@phosphor-icons/react';
import { CustomizationTier } from '../types';
import { TIER_OPTIONS, TIER_ORDER } from '../data/tiers';
import { arrowNudge, btnGhostSm, btnPrimary, btnSecondary, eyebrow } from './ui';

interface TierSelectorProps {
  currentTier: CustomizationTier;
  onSelectTier: (tier: CustomizationTier) => void;
  onBackToHome: () => void;
}

export const TierSelector: React.FC<TierSelectorProps> = ({
  currentTier,
  onSelectTier,
  onBackToHome
}) => {
  return (
    <div className="mx-auto max-w-6xl px-4 pb-24 pt-8 sm:px-6">

      <div className="max-w-[680px]">
        <p className={eyebrow}>Step 1 · 選擇設計方式</p>
        <h1 className="mt-3 bg-gradient-to-r from-[#000000] to-[#666666] bg-clip-text pb-1 text-4xl font-bold tracking-tight text-transparent sm:text-5xl sm:leading-tight">
          選擇適合你的<br />設計方式
        </h1>
        <p className="mt-4 text-lg text-black/60">
          從選外觀、加入文字，到完整自由設計，依你想參與的程度挑一個方案。
        </p>
        <p className="mt-2 text-sm text-black/45">
          三種方案都能上傳自己的小卡，放進展示框即時預覽。
        </p>
      </div>

      <div className="mt-12 grid grid-cols-1 items-stretch gap-4 lg:grid-cols-3">
        {TIER_ORDER.map((tierId) => {
          const plan = TIER_OPTIONS[tierId];
          const isSelected = currentTier === tierId;
          const rank = TIER_ORDER.indexOf(tierId);
          const features = [
            { text: '小卡預覽', included: true },
            { text: '框體外觀', included: true },
            { text: '自訂文字', included: plan.text },
            { text: '主題背景', included: plan.background },
            { text: '自由裝飾', included: plan.stickers },
          ];

          return (
            <article
              key={tierId}
              className={`flex flex-col rounded-3xl border bg-white p-8 transition duration-500 ease-out ${
                isSelected ? 'border-ink shadow-[0_24px_60px_-28px_rgba(20,20,20,0.35)]' : 'border-black/5 hover:-translate-y-1 hover:border-black/15'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="font-mono text-sm font-semibold text-black/40">{tierId}</span>
                {isSelected
                  ? <span className="rounded-full bg-ink px-2 py-1 text-xs font-semibold text-white">目前方案</span>
                  : <span className="rounded-full bg-paper px-2 py-1 text-xs font-semibold text-black/55">{plan.level}</span>}
              </div>

              <h2 className="mt-6 text-2xl font-semibold text-ink">{plan.name}</h2>
              <div className="mt-3 flex gap-1" aria-label={plan.level}>
                {TIER_ORDER.map((level, index) => (
                  <span key={level} className={`h-1 w-6 rounded-full ${index <= rank ? 'bg-brand' : 'bg-black/10'}`} />
                ))}
              </div>
              <p className="mt-4 text-sm text-black/55">{plan.description}</p>

              <div className="mt-6 rounded-2xl bg-paper p-4">
                <p className="text-base font-semibold text-ink">{plan.headline}</p>
                <p className="mt-1 text-xs text-black/50">{plan.summary}</p>
              </div>

              <ul className="mt-6 space-y-3 text-sm" aria-label="可自訂項目">
                {features.map((feat) => (
                  <li key={feat.text} className={`flex items-center gap-3 ${feat.included ? 'text-ink' : 'text-black/30'}`}>
                    {feat.included
                      ? <Check weight="bold" className="h-4 w-4 text-brand" />
                      : <X weight="bold" className="h-4 w-4" />}
                    {feat.text}
                  </li>
                ))}
              </ul>

              <div className="mt-auto pt-8">
                <button
                  onClick={() => onSelectTier(tierId)}
                  className={`w-full ${isSelected ? btnPrimary : btnSecondary}`}
                >
                  {isSelected ? `繼續使用${plan.name}` : `選擇${plan.name}`}
                  <ArrowRight weight="bold" className={arrowNudge} />
                </button>
              </div>
            </article>
          );
        })}
      </div>

      <div className="mt-8">
        <button onClick={onBackToHome} className={btnGhostSm}>
          <ArrowLeft weight="bold" className="h-4 w-4" />
          返回首頁
        </button>
      </div>

    </div>
  );
};
