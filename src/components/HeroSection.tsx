import React, { useState } from 'react';
import { ArrowDown, ArrowRight, CursorClick, Eye, SlidersHorizontal } from '@phosphor-icons/react';
import { BACKGROUND_OPTIONS, FRAME_COLOR_OPTIONS, PRESET_PHOTOCARDS, STICKER_OPTIONS } from '../data/options';
import { CustomizationTier, CustomizerState } from '../types';
import { buildExampleState, ExampleOptions, ProductExample } from './ProductExample';
import { Reveal } from './landing/Reveal';
import { TaglineReveal } from './landing/TaglineReveal';
import { LayerBuilder } from './landing/LayerBuilder';
import { LandingFaq } from './landing/LandingFaq';
import { useTilt } from './landing/useTilt';

// A tier skips the plan step and opens the editor directly; without one the visitor still picks a plan.
export interface LandingStart { tier?: CustomizationTier; state?: CustomizerState }

interface HeroSectionProps { onStart: (start?: LandingStart) => void; onOpenHowItWorks: () => void }

const ease = 'ease-[cubic-bezier(0.22,1,0.36,1)]';
const eyebrow = 'text-xs font-semibold uppercase tracking-widest text-stone-500';
const swatches = FRAME_COLOR_OPTIONS.filter(c => ['clear', 'obsidian', 'blossom-pink', 'neon-cyan', 'champagne-gold'].includes(c.id));
const CARD_LABELS = ['K-POP', 'ANIME', 'GAME'];
const MAX_TEXT = 12;

const INSPIRATIONS: { name: string; category: string; note: string; options: ExampleOptions & { tier: CustomizationTier }; bg: string }[] = [
  { name: '留住心動的瞬間', category: '01 / K-POP', note: '溫柔框色 × 專屬文字', options: { tier: 'CUSTOM', color: 'blossom-pink', card: 0 }, bg: 'bg-[#eee7e2]' },
  { name: '讓角色走進日常', category: '02 / ANIME', note: '清透冷藍 × 自由貼飾', options: { tier: 'PREMIUM', color: 'neon-cyan', card: 1 }, bg: 'bg-[#e6ebea]' },
  { name: '收藏你的高光時刻', category: '03 / GAME', note: '深色外框 × 純粹展示', options: { tier: 'BASIC', color: 'obsidian', card: 2 }, bg: 'bg-[#e3e0da]' },
];

const STEPS = [
  { title: '選擇你的創作方式', body: '三種客製程度，依你想調整的內容開始。', icon: SlidersHorizontal },
  { title: '放入收藏，自由搭配', body: '上傳小卡、切換框色，畫面跟著想法即時改變。', icon: CursorClick },
  { title: '預覽，確認每個細節', body: '下載 PNG 留存靈感，送出前隨時返回修改。', icon: Eye },
];

const InspirationCard: React.FC<{ item: typeof INSPIRATIONS[number]; onStart: HeroSectionProps['onStart'] }> = ({ item, onStart }) => {
  const tiltRef = useTilt<HTMLDivElement>(8);
  return (
    <article className="group">
      <div className={`relative grid h-80 place-items-center overflow-hidden rounded-3xl border border-stone-200 ${item.bg} sm:h-96`}>
        <span className="absolute left-4 top-4 rounded-md border border-stone-400/60 px-2 py-1 text-xs text-stone-600">設計範例</span>
        <div ref={tiltRef} className={`w-[52%] transition-transform duration-500 ${ease}`}>
          <div className={`transition-transform duration-500 ${ease} group-hover:-translate-y-2`}><ProductExample {...item.options} /></div>
        </div>
        <span className="absolute bottom-4 right-4 text-xs text-stone-500">概念效果示意</span>
      </div>
      <div className="mt-6 flex items-end justify-between gap-4">
        <div>
          <p className={eyebrow}>{item.category}</p>
          <h3 className="mt-2 text-lg font-semibold text-ink">{item.name}</h3>
          <p className="mt-1 text-sm text-stone-600">{item.note} · {item.options.tier}</p>
        </div>
        <button
          type="button"
          onClick={() => onStart({ tier: item.options.tier, state: buildExampleState(item.options) })}
          className={`inline-flex shrink-0 items-center gap-2 rounded-xl border border-stone-300 bg-white px-3 py-2 text-sm font-semibold text-ink transition duration-300 ${ease} hover:border-brand hover:text-brand active:scale-[0.98]`}
        >
          套用設計 <ArrowRight size={16} weight="bold" />
        </button>
      </div>
    </article>
  );
};

export const HeroSection: React.FC<HeroSectionProps> = ({ onStart, onOpenHowItWorks }) => {
  const [color, setColor] = useState('clear');
  const [card, setCard] = useState(0);
  const [text, setText] = useState('MY FAVORITE');
  const tiltRef = useTilt<HTMLDivElement>(10);
  const selected = swatches.find(c => c.id === color)!;
  const heroOptions: ExampleOptions = { color, card, text: text.trim() };
  const startFromHero = () => onStart({ state: buildExampleState(heroOptions) });

  return (
    <div className="overflow-x-clip">
      {/* Hero: the main frame is a small playground whose choices carry into the editor. */}
      <section className="page-width grid grid-cols-1 items-center gap-12 pb-16 pt-8 sm:pt-12 lg:grid-cols-[0.9fr_1.1fr] lg:gap-8 lg:pb-24">
        <div>
          <p className={`${eyebrow} flex items-center`}><span className="brand-dot" />A little frame. A lot of you.</p>
          <h1 className="mt-6 max-w-[680px] bg-gradient-to-r from-black to-[#666666] bg-clip-text pb-1 text-4xl font-bold leading-tight tracking-tight text-transparent sm:text-5xl sm:leading-tight xl:text-6xl xl:leading-tight">
            讓喜歡的收藏，<br />成為日常<span className="text-brand">風景。</span>
          </h1>
          <p className="mt-6 max-w-[680px] text-base text-stone-600 sm:text-lg">
            不只收藏，也讓喜歡被看見。<br />從一個框色、一句話開始，<br className="sm:hidden" />為你的小卡留一個專屬位置。
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <button className="btn-primary" onClick={startFromHero}>開始設計 <ArrowRight size={18} weight="bold" /></button>
            <a className="btn-secondary" href="#inspiration">探索設計靈感 <ArrowDown size={16} weight="bold" /></a>
          </div>
          <dl className="mt-12 grid max-w-[480px] grid-cols-3 gap-4 border-t border-stone-200 pt-6">
            {[[FRAME_COLOR_OPTIONS.length, '款框色'], [BACKGROUND_OPTIONS.length, '種主題背景'], [STICKER_OPTIONS.length, '款貼飾']].map(([n, label]) => (
              <div key={label}>
                <dt className="sr-only">{label}</dt>
                <dd className="font-mono text-2xl font-semibold text-ink">{n}</dd>
                <dd className="mt-1 text-xs text-stone-500">{label}</dd>
              </div>
            ))}
          </dl>
        </div>

        <div>
          <div className="relative mx-auto aspect-[5/4] w-[88%] max-w-[640px] sm:w-full">
            <span className="absolute left-0 top-0 text-xs uppercase tracking-widest text-stone-500">The frame collection · 001</span>
            <div className="absolute left-[8%] top-[6%] aspect-square w-[84%] rounded-full bg-[#ebe4da]" aria-hidden="true" />
            {/* Side frames always show the two cards the visitor did not pick. */}
            <div className="absolute left-0 top-[34%] w-[28%] -rotate-[18deg]"><ProductExample tier="BASIC" color="obsidian" card={card === 2 ? 0 : 2} /></div>
            <div className="absolute right-0 top-[26%] w-[27%] rotate-[13deg]"><ProductExample color="neon-cyan" card={card === 1 ? 0 : 1} /></div>
            <div className="absolute left-[27%] top-[6%] z-10 w-[46%] -rotate-[7deg]">
              <div ref={tiltRef} className={`transition-transform duration-500 ${ease} drop-shadow-[10px_18px_17px_rgba(81,75,64,0.13)]`}>
                <ProductExample {...heroOptions} />
              </div>
            </div>
          </div>

          <div className="relative z-20 mx-auto -mt-4 max-w-[480px] rounded-2xl border border-stone-200 bg-white p-4 shadow-[0_16px_40px_-24px_rgba(20,20,20,0.35)] sm:-mt-8">
            <p className="text-sm font-semibold text-ink">先試試看</p>
            <p className="mt-1 text-xs text-stone-500">你的選擇會直接帶進編輯器。</p>
            <div className="mt-4 space-y-3">
              <div className="flex items-center gap-3">
                <span className="w-12 shrink-0 text-xs text-stone-500">小卡</span>
                <div className="flex flex-1 gap-1 rounded-xl bg-paper p-1" role="group" aria-label="示範小卡">
                  {PRESET_PHOTOCARDS.map((p, i) => (
                    <button
                      key={p.id}
                      type="button"
                      aria-pressed={card === i}
                      onClick={() => setCard(i)}
                      className={`flex-1 rounded-lg px-2 py-1 text-xs font-semibold transition duration-300 ${ease} active:scale-[0.98] ${card === i ? 'bg-white text-ink shadow-sm' : 'text-stone-500 hover:text-ink'}`}
                    >
                      {CARD_LABELS[i]}
                    </button>
                  ))}
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className="w-12 shrink-0 text-xs text-stone-500">框色</span>
                <div className="flex gap-2" role="group" aria-label="框色">
                  {swatches.map(c => (
                    <button
                      key={c.id}
                      type="button"
                      aria-label={c.name.split(' (')[0]}
                      aria-pressed={color === c.id}
                      onClick={() => setColor(c.id)}
                      className={`h-8 w-8 rounded-full border border-black/15 transition duration-300 ${ease} hover:scale-110 active:scale-95 ${color === c.id ? 'ring-2 ring-ink ring-offset-2' : ''}`}
                      style={{ background: c.id === 'clear' ? '#efede8' : c.hex }}
                    />
                  ))}
                </div>
                <span className="ml-auto hidden text-xs text-stone-500 sm:inline" aria-live="polite">{selected.name.split(' (')[0]}</span>
              </div>
              <label className="flex items-center gap-3">
                <span className="w-12 shrink-0 text-xs text-stone-500">一句話</span>
                <input
                  value={text}
                  maxLength={MAX_TEXT}
                  onChange={(e) => setText(e.target.value)}
                  placeholder="寫下你的一句話"
                  className="min-w-0 flex-1 rounded-xl border border-stone-300 bg-white px-3 py-2 text-base text-ink outline-none transition-colors duration-300 placeholder:text-stone-400 focus:border-brand"
                />
                <span className="w-10 shrink-0 text-right font-mono text-xs text-stone-500">{text.length}/{MAX_TEXT}</span>
              </label>
            </div>
            <button type="button" onClick={startFromHero} className="text-link mt-4">帶著這個設計開始 <ArrowRight size={16} weight="bold" /></button>
          </div>
          <p className="mt-3 text-center text-xs text-stone-500">概念效果示意 / 非實體成品照片</p>
        </div>
      </section>

      <div className="border-y border-stone-200">
        <div className="page-width flex flex-wrap items-center justify-center gap-x-4 gap-y-2 py-4 text-xs font-semibold uppercase tracking-widest text-stone-600 sm:justify-between">
          <span className="hidden sm:inline">Your collection. Your expression.</span>
          <a href="#layers" className="rounded-md transition-colors duration-300 hover:text-brand">框色 ＋ 文字 ＋ 背景 ＋ 貼飾</a>
          <span className="hidden sm:inline">Made by you ↗</span>
        </div>
      </div>

      <Reveal><LayerBuilder onStart={onStart} /></Reveal>

      <section className="page-width py-16 sm:py-24" aria-label="品牌標語">
        <TaglineReveal lines={['你的喜歡，', '值得一個剛好的位置。']} />
      </section>

      <Reveal as="section" id="inspiration" className="page-width scroll-mt-24 py-16 sm:py-24">
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className={eyebrow}>A frame for every favorite</p>
            <h2 className="mt-3 text-3xl font-semibold tracking-tight text-ink sm:text-4xl">你的喜歡，有自己的樣子。</h2>
          </div>
          <p className="text-sm text-stone-600">挑一個喜歡的範例套用，<br className="hidden sm:inline" />再把它改成你的版本。</p>
        </div>
        <div className="grid gap-12 md:grid-cols-3 md:gap-6">
          {INSPIRATIONS.map(item => <InspirationCard key={item.category} item={item} onStart={onStart} />)}
        </div>
      </Reveal>

      <Reveal as="section" className="page-width py-16 sm:py-24">
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className={eyebrow}>From favorite to frame</p>
            <h2 className="mt-3 text-3xl font-semibold tracking-tight text-ink sm:text-4xl">一點靈感，就能開始。</h2>
          </div>
          <button className="text-link" onClick={onOpenHowItWorks}>查看操作說明 <ArrowRight size={16} weight="bold" /></button>
        </div>
        <ol className="grid gap-4 md:grid-cols-3">
          {STEPS.map((step, i) => (
            <li key={step.title} className={`group rounded-3xl border border-stone-200 bg-white p-6 transition duration-500 ${ease} hover:-translate-y-1 hover:border-stone-400`}>
              <div className="flex items-center justify-between">
                <span className="grid h-12 w-12 place-items-center rounded-xl bg-paper text-ink transition-colors duration-300 group-hover:bg-brand group-hover:text-white">
                  <step.icon size={24} />
                </span>
                <span className="font-mono text-sm text-stone-400">0{i + 1}</span>
              </div>
              <h3 className="mt-6 text-lg font-semibold text-ink">{step.title}</h3>
              <p className="mt-2 text-sm text-stone-600">{step.body}</p>
            </li>
          ))}
        </ol>
      </Reveal>

      <Reveal><LandingFaq /></Reveal>

      <Reveal as="section" className="page-width pb-16 sm:pb-24">
        <div className="rounded-3xl border border-stone-200 bg-[#eae5dd] px-6 py-16 text-center">
          <p className={eyebrow}>Let your favorites take the spotlight</p>
          <h2 className="mt-3 text-3xl font-semibold tracking-tight text-ink sm:text-4xl">下一個風景，由你設計。</h2>
          <p className="mx-auto mt-4 max-w-[480px] text-sm text-stone-600">研究原型，不收費。送出前都能隨時修改。</p>
          <button className="btn-primary mt-8" onClick={() => onStart()}>開始設計 <ArrowRight size={18} weight="bold" /></button>
        </div>
      </Reveal>
    </div>
  );
};
