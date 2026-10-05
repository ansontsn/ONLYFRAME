import React, { useRef } from 'react';
import { TextConfig } from '../types';
import { CardAnchor, FRAME_WIDTH_MM, FRAME_HEIGHT_MM, getCardAnchorMm, mmToPx } from '../utils/dimensions';
import { TextResizeHandle, resizeTextBox } from '../utils/textBox';

interface EditableTextObjectProps {
  text: TextConfig;
  scale: number;
  editable: boolean;
  selected: boolean;
  cardWidthMm: number;
  cardHeightMm: number;
  onSelect?: () => void;
  onMove?: (xMm: number, yMm: number, anchor?: CardAnchor) => void;
  onResize?: (updates: Partial<TextConfig>) => void;
}

const handles: { id: TextResizeHandle; label: string; left: string; top: string; cursor: string }[] = [
  { id: 'w', label: '調整文字框左邊界', left: '0%', top: '50%', cursor: 'ew-resize' },
  { id: 'e', label: '調整文字框右邊界', left: '100%', top: '50%', cursor: 'ew-resize' },
  { id: 'nw', label: '調整文字框左上角', left: '0%', top: '0%', cursor: 'nwse-resize' },
  { id: 'ne', label: '調整文字框右上角', left: '100%', top: '0%', cursor: 'nesw-resize' },
  { id: 'sw', label: '調整文字框左下角', left: '0%', top: '100%', cursor: 'nesw-resize' },
  { id: 'se', label: '調整文字框右下角', left: '100%', top: '100%', cursor: 'nwse-resize' },
];
const anchors: CardAnchor[] = ['top-left', 'top-center', 'top-right', 'center-left', 'center-right', 'bottom-left', 'bottom-center', 'bottom-right'];

export const EditableTextObject: React.FC<EditableTextObjectProps> = ({ text, scale, editable, selected, cardWidthMm, cardHeightMm, onSelect, onMove, onResize }) => {
  const gesture = useRef<{ pointerId: number; x: number; y: number; scale: number; text: TextConfig; handle: TextResizeHandle | null } | null>(null);

  const start = (event: React.PointerEvent<HTMLDivElement>) => {
    if (!editable || (event.pointerType === 'mouse' && event.button !== 0)) return;
    event.preventDefault();
    event.stopPropagation();
    onSelect?.();
    const handle = (event.target as HTMLElement).closest<HTMLElement>('[data-text-resize]')?.dataset.textResize as TextResizeHandle | undefined;
    gesture.current = { pointerId: event.pointerId, x: event.clientX, y: event.clientY, scale, text: { ...text }, handle: handle || null };
    event.currentTarget.setPointerCapture(event.pointerId);
  };

  const move = (event: React.PointerEvent<HTMLDivElement>) => {
    const active = gesture.current;
    if (!editable || !active || active.pointerId !== event.pointerId) return;
    const dx = (event.clientX - active.x) / active.scale;
    const dy = (event.clientY - active.y) / active.scale;
    if (active.handle) {
      onResize?.({
        ...resizeTextBox(active.text, active.handle, dx, dy, FRAME_WIDTH_MM, FRAME_HEIGHT_MM),
        anchorTarget: 'frame', anchorPosition: undefined, offsetXmm: undefined, offsetYmm: undefined,
      });
      return;
    }
    let xMm = Math.max(0, Math.min(FRAME_WIDTH_MM, active.text.xMm + dx));
    let yMm = Math.max(0, Math.min(FRAME_HEIGHT_MM, active.text.yMm + dy));
    let closest: { anchor: CardAnchor; distance: number; xMm: number; yMm: number } | undefined;
    for (const anchor of anchors) {
      const point = getCardAnchorMm(anchor, cardWidthMm, cardHeightMm);
      const distance = Math.hypot(xMm - point.xMm, yMm - point.yMm);
      if (distance < 2 && (!closest || distance < closest.distance)) closest = { anchor, distance, ...point };
    }
    if (closest) { xMm = closest.xMm; yMm = closest.yMm; }
    onMove?.(xMm, yMm, closest?.anchor);
  };

  const end = (event: React.PointerEvent<HTMLDivElement>) => {
    if (gesture.current?.pointerId !== event.pointerId) return;
    gesture.current = null;
    if (event.currentTarget.hasPointerCapture(event.pointerId)) event.currentTarget.releasePointerCapture(event.pointerId);
  };

  return (
    <div
      data-text-object="custom-text"
      role="group"
      aria-label={`文字框：${text.content}`}
      tabIndex={editable ? 0 : undefined}
      onFocus={() => { if (editable) onSelect?.(); }}
      onPointerDown={start}
      onPointerMove={move}
      onPointerUp={end}
      onPointerCancel={end}
      onLostPointerCapture={() => { gesture.current = null; }}
      onClick={event => event.stopPropagation()}
      className={`absolute flex items-center justify-center text-center select-none touch-none ${editable ? 'pointer-events-auto cursor-grab active:cursor-grabbing' : 'pointer-events-none'}`}
      style={{
        left: mmToPx(text.xMm, scale), top: mmToPx(text.yMm, scale),
        width: mmToPx(text.widthMm, scale), height: mmToPx(text.heightMm, scale),
        fontSize: mmToPx(text.fontSizeMm, scale), color: text.color, fontFamily: text.font,
        zIndex: text.zIndex || 30, transform: `translate(-50%, -50%) rotate(${text.rotation}deg)`,
        lineHeight: 1.4, overflow: 'visible',
        textShadow: '0 2px 8px rgba(0, 0, 0, 0.9), 0 0 12px rgba(255, 255, 255, 0.4)',
      }}
      title={editable ? '選取文字框，拖曳移動或使用控制點調整尺寸' : undefined}
    >
      <span data-text-content className="block w-full flex-none font-bold uppercase" style={{
        whiteSpace: text.autoWrap ? 'pre-wrap' : 'nowrap',
        overflowWrap: text.autoWrap ? 'anywhere' : 'normal',
        wordBreak: text.autoWrap ? 'break-word' : 'normal',
        letterSpacing: mmToPx(text.letterSpacingMm, scale),
      }}>{text.content}</span>
      {editable && selected && (
        <div data-text-controls className="absolute inset-0 border border-pink-400 pointer-events-none" style={{ textShadow: 'none' }}>
          {handles.map(handle => (
            <button
              key={handle.id}
              type="button"
              data-text-resize={handle.id}
              aria-label={handle.label}
              title={handle.label}
              className="absolute w-6 h-6 -translate-x-1/2 -translate-y-1/2 flex items-center justify-center pointer-events-auto touch-none"
              style={{
                left: handle.left, top: handle.top, cursor: handle.cursor,
                width: Math.max(6, Math.min(24, mmToPx(text.widthMm, scale))),
                height: Math.max(6, Math.min(24, mmToPx(text.heightMm, scale) / (handle.id.length === 1 ? 2 : 1))),
                zIndex: handle.id.length === 1 ? 2 : 1,
              }}
            >
              <span className="w-2.5 h-2.5 rounded-sm border border-pink-500 bg-white shadow-sm" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
};
