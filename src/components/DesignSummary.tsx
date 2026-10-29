import React from 'react';
import { ArrowRight, Check, Info } from '@phosphor-icons/react';
import { CustomizerState } from '../types';
import { TIER_OPTIONS, getTierLabel } from '../data/tiers';
import { FRAME_OPTIONS, FRAME_COLOR_OPTIONS, BACKGROUND_OPTIONS } from '../data/options';
import { arrowNudge, btnPrimary } from './ui';

interface DesignSummaryProps {
  state: CustomizerState;
  onFinishDesign: () => void;
}

export const DesignSummary: React.FC<DesignSummaryProps> = ({
  state,
  onFinishDesign
}) => {
  const frameOpt = FRAME_OPTIONS.find(f => f.id === state.frameStyleId) || FRAME_OPTIONS[0];
  const colorOpt = FRAME_COLOR_OPTIONS.find(c => c.id === state.frameColorId) || FRAME_COLOR_OPTIONS[0];
  const bgOpt = BACKGROUND_OPTIONS.find(b => b.id === state.backgroundId) || BACKGROUND_OPTIONS[0];
  const plan = TIER_OPTIONS[state.tier];

  const rows: { label: string; value: React.ReactNode }[] = [
    { label: '固定框體', value: frameOpt.name },
    {
      label: '框體色系',
      value: (
        <span className="inline-flex items-center gap-2">
          <span className="h-3 w-3 rounded-full border border-black/15" style={{ background: colorOpt.hex }} />
          {colorOpt.name.split(' ')[0]}
        </span>
      ),
    },
    { label: '背景樣式', value: plan.background ? bgOpt.name : '原色透亮' },
    { label: '原創貼飾', value: plan.stickers ? `${state.stickers.length} 枚` : '無' },
    { label: '客製文字', value: state.tier === 'BASIC' || !state.text.content ? '無' : state.text.content },
    { label: '小卡預覽', value: state.isCustomPhoto ? '個人上傳卡片模擬' : state.photocardUrl ? '示範卡模擬' : '純空框展示' },
  ];

  const adjustable = [
    '框體外觀',
    ...(plan.text ? ['自訂文字與配置'] : []),
    ...(plan.background ? ['主題背景', '自由裝飾：位置、大小、旋轉與多元素配置'] : []),
  ];

  return (
    <div className="flex h-full flex-col overflow-hidden rounded-3xl border border-black/5 bg-white">
      <div className="min-h-0 flex-1 overflow-y-auto p-6">
        <div className="flex items-center justify-between gap-3">
          <span className="text-xs font-semibold uppercase tracking-widest text-black/40">目前配置</span>
          <span className="rounded-full bg-paper px-2 py-1 font-mono text-xs font-semibold text-black/60">{getTierLabel(state.tier)}</span>
        </div>
        <h2 className="mt-2 text-xl font-semibold text-ink">展示框配置清單</h2>

        <dl className="mt-4 divide-y divide-black/5 border-y border-black/5 text-sm">
          {rows.map((row) => (
            <div key={row.label} className="flex items-center justify-between gap-4 py-3">
              <dt className="shrink-0 text-black/45">{row.label}</dt>
              <dd className="truncate text-right font-medium text-ink">{row.value}</dd>
            </div>
          ))}
        </dl>

        <p className="mt-6 text-xs font-semibold uppercase tracking-widest text-black/40">目前可調整</p>
        <ul className="mt-3 space-y-2 text-sm text-black/70">
          {adjustable.map((feature) => (
            <li key={feature} className="flex items-start gap-2">
              <Check weight="bold" className="mt-0.5 h-4 w-4 shrink-0 text-brand" />
              {feature}
            </li>
          ))}
        </ul>

        <div className="mt-4 rounded-2xl bg-paper p-4">
          <span className="block text-xs font-semibold text-black/45">{plan.level}</span>
          <p className="mt-1 text-sm font-semibold text-ink">{plan.summary}</p>
          <p className="mt-1 text-xs text-black/45">小卡上傳與即時預覽為三種方案的共同工具。</p>
        </div>

        <p className="mt-4 flex items-start gap-2 text-xs text-black/40">
          <Info weight="bold" className="mt-0.5 h-4 w-4 shrink-0" />
          網站內容與產品規格僅供畢業專題研究與展示使用，不進行實際販售。
        </p>
      </div>

      <div className="shrink-0 border-t border-black/5 p-4">
        <button onClick={onFinishDesign} className={`w-full ${btnPrimary}`}>
          完成設計，查看成品
          <ArrowRight weight="bold" className={arrowNudge} />
        </button>
      </div>
    </div>
  );
};
