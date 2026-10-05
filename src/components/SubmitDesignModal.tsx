import React, { useState } from 'react';
import { CustomizerState, DesignSubmission } from '../types';
import { submitDesignToBackend, dataUrlToBlob } from '../lib/supabase';
import { toPng } from 'html-to-image';
import { getTierLabel, TIER_OPTIONS } from '../data/tiers';
import { isCardSizeSupported } from '../utils/dimensions';
import { 
  X, 
  Loader2, 
  AlertCircle, 
  ShieldCheck, 
  User, 
  Mail 
} from 'lucide-react';

interface SubmitDesignModalProps {
  isOpen: boolean;
  onClose: () => void;
  state: CustomizerState;
  onSuccess: (submission: DesignSubmission) => void;
}

export const SubmitDesignModal: React.FC<SubmitDesignModalProps> = ({
  isOpen,
  onClose,
  state,
  onSuccess
}) => {
  const [customerName, setCustomerName] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loadingStep, setLoadingStep] = useState('正在儲存你的專屬設計……');
  const [validationErrors, setValidationErrors] = useState<string[]>([]);

  if (!isOpen) return null;

  const validate = (): boolean => {
    const errors: string[] = [];

    // 1. 方案驗證
    if (!state.tier) {
      errors.push('請先選擇客製化方案（Basic / Custom / Premium）');
    }
    if (!isCardSizeSupported(state.cardWidthMm, state.cardHeightMm)) {
      errors.push('此尺寸超出 ONLYFRAME 標準框目前建議支援範圍，請先調整小卡尺寸。');
    }

    // 2. 姓名驗證
    if (!customerName.trim()) {
      errors.push('請填寫聯絡人姓名');
    }

    // 3. Email 格式驗證
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!customerEmail.trim()) {
      errors.push('請填寫電子信箱 (Email)');
    } else if (!emailRegex.test(customerEmail.trim())) {
      errors.push('電子信箱格式不正確，請檢查輸入');
    }

    // 4. 所有方案的自訂小卡預覽驗證
    if (state.isCustomPhoto && !state.photocardUrl) {
      errors.push('已選擇上傳自己的小卡，請先上傳小卡圖片後再送出');
    }

    setValidationErrors(errors);
    return errors.length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);
    setLoadingStep('正在儲存你的專屬設計……');

    try {
      // 1. 嘗試產生立體卡框 Preview Blob (藉由 html-to-image)
      let previewBlob: Blob | null = null;
      setLoadingStep('正在產生 3D 高透壓克力展示框打樣圖……');
      const node = document.getElementById('acrylic-display-frame');
      if (node) {
        try {
          const dataUrl = await toPng(node, {
            quality: 0.95,
            pixelRatio: 2.0,
            cacheBust: true
          });
          previewBlob = await dataUrlToBlob(dataUrl);
        } catch (err) {
          console.warn('Failed to capture preview image blob:', err);
        }
      }

      // 2. 送出至後端 (圖片上傳至 Storage、寫入 Database)
      setLoadingStep('正在上傳設計參數與圖片至雲端儲存空間……');
      const submission = await submitDesignToBackend({
        customerName,
        customerEmail,
        state,
        previewBlob
      });

      // 3. 完成並回傳
      onSuccess(submission);
      onClose();
    } catch (err: any) {
      console.error('Submit design error:', err);
      alert(`送出失敗：${err.message || '請確認網路連線或稍後再試！'}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-3xl bg-[#FAF8F5] border border-stone-200 shadow-2xl p-6 sm:p-7 space-y-5 text-slate-800">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          disabled={isSubmitting}
          className="absolute top-5 right-5 p-2 rounded-full bg-stone-200/60 hover:bg-stone-200 text-slate-500 hover:text-slate-900 transition-colors disabled:opacity-30"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="space-y-1">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-pink-500/10 border border-pink-500/20 text-xs font-bold text-pink-600">
            <img src="/logo.png" alt="ONLYFRAME" className="w-3.5 h-3.5 rounded-sm object-contain" />
            <span>送出客製化設計 · SUBMIT DESIGN</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black tracking-tight text-slate-900">
            確認送出您的專屬卡框
          </h2>
          <p className="text-xs text-slate-500 leading-relaxed">
            系統將為您產生專屬設計編號，並將完整設計參數保存至後端資料庫以供後續打樣評估。
          </p>
        </div>

        {/* Validation Errors Notice */}
        {validationErrors.length > 0 && (
          <div className="p-3.5 rounded-2xl bg-red-50 border border-red-200 text-xs text-red-700 space-y-1">
            <div className="font-bold flex items-center gap-1.5 text-red-800">
              <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0" />
              <span>請完成以下項目後再送出：</span>
            </div>
            <ul className="list-disc list-inside space-y-0.5 pl-1 text-[11px] text-red-600">
              {validationErrors.map((err, idx) => (
                <li key={idx}>{err}</li>
              ))}
            </ul>
          </div>
        )}

        {/* Form Inputs */}
        <form onSubmit={handleSubmit} className="space-y-4">
          
          {/* Design Summary Card */}
          <div className="p-3.5 rounded-2xl bg-white/80 border border-stone-200/80 shadow-sm flex items-center justify-between text-xs">
            <div>
              <span className="text-[10px] text-slate-400 font-mono block">方案配置</span>
              <span className="font-bold text-slate-800">{getTierLabel(state.tier)}</span>
            </div>
            <div className="text-right">
              <span className="text-[10px] text-slate-400 font-mono block">客製程度</span>
              <span className="font-black text-pink-600 text-sm font-mono">{TIER_OPTIONS[state.tier].level}</span>
            </div>
          </div>

          {/* Customer Name */}
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
              <User className="w-3.5 h-3.5 text-pink-500" />
              <span>聯絡姓名 (Name) <span className="text-pink-500">*</span></span>
            </label>
            <input
              type="text"
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              placeholder="例如：王小明"
              disabled={isSubmitting}
              className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-stone-300 focus:border-pink-500 focus:ring-2 focus:ring-pink-500/20 text-xs text-slate-800 outline-none transition-all"
            />
          </div>

          {/* Customer Email */}
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
              <Mail className="w-3.5 h-3.5 text-purple-500" />
              <span>電子信箱 (Email) <span className="text-pink-500">*</span></span>
            </label>
            <input
              type="email"
              value={customerEmail}
              onChange={(e) => setCustomerEmail(e.target.value)}
              placeholder="例如：student@university.edu.tw"
              disabled={isSubmitting}
              className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-stone-300 focus:border-pink-500 focus:ring-2 focus:ring-pink-500/20 text-xs text-slate-800 outline-none transition-all"
            />
          </div>

          {/* Research Purpose Note */}
          <div className="flex items-start gap-2 text-[11px] text-slate-500 leading-normal p-2.5 rounded-xl bg-stone-100/70 border border-stone-200">
            <ShieldCheck className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
            <span>
              本系統為企管系畢業專題研究 MVP，送出之設計資料僅作為打樣分析，不會進行任何信用卡扣款或商業用途。
            </span>
          </div>

          {/* Submit Actions */}
          <div className="pt-2 flex items-center gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="flex-1 py-3 px-4 rounded-xl text-xs font-bold bg-stone-200/70 hover:bg-stone-200 text-slate-700 transition-colors"
            >
              稍後再送
            </button>

            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-2 py-3 px-6 rounded-xl text-xs font-bold bg-gradient-to-r from-pink-500 via-rose-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white shadow-lg shadow-pink-500/25 active:scale-95 transition-all flex items-center justify-center gap-2 disabled:opacity-60"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>{loadingStep}</span>
                </>
              ) : (
                <>
                  <img src="/logo.png" alt="ONLYFRAME" className="w-4 h-4 rounded-sm object-contain" />
                  <span>確認送出設計 ➔</span>
                </>
              )}
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
