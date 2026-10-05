export type CustomizationTier = 'BASIC' | 'CUSTOM' | 'PREMIUM';

export interface FrameOption {
  id: string;
  name: string;
  enName: string;
  description: string;
  cornerStyle: 'rounded-2xl' | 'rounded-lg' | 'rounded-3xl' | 'rounded-none';
  borderWidth: string;
  hasScrews: boolean;
  screwType: 'silver' | 'gold' | 'black';
}

export interface FrameColorOption {
  id: string;
  name: string;
  hex: string;
  glowColor: string;
  outerBorder: string;
  innerGlow: string;
}

export interface BackgroundOption {
  id: string;
  name: string;
  type: 'solid' | 'gradient' | 'pattern' | 'galaxy' | 'y2k' | 'custom';
  cssClass: string;
  backgroundStyle?: string;
  isSpecial: boolean;
}

export interface StickerOption {
  id: string;
  imageSrc: string;
  name: string;
  collection: 'pearl' | 'pastel';
}

export interface PlacedSticker {
  id: string;
  stickerId: string;
  symbol: string;
  xMm: number;
  yMm: number;
  widthMm: number;
  heightMm: number;
  rotation: number; // deg
  color: string;
  zIndex: number;
  anchorTarget?: 'card' | 'frame';
  anchorPosition?: import('../utils/dimensions').CardAnchor;
  offsetXmm?: number;
  offsetYmm?: number;
}

export interface TextConfig {
  content: string;
  font: string;
  fontSizeMm: number;
  color: string;
  rotation: number;
  xMm: number;
  yMm: number;
  widthMm: number;
  heightMm: number;
  zIndex: number;
  anchorTarget?: 'card' | 'frame';
  anchorPosition?: import('../utils/dimensions').CardAnchor;
  offsetXmm?: number;
  offsetYmm?: number;
  isSpecialFont: boolean;
}

export interface CustomizerState {
  cardWidthMm: number;
  cardHeightMm: number;
  cardSizePreset: string;
  tier: CustomizationTier;
  frameStyleId: string;
  frameColorId: string;
  backgroundId: string;
  customBgUrl: string | null;
  photocardUrl: string;
  photocardName: string;
  isCustomPhoto: boolean;
  stickers: PlacedSticker[];
  text: TextConfig;
}

export type SubmissionStatus = 'pending' | 'processing' | 'completed' | 'cancelled';

export interface DesignSubmission {
  id: string;
  submission_code: string;
  created_at: string;
  customer_name: string;
  customer_email: string;
  plan: CustomizationTier;
  plan_name: string;
  // Legacy database columns: neutral values only for schema compatibility.
  base_price: number;
  final_price: number;
  card_image_url: string;
  frame_style: string;
  frame_color: string;
  background: string;
  decorations: string;
  custom_text: string;
  font: string;
  design_data: Record<string, any>;
  preview_image_url: string;
  status: SubmissionStatus;
}
