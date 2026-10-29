import React, { useState } from 'react';
import {
  CustomizerState,
  CustomizationTier,
  PlacedSticker
} from '../types';
import {
  FRAME_COLOR_OPTIONS,
  BACKGROUND_OPTIONS,
  STICKER_OPTIONS,
  FONT_OPTIONS,
  PRESET_PHOTOCARDS
} from '../data/options';
import { StickerArtwork } from './StickerArtwork';
import { TIER_OPTIONS } from '../data/tiers';
import { MIN_TEXT_BOX_MM } from '../utils/textBox';
import { CARD_SIZE_PRESETS, FRAME_WIDTH_MM, FRAME_HEIGHT_MM, isCardSizeSupported } from '../utils/dimensions';
import {
  ArrowUpRight,
  Copy,
  HandGrabbing,
  Image as ImageIcon,
  Info,
  LockSimple,
  Palette,
  Sparkle,
  TextT,
  Trash,
  UploadSimple,
  Warning
} from '@phosphor-icons/react';
import { focusRing, optionTile } from './ui';

interface CustomizerToolsProps {
  state: CustomizerState;
  onUpdateState: (updates: Partial<CustomizerState>) => void;
  onUpgradeTier: (tier: CustomizationTier) => void;
  selectedStickerId?: string | null;
  onSelectSticker?: (id: string | null) => void;
}

type TabType = 'color' | 'background' | 'photo' | 'stickers' | 'text';

const inputClass = 'mt-1 w-full rounded-lg border border-black/10 bg-white px-3 py-2 text-sm text-ink transition-colors duration-300 ease-out placeholder:text-black/30 focus:border-ink focus:outline-none focus:ring-1 focus:ring-ink';
const rangeClass = 'w-full accent-ink';
const subLabel = 'text-xs font-semibold uppercase tracking-widest text-black/40';

const PanelHeading: React.FC<{ title: string; hint?: React.ReactNode; aside?: React.ReactNode }> = ({ title, hint, aside }) => (
  <div>
    <div className="flex items-center justify-between gap-3">
      <h3 className="text-base font-semibold text-ink">{title}</h3>
      {aside && <span className="shrink-0 text-xs text-black/45">{aside}</span>}
    </div>
    {hint && <p className="mt-1 text-sm text-black/50">{hint}</p>}
  </div>
);

const LockedPanel: React.FC<{ title: string; body: string; cta: string; onUpgrade: () => void }> = ({ title, body, cta, onUpgrade }) => (
  <div className="rounded-2xl border border-black/10 bg-paper p-6 text-center">
    <span className="mx-auto grid h-10 w-10 place-items-center rounded-xl bg-white text-ink">
      <LockSimple weight="bold" className="h-5 w-5" />
    </span>
    <h4 className="mt-4 text-sm font-semibold text-ink">{title}</h4>
    <p className="mt-2 text-sm text-black/55">{body}</p>
    <button
      onClick={onUpgrade}
      className={`group mt-4 inline-flex items-center gap-2 rounded-xl bg-ink px-3 py-2 text-sm font-semibold text-white transition duration-300 ease-out hover:bg-black active:scale-[0.98] ${focusRing}`}
    >
      {cta}
      <ArrowUpRight weight="bold" className="h-4 w-4 transition-transform duration-300 ease-out group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
    </button>
  </div>
);

const RangeRow: React.FC<{ label: string; value: string; children: React.ReactNode }> = ({ label, value, children }) => (
  <div>
    <div className="mb-1 flex justify-between text-xs">
      <span className="text-black/55">{label}</span>
      <span className="font-mono font-semibold text-ink">{value}</span>
    </div>
    {children}
  </div>
);

const Tip: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <p className="flex items-start gap-2 rounded-xl bg-paper p-3 text-xs text-black/55">
    <HandGrabbing weight="duotone" className="h-4 w-4 shrink-0 text-ink" />
    <span>{children}</span>
  </p>
);

export const CustomizerTools: React.FC<CustomizerToolsProps> = ({
  state,
  onUpdateState,
  onUpgradeTier,
  selectedStickerId,
  onSelectSticker
}) => {
  const [activeTab, setActiveTab] = useState<TabType>('color');
  const [stickerFilter, setStickerFilter] = useState<'all' | 'pearl' | 'pastel'>('all');
  const [uploadError, setUploadError] = useState<string | null>(null);

  // Tier guards
  const isBasic = state.tier === 'BASIC';
  const canUseBackgroundAndStickers = TIER_OPTIONS[state.tier].background;

  // Sticker actions
  const handleAddSticker = (stickerOptId: string) => {
    if (!canUseBackgroundAndStickers) return;
    const opt = STICKER_OPTIONS.find(s => s.id === stickerOptId);
    if (!opt) return;

    const newId = `stk-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`;
    const sideMargin = (FRAME_WIDTH_MM - state.cardWidthMm) / 2;
    const topMargin = (FRAME_HEIGHT_MM - state.cardHeightMm) / 2;
    const slots = [
      { xMm: FRAME_WIDTH_MM / 2, yMm: topMargin / 2 },
      { xMm: FRAME_WIDTH_MM / 2, yMm: FRAME_HEIGHT_MM - topMargin / 2 },
      { xMm: sideMargin / 2, yMm: FRAME_HEIGHT_MM * 0.35 },
      { xMm: FRAME_WIDTH_MM - sideMargin / 2, yMm: FRAME_HEIGHT_MM * 0.65 },
      { xMm: FRAME_WIDTH_MM - sideMargin / 2, yMm: FRAME_HEIGHT_MM * 0.35 },
      { xMm: sideMargin / 2, yMm: FRAME_HEIGHT_MM * 0.65 }
    ];
    const position = slots.find(slot => state.stickers.every(sticker => Math.hypot(slot.xMm - sticker.xMm, slot.yMm - sticker.yMm) >= 11))
      || slots[state.stickers.length % slots.length];
    const newSticker: PlacedSticker = {
      id: newId,
      stickerId: opt.id,
      symbol: opt.name,
      xMm: Math.round(position.xMm * 10) / 10,
      yMm: Math.round(position.yMm * 10) / 10,
      widthMm: 7.5,
      heightMm: 7.5,
      rotation: Math.floor(Math.random() * 20) - 10,
      color: '#ffffff',
      zIndex: 20,
      anchorTarget: 'frame'
    };

    onUpdateState({ stickers: [...state.stickers, newSticker] });
    onSelectSticker?.(newId);
  };

  const handleUpdateActiveSticker = (updates: Partial<PlacedSticker>) => {
    if (!canUseBackgroundAndStickers || !selectedStickerId) return;
    onUpdateState({
      stickers: state.stickers.map((s) => (s.id === selectedStickerId ? { ...s, ...updates } : s))
    });
  };

  const handleDuplicateSticker = (id: string) => {
    if (!canUseBackgroundAndStickers) return;
    const target = state.stickers.find(s => s.id === id);
    if (!target) return;
    const newId = `stk-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`;
    const cloned: PlacedSticker = {
      ...target,
      id: newId,
      xMm: Math.min(FRAME_WIDTH_MM, target.xMm + 6),
      yMm: Math.min(FRAME_HEIGHT_MM, target.yMm + 6),
      anchorTarget: 'frame',
      anchorPosition: undefined
    };
    onUpdateState({ stickers: [...state.stickers, cloned] });
    onSelectSticker?.(newId);
  };

  const handleRemoveSticker = (id: string) => {
    if (!canUseBackgroundAndStickers) return;
    onUpdateState({ stickers: state.stickers.filter(s => s.id !== id) });
    if (selectedStickerId === id) {
      onSelectSticker?.(null);
    }
  };

  const activeSticker = state.stickers.find(s => s.id === selectedStickerId) || null;

  const tabs: { id: TabType; label: string; icon: React.ReactNode; locked: boolean }[] = [
    { id: 'color', label: '框體顏色', icon: <Palette weight="duotone" className="h-4 w-4" />, locked: false },
    { id: 'photo', label: '小卡模擬預覽', icon: <ImageIcon weight="duotone" className="h-4 w-4" />, locked: false },
    { id: 'background', label: '主題背景', icon: <Sparkle weight="duotone" className="h-4 w-4" />, locked: !canUseBackgroundAndStickers },
    { id: 'stickers', label: '裝飾貼飾', icon: <img src="/stickers/pearl/sparkle.png" alt="" className="h-4 w-4 object-contain" />, locked: !canUseBackgroundAndStickers },
    { id: 'text', label: '客製文字', icon: <TextT weight="duotone" className="h-4 w-4" />, locked: isBasic },
  ];

  return (
    <div className="flex h-full flex-col overflow-hidden rounded-3xl border border-black/5 bg-white">
      <section className="space-y-3 border-b border-black/5 p-4">
        <div className="flex items-start justify-between gap-2">
          <div>
            <h3 className="text-sm font-semibold text-ink">我的小卡尺寸</h3>
            <p className="mt-1 text-xs text-black/45">卡片固定置中，預覽依實際比例呈現</p>
          </div>
          <span className="shrink-0 rounded-full bg-paper px-2 py-1 font-mono text-xs text-black/50">框體 85 × 115 mm</span>
        </div>
        <div className="grid grid-cols-3 gap-2">
          {CARD_SIZE_PRESETS.map((preset) => (
            <button
              key={preset.label}
              onClick={() => onUpdateState({ cardWidthMm: preset.widthMm, cardHeightMm: preset.heightMm, cardSizePreset: preset.label })}
              aria-pressed={state.cardSizePreset === preset.label}
              className={`${optionTile(state.cardSizePreset === preset.label)} px-2 py-2 text-center font-mono text-xs font-medium text-ink`}
            >
              {preset.label}
            </button>
          ))}
          <button
            onClick={() => onUpdateState({ cardSizePreset: 'custom' })}
            aria-pressed={state.cardSizePreset === 'custom'}
            className={`${optionTile(state.cardSizePreset === 'custom')} px-2 py-2 text-center text-xs font-medium text-ink`}
          >
            自訂尺寸
          </button>
        </div>
        {state.cardSizePreset === 'custom' && <div className="grid grid-cols-2 gap-2">
          <label className="text-xs text-black/55">寬度 (mm)<input type="number" min={50} max={63} step="0.1" value={state.cardWidthMm} onChange={(e) => onUpdateState({ cardWidthMm: Number(e.target.value) })} className={inputClass} /></label>
          <label className="text-xs text-black/55">高度 (mm)<input type="number" min={70} max={90} step="0.1" value={state.cardHeightMm} onChange={(e) => onUpdateState({ cardHeightMm: Number(e.target.value) })} className={inputClass} /></label>
        </div>}
        {!isCardSizeSupported(state.cardWidthMm, state.cardHeightMm) && (
          <p role="alert" className="flex items-start gap-2 rounded-xl border border-amber-200 bg-amber-50 p-3 text-xs text-amber-900">
            <Warning weight="bold" className="h-4 w-4 shrink-0" />
            此尺寸超出 ONLYFRAME 標準框目前建議支援範圍，可能與磁吸區域或裝飾區重疊。
          </p>
        )}
      </section>

      {/* Tab Navigation */}
      <div role="tablist" aria-label="編輯工具" className="flex flex-wrap items-center gap-1 border-b border-black/5 p-2">
        {tabs.map((tab) => {
          const active = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              role="tab"
              aria-selected={active}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 whitespace-nowrap rounded-lg px-3 py-2 text-sm transition-colors duration-300 ease-out ${focusRing} ${
                active ? 'bg-ink font-semibold text-white' : 'font-medium text-black/55 hover:bg-black/5 hover:text-ink'
              }`}
            >
              {tab.icon}
              {tab.label}
              {tab.locked && <LockSimple weight="bold" className={`h-3 w-3 ${active ? 'text-white/60' : 'text-black/30'}`} aria-label="需升級方案" />}
            </button>
          );
        })}
      </div>

      {/* Tab Panels Content */}
      <div role="tabpanel" className="flex-1 space-y-4 overflow-y-auto p-4 sm:p-6">

        {/* FRAME COLOR */}
        {activeTab === 'color' && (
          <div className="space-y-4">
            <PanelHeading title="框體顏色與透光效果" hint="模擬壓克力的透光質感，襯托小卡主角。" aside="純色、半透、曜黑" />

            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
              {FRAME_COLOR_OPTIONS.map((c) => {
                const isSelected = state.frameColorId === c.id;
                return (
                  <button
                    key={c.id}
                    onClick={() => onUpdateState({ frameColorId: c.id })}
                    aria-pressed={isSelected}
                    className={`${optionTile(isSelected)} flex items-center gap-3 p-3`}
                  >
                    <span
                      className="h-8 w-8 shrink-0 rounded-full border border-black/10"
                      style={{ background: c.id === 'clear' ? '#ECE9E4' : c.hex }}
                    />
                    <span className="min-w-0">
                      <span className="block truncate text-sm font-medium text-ink">{c.name.split(' (')[0]}</span>
                      <span className="block truncate text-xs text-black/40">{c.name.match(/\((.*)\)/)?.[1] ?? c.id}</span>
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* PHOTOCARD DEMO & UPLOAD */}
        {activeTab === 'photo' && (
          <div className="space-y-6">
            <PanelHeading
              title="小卡裝框效果模擬"
              aside="純預覽，成品僅含框"
              hint={<>商品實體為<strong className="font-semibold text-ink">壓克力展示框本體</strong>（不含小卡）。切換示範卡片，看看小卡裝進去的樣子。</>}
            />

            {/* Demo cards available for ALL TIERS */}
            <div>
              <p className={subLabel}>示範小卡</p>
              <div className="mt-3 grid grid-cols-2 gap-2">
                {PRESET_PHOTOCARDS.map((preset) => {
                  const isSelected = state.photocardUrl === preset.url && !state.isCustomPhoto;
                  return (
                    <button
                      key={preset.id}
                      onClick={() =>
                        onUpdateState({
                          photocardUrl: preset.url,
                          photocardName: preset.name,
                          isCustomPhoto: false
                        })
                      }
                      aria-pressed={isSelected}
                      className={`${optionTile(isSelected)} flex items-center gap-3 p-2`}
                    >
                      <img src={preset.url} alt={preset.name} className="h-12 w-8 shrink-0 rounded object-cover" />
                      <span className="min-w-0">
                        <span className="block truncate text-sm font-medium text-ink">{preset.name}</span>
                        <span className="mt-0.5 block truncate text-xs text-black/40">{(preset as any).desc || '示範小卡'}</span>
                      </span>
                    </button>
                  );
                })}

                {/* Clear / Empty card slot toggle */}
                <button
                  onClick={() =>
                    onUpdateState({
                      photocardUrl: '',
                      photocardName: '純空框展示 (無卡)',
                      isCustomPhoto: false
                    })
                  }
                  aria-pressed={!state.photocardUrl}
                  className={`${optionTile(!state.photocardUrl)} flex items-center gap-3 p-2`}
                >
                  <span className="h-12 w-8 shrink-0 rounded border border-dashed border-black/20" />
                  <span className="min-w-0">
                    <span className="block truncate text-sm font-medium text-ink">純透明空框</span>
                    <span className="mt-0.5 block text-xs text-black/40">不放卡片，看純框</span>
                  </span>
                </button>
              </div>
            </div>

            {/* Shared photocard preview tool */}
            <div className="border-t border-black/5 pt-6">
              <p className={subLabel}>上傳自己的小卡</p>
              <div className="mt-3">
                {state.isCustomPhoto && state.photocardUrl ? (
                  <div className="flex items-center justify-between gap-3 rounded-xl border border-ink p-3">
                    <div className="flex min-w-0 items-center gap-3">
                      <img src={state.photocardUrl} alt="已上傳小卡" className="h-14 w-10 shrink-0 rounded object-cover" />
                      <div className="min-w-0">
                        <span className="block truncate text-sm font-medium text-ink">{state.photocardName || '自訂小卡'}</span>
                        <span className="text-xs text-black/45">已套用到展示框</span>
                      </div>
                    </div>
                    <button
                      onClick={() => onUpdateState({ photocardUrl: '', photocardName: '純空框展示', isCustomPhoto: false })}
                      className={`inline-flex shrink-0 items-center gap-1 rounded-lg px-2 py-2 text-xs font-semibold text-red-700 transition-colors duration-300 ease-out hover:bg-red-50 ${focusRing}`}
                    >
                      <Trash weight="bold" className="h-4 w-4" />
                      清除
                    </button>
                  </div>
                ) : (
                  <label className={`flex cursor-pointer flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-black/20 bg-paper p-6 text-center transition-colors duration-300 ease-out hover:border-ink focus-within:border-ink focus-within:ring-1 focus-within:ring-ink`}>
                    <input
                      type="file"
                      accept="image/png,image/jpeg,image/webp"
                      className="sr-only"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (!file) return;
                        if (file.size > 5 * 1024 * 1024) {
                          setUploadError('上傳失敗：這張圖片超過 5 MB，請壓縮後再上傳。');
                          e.target.value = '';
                          return;
                        }
                        setUploadError(null);
                        const reader = new FileReader();
                        reader.onload = (ev) => {
                          if (ev.target?.result) {
                            onUpdateState({
                              photocardUrl: ev.target.result as string,
                              photocardName: file.name,
                              isCustomPhoto: true
                            });
                          }
                        };
                        reader.readAsDataURL(file);
                      }}
                    />
                    <span className="grid h-10 w-10 place-items-center rounded-xl bg-white text-ink">
                      <UploadSimple weight="bold" className="h-5 w-5" />
                    </span>
                    <span>
                      <span className="block text-sm font-semibold text-ink">選擇小卡圖片</span>
                      <span className="mt-1 block text-xs text-black/45">PNG、JPG、WEBP，每張最多 5 MB</span>
                    </span>
                  </label>
                )}
                {uploadError && <p role="alert" className="mt-2 text-xs font-medium text-red-700">{uploadError}</p>}
              </div>
            </div>

            <p className="flex items-start gap-2 text-xs text-black/40">
              <Info weight="bold" className="mt-0.5 h-4 w-4 shrink-0" />
              上傳圖片僅用於小卡裝框的即時預覽；網站為畢業專題研究原型。
            </p>
          </div>
        )}

        {/* BACKGROUND SELECTION */}
        {activeTab === 'background' && (
          <div className="space-y-4">
            <PanelHeading title="展示框背景樣式" hint="襯托小卡的主題背景：純色、漸層、雷射 Y2K 與星空。" />

            {!canUseBackgroundAndStickers ? (
              <LockedPanel
                title="PREMIUM 自由客製方案可使用主題背景"
                body="PREMIUM 方案可使用背景與裝飾，包含所有純色、漸層與主題效果。"
                cta="切換至 PREMIUM 自由客製"
                onUpgrade={() => onUpgradeTier('PREMIUM')}
              />
            ) : (
              <div className="grid grid-cols-2 gap-2">
                {BACKGROUND_OPTIONS.map((bg) => {
                  const isSelected = state.backgroundId === bg.id;
                  return (
                    <button
                      key={bg.id}
                      onClick={() => onUpdateState({ backgroundId: bg.id })}
                      aria-pressed={isSelected}
                      className={`${optionTile(isSelected)} p-2`}
                    >
                      <div className={`h-12 w-full rounded-lg border border-black/5 ${bg.id === 'bg-transparent' ? 'bg-paper' : ''} ${bg.cssClass}`} />
                      <span className="mt-2 block truncate px-1 pb-1 text-sm font-medium text-ink">{bg.name}</span>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* DECORATIONS / STICKERS */}
        {activeTab === 'stickers' && (
          <div className="space-y-4">
            <PanelHeading title="加入原創裝飾貼飾" hint="兩套原創圖案，可調整大小、角度與位置。" aside={`已加入 ${state.stickers.length} 枚`} />

            {!canUseBackgroundAndStickers ? (
              <LockedPanel
                title="PREMIUM 自由客製方案可使用自由裝飾"
                body="PREMIUM 方案可使用背景與裝飾，自由調整多個貼飾的位置、大小與旋轉。"
                cta="切換至 PREMIUM 自由客製"
                onUpgrade={() => onUpgradeTier('PREMIUM')}
              />
            ) : (
              <div className="space-y-4">

                {/* Sticker Category Filter */}
                <div className="inline-flex rounded-xl bg-paper p-1" role="group" aria-label="貼飾系列">
                  {[
                    { id: 'all', label: '全部款式' },
                    { id: 'pearl', label: '珠光夢境' },
                    { id: 'pastel', label: '柔彩花語' }
                  ].map((cat) => (
                    <button
                      key={cat.id}
                      onClick={() => setStickerFilter(cat.id as typeof stickerFilter)}
                      aria-pressed={stickerFilter === cat.id}
                      className={`whitespace-nowrap rounded-lg px-3 py-1 text-xs transition-colors duration-300 ease-out ${focusRing} ${
                        stickerFilter === cat.id ? 'bg-white font-semibold text-ink shadow-sm' : 'font-medium text-black/50 hover:text-ink'
                      }`}
                    >
                      {cat.label}
                    </button>
                  ))}
                </div>

                {/* Sticker picker grid */}
                <div>
                  <p className="mb-2 text-xs text-black/45">點一下即可放進展示框</p>
                  <div className="grid max-h-40 grid-cols-6 gap-2 overflow-y-auto rounded-xl bg-paper p-2">
                    {STICKER_OPTIONS
                      .filter((stk) => stickerFilter === 'all' || stk.collection === stickerFilter)
                      .map((stk) => (
                        <button
                          key={stk.id}
                          onClick={() => handleAddSticker(stk.id)}
                          className={`group flex h-12 select-none items-center justify-center rounded-lg border border-transparent bg-white transition duration-300 ease-out hover:border-black/15 active:scale-95 ${focusRing}`}
                          title={`${stk.name}：點擊置入`}
                          aria-label={`加入${stk.name}`}
                        >
                          <StickerArtwork stickerId={stk.id} className="h-8 w-8 transition-transform duration-300 ease-out group-hover:scale-110" />
                        </button>
                      ))}
                  </div>
                </div>

                {/* ACTIVE STICKER INSPECTOR (When a sticker is selected) */}
                {activeSticker ? (
                  <div className="space-y-4 rounded-2xl border border-ink p-4">
                    <div className="flex items-center justify-between gap-3 border-b border-black/5 pb-3">
                      <div className="flex items-center gap-3">
                        <span className="grid h-10 w-10 place-items-center rounded-lg bg-paper p-1">
                          <StickerArtwork stickerId={activeSticker.stickerId} fallback={activeSticker.symbol} className="h-full w-full" />
                        </span>
                        <div>
                          <span className="block text-sm font-semibold text-ink">選取中的貼飾</span>
                          <span className="font-mono text-xs text-black/45">
                            {activeSticker.widthMm.toFixed(1)}mm · {activeSticker.rotation}°
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => handleDuplicateSticker(activeSticker.id)}
                          className={`grid h-8 w-8 place-items-center rounded-lg text-black/60 transition-colors duration-300 ease-out hover:bg-black/5 hover:text-ink ${focusRing}`}
                          title="複製此貼飾"
                          aria-label="複製此貼飾"
                        >
                          <Copy weight="bold" className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleRemoveSticker(activeSticker.id)}
                          className={`grid h-8 w-8 place-items-center rounded-lg text-red-700 transition-colors duration-300 ease-out hover:bg-red-50 ${focusRing}`}
                          title="刪除此貼飾"
                          aria-label="刪除此貼飾"
                        >
                          <Trash weight="bold" className="h-4 w-4" />
                        </button>
                      </div>
                    </div>

                    <RangeRow label="大小" value={`${activeSticker.widthMm.toFixed(1)} mm`}>
                      <input
                        type="range"
                        aria-label="貼飾大小"
                        min={4}
                        max={15}
                        step={0.5}
                        value={activeSticker.widthMm}
                        onChange={(e) => handleUpdateActiveSticker({ widthMm: Number(e.target.value), heightMm: Number(e.target.value) })}
                        className={rangeClass}
                      />
                    </RangeRow>

                    <RangeRow label="旋轉角度" value={`${activeSticker.rotation}°`}>
                      <input
                        type="range"
                        aria-label="貼飾旋轉角度"
                        min={-180}
                        max={180}
                        value={activeSticker.rotation}
                        onChange={(e) => handleUpdateActiveSticker({ rotation: Number(e.target.value) })}
                        className={rangeClass}
                      />
                      <div className="mt-2 grid grid-cols-6 gap-1">
                        {[-90, -45, 0, 45, 90, 180].map((deg) => (
                          <button
                            key={deg}
                            onClick={() => handleUpdateActiveSticker({ rotation: deg })}
                            aria-pressed={activeSticker.rotation === deg}
                            className={`rounded-md py-1 font-mono text-xs transition-colors duration-300 ease-out ${focusRing} ${
                              activeSticker.rotation === deg ? 'bg-ink font-semibold text-white' : 'bg-paper text-black/55 hover:text-ink'
                            }`}
                          >
                            {deg > 0 ? `+${deg}°` : `${deg}°`}
                          </button>
                        ))}
                      </div>
                    </RangeRow>

                    <div className="grid grid-cols-2 gap-3 border-t border-black/5 pt-3">
                      <RangeRow label="水平 X" value={`${activeSticker.xMm.toFixed(1)} mm`}>
                        <input
                          type="range"
                          aria-label="貼飾水平位置"
                          min={0}
                          max={FRAME_WIDTH_MM}
                          step={0.5}
                          value={activeSticker.xMm}
                          onChange={(e) => handleUpdateActiveSticker({ xMm: Number(e.target.value), anchorTarget: 'frame', anchorPosition: undefined })}
                          className={rangeClass}
                        />
                      </RangeRow>
                      <RangeRow label="垂直 Y" value={`${activeSticker.yMm.toFixed(1)} mm`}>
                        <input
                          type="range"
                          aria-label="貼飾垂直位置"
                          min={0}
                          max={FRAME_HEIGHT_MM}
                          step={0.5}
                          value={activeSticker.yMm}
                          onChange={(e) => handleUpdateActiveSticker({ yMm: Number(e.target.value), anchorTarget: 'frame', anchorPosition: undefined })}
                          className={rangeClass}
                        />
                      </RangeRow>
                    </div>

                    <p className="text-xs text-black/40">圖案保留原創配色，可自由調整大小、角度與位置。</p>
                  </div>
                ) : (
                  <p className="rounded-xl border border-dashed border-black/15 p-4 text-center text-sm text-black/50">
                    點選已加入的貼飾，或直接在展示框上點擊，就能調整大小、旋轉與位置。
                  </p>
                )}

                {/* Active Stickers Chips List */}
                {state.stickers.length > 0 && (
                  <div className="border-t border-black/5 pt-4">
                    <p className={subLabel}>已加入的裝飾</p>
                    <div className="mt-3 flex flex-wrap gap-2">
                      {state.stickers.map((stk, idx) => {
                        const isSelected = selectedStickerId === stk.id;
                        return (
                          <div
                            key={stk.id}
                            className={`flex items-center rounded-xl border transition-colors duration-300 ease-out ${
                              isSelected ? 'border-ink bg-white ring-1 ring-ink' : 'border-black/10 bg-white hover:border-black/25'
                            }`}
                          >
                            <button
                              onClick={() => onSelectSticker?.(stk.id)}
                              aria-pressed={isSelected}
                              aria-label={`選取第 ${idx + 1} 個貼飾`}
                              className={`flex items-center gap-2 rounded-l-xl py-1 pl-2 pr-1 ${focusRing}`}
                            >
                              <span className="flex h-6 w-6 items-center justify-center">
                                <StickerArtwork stickerId={stk.stickerId} fallback={stk.symbol} className="h-full w-full" />
                              </span>
                              <span className="font-mono text-xs text-black/45">#{idx + 1}</span>
                            </button>
                            <button
                              onClick={() => handleRemoveSticker(stk.id)}
                              aria-label={`刪除第 ${idx + 1} 個貼飾`}
                              className={`mr-1 grid h-6 w-6 place-items-center rounded-lg text-black/35 transition-colors duration-300 ease-out hover:bg-red-50 hover:text-red-700 ${focusRing}`}
                            >
                              <Trash weight="bold" className="h-3 w-3" />
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                <Tip>在中央展示框上直接按住貼飾，就能拖曳到想要的位置。</Tip>

              </div>
            )}
          </div>
        )}

        {/* CUSTOM TEXT */}
        {activeTab === 'text' && (
          <div className="space-y-6">
            <PanelHeading title="客製刻字與應援金句" hint="本命姓名、出道紀念日、名台詞，或任何想展示的一句話。" />

            {isBasic ? (
              <LockedPanel
                title="CUSTOM 方案以上可使用文字"
                body="CUSTOM 文字客製與 PREMIUM 自由客製可編輯內容、字體與文字位置。"
                cta="切換至 CUSTOM 文字客製"
                onUpgrade={() => onUpgradeTier('CUSTOM')}
              />
            ) : (
              <div className="space-y-6">
                <label className="block text-sm font-medium text-ink">
                  文字內容
                  <input
                    type="text"
                    aria-label="文字內容"
                    value={state.text.content}
                    onChange={(e) =>
                      onUpdateState({
                        text: { ...state.text, content: e.target.value }
                      })
                    }
                    placeholder="例：LOVE WONYOUNG 2026.09.20"
                    maxLength={30}
                    className={inputClass}
                  />
                  <span className="mt-1 block text-right font-mono text-xs font-normal text-black/35">{state.text.content.length}/30</span>
                </label>

                {/* Font Choices */}
                <div>
                  <p className={subLabel}>字型</p>
                  <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-2">
                    {FONT_OPTIONS.map((f) => {
                      const isSelected = state.text.font === f.id;
                      return (
                        <button
                          key={f.id}
                          onClick={() =>
                            onUpdateState({
                              text: { ...state.text, font: f.id, isSpecialFont: f.isSpecial }
                            })
                          }
                          aria-pressed={isSelected}
                          className={`${optionTile(isSelected)} p-3`}
                        >
                          <span className="block text-sm font-medium text-ink" style={{ fontFamily: f.id }}>{f.name}</span>
                          <span className="mt-0.5 block text-xs text-black/40">{f.isSpecial ? '特殊設計字體' : '基本字體'}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Text Color Swatches */}
                <div>
                  <p className={subLabel}>文字顏色</p>
                  <div className="mt-3 flex items-center gap-3" role="radiogroup" aria-label="文字顏色">
                    {[
                      { hex: '#ffffff', name: '純白' },
                      { hex: '#12141a', name: '曜石黑' },
                      { hex: '#fda4af', name: '櫻粉' },
                      { hex: '#fcd34d', name: '香檳金' },
                      { hex: '#67e8f9', name: '冰川藍' },
                      { hex: '#c084fc', name: '電馭紫' }
                    ].map((c) => (
                      <button
                        key={c.hex}
                        role="radio"
                        aria-checked={state.text.color === c.hex}
                        aria-label={c.name}
                        onClick={() =>
                          onUpdateState({
                            text: { ...state.text, color: c.hex }
                          })
                        }
                        className={`h-8 w-8 rounded-full border border-black/15 transition-transform duration-300 ease-out ${focusRing} ${
                          state.text.color === c.hex ? 'ring-2 ring-ink ring-offset-2' : 'hover:scale-110'
                        }`}
                        style={{ background: c.hex }}
                        title={c.name}
                      />
                    ))}
                  </div>
                </div>

                {/* Quick Position Presets */}
                <div>
                  <div className="flex items-center justify-between">
                    <p className={subLabel}>常用位置</p>
                    <span className="text-xs text-black/40">也可以在展示框直接拖曳</span>
                  </div>
                  <div className="mt-3 grid grid-cols-2 gap-2">
                    {[
                      { label: '底部中央銘牌', note: '推薦', xMm: 42.5, yMm: 98.9, rot: 0 },
                      { label: '框體頂部抬頭', note: '', xMm: 42.5, yMm: 13.8, rot: 0 }
                    ].map((pos) => {
                      const isSelected = state.text.xMm === pos.xMm && state.text.yMm === pos.yMm;
                      return (
                        <button
                          key={pos.label}
                          onClick={() =>
                            onUpdateState({
                              text: { ...state.text, xMm: pos.xMm, yMm: pos.yMm, rotation: pos.rot, anchorTarget: 'frame', anchorPosition: undefined }
                            })
                          }
                          aria-pressed={isSelected}
                          className={`${optionTile(isSelected)} flex items-center justify-between gap-2 px-3 py-2 text-sm font-medium text-ink`}
                        >
                          {pos.label}
                          {pos.note && <span className="rounded-full bg-brand-soft px-2 text-xs font-semibold text-brand-deep">{pos.note}</span>}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Exact Position Sliders */}
                <div className="space-y-4 rounded-2xl bg-paper p-4">
                  <p className={subLabel}>精確調整</p>
                  <div className="grid grid-cols-2 gap-4">
                    <RangeRow label="水平 X" value={`${state.text.xMm.toFixed(1)} mm`}>
                      <input
                        type="range"
                        aria-label="文字水平位置"
                        min={0}
                        max={FRAME_WIDTH_MM}
                        step={0.5}
                        value={state.text.xMm}
                        onChange={(e) =>
                          onUpdateState({
                            text: { ...state.text, xMm: Number(e.target.value), anchorTarget: 'frame', anchorPosition: undefined }
                          })
                        }
                        className={rangeClass}
                      />
                    </RangeRow>
                    <RangeRow label="垂直 Y" value={`${state.text.yMm.toFixed(1)} mm`}>
                      <input
                        type="range"
                        aria-label="文字垂直位置"
                        min={0}
                        max={FRAME_HEIGHT_MM}
                        step={0.5}
                        value={state.text.yMm}
                        onChange={(e) =>
                          onUpdateState({
                            text: { ...state.text, yMm: Number(e.target.value), anchorTarget: 'frame', anchorPosition: undefined }
                          })
                        }
                        className={rangeClass}
                      />
                    </RangeRow>
                    <RangeRow label="字體大小" value={`${state.text.fontSizeMm.toFixed(1)} mm`}>
                      <input
                        type="range"
                        aria-label="字體大小"
                        min={2}
                        max={12}
                        step={0.25}
                        value={state.text.fontSizeMm}
                        onChange={(e) =>
                          onUpdateState({
                            text: { ...state.text, fontSizeMm: Number(e.target.value) }
                          })
                        }
                        className={rangeClass}
                      />
                    </RangeRow>
                    <RangeRow label="旋轉" value={`${state.text.rotation}°`}>
                      <input
                        type="range"
                        aria-label="旋轉文字"
                        min={-180}
                        max={180}
                        value={state.text.rotation}
                        onChange={(e) =>
                          onUpdateState({
                            text: { ...state.text, rotation: Number(e.target.value) }
                          })
                        }
                        className={rangeClass}
                      />
                    </RangeRow>
                  </div>
                  <RangeRow label="字距" value={`${(state.text.letterSpacingMm ?? 0.45).toFixed(2)} mm`}>
                    <input type="range" aria-label="字距" min={0} max={3} step={0.05} value={state.text.letterSpacingMm ?? 0.45}
                      onChange={e => onUpdateState({ text: { ...state.text, letterSpacingMm: Number(e.target.value) } })}
                      className={rangeClass} />
                  </RangeRow>
                </div>

                {/* Text box size */}
                <div className="space-y-3 rounded-2xl bg-paper p-4">
                  <p className={subLabel}>文字框尺寸</p>
                  <div className="grid grid-cols-2 gap-3">
                    <label className="text-xs text-black/55">
                      寬度 (mm)
                      <input type="number" aria-label="文字框寬度" min={MIN_TEXT_BOX_MM} max={FRAME_WIDTH_MM} step={0.5} value={Number(state.text.widthMm.toFixed(1))}
                        onChange={e => { if (e.target.value) onUpdateState({ text: { ...state.text, widthMm: Math.max(MIN_TEXT_BOX_MM, Math.min(FRAME_WIDTH_MM, Number(e.target.value))) } }); }}
                        className={inputClass} />
                    </label>
                    <label className="text-xs text-black/55">
                      高度 (mm)
                      <input type="number" aria-label="文字框高度" min={MIN_TEXT_BOX_MM} max={FRAME_HEIGHT_MM} step={0.5} value={Number(state.text.heightMm.toFixed(1))}
                        onChange={e => { if (e.target.value) onUpdateState({ text: { ...state.text, heightMm: Math.max(MIN_TEXT_BOX_MM, Math.min(FRAME_HEIGHT_MM, Number(e.target.value))) } }); }}
                        className={inputClass} />
                    </label>
                  </div>
                  <label className="flex cursor-pointer items-center justify-between gap-3 text-sm font-medium text-ink">
                    <span>自動換行</span>
                    <input type="checkbox" role="switch" aria-label="自動換行" checked={state.text.autoWrap ?? false}
                      onChange={e => onUpdateState({ text: { ...state.text, autoWrap: e.target.checked } })}
                      className="peer sr-only" />
                    <span aria-hidden="true" className="relative h-6 w-10 rounded-full bg-black/15 transition-colors duration-300 ease-out after:absolute after:left-1 after:top-1 after:h-4 after:w-4 after:rounded-full after:bg-white after:transition-transform after:duration-300 after:ease-out peer-checked:bg-ink peer-checked:after:translate-x-4 peer-focus-visible:ring-2 peer-focus-visible:ring-ink peer-focus-visible:ring-offset-2" />
                  </label>
                  <p className="text-xs text-black/45">
                    {state.text.autoWrap ? '已開啟：文字依框寬自動換行。' : '單行模式：文字不因框寬不足而換行。'}
                    選取展示框上的文字框後，可拖曳控制點調整尺寸；框尺寸與字體大小分開控制。
                  </p>
                </div>

                <Tip>你也可以在中央展示框上，直接按住文字拖曳到任何位置。</Tip>

              </div>
            )}
          </div>
        )}

      </div>
    </div>
  );
};
