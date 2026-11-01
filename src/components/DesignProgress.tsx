import React from 'react';
import { Check } from 'lucide-react';

const steps = ['選擇方案', '開始設計', '預覽確認'];

export const DesignProgress: React.FC<{ activeStep: number }> = ({ activeStep }) => (
  <nav aria-label="設計流程" className="rounded-2xl border border-stone-200 bg-white px-4 py-3 shadow-sm sm:px-6">
    <ol className="mx-auto flex max-w-2xl items-center">
      {steps.map((step, index) => {
        const number = index + 1;
        const complete = number < activeStep;
        const active = number === activeStep;
        return <React.Fragment key={step}>
          <li className="flex shrink-0 items-center gap-2" aria-current={active ? 'step' : undefined}>
            <span className={`grid h-7 w-7 place-items-center rounded-full text-xs font-bold ${complete ? 'bg-emerald-600 text-white' : active ? 'bg-pink-600 text-white' : 'bg-stone-100 text-slate-500'}`}>
              {complete ? <Check className="h-3.5 w-3.5" /> : number}
            </span>
            <span className={`hidden text-xs font-semibold sm:inline ${active ? 'text-slate-900' : complete ? 'text-emerald-700' : 'text-slate-400'}`}>{step}</span>
          </li>
          {index < steps.length - 1 && <li aria-hidden="true" className={`mx-2 h-px flex-1 sm:mx-4 ${complete ? 'bg-emerald-400' : 'bg-stone-200'}`} />}
        </React.Fragment>;
      })}
    </ol>
  </nav>
);
