import React, { useLayoutEffect, useMemo, useRef, useState } from 'react';
import { CustomizerState } from '../types';
import { FRAME_OPTIONS, FRAME_COLOR_OPTIONS, BACKGROUND_OPTIONS } from '../data/options';
import { CardAnchor, FRAME_WIDTH_MM, FRAME_HEIGHT_MM, MAGNET_CENTERS_MM, MAGNET_DIAMETER_MM, getCardAnchorMm, mmToPx, pxToMm } from '../utils/dimensions';
import { Sparkles, Move } from 'lucide-react';
import { StickerArtwork } from './StickerArtwork';
import { normalizeDesignForTier } from '../data/tiers';

interface AcrylicFramePreviewProps {
  state: CustomizerState;
  onUpdateStickerPosition?: (id: string, xMm: number, yMm: number, anchor?: CardAnchor) => void;
  selectedStickerId?: string | null;
  onSelectSticker?: (id: string) => void;
  onUpdateTextPosition?: (xMm: number, yMm: number, anchor?: CardAnchor) => void;
  interactive?: boolean;
}

const ANCHORS: CardAnchor[] = ['top-left', 'top-center', 'top-right', 'center-left', 'center-right', 'bottom-left', 'bottom-center', 'bottom-right'];

export const AcrylicFramePreview: React.FC<AcrylicFramePreviewProps> = ({ state: inputState, onUpdateStickerPosition, selectedStickerId, onSelectSticker, onUpdateTextPosition, interactive = true }) => {
  const state = normalizeDesignForTier(inputState);
  const frameOpt = FRAME_OPTIONS.find(f => f.id === state.frameStyleId) || FRAME_OPTIONS[0];
  const colorOpt = FRAME_COLOR_OPTIONS.find(c => c.id === state.frameColorId) || FRAME_COLOR_OPTIONS[0];
  const bgOpt = BACKGROUND_OPTIONS.find(b => b.id === state.backgroundId) || BACKGROUND_OPTIONS[0];
  const frameRef = useRef<HTMLDivElement>(null);
  const [isDraggingText, setIsDraggingText] = useState(false);
  const [draggingStickerId, setDraggingStickerId] = useState<string | null>(null);
  const [productMode, setProductMode] = useState(!interactive);
  const [snappedAnchor, setSnappedAnchor] = useState<CardAnchor | null>(null);
  const [scale, setScale] = useState(320 / FRAME_WIDTH_MM);
  useLayoutEffect(() => {
    const node = frameRef.current;
    if (!node) return;
    const observer = new ResizeObserver(() => setScale(node.clientWidth / FRAME_WIDTH_MM));
    observer.observe(node);
    setScale(node.clientWidth / FRAME_WIDTH_MM);
    return () => observer.disconnect();
  }, []);
  const cardXmm = (FRAME_WIDTH_MM - state.cardWidthMm) / 2;
  const cardYmm = (FRAME_HEIGHT_MM - state.cardHeightMm) / 2;
  const nearMagnets = useMemo(() => [...state.stickers.map(s => ({ xMm: s.xMm, yMm: s.yMm, radiusMm: Math.max(s.widthMm, s.heightMm) / 2 })), ...(state.text.content ? [{ xMm: state.text.xMm, yMm: state.text.yMm, radiusMm: Math.max(state.text.widthMm, state.text.heightMm) / 2 }] : [])]
    .some(item => item.xMm >= 0 && item.yMm >= 0 && MAGNET_CENTERS_MM.some(m => Math.hypot(item.xMm - m.xMm, item.yMm - m.yMm) < MAGNET_DIAMETER_MM / 2 + item.radiusMm)), [state.stickers, state.text]);

  const startDrag = (e: React.PointerEvent, onMoveCallback: (xMm: number, yMm: number, anchor?: CardAnchor) => void, onEnd: () => void) => {
    if (!interactive || productMode) return;
    e.preventDefault();
    e.stopPropagation();
    const rect = frameRef.current?.getBoundingClientRect();
    if (!rect) return;
    const onMove = (evt: PointerEvent) => {
      const currentScale = rect.width / FRAME_WIDTH_MM;
      let xMm = pxToMm(evt.clientX - rect.left, currentScale);
      let yMm = pxToMm(evt.clientY - rect.top, currentScale);
      let closest: { anchor: CardAnchor; xMm: number; yMm: number; distance: number } | null = null;
      for (const anchor of ANCHORS) {
        const point = getCardAnchorMm(anchor, state.cardWidthMm, state.cardHeightMm);
        const distance = Math.hypot(xMm - point.xMm, yMm - point.yMm);
        if (distance < 2 && (!closest || distance < closest.distance)) closest = { anchor, ...point, distance };
      }
      if (closest) {
        xMm = closest.xMm;
        yMm = closest.yMm;
        setSnappedAnchor(closest.anchor);
        onMoveCallback(xMm, yMm, closest.anchor);
      } else {
        setSnappedAnchor(null);
        onMoveCallback(Math.max(0, Math.min(FRAME_WIDTH_MM, xMm)), Math.max(0, Math.min(FRAME_HEIGHT_MM, yMm)));
      }
    };
    const onPointerUp = () => {
      onEnd();
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerup', onPointerUp);
    };
    window.addEventListener('pointermove', onMove);
    window.addEventListener('pointerup', onPointerUp);
  };

  const renderMagnet = (point: typeof MAGNET_CENTERS_MM[number], index: number) => {
    const left = mmToPx(point.xMm, scale);
    const top = mmToPx(point.yMm, scale);
    if (!productMode) return <div key={index} className="absolute rounded-full border border-pink-300/35 bg-pink-300/10 pointer-events-none z-40" style={{ left, top, width: mmToPx(MAGNET_DIAMETER_MM, scale), height: mmToPx(MAGNET_DIAMETER_MM, scale), transform: 'translate(-50%, -50%)' }} />;
    return <div key={index} className="absolute rounded-full z-40 shadow-md flex items-center justify-center pointer-events-none bg-gradient-to-tr from-slate-500 via-slate-200 to-white border border-slate-300" style={{ left, top, width: mmToPx(MAGNET_DIAMETER_MM, scale), height: mmToPx(MAGNET_DIAMETER_MM, scale), transform: 'translate(-50%, -50%)' }}><div className="w-2.5 h-[1.5px] rounded-full bg-slate-700/80" /></div>;
  };

  return <div className="relative flex flex-col items-center justify-center p-4 select-none w-full">
    <div className="absolute -inset-4 rounded-full blur-3xl opacity-35 transition-all duration-700 pointer-events-none" style={{ background: colorOpt.glowColor }} />
    <div ref={frameRef} id="acrylic-display-frame" className={`relative max-w-full ${frameOpt.cornerStyle} transition-all duration-300 overflow-hidden acrylic-card shadow-acrylic ${colorOpt.outerBorder}`} style={{ width: 'min(320px, 100%, 50.26vh)', aspectRatio: `${FRAME_WIDTH_MM} / ${FRAME_HEIGHT_MM}`, boxShadow: `0 20px 45px -10px rgba(15, 23, 42, 0.16), 0 0 25px ${colorOpt.glowColor}25, inset 0 1px 2px rgba(255,255,255,0.85)` }}>
      <div className="absolute inset-0 pointer-events-none rounded-[inherit] border border-white/60 z-50" />
      <div className="absolute inset-0 pointer-events-none glass-reflection rotate-25 opacity-70 z-20" style={{ width: '200%', height: '200%', top: '-50%', left: '-50%' }} />
      <div className={`absolute inset-[4%] rounded-xl overflow-hidden transition-all duration-500 z-0 ${bgOpt.cssClass}`} style={state.customBgUrl ? { backgroundImage: `url(${state.customBgUrl})`, backgroundSize: 'cover', backgroundPosition: 'center' } : undefined}>
        <div className="absolute inset-0 bg-white/[0.02] pointer-events-none" />
      </div>

      <div className="absolute z-10 rounded-[4%] overflow-hidden p-[1%] bg-white/10 backdrop-blur-sm shadow-2xl border border-white/25" style={{ left: mmToPx(cardXmm, scale), top: mmToPx(cardYmm, scale), width: mmToPx(state.cardWidthMm, scale), height: mmToPx(state.cardHeightMm, scale) }}>
        <div className="relative w-full h-full rounded-[3%] overflow-hidden bg-slate-900 shadow-inner">
          {state.photocardUrl ? <img src={state.photocardUrl} alt={state.photocardName || '收藏小卡'} className="w-full h-full object-cover select-none pointer-events-none" draggable={false} /> : <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-b from-slate-800 to-slate-900 p-2 text-center"><Sparkles className="w-8 h-8 text-pink-400 mb-2 opacity-60" /><span className="text-xs font-semibold text-slate-300">尚未置入小卡</span><span className="text-[10px] text-slate-500 mt-1">可在左側選擇示範卡</span></div>}
          <div className="absolute inset-0 bg-gradient-to-tr from-white/10 via-transparent to-transparent pointer-events-none" />
        </div>
      </div>

      {MAGNET_CENTERS_MM.map(renderMagnet)}

      {state.tier === 'PREMIUM' && <div className="absolute inset-0 z-20 pointer-events-none">
        {state.stickers.map(sticker => {
          const isSelected = selectedStickerId === sticker.id;
          const isDragging = draggingStickerId === sticker.id;
          return <div key={sticker.id} onClick={e => { e.stopPropagation(); if (interactive && !productMode) onSelectSticker?.(sticker.id); }} onPointerDown={e => { if (!interactive || productMode || !onUpdateStickerPosition) return; onSelectSticker?.(sticker.id); setDraggingStickerId(sticker.id); startDrag(e, (x, y, anchor) => onUpdateStickerPosition(sticker.id, x, y, anchor), () => setDraggingStickerId(null)); }} className={`absolute -translate-x-1/2 -translate-y-1/2 ${interactive && !productMode ? 'pointer-events-auto cursor-grab active:cursor-grabbing' : 'pointer-events-none'} select-none touch-none ${isSelected && !productMode ? 'outline outline-2 outline-pink-400/80 outline-offset-2 rounded-md z-30' : interactive && !productMode ? 'hover:outline hover:outline-1 hover:outline-pink-300/60 hover:outline-offset-1 rounded-md' : ''}`} style={{ left: mmToPx(sticker.xMm, scale), top: mmToPx(sticker.yMm, scale), width: mmToPx(sticker.widthMm, scale), height: mmToPx(sticker.heightMm, scale), lineHeight: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: sticker.zIndex || 20, transform: `translate(-50%, -50%) rotate(${sticker.rotation}deg)`, filter: 'drop-shadow(0 2px 3px rgba(0,0,0,0.2))' }} title={interactive && !productMode ? '點擊選中或拖曳調整位置' : undefined}><StickerArtwork stickerId={sticker.stickerId} fallback={sticker.symbol} className="w-full h-full pointer-events-none" />{interactive && !productMode && <span className={`absolute -top-2 -right-2 text-[9px] bg-white/90 rounded-full px-1 text-pink-600 border border-pink-300/60 ${isSelected || isDragging ? 'opacity-100' : 'opacity-0 hover:opacity-100'}`}><Move className="w-2.5 h-2.5 inline" /></span>}</div>;
        })}
      </div>}

      {state.tier !== 'BASIC' && state.text.content && <div onPointerDown={e => { if (!interactive || productMode || !onUpdateTextPosition) return; setIsDraggingText(true); startDrag(e, (x, y, anchor) => onUpdateTextPosition(x, y, anchor), () => setIsDraggingText(false)); }} className={`absolute text-center -translate-x-1/2 -translate-y-1/2 select-none touch-none ${interactive && !productMode ? 'pointer-events-auto cursor-grab hover:ring-2 hover:ring-pink-400/80 rounded-lg px-2 py-0.5' : 'pointer-events-none'}`} style={{ left: mmToPx(state.text.xMm, scale), top: mmToPx(state.text.yMm, scale), width: mmToPx(state.text.widthMm, scale), fontSize: mmToPx(state.text.fontSizeMm, scale), color: state.text.color, fontFamily: state.text.font, zIndex: state.text.zIndex || 30, transform: `translate(-50%, -50%) rotate(${state.text.rotation}deg)`, textShadow: '0 2px 8px rgba(0, 0, 0, 0.9), 0 0 12px rgba(255, 255, 255, 0.4)', letterSpacing: '0.1em', overflowWrap: 'anywhere' }} title={interactive && !productMode ? '按住拖曳調整文字位置' : undefined}><span className="font-bold tracking-wider uppercase">{state.text.content}</span>{interactive && !productMode && <span className={`absolute -top-4 left-1/2 -translate-x-1/2 text-[9px] bg-pink-500 text-white font-bold px-1.5 py-0.5 rounded-full shadow whitespace-nowrap ${isDraggingText ? 'opacity-100' : 'opacity-0 hover:opacity-100'}`}>{isDraggingText ? '移動中...' : '可自由拖曳'}</span>}</div>}

      {!productMode && snappedAnchor && (() => { const anchor = getCardAnchorMm(snappedAnchor, state.cardWidthMm, state.cardHeightMm); return <span className="absolute z-50 w-3 h-3 rounded-full border-2 border-white bg-pink-400 shadow-[0_0_12px_rgba(244,114,182,0.95)] pointer-events-none" style={{ left: mmToPx(anchor.xMm, scale), top: mmToPx(anchor.yMm, scale), transform: 'translate(-50%, -50%)' }} />; })()}
      <div className="absolute bottom-[1.5%] inset-x-[5%] h-[1px] bg-white/30 rounded-full pointer-events-none z-50" />
    </div>

    {interactive && <div className="relative z-10 mt-3 inline-flex rounded-xl bg-white/80 border border-stone-200 p-1 shadow-sm">
      <button onClick={() => setProductMode(false)} className={`px-3 py-1.5 rounded-lg text-[11px] font-semibold ${!productMode ? 'bg-slate-800 text-white' : 'text-slate-500'}`}>編輯模式</button>
      <button onClick={() => { setProductMode(true); setSnappedAnchor(null); }} className={`px-3 py-1.5 rounded-lg text-[11px] font-semibold ${productMode ? 'bg-slate-800 text-white' : 'text-slate-500'}`}>成品預覽</button>
    </div>}
    <div className="relative z-10 mt-2.5 flex flex-wrap items-center justify-center gap-x-3 gap-y-1 rounded-xl border border-stone-200/70 bg-white/70 px-3 py-2 text-[10px] text-slate-500 shadow-sm">
      <span><b className="text-slate-700">ONLYFRAME 外框</b> 85 × 115 mm</span><span><b className="text-slate-700">我的小卡</b> {state.cardWidthMm.toFixed(1)} × {state.cardHeightMm.toFixed(1)} mm</span><span>左右剩餘 {((FRAME_WIDTH_MM - state.cardWidthMm) / 2).toFixed(1)} mm</span><span>上下剩餘 {((FRAME_HEIGHT_MM - state.cardHeightMm) / 2).toFixed(1)} mm</span>
    </div>
    {!productMode && nearMagnets && <p className="relative z-10 mt-1 text-[10px] text-amber-700 bg-amber-50/90 border border-amber-200 rounded-lg px-2 py-1">此元素接近磁吸位置，實際成品可能影響視覺效果。</p>}
    <div className="absolute bottom-0 right-4 translate-y-full pt-2 flex items-center gap-1.5 text-[11px] text-slate-500 font-mono"><span className="w-1.5 h-1.5 rounded-full bg-emerald-400" /><span>Prototype · 外框 85 × 115 mm</span></div>
  </div>;
};
