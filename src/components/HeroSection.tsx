import React, { useState } from 'react';
import { ArrowDown, ArrowRight, Check, Cube, Eye, Minus, Palette, Plus, Ruler, Stack, SlidersHorizontal, X } from '@phosphor-icons/react';
import { TIER_OPTIONS, TIER_ORDER } from '../data/tiers';
import { FRAME_COLOR_OPTIONS } from '../data/options';
import { Reveal } from './landing/Reveal';
import { TaglineReveal } from './landing/TaglineReveal';

interface HeroSectionProps {
  onStartCustomizing: () => void;
  onOpenHowItWorks: () => void;
}

const focusRing = 'focus:outline-none focus-visible:ring-2 focus-visible:ring-ink focus-visible:ring-offset-2 focus-visible:ring-offset-paper';
const primaryButton = `group inline-flex items-center justify-center gap-2 rounded-xl bg-ink px-3 py-2 text-base font-semibold text-white transition duration-300 ease-out hover:bg-black active:scale-[0.98] ${focusRing}`;
const secondaryButton = `group inline-flex items-center justify-center gap-2 rounded-xl border border-black/10 bg-white px-3 py-2 text-base font-semibold text-ink transition duration-300 ease-out hover:border-black/20 hover:bg-white/60 active:scale-[0.98] ${focusRing}`;

const Eyebrow: React.FC<{ children: React.ReactNode; tone?: 'light' | 'dark' }> = ({ children, tone = 'light' }) => (
  <p className={`text-xs font-semibold uppercase tracking-widest ${tone === 'dark' ? 'text-white/50' : 'text-brand'}`}>{children}</p>
);

// Swatches shown on the hero mockup: a sample of the editor's real frame colors.
const HERO_SWATCHES = ['clear', 'obsidian', 'blossom-pink', 'neon-cyan', 'champagne-gold']
  .map((id) => FRAME_COLOR_OPTIONS.find((c) => c.id === id)!)
  .filter(Boolean);

const STEPS = [
  { n: '01', title: '選擇客製程度', body: '先了解各方案可以調整的項目，挑一個你想參與的程度。', icon: SlidersHorizontal },
  { n: '02', title: '編排專屬樣式', body: '依方案調整框色、文字、背景與裝飾，畫面即時更新。', icon: Palette },
  { n: '03', title: '預覽並確認', body: '確認設計內容與規格清單，送出前都能返回修改。', icon: Eye },
];

const STYLES = [
  { name: 'K-pop 收藏', note: '偶像小卡與應援周邊', src: '/cards/kpop.jpg' },
  { name: '動漫收藏', note: '角色卡與限定特典', src: '/cards/anime.jpg' },
  { name: '遊戲收藏', note: '角色立繪與活動卡', src: '/cards/game.jpg' },
];

const SPECS = [
  { title: '透明壓克力概念', text: '以層次與透光效果襯托收藏，實際材質與表面處理待確認。', icon: Cube },
  { title: '多層展示結構', text: '設計稿以雙層、約 8mm 結構為示意，不代表量產規格。', icon: Stack },
  { title: '卡片適配參考', text: '原型以 54 × 86mm 卡片為參考，適配範圍待打樣確認。', icon: Ruler },
  { title: '個人化外觀', text: '框色、背景與裝飾都能在編輯器中搭配預覽。', icon: Palette },
];

const GLANCE = [
  { label: '展示方式', regular: '固定外觀', onlyframe: '可調整視覺方案' },
  { label: '個人化內容', regular: '依框款而定', onlyframe: '背景、貼飾、文字' },
  { label: '設計預覽', regular: '視商品而定', onlyframe: '網頁即時模擬' },
];

const FAQS = [
  {
    q: '這個網站可以直接購買展示框嗎？',
    a: '目前不行。ONLYFRAME 是畢業專題的研究原型，網站內容與產品規格僅供研究與展示使用，不進行實際販售。',
  },
  {
    q: '三種方案差在哪裡？',
    a: 'BASIC 可以調整框體外觀；CUSTOM 再加上自訂文字；PREMIUM 還能選擇主題背景，並自由擺放裝飾貼飾。三種方案都能上傳小卡即時預覽。',
  },
  {
    q: '可以放進我自己的小卡嗎？',
    a: '可以。在編輯器的「小卡模擬預覽」上傳圖片，小卡會直接放進展示框裡，跟著你的設計一起預覽。',
  },
  {
    q: '支援哪些小卡尺寸？',
    a: '編輯器提供 55 × 85、54 × 86、63 × 88、60 × 90 mm 四種常見尺寸，也可以輸入自訂尺寸。外框以 85 × 115 mm 作為示意。',
  },
  {
    q: '設計到一半想換方案怎麼辦？',
    a: '隨時都能更換。升級方案會保留目前的設計；改成較低的方案時，系統會先提醒你，確認後才移除該方案不支援的文字、背景或裝飾。',
  },
  {
    q: '完成的設計可以保存嗎？',
    a: '可以在編輯器下載 PNG 預覽圖。若在確認頁送出設計，系統會產生一組設計編號，方便之後查詢。',
  },
  {
    q: '送出設計需要填哪些資料？',
    a: '只需要聯絡人姓名與電子信箱，資料會和你的設計一起保存在專題的研究資料庫。',
  },
];

export const HeroSection: React.FC<HeroSectionProps> = ({ onStartCustomizing, onOpenHowItWorks }) => {
  const [swatchId, setSwatchId] = useState(HERO_SWATCHES[0].id);
  const swatch = HERO_SWATCHES.find((s) => s.id === swatchId) ?? HERO_SWATCHES[0];

  return (
    <div className="overflow-hidden">
      {/* HERO */}
      <section className="mx-auto grid max-w-6xl items-center gap-12 px-4 pb-20 pt-12 sm:px-6 lg:grid-cols-[1.1fr_1fr] lg:gap-16 lg:pb-24 lg:pt-20">
        <div>
          <span className="inline-flex items-center gap-2 rounded-full border border-black/10 bg-white px-3 py-1 text-xs font-semibold text-black/60">
            <span className="h-2 w-2 rounded-full bg-brand" aria-hidden="true" />
            收藏小卡客製化展示框
          </span>
          <h1 className="mt-6 max-w-[680px] bg-gradient-to-r from-[#000000] to-[#666666] bg-clip-text pb-2 text-5xl font-bold leading-tight tracking-tight text-transparent sm:text-6xl sm:leading-tight">
            讓喜歡的收藏，<br />成為日常風景。
          </h1>
          <p className="mt-6 max-w-[680px] text-lg text-black/60">
            挑一個你想參與的客製程度，放進自己的小卡，<br className="hidden sm:block" />
            在畫面上即時看見專屬展示框的樣子。
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <button onClick={onStartCustomizing} className={primaryButton}>
              開始設計
              <ArrowRight weight="bold" className="h-4 w-4 transition-transform duration-300 ease-out group-hover:translate-x-0.5" />
            </button>
            <button onClick={onOpenHowItWorks} className={secondaryButton}>
              看看設計流程
              <ArrowDown weight="bold" className="h-4 w-4 text-black/50 transition-transform duration-300 ease-out group-hover:translate-y-0.5" />
            </button>
          </div>
          <ul className="mt-8 flex flex-wrap gap-x-6 gap-y-2 text-sm text-black/60">
            {['即時設計預覽', '三種客製程度', '送出前可返回修改'].map((item) => (
              <li key={item} className="inline-flex items-center gap-2">
                <Check weight="bold" className="h-4 w-4 text-brand" />
                {item}
              </li>
            ))}
          </ul>
        </div>

        {/* Hero visual: a working sample of the frame color picker */}
        <div className="relative mx-auto w-full max-w-md">
          <div className="rounded-3xl border border-black/5 bg-white p-4 shadow-[0_32px_80px_-32px_rgba(20,20,20,0.35)]">
            <div className="flex items-center justify-between px-2 pb-4 pt-2">
              <div>
                <p className="text-xs font-semibold uppercase tracking-widest text-black/40">ONLYFRAME Studio</p>
                <p className="mt-1 text-sm font-semibold text-ink">你的收藏，正在成形</p>
              </div>
              <span className="rounded-full bg-brand-soft px-2 py-1 text-xs font-semibold text-brand-deep">概念預覽</span>
            </div>

            <div className="relative grid aspect-[85/115] place-items-center overflow-hidden rounded-lg bg-[#E4E0DA]">
              <div className="absolute inset-0 transition-colors duration-500 ease-out" style={{ backgroundColor: swatch.hex }} aria-hidden="true" />
              <div className="absolute inset-6 rounded bg-[#181818]" aria-hidden="true" />
              {['left-3 top-3', 'right-3 top-3', 'bottom-3 left-3', 'bottom-3 right-3'].map((pos) => (
                <span key={pos} className={`screw-head absolute h-2 w-2 rounded-full ${pos}`} aria-hidden="true" />
              ))}
              <img
                src="/cards/kpop.jpg"
                alt="放進 ONLYFRAME 展示框的 K-pop 小卡示例"
                className="relative aspect-[55/85] w-[64%] rounded object-cover shadow-[0_16px_40px_-12px_rgba(0,0,0,0.6)]"
              />
              <div className="glass-reflection pointer-events-none absolute inset-0" aria-hidden="true" />
            </div>

            <div className="mt-4 flex flex-wrap items-center justify-between gap-3 rounded-lg bg-paper px-3 py-3">
              <div className="flex items-center gap-2" role="radiogroup" aria-label="框體顏色示例">
                {HERO_SWATCHES.map((c) => (
                  <button
                    key={c.id}
                    role="radio"
                    aria-checked={c.id === swatchId}
                    aria-label={c.name}
                    title={c.name}
                    onClick={() => setSwatchId(c.id)}
                    className={`h-6 w-6 rounded-full border transition-transform duration-300 ease-out hover:scale-110 active:scale-95 ${focusRing} ${
                      c.id === swatchId ? 'border-ink ring-2 ring-ink ring-offset-2 ring-offset-paper' : 'border-black/15'
                    }`}
                    style={{ backgroundColor: c.id === 'clear' ? '#E9E6E1' : c.hex }}
                  />
                ))}
              </div>
              <span className="text-xs font-medium text-black/50">{swatch.name.split(' (')[0]}</span>
            </div>
          </div>
          <p className="mt-3 text-center text-xs text-black/40">畫面示意，實際規格待打樣確認</p>
        </div>
      </section>

      {/* PROBLEM TO SOLUTION */}
      <Reveal as="section" className="mx-auto max-w-6xl px-4 py-20 sm:px-6">
        <div className="max-w-[680px]">
          <Eyebrow>A little more personal</Eyebrow>
          <h2 className="mt-3 text-3xl font-bold tracking-tight text-ink sm:text-4xl">從收好一張卡，<br />到展示你的故事</h2>
          <p className="mt-4 text-base text-black/60">不只是放進框裡。挑選色彩、背景和裝飾，讓收藏更像你。</p>
        </div>
        <div className="mt-12 grid gap-4 md:grid-cols-2">
          <article className="rounded-3xl border border-black/5 bg-white p-8">
            <p className="text-xs font-semibold uppercase tracking-widest text-black/40">一般展示方式</p>
            <div className="mt-6 flex items-center gap-6">
              <div className="h-32 w-24 shrink-0 rounded-lg border border-black/10 bg-paper p-2">
                <img src="/cards/kpop.jpg" alt="一般小卡展示示意" className="h-full w-full rounded object-cover opacity-80 grayscale-[30%]" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-ink">收藏本身很珍貴</h3>
                <p className="mt-2 text-sm text-black/55">但展示方式，通常由現成框款決定。</p>
              </div>
            </div>
          </article>
          <article className="rounded-3xl border border-ink bg-ink p-8 text-white">
            <p className="text-xs font-semibold uppercase tracking-widest text-white/50">ONLYFRAME 設計概念</p>
            <div className="mt-6 flex items-center gap-6">
              <div className="relative h-32 w-24 shrink-0 rounded-lg bg-brand p-2">
                <img src="/cards/kpop.jpg" alt="ONLYFRAME 風格化展示示意" className="h-full w-full rounded object-cover" />
                <span className="absolute -right-2 -top-2 grid h-6 w-6 place-items-center rounded-full bg-white text-xs text-brand" aria-hidden="true">✦</span>
              </div>
              <div>
                <h3 className="text-lg font-semibold">把喜好放進設計裡</h3>
                <p className="mt-2 text-sm text-white/60">在編輯器中搭配框色、背景、貼飾與文字。</p>
              </div>
            </div>
          </article>
        </div>
        <p className="mt-4 text-xs text-black/40">示意比較用於說明客製概念，並非實體成品或第三方商品測試。</p>
      </Reveal>

      {/* TAGLINE REVEAL */}
      <section className="mx-auto max-w-6xl px-4 py-24 sm:px-6" aria-label="ONLYFRAME 理念">
        <TaglineReveal lines={['收藏的意義，', '不只是擁有，', '而是每天都看得見。']} />
      </section>

      {/* HOW IT WORKS */}
      <Reveal as="section" id="how-it-works" className="mx-auto max-w-6xl px-4 py-20 sm:px-6">
        <div className="flex flex-col justify-between gap-6 sm:flex-row sm:items-end">
          <div className="max-w-[680px]">
            <Eyebrow>Design in three steps</Eyebrow>
            <h2 className="mt-3 text-3xl font-bold tracking-tight text-ink sm:text-4xl">簡單三步，<br className="sm:hidden" />先看到你的設計</h2>
          </div>
          <button onClick={onStartCustomizing} className={`group inline-flex items-center gap-2 self-start rounded-lg text-base font-semibold text-ink sm:self-auto ${focusRing}`}>
            開始第一步
            <ArrowRight weight="bold" className="h-4 w-4 transition-transform duration-300 ease-out group-hover:translate-x-0.5" />
          </button>
        </div>
        <ol className="mt-12 grid gap-4 md:grid-cols-3">
          {STEPS.map(({ n, title, body, icon: Icon }) => (
            <li key={n} className="group rounded-3xl border border-black/5 bg-white p-8 transition-transform duration-500 ease-out hover:-translate-y-1">
              <div className="flex items-center justify-between">
                <span className="font-mono text-sm font-semibold text-black/30">{n}</span>
                <span className="grid h-10 w-10 place-items-center rounded-xl bg-paper text-ink transition-colors duration-300 ease-out group-hover:bg-brand-soft group-hover:text-brand">
                  <Icon weight="duotone" className="h-5 w-5" />
                </span>
              </div>
              <h3 className="mt-8 text-xl font-semibold text-ink">{title}</h3>
              <p className="mt-2 text-sm text-black/55">{body}</p>
            </li>
          ))}
        </ol>
      </Reveal>

      {/* PLANS */}
      <Reveal as="section" className="mx-auto max-w-6xl px-4 py-20 sm:px-6">
        <div className="max-w-[680px]">
          <Eyebrow>Choose your detail</Eyebrow>
          <h2 className="mt-3 text-3xl font-bold tracking-tight text-ink sm:text-4xl">從簡單搭配，<br />到自由創作</h2>
          <p className="mt-4 text-base text-black/60">先選你想參與設計的程度，進入編輯器後還能隨時更換。</p>
        </div>
        <div className="mt-12 grid gap-4 md:grid-cols-3">
          {TIER_ORDER.map((tier) => {
            const plan = TIER_OPTIONS[tier];
            const featured = tier === 'CUSTOM';
            const features = [
              { label: '小卡預覽', on: true },
              { label: '框體外觀', on: true },
              { label: '自訂文字', on: plan.text },
              { label: '主題背景', on: plan.background },
              { label: '自由裝飾', on: plan.stickers },
            ];
            return (
              <article
                key={tier}
                className={`flex flex-col rounded-3xl border p-8 ${featured ? 'border-ink bg-white shadow-[0_24px_60px_-28px_rgba(20,20,20,0.35)]' : 'border-black/5 bg-white'}`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-mono text-sm font-semibold text-black/40">{tier}</span>
                  <span className={`rounded-full px-2 py-1 text-xs font-semibold ${featured ? 'bg-ink text-white' : 'bg-paper text-black/60'}`}>{plan.level}</span>
                </div>
                <h3 className="mt-6 text-2xl font-semibold text-ink">{plan.name}</h3>
                <p className="mt-2 text-sm text-black/55">{plan.description}</p>
                <ul className="mt-8 space-y-3 border-t border-black/5 pt-6 text-sm">
                  {features.map((f) => (
                    <li key={f.label} className={`flex items-center gap-3 ${f.on ? 'text-ink' : 'text-black/30'}`}>
                      {f.on
                        ? <Check weight="bold" className="h-4 w-4 text-brand" />
                        : <X weight="bold" className="h-4 w-4" />}
                      {f.label}
                    </li>
                  ))}
                </ul>
              </article>
            );
          })}
        </div>
        <div className="mt-8 flex flex-col items-start gap-3 sm:flex-row sm:items-center">
          <button onClick={onStartCustomizing} className={primaryButton}>
            開始設計
            <ArrowRight weight="bold" className="h-4 w-4 transition-transform duration-300 ease-out group-hover:translate-x-0.5" />
          </button>
          <p className="text-sm text-black/50">三種方案都能上傳自己的小卡，即時預覽。</p>
        </div>
      </Reveal>

      {/* STYLES */}
      <section className="bg-[#181818] text-white">
        <Reveal className="mx-auto max-w-6xl px-4 py-24 sm:px-6">
          <div className="max-w-[680px]">
            <Eyebrow tone="dark">Made for your collection</Eyebrow>
            <h2 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">不同收藏，<br />都能找到靈感</h2>
            <p className="mt-4 text-base text-white/60">以下使用專題示例圖，展示編輯器支援的收藏風格。</p>
          </div>
          <div className="mt-12 grid gap-4 sm:grid-cols-3">
            {STYLES.map((item) => (
              <article key={item.name} className="group overflow-hidden rounded-3xl border border-white/10 bg-[#1F1F1F] p-2">
                <div className="overflow-hidden rounded-2xl">
                  <img src={item.src} alt={`${item.name}示例圖`} className="aspect-[4/5] w-full object-cover transition-transform duration-500 ease-out group-hover:scale-[1.03]" />
                </div>
                <div className="px-3 py-4">
                  <h3 className="text-base font-semibold">{item.name}</h3>
                  <p className="mt-1 text-sm text-white/50">{item.note}</p>
                </div>
              </article>
            ))}
          </div>
        </Reveal>
      </section>

      {/* MATERIAL & DETAILS */}
      <Reveal as="section" className="mx-auto grid max-w-6xl gap-12 px-4 py-24 sm:px-6 lg:grid-cols-2">
        <div>
          <Eyebrow>Material & details</Eyebrow>
          <h2 className="mt-3 text-3xl font-bold tracking-tight text-ink sm:text-4xl">先理解設計，<br />再確認產品規格</h2>
          <p className="mt-4 text-base text-black/60">ONLYFRAME 以透明壓克力展示結構為核心，搭配不同外觀與卡面設計。這是互動原型，畫面中的材質效果與尺寸皆為打樣概念，尚待實際製程驗證。</p>
          <div className="mt-8 grid gap-3 sm:grid-cols-2">
            {SPECS.map(({ title, text, icon: Icon }) => (
              <div key={title} className="rounded-2xl border border-black/5 bg-white p-6">
                <Icon weight="duotone" className="h-6 w-6 text-brand" />
                <h3 className="mt-4 text-base font-semibold text-ink">{title}</h3>
                <p className="mt-2 text-sm text-black/55">{text}</p>
              </div>
            ))}
          </div>
        </div>
        <div className="self-start rounded-3xl border border-black/5 bg-white p-8">
          <p className="text-xs font-semibold uppercase tracking-widest text-black/40">At a glance</p>
          <h3 className="mt-2 text-xl font-semibold text-ink">一般小卡框與 ONLYFRAME 概念</h3>
          <table className="mt-6 w-full text-left text-sm">
            <thead>
              <tr className="text-xs text-black/40">
                <th scope="col" className="pb-3 font-medium">項目</th>
                <th scope="col" className="pb-3 font-medium">一般小卡框</th>
                <th scope="col" className="pb-3 font-medium text-brand">ONLYFRAME</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-black/5">
              {GLANCE.map((row) => (
                <tr key={row.label}>
                  <th scope="row" className="py-4 pr-3 font-semibold text-ink">{row.label}</th>
                  <td className="py-4 pr-3 text-black/50">{row.regular}</td>
                  <td className="py-4 font-medium text-ink">{row.onlyframe}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <p className="mt-6 rounded-xl bg-paper p-3 text-xs text-black/50">比較描述的是本網站原型的設計方向，不構成對市售產品的品質評比。</p>
        </div>
      </Reveal>

      {/* FAQ */}
      <Reveal as="section" className="mx-auto grid max-w-6xl gap-12 px-4 py-20 sm:px-6 lg:grid-cols-[1fr_1.6fr]">
        <div>
          <Eyebrow>FAQ</Eyebrow>
          <h2 className="mt-3 text-3xl font-bold tracking-tight text-ink sm:text-4xl">常見問題</h2>
          <p className="mt-4 text-base text-black/60">還有其他疑問，也可以先打開「設計流程」看看完整步驟。</p>
          <button onClick={onOpenHowItWorks} className={`${secondaryButton} mt-6`}>看看設計流程</button>
        </div>
        <div className="divide-y divide-black/10 border-y border-black/10">
          {FAQS.map((item) => (
            <details key={item.q} className="group">
              <summary className={`flex cursor-pointer list-none items-center justify-between gap-6 rounded-lg py-6 text-base font-semibold text-ink [&::-webkit-details-marker]:hidden ${focusRing}`}>
                {item.q}
                <span className="relative grid h-8 w-8 shrink-0 place-items-center rounded-full border border-black/10 transition-colors duration-300 ease-out group-open:bg-ink group-open:text-white">
                  <Plus weight="bold" className="h-4 w-4 transition-transform duration-500 ease-out group-open:rotate-90 group-open:opacity-0" />
                  <Minus weight="bold" className="absolute h-4 w-4 opacity-0 transition-opacity duration-300 ease-out group-open:opacity-100" />
                </span>
              </summary>
              <p className="pb-6 pr-12 text-sm text-black/60">{item.a}</p>
            </details>
          ))}
        </div>
      </Reveal>

      {/* FINAL CTA */}
      <section className="px-4 pb-24 pt-12 sm:px-6">
        <Reveal className="mx-auto max-w-6xl rounded-3xl bg-ink px-6 py-20 text-center text-white sm:px-12">
          <Eyebrow tone="dark">Your collection, your way</Eyebrow>
          <h2 className="mx-auto mt-3 max-w-[680px] bg-gradient-to-r from-[#FFFFFF] to-[#9B9B9B] bg-clip-text pb-1 text-3xl font-bold tracking-tight text-transparent sm:text-5xl sm:leading-tight">
            來設計你的<br className="sm:hidden" />展示方式
          </h2>
          <p className="mx-auto mt-4 max-w-[680px] text-base text-white/60">選擇客製程度、調整畫面，看看不同元素組合起來的樣子。</p>
          <button
            onClick={onStartCustomizing}
            className="group mt-8 inline-flex items-center justify-center gap-2 rounded-xl bg-white px-3 py-2 text-base font-semibold text-ink transition duration-300 ease-out hover:bg-white/90 active:scale-[0.98] focus:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-ink"
          >
            開始設計
            <ArrowRight weight="bold" className="h-4 w-4 transition-transform duration-300 ease-out group-hover:translate-x-0.5" />
          </button>
          <p className="mt-6 text-xs text-white/40">研究用原型 · 網站內容與產品規格僅供畢業專題研究與展示使用</p>
        </Reveal>
      </section>
    </div>
  );
};
