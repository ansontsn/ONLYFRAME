import React from 'react';
import { CustomizerState } from '../types';
import { FRAME_COLOR_OPTIONS, BACKGROUND_OPTIONS } from '../data/options';
import { TIER_OPTIONS } from '../data/tiers';

interface DesignSummaryProps { state: CustomizerState; onFinishDesign?: () => void }
export const DesignSummary: React.FC<DesignSummaryProps> = ({ state }) => <dl className="summary-list">{[
  ['方案', `${state.tier} · ${TIER_OPTIONS[state.tier].name}`],
  ['框體色系', FRAME_COLOR_OPTIONS.find(c => c.id === state.frameColorId)?.name.split(' (')[0]],
  ['小卡尺寸', `${state.cardWidthMm} × ${state.cardHeightMm} mm`],
  ['背景', BACKGROUND_OPTIONS.find(b => b.id === state.backgroundId)?.name],
  ['文字', state.text.content || '未加入'],
  ['貼飾', `${state.stickers.length} 枚`],
].map(([label, value]) => <div key={label}><dt>{label}</dt><dd>{value}</dd></div>)}</dl>;
