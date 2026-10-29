import React, { useState } from 'react';
import { CustomizerState, DesignSubmission } from '../types';
import { submitDesignToBackend, dataUrlToBlob } from '../lib/supabase';
import { toPng } from 'html-to-image';
import { getTierLabel, TIER_OPTIONS } from '../data/tiers';
import { isCardSizeSupported } from '../utils/dimensions';
import { ArrowRight, ShieldCheck, WarningCircle, X } from '@phosphor-icons/react';
import { arrowNudge, btnPrimary, btnSecondary, focusRing } from './ui';

interface SubmitDesignModalProps {
  isOpen: boolean;
  onClose: () => void;
  state: CustomizerState;
  onSuccess: (submission: DesignSubmission) => void;
}

const fieldClass = (invalid: boolean) =>
  `mt-2 w-full rounded-xl border bg-white px-3 py-2 text-base text-ink outline-none transition-colors duration-300 ease-out placeholder:text-black/30 disabled:opacity-50 ${
    invalid ? 'border-red-400 focus:border-red-600 focus:ring-1 focus:ring-red-600' : 'border-black/10 focus:border-ink focus:ring-1 focus:ring-ink'
  }`;

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
  const [submitError, setSubmitError] = useState<string | null>(null);

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
    setSubmitError(null);
    if (!validate()) return;

    setIsSubmitting(true);
    setLoadingStep('正在儲存你的專屬設計……');

    try {
      // 1. 嘗試產生立體卡框 Preview Blob (藉由 html-to-image)
      let previewBlob: Blob | null = null;
      setLoadingStep('正在產生展示框預覽圖……');
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
      setLoadingStep('正在上傳設計資料……');
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
      setSubmitError(`送出失敗：${err.message || '請確認網路連線後再試一次。'}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const nameInvalid = validationErrors.some((e) => e.includes('姓名'));
  const emailInvalid = validationErrors.some((e) => e.includes('信箱'));

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="submit-design-title"
        className="relative max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-3xl bg-white p-6 shadow-[0_40px_120px_-40px_rgba(0,0,0,0.5)] sm:p-8"
      >
        <button
          onClick={onClose}
          disabled={isSubmitting}
          aria-label="關閉"
          className={`absolute right-4 top-4 grid h-10 w-10 place-items-center rounded-full text-black/50 transition-colors duration-300 ease-out hover:bg-black/5 hover:text-ink disabled:opacity-30 ${focusRing}`}
        >
          <X weight="bold" className="h-5 w-5" />
        </button>

        <p className="text-xs font-semibold uppercase tracking-widest text-brand">送出設計</p>
        <h2 id="submit-design-title" className="mt-2 pr-12 text-2xl font-bold tracking-tight text-ink">
          確認送出你的專屬卡框
        </h2>
        <p className="mt-2 text-sm text-black/55">
          系統會為你產生專屬設計編號，並把完整設計參數保存到資料庫，供後續打樣評估。
        </p>

        {validationErrors.length > 0 && (
          <div role="alert" className="mt-6 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-800">
            <p className="flex items-center gap-2 font-semibold">
              <WarningCircle weight="bold" className="h-4 w-4 shrink-0" />
              請完成以下項目後再送出
            </p>
            <ul className="mt-2 list-inside list-disc space-y-1 text-red-700">
              {validationErrors.map((err, idx) => (
                <li key={idx}>{err}</li>
              ))}
            </ul>
          </div>
        )}

        <form onSubmit={handleSubmit} noValidate className="mt-6 space-y-4">

          <div className="flex items-center justify-between gap-3 rounded-2xl bg-paper p-4 text-sm">
            <div>
              <span className="block text-xs text-black/40">方案配置</span>
              <span className="font-semibold text-ink">{getTierLabel(state.tier)}</span>
            </div>
            <div className="text-right">
              <span className="block text-xs text-black/40">客製程度</span>
              <span className="font-semibold text-ink">{TIER_OPTIONS[state.tier].level}</span>
            </div>
          </div>

          <label className="block text-sm font-medium text-ink">
            聯絡姓名 <span className="text-brand" aria-hidden="true">*</span>
            <input
              type="text"
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              placeholder="例如：林品妤"
              disabled={isSubmitting}
              required
              aria-invalid={nameInvalid}
              autoComplete="name"
              className={fieldClass(nameInvalid)}
            />
          </label>

          <label className="block text-sm font-medium text-ink">
            電子信箱 <span className="text-brand" aria-hidden="true">*</span>
            <input
              type="email"
              value={customerEmail}
              onChange={(e) => setCustomerEmail(e.target.value)}
              placeholder="例如：pinyu.lin@mail.ntust.edu.tw"
              disabled={isSubmitting}
              required
              aria-invalid={emailInvalid}
              autoComplete="email"
              className={fieldClass(emailInvalid)}
            />
          </label>

          <p className="flex items-start gap-2 rounded-xl bg-paper p-3 text-xs text-black/55">
            <ShieldCheck weight="duotone" className="h-4 w-4 shrink-0 text-ink" />
            本系統為企管系畢業專題研究原型，送出的設計資料僅作為打樣分析，不會進行任何扣款或商業用途。
          </p>

          {submitError && <p role="alert" className="text-sm font-medium text-red-700">{submitError}</p>}

          <div className="flex flex-col-reverse gap-2 pt-2 sm:flex-row">
            <button type="button" onClick={onClose} disabled={isSubmitting} className={`sm:flex-1 ${btnSecondary}`}>
              稍後再送
            </button>
            <button type="submit" disabled={isSubmitting} aria-busy={isSubmitting} className={`sm:flex-[2] ${btnPrimary} disabled:opacity-100`}>
              {isSubmitting ? (
                <span className="inline-flex items-center gap-2 text-sm">
                  <span className="h-2 w-2 animate-pulse rounded-full bg-white" aria-hidden="true" />
                  {loadingStep}
                </span>
              ) : (
                <>
                  確認送出設計
                  <ArrowRight weight="bold" className={arrowNudge} />
                </>
              )}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
};
