import { CustomizationTier, CustomizerState } from '../types';

// One definition for the comparison, editor, preview and submitted research data.
export const TIER_OPTIONS = {
  BASIC: {
    name: '簡易客製',
    level: '低客製化程度',
    headline: '簡單選擇',
    description: '從基本外觀開始，簡單選擇自己喜歡的展示方式。',
    summary: '框體外觀',
    text: false,
    background: false,
    stickers: false,
  },
  CUSTOM: {
    name: '文字客製',
    level: '中客製化程度',
    headline: '加入個人文字',
    description: '加入自己的文字，讓展示框帶有更明顯的個人特色。',
    summary: '框體外觀＋自訂文字',
    text: true,
    background: false,
    stickers: false,
  },
  PREMIUM: {
    name: '自由客製',
    level: '高客製化程度',
    headline: '完整自由設計',
    description: '自由搭配背景、文字與裝飾，完整打造屬於自己的展示風格。',
    summary: '框體外觀＋文字＋主題背景＋自由裝飾',
    text: true,
    background: true,
    stickers: true,
  },
} as const;

export const TIER_ORDER: CustomizationTier[] = ['BASIC', 'CUSTOM', 'PREMIUM'];

export const getTierLabel = (tier: CustomizationTier): string =>
  `${tier}｜${TIER_OPTIONS[tier].name}`;

// Apply on every edit and again before serialization so unsupported elements
// cannot remain in the preview or research record after a downgrade.
export const normalizeDesignForTier = (state: CustomizerState): CustomizerState => {
  const permissions = TIER_OPTIONS[state.tier];
  return {
    ...state,
    backgroundId: permissions.background ? state.backgroundId : 'bg-transparent',
    customBgUrl: permissions.background ? state.customBgUrl : null,
    stickers: permissions.stickers ? state.stickers : [],
    text: permissions.text ? state.text : { ...state.text, content: '' },
  };
};

export const getTierSwitchWarning = (from: CustomizationTier, to: CustomizationTier): string | null => {
  if (TIER_ORDER.indexOf(to) >= TIER_ORDER.indexOf(from)) return null;
  const removed = to === 'BASIC' ? '文字、主題背景與所有裝飾元素' : '主題背景與所有裝飾元素';
  return `切換至 ${getTierLabel(to)} 將移除${removed}，清除後無法復原。小卡預覽與框體外觀會保留。確定切換方案嗎？`;
};
