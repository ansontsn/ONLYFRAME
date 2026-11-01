import React from 'react';
import { Check, Minus, ArrowRight } from 'lucide-react';
import { CustomizationTier } from '../types';
import { TIER_OPTIONS, TIER_ORDER } from '../data/tiers';
import { ProductExample } from './ProductExample';

interface TierSelectorProps { currentTier: CustomizationTier; onSelectTier: (tier: CustomizationTier) => void; onBackToHome: () => void }
export const TierSelector: React.FC<TierSelectorProps> = ({ currentTier, onSelectTier, onBackToHome }) => <section className="page-width tier-section">
  <div className="section-heading"><div><p className="eyebrow">CHOOSE YOUR CREATIVE SPACE</p><h1>想設計多少，由你決定。</h1></div><p>三種方案都能上傳小卡、即時預覽。<br />選擇你想參與的客製程度。</p></div>
  <p className="text-sm text-stone-600 mb-6">下方使用同一張小卡、相同角度與尺寸比較。皆為概念效果示意。</p>
  <div className="tier-grid">{TIER_ORDER.map((tier, i) => {
    const plan = TIER_OPTIONS[tier];
    return <article className={`tier-card ${currentTier === tier ? 'tier-selected' : ''}`} key={tier}>
      <div className="tier-card-heading"><span className="eyebrow">0{i + 1} / {plan.level}</span><span className="tier-current">{currentTier === tier ? '目前選擇' : '　'}</span></div>
      <h2>{tier}</h2><p className="text-sm text-stone-600">{plan.name}</p>
      <div className="tier-art"><ProductExample tier={tier} /><span>設計範例 · 效果示意</span></div>
      <h3>{plan.headline}</h3><p className="tier-description">{plan.description}</p>
      <ul>{[
        ['小卡上傳與即時預覽', true], ['框體外觀', true], ['自訂文字', plan.text], ['主題背景', plan.background], ['自由貼飾', plan.stickers],
      ].map(([label, included]) => <li key={String(label)}>{included ? <Check size={15} className="text-brand" /> : <Minus size={15} className="text-stone-400" />}<span className={included ? '' : 'text-stone-500'}>{label}</span></li>)}</ul>
      <button className="btn-primary w-full" onClick={() => onSelectTier(tier)}>選擇 {tier} <ArrowRight size={16} /></button>
    </article>;
  })}</div>
  <button className="text-link mt-8" onClick={onBackToHome}>← 返回首頁</button>
</section>;
