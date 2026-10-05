import React from 'react';
import { TIER_OPTIONS, TIER_ORDER } from '../data/tiers';
import { ArrowDown, ArrowRight, Check, Layers, ShieldCheck, Sparkles } from 'lucide-react';

interface HeroSectionProps {
  onStartCustomizing: () => void;
  onOpenHowItWorks: () => void;
}

const primaryButton = 'inline-flex items-center justify-center gap-2 rounded-xl bg-slate-950 px-6 py-3.5 text-sm font-bold text-white shadow-lg shadow-slate-900/10 transition hover:bg-pink-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-pink-500 focus-visible:ring-offset-2';

export const HeroSection: React.FC<HeroSectionProps> = ({ onStartCustomizing, onOpenHowItWorks }) => (
  <div className="overflow-hidden">
    <section className="relative border-b border-stone-200/80 bg-gradient-to-br from-[#fbf8f4] via-white to-[#f7eef1]">
      <div className="pointer-events-none absolute -right-32 -top-20 h-[34rem] w-[34rem] rounded-full bg-pink-200/30 blur-3xl" />
      <div className="relative mx-auto grid max-w-7xl items-center gap-12 px-4 py-14 sm:px-6 sm:py-20 lg:grid-cols-2 lg:px-8 lg:py-24">
        <div className="space-y-7">
          <span className="inline-flex items-center gap-2 rounded-full border border-pink-200 bg-white/80 px-3.5 py-1.5 text-xs font-semibold text-pink-700 shadow-sm">
            <Sparkles className="h-3.5 w-3.5" /> 為收藏，做一個剛剛好的展示框
          </span>
          <div className="space-y-4">
            <h1 className="max-w-2xl text-4xl font-black leading-[1.12] tracking-tight text-slate-950 sm:text-5xl lg:text-6xl">
              讓喜歡的收藏，<span className="text-pink-600">成為日常風景。</span>
            </h1>
            <p className="max-w-xl text-base leading-8 text-slate-600 sm:text-lg">
              從選擇展示框到親手編排卡面，先在畫面上預覽專屬設計，再了解不同方案可以調整的內容。
            </p>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row">
            <button onClick={onStartCustomizing} className={primaryButton}>開始設計 <ArrowRight className="h-4 w-4" /></button>
            <button onClick={onOpenHowItWorks} className="inline-flex items-center justify-center gap-2 rounded-xl border border-stone-300 bg-white/80 px-5 py-3.5 text-sm font-semibold text-slate-700 transition hover:border-slate-400 hover:bg-white">
              了解設計流程 <ArrowDown className="h-4 w-4" />
            </button>
          </div>
          <p className="text-xs leading-5 text-slate-500">依照你想參與設計的程度選擇方案。三種方案都能上傳自己的小卡進行即時預覽。</p>
          <div className="flex flex-wrap gap-x-5 gap-y-2 text-xs font-medium text-slate-600">
            <span className="inline-flex items-center gap-1.5"><Check className="h-3.5 w-3.5 text-emerald-600" />即時設計預覽</span>
            <span className="inline-flex items-center gap-1.5"><Check className="h-3.5 w-3.5 text-emerald-600" />三種客製程度</span>
            <span className="inline-flex items-center gap-1.5"><Check className="h-3.5 w-3.5 text-emerald-600" />確認前可返回修改</span>
          </div>
        </div>
        <div className="relative mx-auto w-full max-w-md">
          <div className="absolute inset-6 rounded-[2rem] bg-gradient-to-br from-pink-200/70 to-violet-200/70 blur-2xl" />
          <div className="relative rounded-[2rem] border border-white bg-white/70 p-4 shadow-2xl shadow-slate-900/10 backdrop-blur">
            <div className="flex items-center justify-between px-2 pb-4">
              <div><p className="text-[10px] font-bold uppercase tracking-[.22em] text-pink-600">ONLYFRAME STUDIO</p><p className="mt-1 text-sm font-semibold text-slate-800">你的收藏，正在成形</p></div>
              <span className="rounded-full bg-amber-50 px-2.5 py-1 text-[10px] font-bold text-amber-800">概念預覽</span>
            </div>
            <div className="relative mx-auto aspect-[.72] w-[78%] overflow-hidden rounded-2xl border-[10px] border-white/70 bg-slate-950 p-3 shadow-[0_24px_60px_-26px_rgba(15,23,42,.65)] ring-1 ring-slate-300/70">
              <div className="absolute inset-0 bg-gradient-to-br from-indigo-900/50 via-purple-900/20 to-black" />
              <img src="/cards/kpop.jpg" alt="收藏小卡設計預覽示例" className="relative z-10 h-full w-full rounded-xl object-cover shadow-xl" />
              <span className="absolute left-5 top-5 z-20 text-xl text-pink-200 drop-shadow">✦</span>
              <span className="absolute right-5 top-12 z-20 text-xl text-amber-200 drop-shadow">✧</span>
              <span className="absolute bottom-5 left-1/2 z-20 -translate-x-1/2 rounded-full border border-white/20 bg-slate-950/70 px-3 py-1.5 text-[10px] font-semibold tracking-[.15em] text-white">ONLYFRAME · YOUR STYLE</span>
            </div>
            <div className="mt-4 flex items-center justify-between rounded-xl bg-[#f8f6f3] px-4 py-3">
              <span className="text-xs font-medium text-slate-600">畫面示意，實際規格待打樣確認</span>
              <span className="text-xs font-bold text-slate-900">三種客製程度</span>
            </div>
          </div>
        </div>
      </div>
    </section>

    <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 lg:py-20">
      <div className="mx-auto max-w-2xl text-center">
        <p className="text-xs font-bold uppercase tracking-[.2em] text-pink-600">A LITTLE MORE PERSONAL</p>
        <h2 className="mt-3 text-3xl font-black tracking-tight text-slate-950">從收好一張卡，到展示你的故事</h2>
        <p className="mt-3 text-sm leading-6 text-slate-600">不只放進框裡，也能挑選色彩、背景和裝飾，讓收藏更像你。</p>
      </div>
      <div className="mt-9 grid gap-4 md:grid-cols-2">
        <article className="rounded-3xl border border-stone-200 bg-white p-6 sm:p-8">
          <span className="text-[10px] font-bold uppercase tracking-[.18em] text-slate-400">一般展示方式</span>
          <div className="mt-5 flex items-center gap-5">
            <div className="grid h-28 w-24 place-items-center rounded-xl border border-slate-200 bg-slate-50 p-2 shadow-sm"><img src="/cards/kpop.jpg" alt="一般小卡展示示意" className="h-full w-full rounded-lg object-cover" /></div>
            <div><h3 className="font-bold text-slate-800">收藏本身很珍貴</h3><p className="mt-1 text-sm leading-6 text-slate-500">但展示方式通常由現成框款決定。</p></div>
          </div>
        </article>
        <article className="rounded-3xl border border-pink-200 bg-gradient-to-br from-pink-50 to-white p-6 sm:p-8">
          <span className="text-[10px] font-bold uppercase tracking-[.18em] text-pink-600">ONLYFRAME 設計概念</span>
          <div className="mt-5 flex items-center gap-5">
            <div className="relative grid h-28 w-24 place-items-center rounded-xl border-[5px] border-white bg-slate-900 p-1 shadow-lg ring-1 ring-pink-200"><img src="/cards/kpop.jpg" alt="ONLYFRAME 風格化展示示意" className="h-full w-full rounded-md object-cover" /><span className="absolute -right-1 -top-2 text-amber-300">✦</span></div>
            <div><h3 className="font-bold text-slate-900">把喜好放進設計裡</h3><p className="mt-1 text-sm leading-6 text-slate-600">在編輯器中搭配框色、背景、貼飾與文字。</p></div>
          </div>
        </article>
      </div>
      <p className="mt-3 text-center text-[11px] text-slate-400">示意比較用於說明客製概念，並非實體成品或第三方商品測試。</p>
    </section>

    <section className="bg-[#f6f3ef] py-16 sm:py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
          <div><p className="text-xs font-bold uppercase tracking-[.2em] text-pink-600">DESIGN IN THREE STEPS</p><h2 className="mt-3 text-3xl font-black tracking-tight text-slate-950">簡單三步，先看到你的設計</h2></div>
          <button onClick={onStartCustomizing} className="inline-flex items-center gap-2 self-start text-sm font-bold text-pink-700 hover:text-pink-800 sm:self-auto">開始設計 <ArrowRight className="h-4 w-4" /></button>
        </div>
        <div className="mt-8 grid gap-4 md:grid-cols-3">
          {[
            { n: '01', title: '選擇客製程度', body: '先了解各方案可以調整的項目與客製程度。', icon: Layers },
            { n: '02', title: '編排專屬樣式', body: '依方案調整框色、文字、背景與裝飾，即時預覽。', icon: Sparkles },
            { n: '03', title: '預覽並確認', body: '確認你的設計內容；送出前仍可返回修改。', icon: ShieldCheck },
          ].map(({ n, title, body, icon: Icon }) => <div key={n} className="rounded-2xl border border-stone-200 bg-white p-6"><div className="flex items-center justify-between"><span className="text-xs font-black tracking-widest text-pink-600">STEP {n}</span><Icon className="h-5 w-5 text-slate-400" /></div><h3 className="mt-5 text-lg font-bold text-slate-900">{title}</h3><p className="mt-2 text-sm leading-6 text-slate-600">{body}</p></div>)}
        </div>
      </div>
    </section>

    <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 lg:py-20">
      <div className="mx-auto max-w-2xl text-center"><p className="text-xs font-bold uppercase tracking-[.2em] text-pink-600">CHOOSE YOUR DETAIL</p><h2 className="mt-3 text-3xl font-black tracking-tight text-slate-950">從簡單搭配，到自由創作</h2><p className="mt-3 text-sm leading-6 text-slate-600">先選你想參與設計的程度，進入編輯器後還能隨時調整。</p></div>
      <div className="mt-8 grid gap-4 md:grid-cols-3">
        {TIER_ORDER.map((tier) => ({ tier, ...TIER_OPTIONS[tier] })).map((plan) => <article key={plan.tier} className={`relative rounded-3xl border p-6 ${plan.tier === 'CUSTOM' ? 'border-pink-300 bg-pink-50/60 shadow-lg shadow-pink-100' : 'border-stone-200 bg-white'}`}>
          <span className="absolute right-5 top-5 rounded-full bg-pink-50 px-2.5 py-1 text-[10px] font-bold text-pink-700">{plan.level}</span>
          <p className="text-xs font-bold tracking-widest text-slate-500">{plan.tier}</p><h3 className="mt-2 text-xl font-black text-slate-950">{plan.name}</h3><p className="mt-1 text-sm text-slate-600">{plan.description}</p>
          <div className="mt-6 border-t border-stone-200 pt-4"><p className="text-lg font-black text-slate-950">{plan.headline}</p><p className="mt-1 text-xs text-slate-500">{plan.summary}</p></div>
        </article>)}
      </div>
      <div className="mt-6 text-center"><button onClick={onStartCustomizing} className={primaryButton}>開始設計 <ArrowRight className="h-4 w-4" /></button></div>
    </section>

    <section className="bg-slate-950 py-16 text-white sm:py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center"><p className="text-xs font-bold uppercase tracking-[.2em] text-pink-300">MADE FOR YOUR COLLECTION</p><h2 className="mt-3 text-3xl font-black tracking-tight">不同收藏，都能找到靈感</h2><p className="mt-3 text-sm leading-6 text-slate-300">以下使用專題示例圖，展示編輯器支援的收藏風格。</p></div>
        <div className="mt-8 grid gap-4 sm:grid-cols-3">
          {[{ name: 'K-pop 收藏', src: '/cards/kpop.jpg' }, { name: '動漫收藏', src: '/cards/anime.jpg' }, { name: '遊戲收藏', src: '/cards/game.jpg' }].map((item) => <article key={item.name} className="group overflow-hidden rounded-2xl border border-white/10 bg-white/5"><img src={item.src} alt={`${item.name}示例`} className="h-64 w-full object-cover transition duration-500 group-hover:scale-[1.03]" /><div className="px-4 py-3 text-sm font-semibold">{item.name}</div></article>)}
        </div>
      </div>
    </section>

    <section className="mx-auto grid max-w-7xl gap-10 px-4 py-16 sm:px-6 lg:grid-cols-2 lg:px-8 lg:py-20">
      <div><p className="text-xs font-bold uppercase tracking-[.2em] text-pink-600">MATERIAL & DETAILS</p><h2 className="mt-3 text-3xl font-black tracking-tight text-slate-950">先理解設計，再確認產品規格</h2><p className="mt-4 text-sm leading-7 text-slate-600">ONLYFRAME 的概念以透明壓克力展示結構為核心，搭配不同外觀與卡面設計。這是互動 Prototype，畫面中的材質效果與尺寸皆為打樣概念，尚待實際製程驗證。</p>
        <div className="mt-6 grid gap-3 sm:grid-cols-2">{[{ title: '透明壓克力概念', text: '以層次與透光效果襯托收藏，實際材質與表面處理待確認。' }, { title: '多層展示結構', text: '目前設計稿以雙層、約 8mm 結構為示意，不代表量產規格。' }, { title: '卡片適配參考', text: '原型以 54 × 86mm 卡片為參考，適配範圍待打樣確認。' }, { title: '個人化外觀', text: '框色、背景與裝飾可在編輯器中搭配預覽。' }].map((spec) => <div key={spec.title} className="rounded-2xl border border-stone-200 bg-white p-4"><h3 className="text-sm font-bold text-slate-900">{spec.title}</h3><p className="mt-1.5 text-xs leading-5 text-slate-600">{spec.text}</p></div>)}</div>
      </div>
      <div className="rounded-3xl border border-stone-200 bg-[#f8f6f3] p-6 sm:p-8"><p className="text-xs font-bold uppercase tracking-[.18em] text-slate-500">AT A GLANCE</p><h3 className="mt-2 text-xl font-black text-slate-950">一般小卡框與 ONLYFRAME 概念</h3>
        <div className="mt-5 divide-y divide-stone-200 text-sm"><div className="grid grid-cols-[1fr_1fr] gap-3 py-3"><span className="font-semibold text-slate-700">展示方式</span><span className="text-slate-600">固定外觀 ／ 可調整視覺方案</span></div><div className="grid grid-cols-[1fr_1fr] gap-3 py-3"><span className="font-semibold text-slate-700">個人化內容</span><span className="text-slate-600">依框款而定 ／ 背景、貼飾、文字</span></div><div className="grid grid-cols-[1fr_1fr] gap-3 py-3"><span className="font-semibold text-slate-700">設計預覽</span><span className="text-slate-600">視商品而定 ／ 網頁即時模擬</span></div></div>
        <p className="mt-4 rounded-xl bg-white p-3 text-[11px] leading-5 text-slate-500">比較描述的是本網站 Prototype 的設計方向，不構成對市售產品的品質評比。</p>
      </div>
    </section>

    <section className="border-t border-stone-200 bg-pink-50/60 px-4 py-14 text-center sm:py-16">
      <p className="text-xs font-bold uppercase tracking-[.2em] text-pink-600">YOUR COLLECTION, YOUR WAY</p><h2 className="mt-3 text-3xl font-black tracking-tight text-slate-950">來試著設計你的展示方式</h2><p className="mx-auto mt-3 max-w-xl text-sm leading-6 text-slate-600">選擇客製程度、調整畫面，再看看不同元素組合起來的樣子。</p><button onClick={onStartCustomizing} className={`${primaryButton} mt-6`}>開始設計 <ArrowRight className="h-4 w-4" /></button>
      <p className="mt-4 text-[11px] text-slate-500">研究用 Prototype · 網站內容與產品規格僅供畢業專題研究與展示使用</p>
    </section>
  </div>
);
