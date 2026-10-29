import React, { useEffect } from 'react';
import { ArrowRight, CheckCircle, Eye, Palette, SlidersHorizontal, X } from '@phosphor-icons/react';

interface HowItWorksModalProps {
  isOpen: boolean;
  onClose: () => void;
  onStartCustomizing: () => void;
}

const focusRing = 'focus:outline-none focus-visible:ring-2 focus-visible:ring-ink focus-visible:ring-offset-2 focus-visible:ring-offset-white';

export const HowItWorksModal: React.FC<HowItWorksModalProps> = ({
  isOpen,
  onClose,
  onStartCustomizing
}) => {
  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const steps = [
    {
      step: '01',
      title: '選擇客製化程度',
      desc: '依需求選擇 BASIC（簡易客製）、CUSTOM（文字客製）或 PREMIUM（自由客製），不用一次面對所有功能。',
      icon: SlidersHorizontal
    },
    {
      step: '02',
      title: '進入互動式編輯器',
      desc: '系統依方案開放對應工具。三種方案都能上傳小卡與選框色；CUSTOM 以上可加入文字；PREMIUM 可選主題背景與自由裝飾。',
      icon: Palette
    },
    {
      step: '03',
      title: '即時預覽',
      desc: '每次調整顏色、背景、文字或貼飾，中央的壓克力展示框都會立刻更新。',
      icon: Eye
    },
    {
      step: '04',
      title: '完成專屬展示框',
      desc: '確認最終設計內容與規格清單，保存你的專屬展示框設計。',
      icon: CheckCircle
    }
  ];

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm"
      onClick={onClose}
      role="presentation"
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="how-it-works-title"
        onClick={(e) => e.stopPropagation()}
        className="relative max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-3xl bg-white p-6 shadow-[0_40px_120px_-40px_rgba(0,0,0,0.5)] sm:p-8"
      >
        <button
          onClick={onClose}
          aria-label="關閉設計流程"
          className={`absolute right-4 top-4 grid h-10 w-10 place-items-center rounded-full text-black/50 transition-colors duration-300 ease-out hover:bg-black/5 hover:text-ink ${focusRing}`}
        >
          <X weight="bold" className="h-5 w-5" />
        </button>

        <p className="text-xs font-semibold uppercase tracking-widest text-brand">How it works</p>
        <h2 id="how-it-works-title" className="mt-2 pr-12 text-2xl font-bold tracking-tight text-ink">
          如何製作你的專屬收藏展示框？
        </h2>
        <p className="mt-2 text-sm text-black/55">四個步驟，客製化要做多深，由你決定。</p>

        <ol className="mt-8 grid grid-cols-1 gap-3 sm:grid-cols-2">
          {steps.map((s) => {
            const Icon = s.icon;
            return (
              <li key={s.step} className="rounded-2xl border border-black/5 bg-paper p-6">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-sm font-semibold text-black/30">{s.step}</span>
                  <Icon weight="duotone" className="h-5 w-5 text-brand" />
                </div>
                <h3 className="mt-4 text-base font-semibold text-ink">{s.title}</h3>
                <p className="mt-2 text-sm text-black/55">{s.desc}</p>
              </li>
            );
          })}
        </ol>

        <div className="mt-8 flex flex-col-reverse items-start justify-between gap-4 border-t border-black/5 pt-6 sm:flex-row sm:items-center">
          <span className="text-xs text-black/40">企管系畢業專題原型概念平台</span>
          <button
            onClick={() => {
              onClose();
              onStartCustomizing();
            }}
            className={`group inline-flex items-center gap-2 rounded-xl bg-ink px-3 py-2 text-base font-semibold text-white transition duration-300 ease-out hover:bg-black active:scale-[0.98] ${focusRing}`}
          >
            挑選方案開始製作
            <ArrowRight weight="bold" className="h-4 w-4 transition-transform duration-300 ease-out group-hover:translate-x-0.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
