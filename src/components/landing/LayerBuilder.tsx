import React, { useState } from 'react';
import { ArrowRight, ImageSquare, Palette, Sparkle, TextT } from '@phosphor-icons/react';
import { CustomizationTier } from '../../types';
import { TIER_OPTIONS } from '../../data/tiers';
import { BACKGROUND_OPTIONS, FRAME_COLOR_OPTIONS, STICKER_OPTIONS } from '../../data/options';
import { buildExampleState, ProductExample } from '../ProductExample';
import { useTilt } from './useTilt';
import type { LandingStart } from '../HeroSection';

type LayerId = 'color' | 'text' | 'background' | 'stickers';

const LAYERS: { id: LayerId; title: string; body: string; tier: CustomizationTier; icon: React.ElementType }[] = [
  { id: 'color', title: '框色', body: `${FRAME_COLOR_OPTIONS.length} 款框色，從清透到霧黑。`, tier: 'BASIC', icon: Palette },
  { id: 'text', title: '文字', body: '寫上名字、日期或一句話。', tier: 'CUSTOM', icon: TextT },
  { id: 'background', title: '主題背景', body: `${BACKGROUND_OPTIONS.length} 種背景，襯在小卡後方。`, tier: 'PREMIUM', icon: ImageSquare },
  { id: 'stickers', title: '貼飾', body: `${STICKER_OPTIONS.length} 款珍珠與柔彩貼飾，自由擺放。`, tier: 'PREMIUM', icon: Sparkle },
];

const TIER_BADGE: Record<CustomizationTier, string> = { BASIC: 'BASIC 起', CUSTOM: 'CUSTOM 起', PREMIUM: 'PREMIUM' };

const ease = 'ease-[cubic-bezier(0.22,1,0.36,1)]';

export const LayerBuilder: React.FC<{ onStart: (start: LandingStart) => void }> = ({ onStart }) => {
  const [active, setActive] = useState<Record<LayerId, boolean>>({ color: true, text: true, background: false, stickers: false });
  const tiltRef = useTilt<HTMLDivElement>(10);

  // The cheapest plan that covers every active layer.
  const tier: CustomizationTier = active.background || active.stickers ? 'PREMIUM' : active.text ? 'CUSTOM' : 'BASIC';
  const options = {
    tier,
    color: active.color ? 'blossom-pink' : 'clear',
    text: active.text ? 'MY FAVORITE' : '',
    background: active.background ? 'bg-stars-cosmic' : 'bg-transparent',
    stickers: active.stickers,
  };
  const plan = TIER_OPTIONS[tier];

  return (
    <section id="layers" aria-labelledby="layers-title" className="page-width scroll-mt-24 py-16 sm:py-24">
      <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-2 lg:gap-16">
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-stone-500">Build it layer by layer</p>
          <h2 id="layers-title" className="mt-3 text-3xl font-semibold tracking-tight text-ink sm:text-4xl">一層一層，<br />疊出你的框。</h2>
          <p className="mt-4 max-w-[480px] text-base text-stone-600">點選圖層，看看每一層怎麼改變畫面，也知道需要哪一種方案。</p>

          <ul className="mt-8 space-y-3">
            {LAYERS.map((layer) => {
              const on = active[layer.id];
              return (
                <li key={layer.id}>
                  <button
                    type="button"
                    aria-pressed={on}
                    onClick={() => setActive((prev) => ({ ...prev, [layer.id]: !prev[layer.id] }))}
                    className={`group flex w-full items-center gap-4 rounded-2xl border bg-white p-4 text-left transition duration-300 ${ease} active:scale-[0.98] ${
                      on ? 'border-brand shadow-[0_12px_32px_-20px_rgba(200,56,108,0.6)]' : 'border-stone-200 hover:border-stone-400'
                    }`}
                  >
                    <span className={`grid h-12 w-12 shrink-0 place-items-center rounded-xl transition-colors duration-300 ${on ? 'bg-brand text-white' : 'bg-paper text-stone-500'}`}>
                      <layer.icon size={24} weight={on ? 'fill' : 'regular'} />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="flex flex-wrap items-center gap-2">
                        <span className="text-base font-semibold text-ink">{layer.title}</span>
                        <span className="rounded-full bg-paper px-2 py-0.5 text-xs font-medium text-stone-600">{TIER_BADGE[layer.tier]}</span>
                      </span>
                      <span className="mt-1 block text-sm text-stone-600">{layer.body}</span>
                    </span>
                    <span aria-hidden="true" className={`relative h-6 w-10 shrink-0 rounded-full transition-colors duration-300 ${on ? 'bg-brand' : 'bg-stone-300'}`}>
                      <span className={`absolute left-1 top-1 h-4 w-4 rounded-full bg-white transition-transform duration-500 ${ease} ${on ? 'translate-x-4' : ''}`} />
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>

          <div className="mt-6 flex flex-col gap-4 rounded-2xl bg-white p-4 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm text-stone-600" aria-live="polite">
              這個組合適合
              <span className="mx-1 font-semibold text-ink">{plan.name}</span>
              <span className="font-mono text-xs text-stone-500">{tier}</span>
            </p>
            <button type="button" className="btn-primary shrink-0" onClick={() => onStart({ tier, state: buildExampleState(options) })}>
              用這個組合開始 <ArrowRight size={18} weight="bold" />
            </button>
          </div>
        </div>

        <div className="relative grid place-items-center rounded-3xl bg-[#eae7e1] px-8 py-12 sm:py-16">
          <span className="absolute left-6 top-6 text-xs font-medium uppercase tracking-widest text-stone-500">Live preview</span>
          <div ref={tiltRef} className={`w-[min(300px,80%)] transition-transform duration-500 ${ease}`}>
            <ProductExample {...options} />
          </div>
          <p className="absolute bottom-6 right-6 text-xs text-stone-500">概念效果示意</p>
        </div>
      </div>
    </section>
  );
};
