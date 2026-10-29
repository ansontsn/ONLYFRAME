import React from 'react';
import { Check } from '@phosphor-icons/react';

const steps = ['選擇方案', '開始設計', '預覽確認'];

export const DesignProgress: React.FC<{ activeStep: number }> = ({ activeStep }) => (
  <nav aria-label="設計流程" className="py-2">
    <ol className="mx-auto flex max-w-xl items-center">
      {steps.map((step, index) => {
        const number = index + 1;
        const complete = number < activeStep;
        const active = number === activeStep;
        return <React.Fragment key={step}>
          <li className="flex shrink-0 items-center gap-2" aria-current={active ? 'step' : undefined}>
            <span className={`grid h-6 w-6 place-items-center rounded-full font-mono text-xs font-semibold transition-colors duration-300 ease-out ${complete ? 'bg-ink text-white' : active ? 'bg-brand text-white' : 'border border-black/10 bg-white text-black/40'}`}>
              {complete ? <Check weight="bold" className="h-3 w-3" /> : number}
            </span>
            <span className={`hidden text-sm sm:inline ${active ? 'font-semibold text-ink' : complete ? 'text-black/60' : 'text-black/35'}`}>{step}</span>
          </li>
          {index < steps.length - 1 && <li aria-hidden="true" className={`mx-3 h-px flex-1 sm:mx-4 ${complete ? 'bg-ink' : 'bg-black/10'}`} />}
        </React.Fragment>;
      })}
    </ol>
  </nav>
);
