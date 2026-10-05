import { createClient } from '@supabase/supabase-js';
import { CustomizerState, DesignSubmission, SubmissionStatus } from '../types';
import { normalizeDesignForTier, getTierLabel } from '../data/tiers';
import { FRAME_OPTIONS, FRAME_COLOR_OPTIONS, BACKGROUND_OPTIONS, FONT_OPTIONS, STICKER_OPTIONS } from '../data/options';
import { centeredCardPosition, FRAME_WIDTH_MM, FRAME_HEIGHT_MM, isCardSizeSupported } from '../utils/dimensions';

// 取得環境變數
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

// 檢查是否已設定有效的 Supabase 連線資訊
export const isSupabaseConfigured = (): boolean => {
  return (
    typeof supabaseUrl === 'string' &&
    supabaseUrl.trim().length > 0 &&
    supabaseUrl.startsWith('http') &&
    !supabaseUrl.includes('your-project') &&
    typeof supabaseAnonKey === 'string' &&
    supabaseAnonKey.trim().length > 0 &&
    !supabaseAnonKey.includes('your-anon-key')
  );
};

// 建立 Supabase Client
export const supabase = isSupabaseConfigured()
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

// Mock 本機儲存 Key (用於無 Supabase key 時無縫體驗與測試)
const MOCK_STORAGE_KEY = 'onlyframe_mock_submissions';
const LEGACY_STORAGE_KEY = 'lumina_mock_submissions';

// 取得 Mock 資料
const getMockSubmissions = (): DesignSubmission[] => {
  try {
    const raw = localStorage.getItem(MOCK_STORAGE_KEY) || localStorage.getItem(LEGACY_STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
};

// 儲存 Mock 資料
const saveMockSubmissions = (data: DesignSubmission[]) => {
  try {
    localStorage.setItem(MOCK_STORAGE_KEY, JSON.stringify(data));
  } catch (err) {
    console.warn('Failed to save to localStorage:', err);
  }
};

/**
 * 將 Base64 Data URL 轉換為 Blob
 */
export const dataUrlToBlob = async (dataUrl: string): Promise<Blob> => {
  const res = await fetch(dataUrl);
  return await res.blob();
};

/**
 * 上傳圖片檔案至 Supabase Storage
 */
export const uploadImageToStorage = async (
  blob: Blob,
  bucket: 'card-images' | 'design-previews',
  fileNamePrefix: string
): Promise<string> => {
  if (!isSupabaseConfigured() || !supabase) {
    // 降級模式：若未設定 Supabase，轉成 Base64 或 Object URL 供展示
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.readAsDataURL(blob);
    });
  }

  const fileExt = blob.type.split('/')[1] || 'png';
  const filePath = `${fileNamePrefix}-${Date.now()}-${Math.random().toString(36).substring(2, 6)}.${fileExt}`;

  const { error } = await supabase.storage
    .from(bucket)
    .upload(filePath, blob, {
      contentType: blob.type || 'image/png',
      upsert: false
    });

  if (error) {
    console.error(`Error uploading to ${bucket}:`, error);
    throw new Error(`上傳圖片至 ${bucket} 失敗: ${error.message}`);
  }

  const { data } = supabase.storage.from(bucket).getPublicUrl(filePath);
  return data.publicUrl;
};

/**
 * 送出設計核心 API
 * 1. 依所選方案清除不支援的設計元素
 * 2. 上傳小卡至 card-images
 * 3. 上傳預覽圖至 design-previews
 * 4. 寫入 design_submissions
 */
export const submitDesignToBackend = async (params: {
  customerName: string;
  customerEmail: string;
  state: CustomizerState;
  previewBlob?: Blob | null;
}): Promise<DesignSubmission> => {
  const { customerName, customerEmail, previewBlob } = params;
  const state = normalizeDesignForTier(params.state);

  if (!isCardSizeSupported(state.cardWidthMm, state.cardHeightMm)) {
    throw new Error('小卡尺寸超出 ONLYFRAME 標準框目前建議支援範圍，請先調整尺寸。');
  }

  // 2. 處理小卡圖片上傳
  let cardImageUrl = state.photocardUrl;
  if (state.isCustomPhoto && state.photocardUrl.startsWith('data:')) {
    try {
      const cardBlob = await dataUrlToBlob(state.photocardUrl);
      cardImageUrl = await uploadImageToStorage(cardBlob, 'card-images', 'card');
    } catch (err) {
      console.warn('Failed to upload card image to storage, fallback to data url:', err);
    }
  }

  // 3. 處理完整立體展示框打樣圖上傳
  let previewImageUrl = '';
  if (previewBlob) {
    try {
      previewImageUrl = await uploadImageToStorage(previewBlob, 'design-previews', 'preview');
    } catch (err) {
      console.warn('Failed to upload preview image, skipping:', err);
    }
  }

  // 4. 解析各選項名稱供後台直接易讀
  const frameOpt = FRAME_OPTIONS.find(f => f.id === state.frameStyleId) || FRAME_OPTIONS[0];
  const colorOpt = FRAME_COLOR_OPTIONS.find(c => c.id === state.frameColorId) || FRAME_COLOR_OPTIONS[0];
  const bgOpt = BACKGROUND_OPTIONS.find(b => b.id === state.backgroundId) || BACKGROUND_OPTIONS[0];
  const fontOpt = FONT_OPTIONS.find(f => f.id === state.text.font) || FONT_OPTIONS[0];

  const decorationsSummary = state.stickers.length > 0
    ? `${state.stickers.length} 枚貼飾 (${state.stickers.map(s => STICKER_OPTIONS.find(option => option.id === s.stickerId)?.name || s.symbol).join('、')})`
    : '無裝飾';

  // 5. 產生人類易讀之訂單編號格式 (DES-YYYYMMDD-XXXX)
  const now = new Date();
  const dateStr = now.toISOString().slice(0, 10).replace(/-/g, '');
  const randomSeq = Math.floor(1000 + Math.random() * 9000);
  const submissionCode = `DES-${dateStr}-${randomSeq}`;

  // 6. 整理完整客製化 JSON (供未來還原設計)
  const cardPosition = centeredCardPosition(state.cardWidthMm, state.cardHeightMm);
  const printElements = [
    ...state.stickers.map(sticker => ({
      id: sticker.id, type: 'sticker' as const, xMm: sticker.xMm, yMm: sticker.yMm,
      widthMm: sticker.widthMm, heightMm: sticker.heightMm, rotation: sticker.rotation,
      zIndex: sticker.zIndex, anchorTarget: sticker.anchorTarget || 'frame', anchorPosition: sticker.anchorPosition || null,
      offsetXmm: sticker.offsetXmm ?? 0, offsetYmm: sticker.offsetYmm ?? 0,
      stickerId: sticker.stickerId, symbol: sticker.symbol, color: sticker.color
    })),
    ...(state.text.content ? [{
      id: 'custom-text', type: 'text' as const, xMm: state.text.xMm, yMm: state.text.yMm,
      widthMm: state.text.widthMm, heightMm: state.text.heightMm, rotation: state.text.rotation,
      zIndex: state.text.zIndex, anchorTarget: state.text.anchorTarget || 'frame', anchorPosition: state.text.anchorPosition || null,
      offsetXmm: state.text.offsetXmm ?? 0, offsetYmm: state.text.offsetYmm ?? 0,
      content: state.text.content, font: state.text.font, fontSizeMm: state.text.fontSizeMm,
      letterSpacingMm: state.text.letterSpacingMm, autoWrap: state.text.autoWrap, color: state.text.color
    }] : [])
  ];
  const designData = {
    frame: { widthMm: FRAME_WIDTH_MM, heightMm: FRAME_HEIGHT_MM },
    card: { widthMm: state.cardWidthMm, heightMm: state.cardHeightMm, ...cardPosition },
    elements: printElements,
    plan: state.tier,
    frameStyleId: state.frameStyleId,
    frameName: frameOpt.name,
    frameColorId: state.frameColorId,
    frameColorName: colorOpt.name,
    backgroundId: state.backgroundId,
    backgroundName: bgOpt.name,
    customBgUrl: state.customBgUrl,
    photocardName: state.photocardName,
    isCustomPhoto: state.isCustomPhoto,
    stickers: state.stickers,
    text: state.text
  };

  const newSubmission: DesignSubmission = {
    id: `sub-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    submission_code: submissionCode,
    created_at: new Date().toISOString(),
    customer_name: customerName.trim(),
    customer_email: customerEmail.trim(),
    plan: state.tier,
    plan_name: getTierLabel(state.tier),
    // Existing databases require these legacy columns. No calculation or display.
    base_price: 0,
    final_price: 0,
    card_image_url: cardImageUrl,
    frame_style: frameOpt.name,
    frame_color: colorOpt.name,
    background: bgOpt.name,
    decorations: decorationsSummary,
    custom_text: state.text.content || '(未設定文字)',
    font: fontOpt.name,
    design_data: designData,
    preview_image_url: previewImageUrl || cardImageUrl,
    status: 'pending'
  };

  // 7. 寫入資料庫
  if (isSupabaseConfigured() && supabase) {
    const { data, error } = await supabase
      .from('design_submissions')
      .insert([
        {
          submission_code: newSubmission.submission_code,
          customer_name: newSubmission.customer_name,
          customer_email: newSubmission.customer_email,
          plan: newSubmission.plan,
          plan_name: newSubmission.plan_name,
          base_price: newSubmission.base_price,
          final_price: newSubmission.final_price,
          card_image_url: newSubmission.card_image_url,
          frame_style: newSubmission.frame_style,
          frame_color: newSubmission.frame_color,
          background: newSubmission.background,
          decorations: newSubmission.decorations,
          custom_text: newSubmission.custom_text,
          font: newSubmission.font,
          design_data: newSubmission.design_data,
          preview_image_url: newSubmission.preview_image_url,
          status: newSubmission.status
        }
      ])
      .select()
      .single();

    if (error) {
      console.error('Supabase insert error:', error);
      throw new Error(`儲存至資料庫失敗: ${error.message}`);
    }

    if (data) {
      newSubmission.id = data.id;
      if (data.submission_code) newSubmission.submission_code = data.submission_code;
      if (data.created_at) newSubmission.created_at = data.created_at;
    }
  } else {
    // 儲存於本機模擬資料庫
    const mocks = getMockSubmissions();
    saveMockSubmissions([newSubmission, ...mocks]);
  }

  return newSubmission;
};

/**
 * 取得所有送出之設計資料（供 Admin 管理者查看）
 */
export const fetchAllSubmissions = async (): Promise<DesignSubmission[]> => {
  if (isSupabaseConfigured() && supabase) {
    const { data, error } = await supabase
      .from('design_submissions')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Fetch submissions error:', error);
      throw new Error(`無法載入設計清單: ${error.message}`);
    }
    return data as DesignSubmission[];
  }

  // 降級讀取本機 Mock 資料庫
  return getMockSubmissions();
};

/**
 * 更新設計狀態 (待處理 / 製作中 / 已完成 / 已取消)
 */
export const updateSubmissionStatus = async (
  id: string,
  status: SubmissionStatus
): Promise<boolean> => {
  if (isSupabaseConfigured() && supabase) {
    const { error } = await supabase
      .from('design_submissions')
      .update({ status })
      .eq('id', id);

    if (error) {
      console.error('Update status error:', error);
      throw new Error(`更新狀態失敗: ${error.message}`);
    }
    return true;
  }

  // 本機 Mock 資料更新
  const mocks = getMockSubmissions();
  const updated = mocks.map(item => item.id === id ? { ...item, status } : item);
  saveMockSubmissions(updated);
  return true;
};
