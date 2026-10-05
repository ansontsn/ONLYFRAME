import React from 'react';
import { Sparkles, GraduationCap, Box, Layers } from 'lucide-react';

interface AboutSectionProps {
  onStartCustomizing: () => void;
}

export const AboutSection: React.FC<AboutSectionProps> = ({ onStartCustomizing }) => {
  return (
    <div className="py-12 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto space-y-12">
      
      {/* Header */}
      <div className="text-center space-y-3">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-pink-500/10 border border-pink-500/20 text-xs font-semibold text-pink-600">
          <GraduationCap className="w-4 h-4" />
          <span>企管系畢業專題 · 概念產品研究</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900">
          關於 ONLYFRAME 專題概念
        </h1>
        <p className="text-sm sm:text-base text-slate-600 max-w-2xl mx-auto leading-relaxed">
          探討「客製化程度是否影響收藏型消費者的購買意願？」之實證研究與互動式 Prototype 平台。
        </p>
      </div>

      {/* 3 Core Pillars */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Card 1: 研究背景與核心問題 */}
        <div className="p-6 rounded-3xl bg-white/85 border border-stone-200/80 shadow-sm space-y-3">
          <div className="w-10 h-10 rounded-xl bg-purple-50 border border-purple-200 flex items-center justify-center text-purple-600">
            <Layers className="w-5 h-5" />
          </div>
          <h3 className="text-lg font-bold text-slate-900">專題研究核心假說</h3>
          <p className="text-xs text-slate-600 leading-relaxed">
            現代 K-pop 粉絲與二次元動漫收藏者對於專屬周邊展示有高度的情感連結與審美要求。本專題旨在驗證：<strong>提供階梯式自訂選項（簡易客製、文字客製、自由客製）是否能顯著提升消費者的價值感知與購買意願？</strong>
          </p>
        </div>

        {/* Card 2: 產品定位與設計理念 */}
        <div className="p-6 rounded-3xl bg-white/85 border border-stone-200/80 shadow-sm space-y-3">
          <div className="w-10 h-10 rounded-xl bg-pink-50 border border-pink-200 flex items-center justify-center text-pink-600">
            <Sparkles className="w-5 h-5" />
          </div>
          <h3 className="text-lg font-bold text-slate-900">中性潮流與收藏品美學</h3>
          <p className="text-xs text-slate-600 leading-relaxed">
            跳脫傳統粉紅少女風，採用黑白、金屬冷光與高透壓克力材質，打造男女收藏者皆熱愛的精品級卡框。支援 54×86mm 標準規格小卡，兼具保護性與藝術展示價值。
          </p>
        </div>

      </div>

      {/* Prototype Specification Notice (As requested: do not lock down factory specs) */}
      <div className="p-6 sm:p-8 rounded-3xl bg-amber-50/70 border border-amber-200/80 shadow-sm space-y-4">
        <div className="flex items-center gap-2 text-amber-800 text-sm font-bold">
          <Box className="w-4 h-4" />
          <span>產品規格與製造聲明 (PROTOTYPE NOTICE)</span>
        </div>
        
        <p className="text-xs text-slate-700 leading-relaxed">
          目前本網站所呈現之尺寸（54×86mm 小卡卡槽、8mm 壓克力厚度、四角磁鐵吸附五金等），均屬<strong>專題概念與 Prototype 暫定打樣規格</strong>。
        </p>
        <p className="text-xs text-slate-600 leading-relaxed">
          專題小組後續將進一步與台灣在地壓克力精密加工廠接洽，根據雷射切割、UV 直噴印刷、倒角拋光及強磁嵌入之實際工藝，進行實體打樣與製程驗證。
        </p>

        <div className="pt-2 flex flex-wrap gap-2 text-[11px] font-mono text-slate-600">
          <span className="px-3 py-1 rounded-full bg-white border border-stone-200 shadow-sm">✓ 8mm 雙層壓克力概念</span>
          <span className="px-3 py-1 rounded-full bg-white border border-stone-200 shadow-sm">✓ 4角強磁吸附結構</span>
          <span className="px-3 py-1 rounded-full bg-white border border-stone-200 shadow-sm">✓ UV 精密微浮雕印刷</span>
          <span className="px-3 py-1 rounded-full bg-white border border-stone-200 shadow-sm">✓ 台灣加工廠對接中</span>
        </div>
      </div>

      {/* Start Customizing Banner */}
      <div className="text-center pt-4">
        <button
          onClick={onStartCustomizing}
          className="px-8 py-3.5 rounded-2xl font-bold text-sm bg-gradient-to-r from-pink-500 via-rose-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white shadow-xl shadow-pink-500/25 transition-all flex items-center justify-center gap-2 mx-auto active:scale-95"
        >
          <img src="/logo.png" alt="ONLYFRAME" className="w-4 h-4 rounded object-contain shadow-xs" />
          <span>立即體驗展示框客製化</span>
        </button>
      </div>

    </div>
  );
};
