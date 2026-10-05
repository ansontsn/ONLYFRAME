import React, { useRef, useState } from 'react';
import { TIER_OPTIONS, getTierLabel } from '../data/tiers';
import { CustomizerState } from '../types';
import { FRAME_OPTIONS, FRAME_COLOR_OPTIONS, BACKGROUND_OPTIONS } from '../data/options';
import { AcrylicFramePreview } from './AcrylicFramePreview';
import { CheckCircle2, Download, RotateCcw, Layers, Share2, Info, Loader2 } from 'lucide-react';
import { toPng } from 'html-to-image';

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

  const frameOpt = FRAME_OPTIONS.find(f => f.id === state.frameStyleId) || FRAME_OPTIONS[0];
  const colorOpt = FRAME_COLOR_OPTIONS.find(c => c.id === state.frameColorId) || FRAME_COLOR_OPTIONS[0];
  const bgOpt = BACKGROUND_OPTIONS.find(b => b.id === state.backgroundId) || BACKGROUND_OPTIONS[0];

  const handleDownloadMockup = async () => {
    const node = previewContainerRef.current?.querySelector<HTMLElement>('#acrylic-display-frame');
    if (!node) {
      alert('找不到展示框元件，請重新整理頁面。');
      return;
    }

    setIsDownloading(true);
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
      alert('圖片匯出失敗，請確認瀏覽器支援 Canvas 繪製。');
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <div className="py-10 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto space-y-10">
      
      {/* Top Banner */}
      <div className="text-center space-y-3">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-50 border border-emerald-200 text-xs font-semibold text-emerald-700">
          <CheckCircle2 className="w-4 h-4" />
          <span>設計已完成 · DESIGN COMPLETED</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900">
          你的專屬收藏展示框已就緒
        </h1>
        <p className="text-sm text-slate-600 max-w-xl mx-auto">
          依據您選擇的客製化程度與各項細節，我們已完成專屬壓克力展示框的即時預覽與設計內容清單。
        </p>
      </div>

      {/* Main Showcase Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
        
        {/* Left: Finished Acrylic Frame Preview */}
        <div className="lg:col-span-6 flex flex-col items-center">
          <div ref={previewContainerRef} className="p-4 rounded-3xl bg-white/80 border border-stone-200/80 shadow-sm w-full flex justify-center">
            <AcrylicFramePreview state={state} interactive={false} />
          </div>

          <div className="flex items-center gap-3 mt-4 w-full max-w-sm">
            <button
              onClick={handleDownloadMockup}
              disabled={isDownloading}
              className="flex-1 py-3 px-4 rounded-xl text-xs font-bold bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white shadow-lg shadow-pink-500/20 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {isDownloading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>正在生成高畫質相片...</span>
                </>
              ) : downloadSuccess ? (
                <>
                  <CheckCircle2 className="w-4 h-4 text-emerald-300" />
                  <span>相片已成功下載！</span>
                </>
              ) : (
                <>
                  <Download className="w-4 h-4" />
                  <span>下載展示框照片 (PNG)</span>
                </>
              )}
            </button>
            <button
              onClick={() => {
                navigator.clipboard?.writeText(window.location.href);
                alert('已複製展示連結！');
              }}
              className="py-3 px-4 rounded-xl text-xs font-semibold bg-white/80 hover:bg-white text-slate-700 border border-stone-200 shadow-sm transition-all flex items-center gap-1.5"
            >
              <Share2 className="w-3.5 h-3.5" />
              <span>分享</span>
            </button>
          </div>
        </div>

        {/* Right: Specifications & Design Summary */}
        <div className="lg:col-span-6 space-y-6">
          <div className="p-6 rounded-3xl bg-[#12141c]/90 border border-white/10 shadow-2xl space-y-5">
            
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <div>
                <span className="text-[10px] uppercase font-mono tracking-widest text-pink-400 block">
                  SELECTED TIER
                </span>
                <h3 className="text-xl font-black text-white mt-0.5">
                  {getTierLabel(state.tier)}
                </h3>
              </div>
              <span className="text-xs font-mono px-3 py-1 rounded-full bg-pink-500/10 text-pink-300 border border-pink-500/30">
                PROTOTYPE
              </span>
            </div>

            {/* Spec Breakdown */}
            <div className="space-y-2.5 text-xs">
              <div className="flex justify-between py-1 border-b border-white/5">
                <span className="text-slate-400">固定框體外型</span>
                <span className="font-semibold text-slate-200">{frameOpt.name}</span>
              </div>

              <div className="flex justify-between py-1 border-b border-white/5">
                <span className="text-slate-400">框體外觀色</span>
                <span className="font-semibold text-slate-200 flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full border border-white/30" style={{ background: colorOpt.hex }} />
                  {colorOpt.name}
                </span>
              </div>

              <div className="flex justify-between py-1 border-b border-white/5">
                <span className="text-slate-400">背景視覺</span>
                <span className="font-semibold text-slate-200">
                  {TIER_OPTIONS[state.tier].background ? bgOpt.name : '原色透亮'}
                </span>
              </div>

              <div className="flex justify-between py-1 border-b border-white/5">
                <span className="text-slate-400">裝飾配件</span>
                <span className="font-semibold text-slate-200">
                  {TIER_OPTIONS[state.tier].stickers ? `${state.stickers.length} 枚` : '無'}
                </span>
              </div>

              <div className="flex justify-between py-1 border-b border-white/5">
                <span className="text-slate-400">雷雕刻字</span>
                <span className="font-semibold text-slate-200">
                  {state.tier === 'BASIC' || !state.text.content ? '無' : state.text.content}
                </span>
              </div>

              <div className="flex justify-between py-1">
                <span className="text-slate-400">小卡裝框效果</span>
                <span className="font-semibold text-slate-200">
                  {state.isCustomPhoto ? '個人小卡模擬' : state.photocardUrl ? '示範卡模擬預覽' : '純空框展示'}
                </span>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-gradient-to-tr from-pink-500/10 via-purple-500/10 to-transparent border border-pink-500/30 space-y-1">
              <span className="text-xs text-slate-400 block">{TIER_OPTIONS[state.tier].level}</span>
              <p className="text-sm font-bold text-pink-300">{TIER_OPTIONS[state.tier].summary}</p>
              <p className="text-[11px] text-slate-400">三種方案皆可上傳小卡進行預覽。</p>
            </div>

            <div className="flex items-start gap-2 text-[11px] text-slate-400">
              <Info className="w-4 h-4 text-slate-500 flex-shrink-0 mt-0.5" />
              <p>
                本網站為企管系畢業專題開發之互動式 Prototype。網站內容與產品規格僅供研究與展示使用，不進行實際販售。
              </p>
            </div>

            {/* Action Buttons */}
            <div className="space-y-2.5 pt-2">
              {onSubmitDesign && (
                <button
                  onClick={onSubmitDesign}
                  className="w-full py-3 sm:py-3.5 px-4 sm:px-6 rounded-xl sm:rounded-2xl text-xs sm:text-sm font-bold bg-gradient-to-r from-pink-500 via-rose-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white shadow-lg shadow-pink-500/25 hover:shadow-pink-500/40 active:scale-[0.99] transition-all flex items-center justify-center gap-2 group whitespace-nowrap"
                >
                  <img 
                    src="/logo.png" 
                    alt="ONLYFRAME" 
                    className="w-4 h-4 sm:w-5 sm:h-5 rounded-sm object-contain flex-shrink-0 shadow-xs" 
                    style={{ width: '18px', height: '18px' }}
                  />
                  <span className="whitespace-nowrap">送出我的專屬設計 ➔</span>
                </button>
              )}

              <div className="grid grid-cols-2 gap-2.5">
                <button
                  onClick={onModifyDesign}
                  className="py-3 px-4 rounded-xl text-xs font-bold bg-white/10 hover:bg-white/20 text-white transition-all flex items-center justify-center gap-1.5"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>返回修改設計</span>
                </button>

                <button
                  onClick={onChangeTier}
                  className="py-3 px-4 rounded-xl text-xs font-bold bg-white/10 hover:bg-white/20 text-white transition-all flex items-center justify-center gap-1.5"
                >
                  <Layers className="w-3.5 h-3.5" />
                  <span>切換其他方案</span>
                </button>
              </div>
            </div>

          </div>
        </div>

      </div>

    </div>
  );
};
