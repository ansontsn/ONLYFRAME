import React from 'react';
import { AcrylicFramePreview } from './AcrylicFramePreview';
import { CustomizationTier, CustomizerState } from '../types';
import { INITIAL_TEXT_CONFIG, PRESET_PHOTOCARDS } from '../data/options';

export interface ExampleOptions {
  tier?: CustomizationTier;
  color?: string;
  card?: number;
  text?: string;
  background?: string;
  stickers?: boolean;
}

// One builder feeds both the landing examples and the "use this design" presets,
// so what visitors see is exactly what the editor opens with.
export const buildExampleState = ({
  tier = 'PREMIUM', color = 'clear', card = 0, text = 'MY FAVORITE', background = 'bg-gradient-sunset', stickers = true,
}: ExampleOptions = {}): CustomizerState => ({
  tier, cardWidthMm: 55, cardHeightMm: 85, cardSizePreset: '55 × 85 mm',
  frameStyleId: 'acrylic-classic', frameColorId: color,
  backgroundId: background, customBgUrl: null,
  photocardUrl: PRESET_PHOTOCARDS[card].url, photocardName: PRESET_PHOTOCARDS[card].name, isCustomPhoto: false,
  text: { ...INITIAL_TEXT_CONFIG, content: text, color: '#722b4b', fontSizeMm: 3.1, widthMm: 57, yMm: 104, letterSpacingMm: .45 },
  stickers: stickers ? [
    { id: 'example-1', stickerId: 'pearl-sparkle', symbol: '水晶四芒星', xMm: 11, yMm: 24, widthMm: 12, heightMm: 12, rotation: -12, color: '#fff', zIndex: 20 },
    { id: 'example-2', stickerId: 'pastel-bow', symbol: '柔粉蝴蝶結', xMm: 72, yMm: 89, widthMm: 16, heightMm: 16, rotation: 15, color: '#fff', zIndex: 20 },
  ] : [],
});

// Examples share the editor's millimetre renderer and tier permissions.
export const ProductExample: React.FC<ExampleOptions & { className?: string }> = ({ className = '', ...options }) => (
  <div className={`product-example ${className}`}>
    <AcrylicFramePreview state={buildExampleState(options)} interactive={false} displayOnly />
  </div>
);
