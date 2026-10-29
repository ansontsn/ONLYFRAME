import React from 'react';
import { ArrowRight, Cube, GraduationCap, Sparkle, Stack } from '@phosphor-icons/react';
import { Reveal } from './landing/Reveal';

interface AboutSectionProps {
  onStartCustomizing: () => void;
}

const focusRing = 'focus:outline-none focus-visible:ring-2 focus-visible:ring-ink focus-visible:ring-offset-2 focus-visible:ring-offset-paper';

export const AboutSection: React.FC<AboutSectionProps> = ({ onStartCustomizing }) => {
  return (
    <div className="mx-auto max-w-5xl px-4 pb-24 pt-12 sm:px-6 lg:pt-20">

      {/* Header */}
      <div>
        <span className="inline-flex items-center gap-2 rounded-full border border-black/10 bg-white px-3 py-1 text-xs font-semibold text-black/60">
          <GraduationCap weight="duotone" className="h-4 w-4 text-brand" />
          企管系畢業專題 · 概念產品研究
        </span>
        <h1 className="mt-6 max-w-[680px] bg-gradient-to-r from-[#000000] to-[#666666] bg-clip-text pb-1 text-4xl font-bold tracking-tight text-transparent sm:text-5xl sm:leading-tight">
          關於 ONLYFRAME<br />專題概念
        </h1>
        <p className="mt-6 max-w-[680px] text-lg text-black/60">
          探討「客製化程度是否影響收藏型消費者的購買意願？」的實證研究，<br className="hidden sm:block" />與它的互動式原型平台。
        </p>
      </div>

      {/* Core pillars */}
      <Reveal className="mt-16 grid grid-cols-1 gap-4 md:grid-cols-2">
        <article className="rounded-3xl border border-black/5 bg-white p-8">
          <span className="grid h-10 w-10 place-items-center rounded-xl bg-paper text-ink">
            <Stack weight="duotone" className="h-5 w-5" />
          </span>
          <h2 className="mt-6 text-xl font-semibold text-ink">專題研究核心假說</h2>
          <p className="mt-3 text-sm text-black/60">
            K-pop 粉絲與二次元動漫收藏者，對專屬周邊的展示有高度情感連結與審美要求。本專題想驗證：<strong className="font-semibold text-ink">提供階梯式自訂選項（簡易客製、文字客製、自由客製），是否能顯著提升消費者的價值感知與購買意願？</strong>
          </p>
        </article>

        <article className="rounded-3xl border border-black/5 bg-white p-8">
          <span className="grid h-10 w-10 place-items-center rounded-xl bg-brand-soft text-brand">
            <Sparkle weight="duotone" className="h-5 w-5" />
          </span>
          <h2 className="mt-6 text-xl font-semibold text-ink">中性潮流與收藏品美學</h2>
          <p className="mt-3 text-sm text-black/60">
            跳脫傳統粉紅少女風，採用黑白、金屬冷光與高透壓克力材質，打造男女收藏者都喜歡的精品級卡框。支援 54×86mm 標準規格小卡，兼具保護性與展示價值。
          </p>
        </article>
      </Reveal>

      {/* Prototype specification notice (do not lock down factory specs) */}
      <Reveal className="mt-4 rounded-3xl border border-amber-200 bg-amber-50 p-8">
        <div className="flex items-center gap-2 text-sm font-semibold text-amber-900">
          <Cube weight="duotone" className="h-5 w-5" />
          產品規格與製造聲明
        </div>
        <p className="mt-4 text-sm text-black/70">
          本網站呈現的尺寸（54×86mm 小卡卡槽、8mm 壓克力厚度、四角磁鐵吸附五金等），均屬<strong className="font-semibold text-ink">專題概念與原型暫定打樣規格</strong>。
        </p>
        <p className="mt-3 text-sm text-black/60">
          專題小組後續將與台灣在地壓克力精密加工廠接洽，依雷射切割、UV 直噴印刷、倒角拋光及強磁嵌入的實際工藝，進行實體打樣與製程驗證。
        </p>
        <ul className="mt-6 flex flex-wrap gap-2 text-xs font-medium text-black/60">
          {['8mm 雙層壓克力概念', '四角強磁吸附結構', 'UV 精密微浮雕印刷', '台灣加工廠對接中'].map((tag) => (
            <li key={tag} className="rounded-full border border-amber-200 bg-white px-3 py-1">{tag}</li>
          ))}
        </ul>
      </Reveal>

      {/* Start customizing */}
      <div className="mt-12">
        <button
          onClick={onStartCustomizing}
          className={`group inline-flex items-center gap-2 rounded-xl bg-ink px-3 py-2 text-base font-semibold text-white transition duration-300 ease-out hover:bg-black active:scale-[0.98] ${focusRing}`}
        >
          立即體驗展示框客製化
          <ArrowRight weight="bold" className="h-4 w-4 transition-transform duration-300 ease-out group-hover:translate-x-0.5" />
        </button>
      </div>

    </div>
  );
};
