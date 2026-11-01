import React, { useEffect, useState } from 'react';
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
  Palette, 
  Sparkles, 
  Type, 
  Image as ImageIcon, 
  Lock, 
  Trash2, 
  ArrowUpRight,
  Copy,
  RotateCw,
  Maximize2,
  SlidersHorizontal,
  UploadCloud
} from 'lucide-react';

interface CustomizerToolsProps {
  state: CustomizerState;
  onUpdateState: (updates: Partial<CustomizerState>) => void;
  onUpgradeTier: (tier: CustomizationTier) => void;
  isTextSelected?: boolean;
  onSelectText?: () => void;
  selectedStickerId?: string | null;
  onSelectSticker?: (id: string | null) => void;
}

type TabType = 'color' | 'background' | 'photo' | 'stickers' | 'text';

export const CustomizerTools: React.FC<CustomizerToolsProps> = ({
  state,
  onUpdateState,
  onUpgradeTier,
  selectedStickerId,
  isTextSelected,
  onSelectText,
  onSelectSticker
}) => {
  const [activeTab, setActiveTab] = useState<TabType>('photo');
  const [stickerFilter, setStickerFilter] = useState<'all' | 'pearl' | 'pastel'>('all');

  useEffect(() => {
    if (selectedStickerId) setActiveTab('stickers');
    else if (isTextSelected) setActiveTab('text');
  }, [selectedStickerId, isTextSelected]);

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

  return (
    <div className="tool-panel flex flex-col bg-white rounded-2xl border border-stone-200 overflow-hidden shadow-sm">

      
      <div className="tool-panel-heading"><span className="eyebrow">MAKE IT YOURS</span><span>{state.tier} 工具</span></div>
      <div className="tool-tabs" role="tablist" aria-label="設計工具">
        {([
          ['photo', '小卡', ImageIcon, false], ['color', '框色', Palette, false],
          ['text', '文字', Type, isBasic], ['background', '背景', Sparkles, !canUseBackgroundAndStickers],
          ['stickers', '貼飾', SlidersHorizontal, !canUseBackgroundAndStickers],
        ] as const).map(([id, label, Icon, locked]) => <button key={id} id={`tab-${id}`} role="tab" aria-selected={activeTab === id} aria-controls={`panel-${id}`} onClick={() => setActiveTab(id)} className={activeTab === id ? 'active' : ''}><Icon size={17} /><span>{label}{locked && <Lock size={10} />}</span></button>)}
      </div>
      {/* Tab Panels Content */}
      <div id={`panel-${activeTab}`} role="tabpanel" aria-labelledby={`tab-${activeTab}`} className="tool-content p-4 sm:p-5 space-y-4">
        
        {/* FRAME COLOR */}
        {activeTab === 'color' && (
          <div className="space-y-3">
            <div>
              <h3 className="text-sm font-bold text-ink flex items-center justify-between">
                <span>選擇框體顏色與透光效果</span>
                <span className="text-xs text-stone-600 font-normal">純色/半透/曜黑</span>
              </h3>
              <p className="text-xs text-stone-600 mt-0.5">
                切換框色，找到適合收藏的搭配。效果僅供示意。
              </p>
            </div>

            <p className="selected-color-name" aria-live="polite">{FRAME_COLOR_OPTIONS.find(c => c.id === state.frameColorId)?.name.split(' (')[0]}</p>
            <div className="frame-swatches">{FRAME_COLOR_OPTIONS.map(c => <button key={c.id} onClick={() => onUpdateState({ frameColorId: c.id })} aria-label={c.name.split(' (')[0]} aria-pressed={state.frameColorId === c.id} title={c.name.split(' (')[0]} className={state.frameColorId === c.id ? 'selected' : ''}><span style={{ background: c.id === 'clear' ? 'linear-gradient(135deg,#fff,#dad7d2)' : c.hex }} /></button>)}</div>
            <p className="text-xs text-stone-600">點選色票，即時比較框體外觀。</p>
          </div>
        )}

        {/* 3. PHOTOCARD DEMO & UPLOAD */}
        {activeTab === 'photo' && (
          <div className="space-y-4">
      <details className="size-settings">
<summary>小卡尺寸 · {state.cardWidthMm} × {state.cardHeightMm} mm <span>調整尺寸</span></summary>
        <div className="flex items-center justify-between gap-2">
          <div><h3 className="text-sm font-bold text-ink">我的小卡尺寸</h3><p className="text-[11px] text-stone-600 mt-0.5">卡片固定置中，預覽依實際比例呈現</p></div>
          <span className="text-[11px] text-stone-600 font-mono">框體 85 × 115 mm</span>
        </div>
        <div className="grid grid-cols-2 gap-1.5">
          {CARD_SIZE_PRESETS.map((preset) => <button key={preset.label} onClick={() => onUpdateState({ cardWidthMm: preset.widthMm, cardHeightMm: preset.heightMm, cardSizePreset: preset.label })} className={`px-2 py-1.5 rounded-lg border text-[11px] font-medium transition-colors ${state.cardSizePreset === preset.label ? 'border-pink-400 bg-pink-500/15 text-brand-deep' : 'border-stone-200 bg-stone-50 text-stone-700 hover:border-stone-200/25'}`}>{preset.label}</button>)}
        </div>
        <button onClick={() => onUpdateState({ cardSizePreset: 'custom' })} className={`w-full px-2 py-1.5 rounded-lg border text-[11px] text-left ${state.cardSizePreset === 'custom' ? 'border-pink-400 bg-pink-500/15 text-brand-deep' : 'border-stone-200 text-stone-700'}`}>自訂尺寸</button>
        {state.cardSizePreset === 'custom' && <div className="grid grid-cols-2 gap-2">
          <label className="text-[11px] text-stone-600">寬度 (mm)<input type="number" min={50} max={63} step="0.1" value={state.cardWidthMm} onChange={(e) => onUpdateState({ cardWidthMm: Number(e.target.value) })} className="mt-1 w-full rounded-lg border border-stone-200 bg-stone-100 px-2 py-1.5 text-xs text-ink" /></label>
          <label className="text-[11px] text-stone-600">高度 (mm)<input type="number" min={70} max={90} step="0.1" value={state.cardHeightMm} onChange={(e) => onUpdateState({ cardHeightMm: Number(e.target.value) })} className="mt-1 w-full rounded-lg border border-stone-200 bg-stone-100 px-2 py-1.5 text-xs text-ink" /></label>
        </div>}
        {!isCardSizeSupported(state.cardWidthMm, state.cardHeightMm) && <p className="text-[11px] leading-relaxed text-amber-800 bg-amber-400/10 border border-amber-300/20 rounded-lg px-2 py-1.5">此尺寸超出 ONLYFRAME 標準框目前建議支援範圍，可能與磁吸區域或裝飾區重疊。</p>}
      </details>
            <div>
              <h3 className="text-sm font-bold text-ink flex items-center justify-between">
                <span>小卡裝框效果模擬</span>
                <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-stone-100 text-stone-700">
                  三種方案共用
                </span>
              </h3>
              <p className="text-xs text-stone-600 mt-0.5 leading-relaxed">
                選擇示範小卡或上傳自己的圖片，看看裝框後的樣子。小卡僅供預覽，本網站為研究原型，非實際販售。
              </p>
            </div>

            {/* Section A: Demo cards available for ALL TIERS */}
            <div className="space-y-2">
              <span className="text-xs font-semibold text-stone-700 block">
                選擇示範小卡風格（所有方案皆可試看）：
              </span>
              <div className="grid grid-cols-2 gap-2">
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
                      className={`p-2.5 rounded-xl border flex items-center gap-2.5 text-left transition-all ${
                        isSelected
                          ? 'border-pink-500 bg-pink-500/10 shadow-md ring-1 ring-pink-500/50'
                          : 'border-stone-200 bg-stone-50 hover:border-stone-200'
                      }`}
                    >
                      <img
                        src={preset.url}
                        alt={preset.name}
                        className="w-8 h-12 object-cover rounded-md border border-stone-200 flex-shrink-0"
                      />
                      <div className="min-w-0">
                        <span className="text-xs font-bold text-stone-800 block truncate">
                          {preset.name}
                        </span>
                        <span className="text-[11px] text-brand-deep truncate block mt-0.5">
                          {(preset as any).desc || '示範小卡'}
                        </span>
                      </div>
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
                  className={`p-2.5 rounded-xl border flex items-center gap-2.5 text-left transition-all ${
                    !state.photocardUrl
                      ? 'border-pink-500 bg-pink-500/10 shadow-md ring-1 ring-pink-500/50'
                      : 'border-stone-200 bg-stone-50 hover:border-stone-200'
                  }`}
                >
                  <div className="w-8 h-12 rounded-md border border-dashed border-stone-200/30 flex items-center justify-center text-slate-500 text-xs flex-shrink-0">
                    🔲
                  </div>
                  <div className="min-w-0">
                    <span className="text-xs font-bold text-stone-800 block truncate">
                      純透明空框
                    </span>
                    <span className="text-[11px] text-stone-600 block mt-0.5">
                      不放卡片，看純框
                    </span>
                  </div>
                </button>
              </div>
            </div>

            {/* Shared photocard preview tool */}
            <div className="pt-2 border-t border-stone-200">
              <span className="text-xs font-semibold text-stone-700 block mb-2">
                上傳自己的小卡圖片（三種方案皆可預覽）：
              </span>

              <div className="space-y-3">
                  {state.isCustomPhoto && state.photocardUrl ? (
                    <div className="flex items-center justify-between p-3 rounded-xl bg-stone-50 border border-pink-500/40">
                      <div className="flex items-center gap-3 min-w-0">
                        <img 
                          src={state.photocardUrl} 
                          alt="已上傳小卡" 
                          className="w-10 h-14 object-cover rounded-md border border-stone-200 flex-shrink-0" 
                        />
                        <div className="min-w-0">
                          <span className="text-xs font-bold text-ink block truncate">
                            {state.photocardName || '自訂小卡'}
                          </span>
                          <span className="text-[11px] text-brand font-mono">已成功套用</span>
                        </div>
                      </div>
                      <button
                        onClick={() => onUpdateState({ photocardUrl: '', photocardName: '純空框展示', isCustomPhoto: false })}
                        className="p-2 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/30 text-xs flex items-center gap-1 transition-all"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>清除</span>
                      </button>
                    </div>
                  ) : (
                    <label className="border-2 border-dashed border-stone-200 hover:border-pink-400/50 rounded-2xl p-5 text-center flex flex-col items-center justify-center gap-2 cursor-pointer bg-stone-50 hover:bg-pink-500/5 transition-all">
                      <input
                        type="file"
                        accept="image/png,image/jpeg,image/webp"
                        className="hidden"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (!file) return;
                          if (file.size > 5 * 1024 * 1024) {
                            alert('單張小卡圖片最多 5 MB，請壓縮後再上傳。');
                            e.target.value = '';
                            return;
                          }
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
                      <div className="w-10 h-10 rounded-xl bg-pink-500/10 border border-pink-500/20 flex items-center justify-center text-brand">
                        <UploadCloud className="w-5 h-5" />
                      </div>
                      <div>
                        <span className="text-xs font-semibold text-stone-800 block">點擊上傳個人小卡圖片</span>
                        <span className="text-[11px] text-slate-500 block mt-0.5">支援 PNG, JPG, WEBP；每張最多 5 MB（1:1 裝框模擬）</span>
                      </div>
                    </label>
                  )}
              </div>
            </div>

            <div className="p-2.5 rounded-xl bg-stone-50 border border-stone-200 text-[11px] text-stone-600 flex items-start gap-1.5">
              <span className="text-amber-400">⚠️</span>
              <span>上傳圖片僅用於小卡裝框的即時預覽；網站為畢業專題研究 Prototype。</span>
            </div>

          </div>
        )}

        {/* 4. BACKGROUND SELECTION */}
        {activeTab === 'background' && (
          <div className="space-y-3">
            <div>
              <h3 className="text-sm font-bold text-ink">展示框背景樣式</h3>
              <p className="text-xs text-stone-600 mt-0.5">
                襯托小卡的主題背景（純色、漸層、雷射 Y2K、星塵星空）
              </p>
            </div>

            {!canUseBackgroundAndStickers ? (
              <div className="p-4 rounded-xl bg-pink-500/10 border border-pink-500/30 text-center space-y-2">
                <Lock className="w-6 h-6 text-brand mx-auto" />
                <h4 className="text-xs font-bold text-brand-deep">PREMIUM 自由客製方案可使用主題背景</h4>
                <p className="text-xs text-stone-700 leading-relaxed">
                  PREMIUM 方案可使用背景與裝飾，包含所有既有純色、漸層與主題效果。
                </p>
                <button
                  onClick={() => onUpgradeTier('PREMIUM')}
                  className="mt-2 inline-flex items-center gap-1 px-4 py-1.5 rounded-lg text-xs font-semibold bg-brand hover:bg-brand-deep text-white shadow-md transition-all"
                >
                  切換至 PREMIUM 自由客製
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-2.5">
                {BACKGROUND_OPTIONS.map((bg) => {
                  const isSelected = state.backgroundId === bg.id;
                  return (
                    <button
                      key={bg.id}
                      onClick={() => onUpdateState({ backgroundId: bg.id })}
                      className={`p-3 rounded-xl border text-left transition-all ${
                        isSelected
                          ? 'border-pink-500 bg-pink-500/10 shadow-md'
                          : 'border-stone-200 bg-stone-50 hover:border-stone-200'
                      }`}
                    >
                      <div className={`w-full h-12 rounded-lg border border-stone-200 mb-2 ${bg.cssClass}`} />
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-stone-800 block truncate">
                          {bg.name}
                        </span>
                      </div>
                      <span className="text-[11px] text-brand mt-0.5 block">
                        PREMIUM 主題背景
                      </span>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* 5. DECORATIONS / STICKERS */}
        {activeTab === 'stickers' && (
          <div className="space-y-4">
            <div>
              <h3 className="text-sm font-bold text-ink flex items-center justify-between">
                <span>加入原創裝飾貼飾</span>
                <span className="text-xs text-stone-600 font-normal">
                  已加入: {state.stickers.length} 枚
                </span>
              </h3>
              <p className="text-xs text-stone-600 mt-0.5">
                從兩套原創圖案挑選，可調整大小、旋轉角度與位置
              </p>
            </div>

            {!canUseBackgroundAndStickers ? (
              <div className="p-4 rounded-xl bg-pink-500/10 border border-pink-500/30 text-center space-y-2">
                <Lock className="w-6 h-6 text-brand mx-auto" />
                <h4 className="text-xs font-bold text-brand-deep">PREMIUM 自由客製方案可使用自由裝飾</h4>
                <p className="text-xs text-stone-700 leading-relaxed">
                  PREMIUM 方案可使用背景與裝飾，自由調整多個貼飾的位置、大小與旋轉。
                </p>
                <button
                  onClick={() => onUpgradeTier('PREMIUM')}
                  className="mt-2 inline-flex items-center gap-1 px-4 py-1.5 rounded-lg text-xs font-semibold bg-brand hover:bg-brand-deep text-white shadow-md transition-all"
                >
                  切換至 PREMIUM 自由客製
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                
                {/* Sticker Category Filter */}
                <div className="flex items-center gap-1 overflow-x-auto pb-1 text-[11px]">
                  {[
                    { id: 'all', label: '全部款式' },
                    { id: 'pearl', label: '珠光夢境' },
                    { id: 'pastel', label: '柔彩花語' }
                  ].map((cat) => (
                    <button
                      key={cat.id}
                      onClick={() => setStickerFilter(cat.id as typeof stickerFilter)}
                      className={`px-2.5 py-1 rounded-lg transition-colors whitespace-nowrap font-medium ${
                        stickerFilter === cat.id
                          ? 'bg-brand text-white font-bold'
                          : 'bg-stone-100 text-stone-600 hover:bg-stone-100 hover:text-ink'
                      }`}
                    >
                      {cat.label}
                    </button>
                  ))}
                </div>

                {/* Sticker picker grid */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-xs font-semibold text-stone-700">
                      點擊即可置入展示框：
                    </span>
                  </div>

                  <div className="grid grid-cols-4 sm:grid-cols-6 lg:grid-cols-5 gap-2 max-h-40 overflow-y-auto p-1.5 bg-stone-100 rounded-xl border border-stone-200">
                    {STICKER_OPTIONS
                      .filter((stk) => stickerFilter === 'all' || stk.collection === stickerFilter)
                      .map((stk) => (
                        <button
                          key={stk.id}
                          onClick={() => handleAddSticker(stk.id)}
                          className="h-11 rounded-xl border border-stone-200 bg-stone-50 hover:border-pink-400 hover:bg-pink-500/20 flex items-center justify-center transition-all active:scale-90 group select-none"
                          title={`${stk.name} - 點擊置入`}
                          aria-label={`加入${stk.name}`}
                        >
                          <StickerArtwork stickerId={stk.id} className="w-9 h-9 group-hover:scale-110 transition-transform" />
                        </button>
                      ))}
                  </div>
                </div>

                {/* ACTIVE STICKER INSPECTOR (When a sticker is selected) */}
                {activeSticker ? (
                  <div className="p-3.5 rounded-2xl bg-brand-soft/50 border border-pink-500/40 space-y-3">
                    <div className="flex items-center justify-between pb-2 border-b border-pink-500/20">
                      <div className="flex items-center gap-2">
                        <span className="p-1 bg-stone-100 rounded-lg border border-pink-500/30 flex items-center justify-center w-[38px] h-[38px]">
                          <StickerArtwork stickerId={activeSticker.stickerId} fallback={activeSticker.symbol} className="w-full h-full" />
                        </span>
                        <div>
                          <span className="text-xs font-bold text-ink block">
                            自訂選中貼飾
                          </span>
                          <span className="text-[11px] text-brand font-mono">
                            大小 {activeSticker.widthMm.toFixed(1)}mm ‧ 角度 {activeSticker.rotation}°
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => handleDuplicateSticker(activeSticker.id)}
                          className="p-1.5 rounded-lg bg-stone-100 hover:bg-stone-200 text-stone-800 text-xs flex items-center gap-1"
                          title="複製此貼飾"
                        >
                          <Copy className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleRemoveSticker(activeSticker.id)}
                          className="p-1.5 rounded-lg bg-rose-500/20 hover:bg-rose-500/30 text-rose-700 text-xs flex items-center gap-1"
                          title="刪除此貼飾"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    {/* Size Slider */}
                    <div>
                      <div className="flex justify-between text-xs mb-1">
                        <span className="text-stone-700 flex items-center gap-1">
                          <Maximize2 className="w-3 h-3 text-brand" />
                          自訂大小
                        </span>
                        <span className="font-mono text-brand-deep font-bold">{activeSticker.widthMm.toFixed(1)} mm</span>
                      </div>
                      <input
                        type="range"
                        aria-label="貼飾大小"
                        min={4}
                        max={15}
                        step={0.5}
                        value={activeSticker.widthMm}
                        onChange={(e) => handleUpdateActiveSticker({ widthMm: Number(e.target.value), heightMm: Number(e.target.value) })}
                        className="w-full accent-pink-500"
                      />
                    </div>

                    {/* Rotation Slider & Quick Buttons */}
                    <div>
                      <div className="flex justify-between text-xs mb-1">
                        <span className="text-stone-700 flex items-center gap-1">
                          <RotateCw className="w-3 h-3 text-brand" />
                          旋轉角度
                        </span>
                        <span className="font-mono text-brand-deep font-bold">{activeSticker.rotation}°</span>
                      </div>
                      <input
                        type="range"
                        aria-label="貼飾旋轉"
                        min={-180}
                        max={180}
                        value={activeSticker.rotation}
                        onChange={(e) => handleUpdateActiveSticker({ rotation: Number(e.target.value) })}
                        className="w-full accent-pink-500"
                      />
                      <div className="flex items-center justify-between gap-1 pt-1.5">
                        {[-90, -45, 0, 45, 90, 180].map((deg) => (
                          <button
                            key={deg}
                            onClick={() => handleUpdateActiveSticker({ rotation: deg })}
                            className={`px-2 py-0.5 rounded text-[11px] font-mono transition-colors ${
                              activeSticker.rotation === deg
                                ? 'bg-brand text-white font-bold'
                                : 'bg-stone-100 text-stone-600 hover:bg-stone-100'
                            }`}
                          >
                            {deg > 0 ? `+${deg}°` : `${deg}°`}
                          </button>
                        ))}
                      </div>
                    </div>

                    <p className="text-[11px] text-stone-600">圖案保留原創配色，可自由調整大小、角度與位置。</p>

                    {/* Precise Coordinate Controls */}
                    <div className="grid grid-cols-2 gap-3 pt-1 border-t border-stone-200 text-[11px]">
                      <div>
                        <div className="flex justify-between text-stone-600 mb-0.5">
                          <span>水平 X</span>
                          <span className="font-mono text-stone-800">{activeSticker.xMm.toFixed(1)} mm</span>
                        </div>
                        <input
                          type="range"
                          aria-label="貼飾水平位置"
                          min={0}
                          max={FRAME_WIDTH_MM}
                          step={0.5}
                          value={activeSticker.xMm}
                          onChange={(e) => handleUpdateActiveSticker({ xMm: Number(e.target.value), anchorTarget: 'frame', anchorPosition: undefined })}
                          className="w-full accent-pink-500"
                        />
                      </div>
                      <div>
                        <div className="flex justify-between text-stone-600 mb-0.5">
                          <span>垂直 Y</span>
                          <span className="font-mono text-stone-800">{activeSticker.yMm.toFixed(1)} mm</span>
                        </div>
                        <input
                          type="range"
                          aria-label="貼飾垂直位置"
                          min={0}
                          max={FRAME_HEIGHT_MM}
                          step={0.5}
                          value={activeSticker.yMm}
                          onChange={(e) => handleUpdateActiveSticker({ yMm: Number(e.target.value), anchorTarget: 'frame', anchorPosition: undefined })}
                          className="w-full accent-pink-500"
                        />
                      </div>
                    </div>

                  </div>
                ) : (
                  <div className="p-3 rounded-xl bg-stone-50 border border-stone-200 text-center text-xs text-stone-600">
                    點選下方任一已加入的貼飾（或在中央展示框直接點擊），即可調整<strong>大小、旋轉與位置</strong>。
                  </div>
                )}

                {/* Active Stickers Chips List */}
                {state.stickers.length > 0 && (
                  <div className="space-y-2 pt-1 border-t border-stone-200">
                    <span className="text-xs font-semibold text-stone-600 block">
                      已加入的裝飾清單 (點擊選取編輯):
                    </span>
                    <div className="flex flex-wrap gap-2">
                      {state.stickers.map((stk, idx) => {
                        const isSelected = selectedStickerId === stk.id;
                        return (
                          <div
                            key={stk.id}
                            onClick={() => onSelectSticker?.(stk.id)}
                            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs cursor-pointer transition-all ${
                              isSelected
                                ? 'bg-pink-500/20 border-pink-400 text-brand-deep shadow-md ring-1 ring-pink-400'
                                : 'bg-stone-100 border-stone-200 text-stone-700 hover:bg-stone-100 hover:border-stone-200'
                            }`}
                          >
                            <span className="w-5 h-5 flex items-center justify-center">
                              <StickerArtwork stickerId={stk.stickerId} fallback={stk.symbol} className="w-full h-full" />
                            </span>
                            <span className="text-[11px] text-stone-600 font-mono">#{idx + 1}</span>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleRemoveSticker(stk.id);
                              }}
                              className="text-stone-600 hover:text-rose-400 ml-1 p-0.5"
                            >
                              <Trash2 className="w-3 h-3" />
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                <p className="text-[11px] text-emerald-800 bg-emerald-500/10 border border-emerald-500/20 p-2 rounded-lg leading-relaxed">
                  💡 <strong>直覺互動提示</strong>：在中央壓克力展示框上，直接按住貼飾即可任意拖曳移動擺放位置！
                </p>

              </div>
            )}
          </div>
        )}

        {/* 6. CUSTOM TEXT */}
        {activeTab === 'text' && (
          <div className="space-y-4">
            <div>
              <h3 className="text-sm font-bold text-ink">加入你的專屬文字</h3>
              <p className="text-xs text-stone-600 mt-0.5">
                輸入姓名、紀念日或一句喜歡的話，點選文字後調整細節。
              </p>
            </div>

            {isBasic ? (
              <div className="p-4 rounded-xl bg-pink-500/10 border border-pink-500/30 text-center space-y-2">
                <Lock className="w-6 h-6 text-brand mx-auto" />
                <h4 className="text-xs font-bold text-brand-deep">CUSTOM 方案以上可使用文字</h4>
                <p className="text-xs text-stone-700 leading-relaxed">
                  CUSTOM 文字客製與 PREMIUM 自由客製可編輯內容、字體與文字位置。
                </p>
                <button
                  onClick={() => onUpgradeTier('CUSTOM')}
                  className="mt-2 inline-flex items-center gap-1 px-4 py-1.5 rounded-lg text-xs font-semibold bg-brand hover:bg-brand-deep text-white shadow-md transition-all"
                >
                  切換至 CUSTOM 文字客製
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                <div>
                  <label className="text-xs font-semibold text-stone-700 block mb-1">
                    輸入文字內容：
                  </label>
                  <input
                    type="text"
                    aria-label="文字內容"
                    value={state.text.content}
                    onChange={(e) =>
                      onUpdateState({
                        text: { ...state.text, content: e.target.value }
                      })
                    }
                    placeholder="例：MY FAVORITE, 2026.11.01"
                    maxLength={30}
                    className="w-full px-3 py-2 rounded-xl bg-stone-50 border border-stone-200 text-sm text-ink placeholder:text-slate-600 focus:outline-none focus:border-pink-500"
                  />
                </div>

                {state.text.content && !isTextSelected && <button className="btn-secondary w-full" onClick={onSelectText}>選取文字，調整細節</button>}
                {state.text.content && isTextSelected && <>
                <div className="p-3 rounded-2xl bg-stone-50 border border-stone-200 space-y-3">
                  <span className="text-xs font-bold text-ink block">文字框尺寸</span>
                  <div className="grid grid-cols-2 gap-3">
                    <label className="text-[11px] text-stone-700">
                      文字框寬度 (mm)
                      <input type="number" aria-label="文字框寬度" min={MIN_TEXT_BOX_MM} max={FRAME_WIDTH_MM} step={0.5} value={Number(state.text.widthMm.toFixed(1))}
                        onChange={e => { if (e.target.value) onUpdateState({ text: { ...state.text, widthMm: Math.max(MIN_TEXT_BOX_MM, Math.min(FRAME_WIDTH_MM, Number(e.target.value))) } }); }}
                        className="mt-1 w-full px-2 py-1.5 rounded-lg bg-stone-100 border border-stone-200 text-xs text-ink" />
                    </label>
                    <label className="text-[11px] text-stone-700">
                      文字框高度 (mm)
                      <input type="number" aria-label="文字框高度" min={MIN_TEXT_BOX_MM} max={FRAME_HEIGHT_MM} step={0.5} value={Number(state.text.heightMm.toFixed(1))}
                        onChange={e => { if (e.target.value) onUpdateState({ text: { ...state.text, heightMm: Math.max(MIN_TEXT_BOX_MM, Math.min(FRAME_HEIGHT_MM, Number(e.target.value))) } }); }}
                        className="mt-1 w-full px-2 py-1.5 rounded-lg bg-stone-100 border border-stone-200 text-xs text-ink" />
                    </label>
                  </div>
                  <label className="flex items-center justify-between gap-3 text-xs font-semibold text-stone-800">
                    <span>自動換行</span>
                    <input type="checkbox" role="switch" aria-label="自動換行" checked={state.text.autoWrap ?? false}
                      onChange={e => onUpdateState({ text: { ...state.text, autoWrap: e.target.checked } })}
                      className="h-4 w-4 accent-pink-500" />
                  </label>
                  <p className="text-[11px] text-stone-600 leading-relaxed">
                    {state.text.autoWrap ? '已開啟：文字依框寬自動換行。' : '單行模式：文字不因框寬不足而換行。'}
                    選取中央文字框後，可拖曳左右或四角控制點調整尺寸；框尺寸與字體大小分開控制。
                  </p>
                </div>

                {/* 2 Quick Position Presets */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-xs font-semibold text-stone-700 block">
                      常用文字位置：
                    </label>
                    <span className="text-[11px] text-brand">亦可在展示框直接拖曳</span>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      { label: '底部中央', xMm: 42.5, yMm: 98.9, rot: 0 },
                      { label: '框體頂部', xMm: 42.5, yMm: 13.8, rot: 0 }
                    ].map((pos, idx) => (
                      <button
                        key={idx}
                        onClick={() =>
                          onUpdateState({
                            text: { ...state.text, xMm: pos.xMm, yMm: pos.yMm, rotation: pos.rot, anchorTarget: 'frame', anchorPosition: undefined }
                          })
                        }
                        className={`px-3 py-2 rounded-xl border text-xs font-medium transition-all text-center ${
                          state.text.xMm === pos.xMm && state.text.yMm === pos.yMm
                            ? 'bg-pink-500/20 border-pink-400 text-brand-deep font-bold'
                            : 'bg-stone-50 hover:bg-pink-500/10 border-stone-200 hover:border-pink-400/40 text-stone-700'
                        }`}
                      >
                        {pos.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Exact Position Sliders */}
                <div className="p-3 rounded-2xl bg-stone-50 border border-stone-200 space-y-3">
                  <span className="text-xs font-bold text-ink flex items-center gap-1.5">
                    <SlidersHorizontal className="w-3.5 h-3.5 text-brand" />
                    自訂文字精確座標與角度
                  </span>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <div className="flex justify-between text-[11px] text-stone-700 mb-0.5">
                        <span>水平 X 座標</span>
                        <span className="font-mono text-brand-deep font-bold">{state.text.xMm.toFixed(1)} mm</span>
                      </div>
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
                        className="w-full accent-pink-500"
                      />
                    </div>

                    <div>
                      <div className="flex justify-between text-[11px] text-stone-700 mb-0.5">
                        <span>垂直 Y 座標</span>
                        <span className="font-mono text-brand-deep font-bold">{state.text.yMm.toFixed(1)} mm</span>
                      </div>
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
                        className="w-full accent-pink-500"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3 pt-1">
                    <div>
                      <div className="flex justify-between text-[11px] text-stone-700 mb-0.5">
                        <span>字體大小</span>
                        <span className="font-mono text-brand-deep font-bold">{state.text.fontSizeMm.toFixed(1)} mm</span>
                      </div>
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
                        className="w-full accent-pink-500"
                      />
                    </div>

                    <div>
                      <div className="flex justify-between text-[11px] text-stone-700 mb-0.5">
                        <span>旋轉文字</span>
                        <span className="font-mono text-brand-deep font-bold">{state.text.rotation}°</span>
                      </div>
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
                        className="w-full accent-pink-500"
                      />
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-[11px] text-stone-700 mb-0.5">
                      <span>字距</span>
                      <span className="font-mono text-brand-deep font-bold">{(state.text.letterSpacingMm ?? 0.45).toFixed(2)} mm</span>
                    </div>
                    <input type="range" aria-label="字距" min={0} max={3} step={0.05} value={state.text.letterSpacingMm ?? 0.45}
                      onChange={e => onUpdateState({ text: { ...state.text, letterSpacingMm: Number(e.target.value) } })}
                      className="w-full accent-pink-500" />
                  </div>
                </div>

                {/* Font Choices */}
                <div>
                  <label className="text-xs font-semibold text-stone-700 block mb-1.5">
                    風格字型選擇：
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
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
                          className={`p-2.5 rounded-xl border text-left transition-all ${
                            isSelected
                              ? 'border-pink-500 bg-pink-500/10'
                              : 'border-stone-200 bg-stone-50 hover:border-stone-200'
                          }`}
                        >
                          <span className={`text-xs font-bold text-stone-800 block ${f.fontClass}`}>
                            {f.name}
                          </span>
                          <span className="text-[11px] text-brand block mt-0.5">
                            {f.isSpecial ? '特殊設計字體' : '基本字體'}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Text Color Swatches */}
                <div>
                  <label className="text-xs font-semibold text-stone-700 block mb-1.5">
                    文字字體色彩：
                  </label>
                  <div className="flex items-center gap-2">
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
                        onClick={() =>
                          onUpdateState({
                            text: { ...state.text, color: c.hex }
                          })
                        }
                        className={`w-7 h-7 rounded-full border transition-transform ${
                          state.text.color === c.hex
                            ? 'scale-125 border-white ring-2 ring-pink-400'
                            : 'border-stone-200 hover:scale-110'
                        }`}
                        style={{ background: c.hex }}
                        title={c.name}
                      />
                    ))}
                  </div>
                </div>

                <p className="text-[11px] text-emerald-800 bg-emerald-500/10 border border-emerald-500/20 p-2 rounded-lg leading-relaxed">
                  💡 <strong>拖曳提示</strong>：您也可以直接在中央展示框中，用滑鼠直接按住文字拖曳至任意喜歡的位置！
                </p>

                </>}
              </div>
            )}
          </div>
        )}

      </div>
    </div>
  );
};
