import React, { useRef, useState } from 'react';
import { TIER_OPTIONS, getTierLabel } from '../data/tiers';
import { CustomizerState } from '../types';
import { FRAME_OPTIONS, FRAME_COLOR_OPTIONS, BACKGROUND_OPTIONS } from '../data/options';
import { AcrylicFramePreview } from './AcrylicFramePreview';
import { ArrowCounterClockwise, ArrowRight, Check, CheckCircle, DownloadSimple, Info, LinkSimple, Stack } from '@phosphor-icons/react';
import { toPng } from 'html-to-image';
import { arrowNudge, btnPrimary, btnSecondarySm, eyebrow } from './ui';

interface DesignConfirmationProps {
  state: CustomizerState;
  onModifyDesign: () => void;
  onChangeTier: () => void;
  onSubmitDesign?: () => void;
}

export const DesignConfirmation: React.FC<DesignConfirmationProps> = ({
  state,
  onModifyDesign,
  onChangeTier,
  onSubmitDesign
}) => {
  const previewContainerRef = useRef<HTMLDivElement>(null);
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadSuccess, setDownloadSuccess] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{ tone: 'ok' | 'error'; text: string } | null>(null);

  const frameOpt = FRAME_OPTIONS.find(f => f.id === state.frameStyleId) || FRAME_OPTIONS[0];
  const colorOpt = FRAME_COLOR_OPTIONS.find(c => c.id === state.frameColorId) || FRAME_COLOR_OPTIONS[0];
  const bgOpt = BACKGROUND_OPTIONS.find(b => b.id === state.backgroundId) || BACKGROUND_OPTIONS[0];
  const plan = TIER_OPTIONS[state.tier];

  const handleDownloadMockup = async () => {
    const node = previewContainerRef.current?.querySelector<HTMLElement>('#acrylic-display-frame');
    if (!node) {
      setStatusMessage({ tone: 'error', text: '找不到展示框元件，請重新整理頁面後再試一次。' });
      return;
    }

    setIsDownloading(true);
    setStatusMessage(null);
    try {
      // Small delay to ensure all assets/fonts are stable
      await new Promise(r => setTimeout(r, 120));

      const dataUrl = await toPng(node, {
        quality: 0.98,
        pixelRatio: 2.5, // High resolution output
        cacheBust: true,
      });

      const link = document.createElement('a');
      link.download = `ONLYFRAME-${state.tier}-${Date.now()}.png`;
      link.href = dataUrl;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      setDownloadSuccess(true);
      setTimeout(() => setDownloadSuccess(false), 3000);
    } catch (err) {
      console.error('Download error:', err);
      setStatusMessage({ tone: 'error', text: '圖片匯出失敗，請確認瀏覽器支援 Canvas 繪製後再試一次。' });
    } finally {
      setIsDownloading(false);
    }
  };

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setStatusMessage({ tone: 'ok', text: '已複製展示連結。' });
    } catch {
      setStatusMessage({ tone: 'error', text: '無法存取剪貼簿，請手動複製網址列的連結。' });
    }
  };

  const specs: { label: string; value: React.ReactNode }[] = [
    { label: '固定框體外型', value: frameOpt.name },
    {
      label: '框體外觀色',
      value: (
        <span className="inline-flex items-center gap-2">
          <span className="h-3 w-3 rounded-full border border-black/15" style={{ background: colorOpt.hex }} />
          {colorOpt.name.split(' (')[0]}
        </span>
      ),
    },
    { label: '背景視覺', value: plan.background ? bgOpt.name : '原色透亮' },
    { label: '裝飾配件', value: plan.stickers ? `${state.stickers.length} 枚` : '無' },
    { label: '雷雕刻字', value: state.tier === 'BASIC' || !state.text.content ? '無' : state.text.content },
    { label: '小卡裝框效果', value: state.isCustomPhoto ? '個人小卡模擬' : state.photocardUrl ? '示範卡模擬預覽' : '純空框展示' },
  ];

  return (
    <div className="mx-auto max-w-5xl px-4 pb-24 pt-8 sm:px-6">

      <div className="max-w-[680px]">
        <p className={`${eyebrow} inline-flex items-center gap-2`}>
          <CheckCircle weight="fill" className="h-4 w-4" />
          設計已完成
        </p>
        <h1 className="mt-3 bg-gradient-to-r from-[#000000] to-[#666666] bg-clip-text pb-1 text-4xl font-bold tracking-tight text-transparent sm:text-5xl sm:leading-tight">
          你的專屬展示框<br />已經準備好了
        </h1>
        <p className="mt-4 text-lg text-black/60">
          依你選擇的客製程度與細節，整理出展示框的預覽與設計清單。送出前都還能返回修改。
        </p>
      </div>

      <div className="mt-12 grid grid-cols-1 items-start gap-8 lg:grid-cols-12">

        {/* Finished frame preview */}
        <div className="flex flex-col items-center lg:col-span-6">
          <div ref={previewContainerRef} className="flex w-full justify-center rounded-3xl bg-white p-6 ring-1 ring-black/5">
            <AcrylicFramePreview state={state} interactive={false} />
          </div>

          <div className="mt-4 flex w-full items-center gap-2">
            <button
              onClick={handleDownloadMockup}
              disabled={isDownloading}
              aria-busy={isDownloading}
              className={`flex-1 ${btnSecondarySm}`}
            >
              {isDownloading ? (
                <span className="inline-flex items-center gap-2">
                  <span className="h-4 w-4 animate-pulse rounded bg-black/10" aria-hidden="true" />
                  正在產生高畫質圖片
                </span>
              ) : downloadSuccess ? (
                <>
                  <Check weight="bold" className="h-4 w-4 text-emerald-700" />
                  圖片已下載
                </>
              ) : (
                <>
                  <DownloadSimple weight="bold" className="h-4 w-4" />
                  下載展示框圖片
                </>
              )}
            </button>
            <button onClick={handleCopyLink} className={btnSecondarySm}>
              <LinkSimple weight="bold" className="h-4 w-4" />
              複製連結
            </button>
          </div>
          {statusMessage && (
            <p role={statusMessage.tone === 'error' ? 'alert' : 'status'} className={`mt-2 w-full text-sm ${statusMessage.tone === 'error' ? 'text-red-700' : 'text-black/55'}`}>
              {statusMessage.text}
            </p>
          )}
        </div>

        {/* Specifications */}
        <div className="rounded-3xl border border-black/5 bg-white p-8 lg:col-span-6">
          <div className="flex items-start justify-between gap-3 border-b border-black/5 pb-4">
            <div>
              <span className="block text-xs font-semibold uppercase tracking-widest text-black/40">選擇的方案</span>
              <h2 className="mt-1 text-xl font-semibold text-ink">{getTierLabel(state.tier)}</h2>
            </div>
            <span className="rounded-full bg-paper px-2 py-1 text-xs font-semibold text-black/50">Prototype</span>
          </div>

          <dl className="divide-y divide-black/5 text-sm">
            {specs.map((row) => (
              <div key={row.label} className="flex items-center justify-between gap-4 py-3">
                <dt className="shrink-0 text-black/45">{row.label}</dt>
                <dd className="truncate text-right font-medium text-ink">{row.value}</dd>
              </div>
            ))}
          </dl>

          <div className="mt-4 rounded-2xl bg-paper p-4">
            <span className="block text-xs font-semibold text-black/45">{plan.level}</span>
            <p className="mt-1 text-sm font-semibold text-ink">{plan.summary}</p>
            <p className="mt-1 text-xs text-black/45">三種方案都能上傳小卡進行預覽。</p>
          </div>

          <p className="mt-4 flex items-start gap-2 text-xs text-black/40">
            <Info weight="bold" className="mt-0.5 h-4 w-4 shrink-0" />
            本網站為企管系畢業專題開發的互動式原型。網站內容與產品規格僅供研究與展示使用，不進行實際販售。
          </p>

          <div className="mt-6 space-y-2">
            {onSubmitDesign && (
              <button onClick={onSubmitDesign} className={`w-full ${btnPrimary}`}>
                送出我的專屬設計
                <ArrowRight weight="bold" className={arrowNudge} />
              </button>
            )}
            <div className="grid grid-cols-2 gap-2">
              <button onClick={onModifyDesign} className={btnSecondarySm}>
                <ArrowCounterClockwise weight="bold" className="h-4 w-4" />
                返回修改
              </button>
              <button onClick={onChangeTier} className={btnSecondarySm}>
                <Stack weight="bold" className="h-4 w-4" />
                切換方案
              </button>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};
