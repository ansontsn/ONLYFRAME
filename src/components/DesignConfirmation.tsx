import React, { useRef, useState } from 'react';
import { CustomizerState } from '../types';
import { AcrylicFramePreview } from './AcrylicFramePreview';
import { DesignSummary } from './DesignSummary';
import { getTierLabel } from '../data/tiers';
import { Download, Loader2, ArrowRight, RotateCcw } from 'lucide-react';
import { toPng } from 'html-to-image';

interface DesignConfirmationProps { state: CustomizerState; onModifyDesign: () => void; onChangeTier: () => void; onSubmitDesign?: () => void }
export const DesignConfirmation: React.FC<DesignConfirmationProps> = ({ state, onModifyDesign, onChangeTier, onSubmitDesign }) => {
  const previewContainerRef = useRef<HTMLDivElement>(null);
  const [isDownloading, setIsDownloading] = useState(false);
  const handleDownloadMockup = async () => {
    const node = previewContainerRef.current?.querySelector<HTMLElement>('#acrylic-display-frame');
    if (!node) { alert('找不到展示框元件，請重新整理頁面。'); return; }
    setIsDownloading(true);
    try {
      await document.fonts.ready;
      const dataUrl = await toPng(node, { quality: .98, pixelRatio: 2.5, cacheBust: true });
      const link = document.createElement('a');
      link.download = `ONLYFRAME-${state.tier}-${Date.now()}.png`;
      link.href = dataUrl;
      document.body.appendChild(link); link.click(); link.remove();
    } catch (err) { console.error('Download error:', err); alert('圖片匯出失敗，請稍後重試。'); }
    finally { setIsDownloading(false); }
  };
  return <section className="page-width confirmation-page">
    <div className="section-heading"><div><p className="eyebrow">ONE LAST LOOK</p><h1>喜歡的樣子，已經成形。</h1></div><p>確認這一刻的設計。<br />還想微調？隨時返回修改。</p></div>
    <div className="confirmation-grid">
      <div className="confirmation-art" ref={previewContainerRef}><span className="eyebrow">YOUR FRAME / {state.tier}</span><AcrylicFramePreview state={state} interactive={false} /><button className="btn-secondary" disabled={isDownloading} onClick={handleDownloadMockup}>{isDownloading ? <Loader2 size={16} className="animate-spin" /> : <Download size={16} />}{isDownloading ? '正在產生圖片…' : '下載設計 PNG'}</button></div>
      <div className="confirmation-details"><p className="eyebrow">DESIGN DETAILS</p><h2>{getTierLabel(state.tier)}</h2><DesignSummary state={state} />
        <details className="precise-details"><summary>查看完整配置與毫米座標</summary><dl className="summary-list">
          <div><dt>固定框體</dt><dd>85 × 115 mm · 標準矩形</dd></div>
          <div><dt>小卡預覽</dt><dd>{state.photocardName || '純空框'}</dd></div>
          {state.text.content && <><div><dt>文字字體／顏色</dt><dd>{state.text.font} / <span style={{ background: state.text.color }} className="inline-block w-3 h-3 rounded-full border border-stone-300" /></dd></div><div><dt>文字位置</dt><dd>X {state.text.xMm.toFixed(1)} / Y {state.text.yMm.toFixed(1)} mm</dd></div><div><dt>文字框／字體大小</dt><dd>{state.text.widthMm.toFixed(1)} × {state.text.heightMm.toFixed(1)} / {state.text.fontSizeMm.toFixed(1)} mm</dd></div><div><dt>角度／字距／換行</dt><dd>{state.text.rotation}° / {state.text.letterSpacingMm} mm / {state.text.autoWrap ? '開啟' : '關閉'}</dd></div></>}
          {state.stickers.map((s,i) => <div key={s.id}><dt>貼飾 {i+1} · {s.symbol}</dt><dd>X {s.xMm.toFixed(1)} / Y {s.yMm.toFixed(1)} mm<br />{s.widthMm} × {s.heightMm} mm / {s.rotation}°</dd></div>)}
        </dl></details>
        <p className="prototype-note">這是研究原型的設計預覽，非實際販售。尺寸、材質與製程均待驗證。送出時將填寫姓名與電子信箱，成功後才會取得設計編號。</p>
        <div className="space-y-3 mt-6">{onSubmitDesign && <button className="btn-primary w-full" onClick={onSubmitDesign}>送出我的專屬設計 <ArrowRight size={17} /></button>}<button className="btn-secondary w-full" onClick={onModifyDesign}><RotateCcw size={16} />返回修改設計</button><button className="text-link w-full justify-center" onClick={onChangeTier}>切換其他方案</button></div>
      </div>
    </div>
  </section>;
};
