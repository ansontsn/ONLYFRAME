import React from 'react';
import { Plus } from '@phosphor-icons/react';

const FAQS = [
  { q: '這是可以購買的商品嗎？', a: '目前是企管系畢業專題的研究原型，不販售也不收費。送出的設計只用於打樣分析。' },
  { q: '我的小卡放得進去嗎？', a: '外框為 85 × 115 mm，支援 55 × 85、54 × 86、63 × 88、60 × 90 mm 等常見規格，也能自訂尺寸。超出範圍時，編輯器會先提醒你調整。' },
  { q: '三種方案差在哪裡？', a: 'BASIC 可以選框色，CUSTOM 再加上自訂文字，PREMIUM 還能搭配主題背景與貼飾。三種方案都能上傳自己的小卡預覽。' },
  { q: '可以先把設計存下來嗎？', a: '可以。編輯器和確認頁都能下載 PNG 圖片，方便留存或分享給朋友。' },
  { q: '送出前還能修改嗎？', a: '可以。確認頁隨時能返回編輯器，設計內容會保留。送出後會取得一組專屬設計編號。' },
  { q: '我上傳的圖片會被保存嗎？', a: '編輯時圖片只在你的瀏覽器裡處理。只有按下送出後，設計參數與示意圖才會保存，供專題研究使用。' },
];

export const LandingFaq: React.FC = () => (
  <section aria-labelledby="faq-title" className="page-width py-16 sm:py-24">
    <div className="grid grid-cols-1 gap-8 lg:grid-cols-[1fr_1.5fr] lg:gap-16">
      <div>
        <p className="text-xs font-semibold uppercase tracking-widest text-stone-500">Questions</p>
        <h2 id="faq-title" className="mt-3 text-3xl font-semibold tracking-tight text-ink sm:text-4xl">開始之前，<br />你可能想知道。</h2>
      </div>
      <div className="divide-y divide-stone-200 rounded-3xl border border-stone-200 bg-white px-6">
        {FAQS.map((item) => (
          <details key={item.q} className="group py-2">
            <summary className="flex cursor-pointer list-none items-center justify-between gap-4 rounded-xl py-4 text-base font-semibold text-ink [&::-webkit-details-marker]:hidden">
              {item.q}
              <Plus size={20} weight="bold" aria-hidden="true" className="shrink-0 text-stone-500 transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] group-open:rotate-45" />
            </summary>
            <p className="pb-4 pr-8 text-sm text-stone-600">{item.a}</p>
          </details>
        ))}
      </div>
    </div>
  </section>
);
