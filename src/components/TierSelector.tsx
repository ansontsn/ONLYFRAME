import React from 'react';
import { CustomizationTier } from '../types';
import { TIER_OPTIONS, TIER_ORDER } from '../data/tiers';
import { Check, Shield, Zap, Crown, ArrowRight } from 'lucide-react';

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
  const tiers = [
    {
      id: 'BASIC' as CustomizationTier,
      badge: TIER_OPTIONS.BASIC.level,
      name: 'BASIC',
      icon: Shield,
      accentColor: 'border-stone-300 bg-white/85 hover:border-stone-400 shadow-sm',
      tagColor: 'bg-stone-100 text-stone-700 border-stone-200',
      btnClass: 'bg-stone-800 hover:bg-stone-900 text-white',
    },
    {
      id: 'CUSTOM' as CustomizationTier,
      badge: TIER_OPTIONS.CUSTOM.level,
      name: 'CUSTOM',
      icon: Zap,
      accentColor: 'border-purple-300/80 bg-white/90 hover:border-purple-400 shadow-md shadow-purple-500/5',
      tagColor: 'bg-purple-100 text-purple-700 border-purple-200',
      btnClass: 'bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white shadow-md',
    },
    {
      id: 'PREMIUM' as CustomizationTier,
      badge: TIER_OPTIONS.PREMIUM.level,
      name: 'PREMIUM',
      icon: Crown,
      accentColor: 'border-pink-300/80 bg-white/90 hover:border-pink-400 shadow-lg shadow-pink-500/10',
      tagColor: 'bg-pink-100 text-pink-700 border-pink-200',
      btnClass: 'bg-gradient-to-r from-pink-500 via-rose-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white shadow-md',
    }
  ];

  return (
    <div className="py-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-10">
      
      {/* Step Indicator & Header */}
      <div className="text-center max-w-3xl mx-auto space-y-3">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-pink-500/10 border border-pink-500/20 text-xs font-semibold text-pink-600">
          <img src="/logo.png" alt="ONLYFRAME" className="w-3.5 h-3.5 rounded-sm object-contain" />
          <span>STEP 1：選擇設計方式</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900">
          選擇適合你的設計方式
        </h1>
        <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
          從選外觀、加入文字，到完整自由設計，依照你想參與設計的程度選擇方案。
        </p>
        <p className="text-xs text-slate-500 leading-relaxed">
          三種方案都能上傳自己的小卡圖片，放入展示框中進行即時預覽。小卡預覽是共同工具。
        </p>
      </div>

      {/* 3 Tier Cards Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 pt-4 items-stretch">
        {tiers.map((tier) => {
          const Icon = tier.icon;
          const isSelected = currentTier === tier.id;
          const plan = TIER_OPTIONS[tier.id];
          const features = [
            { text: '小卡預覽', included: true },
            { text: '框體外觀', included: true },
            { text: '自訂文字', included: plan.text },
            { text: '主題背景', included: plan.background },
            { text: '自由裝飾', included: plan.stickers },
          ];

          return (
            <div
              key={tier.id}
              className={`relative rounded-3xl p-6 sm:p-8 flex flex-col justify-between border transition-all duration-300 ${
                tier.accentColor
              } ${isSelected ? 'ring-2 ring-pink-500 scale-[1.02]' : 'hover:scale-[1.01]'}`}
            >
              {/* Header Badge */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className={`text-[11px] font-bold tracking-wider uppercase px-3 py-1 rounded-full border ${tier.tagColor}`}>
                    {tier.badge}
                  </span>
                  <div className="w-8 h-8 rounded-xl bg-stone-100 flex items-center justify-center text-slate-700">
                    <Icon className="w-4 h-4" />
                  </div>
                </div>

                <div>
                  <h3 className="text-2xl font-black tracking-tight text-slate-900">
                    {tier.name}
                  </h3>
                  <p className="text-xs text-slate-500 font-medium mt-0.5">
                    {plan.name}
                  </p>
                </div>

                <div className="pt-2 border-b border-stone-200/80 pb-4 space-y-2">
                  <div className="flex gap-1" aria-label={plan.level}>
                    {TIER_ORDER.map((level, index) => <span key={level} className={`h-1.5 w-8 rounded-full ${index <= TIER_ORDER.indexOf(tier.id) ? 'bg-pink-500' : 'bg-stone-200'}`} />)}
                  </div>
                  <p className="text-xl font-black text-slate-900">{plan.headline}</p>
                  <p className="text-xs font-medium text-slate-500">{plan.summary}</p>
                </div>

                <p className="min-h-[2.5rem] text-xs text-slate-600 leading-relaxed">
                  {plan.description}
                </p>

                {/* Features Checklist */}
                <div className="space-y-2.5 pt-2">
                  <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
                    可自訂項目清單：
                  </span>
                  <ul className="space-y-2 text-xs">
                    {features.map((feat, idx) => (
                      <li key={idx} className="flex items-start gap-2.5">
                        {feat.included ? (
                          <div className="w-4 h-4 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center flex-shrink-0 mt-0.5">
                            <Check className="w-2.5 h-2.5 stroke-[3]" />
                          </div>
                        ) : (
                          <div className="w-4 h-4 rounded-full bg-stone-100 text-stone-400 flex items-center justify-center flex-shrink-0 mt-0.5">
                            <span className="text-[10px]">✕</span>
                          </div>
                        )}
                        <span className={feat.included ? 'text-slate-700 font-medium' : 'text-slate-400'}>
                          {feat.text}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Action Button */}
              <div className="pt-8">
                <button
                  onClick={() => onSelectTier(tier.id)}
                  className={`w-full py-3 px-4 rounded-xl font-bold text-xs sm:text-sm transition-all duration-200 flex items-center justify-center gap-2 group active:scale-98 ${
                    tier.btnClass
                  }`}
                >
                  <img src="/logo.png" alt="ONLYFRAME" className="w-4 h-4 rounded-sm object-contain" />
                  <span>選擇此方案 ({tier.name})</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </button>
              </div>

            </div>
          );
        })}
      </div>

      {/* Back to Home Link */}
      <div className="text-center pt-4">
        <button
          onClick={onBackToHome}
          className="text-xs text-slate-500 hover:text-slate-300 transition-colors"
        >
          ← 返回首頁介紹
        </button>
      </div>

    </div>
  );
};
