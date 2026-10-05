import React from 'react';
import { CustomizerState } from '../types';
import { TIER_OPTIONS, getTierLabel } from '../data/tiers';
import { FRAME_OPTIONS, FRAME_COLOR_OPTIONS, BACKGROUND_OPTIONS } from '../data/options';
import { ArrowRight, Tag, Info, Check } from 'lucide-react';

interface DesignSummaryProps {
  state: CustomizerState;
  onFinishDesign: () => void;
}

const TIER_BADGES: Record<string, { label: string; color: string }> = {
  BASIC: { label: getTierLabel('BASIC'), color: 'text-slate-300 bg-slate-800 border-slate-700' },
  CUSTOM: { label: getTierLabel('CUSTOM'), color: 'text-purple-300 bg-purple-950/60 border-purple-800' },
  PREMIUM: { label: getTierLabel('PREMIUM'), color: 'text-pink-300 bg-pink-950/60 border-pink-800' }
};

export const DesignSummary: React.FC<DesignSummaryProps> = ({
  state,
  onFinishDesign
}) => {
  const frameOpt = FRAME_OPTIONS.find(f => f.id === state.frameStyleId) || FRAME_OPTIONS[0];
  const colorOpt = FRAME_COLOR_OPTIONS.find(c => c.id === state.frameColorId) || FRAME_COLOR_OPTIONS[0];
  const bgOpt = BACKGROUND_OPTIONS.find(b => b.id === state.backgroundId) || BACKGROUND_OPTIONS[0];
  const badge = TIER_BADGES[state.tier] || TIER_BADGES.BASIC;

  return (
    <div className="flex flex-col h-full bg-[#12141c]/90 rounded-2xl border border-white/10 p-5 shadow-2xl backdrop-blur-xl justify-between">
      <div className="space-y-4">
        
        {/* Header & Current Tier */}
        <div>
          <div className="flex items-center justify-between">
            <span className="text-xs uppercase tracking-wider text-slate-400 font-bold flex items-center gap-1.5">
              <Tag className="w-3.5 h-3.5 text-pink-400" />
              目前方案與配置
            </span>
            <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full border ${badge.color}`}>
              {badge.label}
            </span>
          </div>
          <h2 className="text-xl font-black text-white mt-1">
            展示框配置清單
          </h2>
        </div>

        {/* Selected Config List */}
        <div className="space-y-2 py-2 border-y border-white/10 text-xs text-slate-300">
          <div className="flex justify-between items-center py-1">
            <span className="text-slate-400">固定框體:</span>
            <span className="font-semibold text-white truncate max-w-[140px] text-right">
              {frameOpt.name}
            </span>
          </div>

          <div className="flex justify-between items-center py-1">
            <span className="text-slate-400">框體色系:</span>
            <span className="font-semibold text-white flex items-center gap-1.5">
              <span 
                className="w-2.5 h-2.5 rounded-full border border-white/40" 
                style={{ background: colorOpt.hex }}
              />
              {colorOpt.name.split(' ')[0]}
            </span>
          </div>

          <div className="flex justify-between items-center py-1">
            <span className="text-slate-400">背景樣式:</span>
            <span className="font-semibold text-white truncate max-w-[140px] text-right">
              {TIER_OPTIONS[state.tier].background ? bgOpt.name : '原色透亮'}
            </span>
          </div>

          <div className="flex justify-between items-center py-1">
            <span className="text-slate-400">原創貼飾:</span>
            <span className="font-semibold text-white">
              {TIER_OPTIONS[state.tier].stickers ? `${state.stickers.length} 枚` : '無'}
            </span>
          </div>

          <div className="flex justify-between items-center py-1">
            <span className="text-slate-400">客製文字:</span>
            <span className="font-semibold text-white truncate max-w-[130px] text-right">
              {state.tier === 'BASIC' || !state.text.content ? '無' : state.text.content}
            </span>
          </div>

          <div className="flex justify-between items-center py-1">
            <span className="text-slate-400">小卡預覽:</span>
            <span className="font-semibold text-white">
              {state.isCustomPhoto ? '個人上傳卡片模擬' : state.photocardUrl ? '示範卡模擬' : '純空框展示'}
            </span>
          </div>
        </div>

        {/* Available customization tools */}
        <div className="space-y-2 pt-1">
          <span className="text-xs font-bold text-slate-400 block uppercase tracking-wider">
            目前可調整的內容
          </span>

          <div className="space-y-1.5 text-xs">
            {['框體外觀', ...(TIER_OPTIONS[state.tier].text ? ['自訂文字與配置'] : []), ...(TIER_OPTIONS[state.tier].background ? ['主題背景', '自由裝飾：位置、大小、旋轉與多元素配置'] : [])].map((feature) => (
              <div key={feature} className="flex text-pink-300/90 text-[11px]">
                <span className="flex items-center gap-1">
                  <Check className="w-3 h-3 text-pink-400" />
                  {feature}
                </span>
              </div>
            ))}
          </div>

          <div className="mt-3 p-3.5 rounded-xl bg-gradient-to-r from-pink-500/10 via-purple-500/10 to-indigo-500/10 border border-pink-500/20 space-y-1">
            <span className="text-[10px] font-bold text-slate-400 block">{TIER_OPTIONS[state.tier].level}</span>
            <p className="text-sm font-bold text-pink-300">{TIER_OPTIONS[state.tier].summary}</p>
            <p className="text-[11px] text-slate-400">小卡上傳與即時預覽為三種方案的共同工具。</p>
          </div>
        </div>

        {/* Prototype Disclaimer */}
        <div className="flex items-start gap-2 p-2.5 rounded-xl bg-white/[0.02] border border-white/5 text-[11px] text-slate-400">
          <Info className="w-4 h-4 text-slate-500 flex-shrink-0 mt-0.5" />
          <p className="leading-tight">
            網站內容與產品規格僅供畢業專題研究與展示使用，不進行實際販售。
          </p>
        </div>

      </div>

      {/* Primary CTA: Finish Design */}
      <div className="pt-4">
        <button
          onClick={onFinishDesign}
          className="w-full py-3.5 px-4 rounded-xl font-bold text-sm bg-gradient-to-r from-pink-500 via-rose-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white shadow-xl shadow-pink-500/25 transition-all duration-200 active:scale-98 flex items-center justify-center gap-2.5 group"
        >
          <img src="/logo.png" alt="ONLYFRAME" className="w-4 h-4 rounded object-contain shadow-xs" />
          <span>完成設計 ‧ 查看成品</span>
          <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
        </button>
      </div>

    </div>
  );
};
