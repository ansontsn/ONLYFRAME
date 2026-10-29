import React, { useState } from 'react';
import { TIER_OPTIONS, getTierLabel } from '../data/tiers';
import { DesignSubmission } from '../types';
import { ArrowCounterClockwise, Check, CheckCircle, Copy, Eye, X } from '@phosphor-icons/react';
import { btnPrimary, btnSecondary, focusRing } from './ui';

interface SubmissionSuccessViewProps {
  submission: DesignSubmission;
  onReset: () => void;
}

export const SubmissionSuccessView: React.FC<SubmissionSuccessViewProps> = ({
  submission,
  onReset
}) => {
  const [copied, setCopied] = useState(false);
  const [isDetailOpen, setIsDetailOpen] = useState(false);

  const handleCopyCode = () => {
    navigator.clipboard?.writeText(submission.submission_code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const infoTiles = [
    { label: '客製方案', value: getTierLabel(submission.plan) },
    { label: '聯絡姓名', value: submission.customer_name },
    { label: '電子信箱', value: submission.customer_email },
  ];

  const details = [
    { label: '固定框體', value: submission.frame_style },
    { label: '框體外觀色系', value: submission.frame_color },
    { label: '背景樣式', value: submission.background },
    { label: '裝飾配件', value: submission.decorations },
    { label: '刻字內容', value: submission.custom_text },
    { label: '字體選用', value: submission.font },
  ];

  return (
    <div className="mx-auto max-w-2xl px-4 pb-24 pt-12 sm:px-6 lg:pt-20">

      <div>
        <span className="grid h-12 w-12 place-items-center rounded-2xl bg-ink text-white">
          <CheckCircle weight="fill" className="h-6 w-6" />
        </span>
        <h1 className="mt-6 bg-gradient-to-r from-[#000000] to-[#666666] bg-clip-text pb-1 text-4xl font-bold tracking-tight text-transparent sm:text-5xl sm:leading-tight">
          設計已送出
        </h1>
        <p className="mt-4 max-w-[680px] text-lg text-black/60">
          我們收到你的客製化設計了。專題團隊會依這份規格進行打樣評估與研究分析。
        </p>
      </div>

      <div className="mt-12 rounded-3xl border border-black/5 bg-white p-6 sm:p-8">

        <div className="flex flex-col justify-between gap-6 border-b border-black/5 pb-6 sm:flex-row sm:items-end">
          <div className="min-w-0">
            <span className="block text-xs font-semibold uppercase tracking-widest text-black/40">設計編號</span>
            <div className="mt-2 flex items-center gap-2">
              <span className="min-w-0 break-all font-mono text-2xl font-semibold tracking-tight text-ink sm:text-3xl">
                {submission.submission_code}
              </span>
              <button
                onClick={handleCopyCode}
                className={`grid h-8 w-8 shrink-0 place-items-center rounded-lg text-black/55 transition-colors duration-300 ease-out hover:bg-black/5 hover:text-ink ${focusRing}`}
                title="複製設計編號"
                aria-label="複製設計編號"
              >
                {copied ? <Check weight="bold" className="h-4 w-4 text-emerald-700" /> : <Copy weight="bold" className="h-4 w-4" />}
              </button>
            </div>
            <p role="status" className="mt-1 h-4 text-xs text-emerald-700">{copied ? '已複製設計編號' : ''}</p>
          </div>

          <div className="sm:text-right">
            <span className="block text-xs text-black/40">客製程度</span>
            <span className="mt-1 block text-lg font-semibold text-ink">{TIER_OPTIONS[submission.plan].level}</span>
          </div>
        </div>

        <dl className="mt-6 grid grid-cols-1 gap-3 text-sm sm:grid-cols-2">
          {infoTiles.map((tile) => (
            <div key={tile.label} className="rounded-2xl bg-paper p-4">
              <dt className="text-xs text-black/40">{tile.label}</dt>
              <dd className="mt-1 truncate font-semibold text-ink">{tile.value}</dd>
            </div>
          ))}
          <div className="rounded-2xl bg-paper p-4">
            <dt className="text-xs text-black/40">設計狀態</dt>
            <dd className="mt-1">
              <span className="inline-flex items-center gap-2 text-sm font-semibold text-ink">
                <span className="h-2 w-2 rounded-full bg-amber-500" aria-hidden="true" />
                待處理
              </span>
            </dd>
          </div>
        </dl>

        {submission.preview_image_url && (
          <div className="mt-3 flex items-center gap-4 rounded-2xl bg-paper p-4">
            <img
              src={submission.preview_image_url}
              alt="展示框成品打樣預覽"
              className="h-24 w-16 shrink-0 rounded-lg bg-white object-contain"
            />
            <div className="min-w-0">
              <span className="block text-sm font-semibold text-ink">展示框打樣預覽圖</span>
              <p className="mt-1 text-xs text-black/50">預覽圖已和設計一起保存，專題團隊可以在後台查看。</p>
            </div>
          </div>
        )}

        <div className="mt-6 flex flex-col gap-2 sm:flex-row">
          <button onClick={() => setIsDetailOpen(true)} className={`sm:flex-1 ${btnSecondary}`}>
            <Eye weight="bold" className="h-4 w-4" />
            查看設計明細
          </button>
          <button onClick={onReset} className={`sm:flex-1 ${btnPrimary}`}>
            <ArrowCounterClockwise weight="bold" className="h-4 w-4" />
            再設計一個卡框
          </button>
        </div>

      </div>

      {isDetailOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm" onClick={() => setIsDetailOpen(false)} role="presentation">
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="submission-detail-title"
            onClick={(e) => e.stopPropagation()}
            className="relative max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-3xl bg-white p-6 shadow-[0_40px_120px_-40px_rgba(0,0,0,0.5)] sm:p-8"
          >
            <button
              onClick={() => setIsDetailOpen(false)}
              aria-label="關閉設計明細"
              className={`absolute right-4 top-4 grid h-10 w-10 place-items-center rounded-full text-black/50 transition-colors duration-300 ease-out hover:bg-black/5 hover:text-ink ${focusRing}`}
            >
              <X weight="bold" className="h-5 w-5" />
            </button>

            <p className="text-xs font-semibold uppercase tracking-widest text-black/40">設計明細</p>
            <h3 id="submission-detail-title" className="mt-1 pr-12 font-mono text-lg font-semibold text-ink">
              {submission.submission_code}
            </h3>

            <dl className="mt-4 divide-y divide-black/5 border-y border-black/5 text-sm">
              {details.map((row) => (
                <div key={row.label} className="flex justify-between gap-4 py-3">
                  <dt className="shrink-0 text-black/45">{row.label}</dt>
                  <dd className="text-right font-medium text-ink">{row.value}</dd>
                </div>
              ))}
            </dl>

            {submission.preview_image_url && (
              <div className="mt-4">
                <span className="block text-xs font-semibold uppercase tracking-widest text-black/40">打樣成品預覽</span>
                <div className="mt-2 flex justify-center rounded-2xl bg-paper p-3">
                  <img src={submission.preview_image_url} alt="展示框打樣預覽圖" className="max-h-60 rounded-xl object-contain" />
                </div>
              </div>
            )}

            <button onClick={() => setIsDetailOpen(false)} className={`mt-6 w-full ${btnSecondary}`}>
              關閉明細
            </button>
          </div>
        </div>
      )}

    </div>
  );
};
