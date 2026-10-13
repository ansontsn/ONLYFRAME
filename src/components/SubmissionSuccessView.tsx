import React, { useState } from 'react';
import { TIER_OPTIONS, getTierLabel } from '../data/tiers';
import { DesignSubmission } from '../types';
import { 
  CheckCircle2, 
  Copy, 
  RotateCcw, 
  Eye, 
  Check, 
  X 
} from 'lucide-react';

interface SubmissionSuccessViewProps {
  submission: DesignSubmission;
  onReset: () => void;
}

export const SubmissionSuccessView: React.FC<SubmissionSuccessViewProps> = ({
  submission,
  onReset
}) => {
  const [copied, setCopied] = useState(false);
  const [isDetailOpen, setIsDetailOpen] = useState(false);

  const handleCopyCode = () => {
    navigator.clipboard?.writeText(submission.submission_code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="py-12 px-4 sm:px-6 lg:px-8 max-w-2xl mx-auto space-y-8 animate-in fade-in zoom-in-95 duration-300">
      
      {/* Top Success Badge */}
      <div className="text-center space-y-3">
        <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-md border border-emerald-200">
          <CheckCircle2 className="w-9 h-9 stroke-[2.2]" />
        </div>
        
        <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-slate-900">
          你的設計已成功送出！
        </h1>
        <p className="text-sm text-slate-600 max-w-md mx-auto leading-relaxed">
          我們已收到你的客製化設計。專題製作團隊將依據此規格進行打樣評估與研究分析。
        </p>
      </div>

      {/* Main Ticket Card */}
      <div className="relative rounded-3xl bg-white/95 border border-stone-200 shadow-xl overflow-hidden p-6 sm:p-8 space-y-6">
        
        {/* Top Header of Ticket */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-stone-200">
          <div>
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-widest block font-mono">
              OFFICIAL SUBMISSION CODE
            </span>
            <div className="flex items-center gap-2 mt-1">
              <span className="min-w-0 break-all text-lg sm:text-3xl font-black text-slate-900 font-mono tracking-tight">
                {submission.submission_code}
              </span>
              <button
                onClick={handleCopyCode}
                className="p-1.5 rounded-lg bg-stone-100 hover:bg-stone-200 text-slate-600 transition-colors"
                title="複製設計編號"
              >
                {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
              </button>
            </div>
            {copied && <span className="text-[10px] text-emerald-600 font-semibold">已複製到剪貼簿！</span>}
          </div>

          <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-center">
            <span className="text-xs text-slate-400 font-medium">客製程度</span>
            <span className="text-2xl sm:text-3xl font-black text-pink-600 font-mono">
              {TIER_OPTIONS[submission.plan].level}
            </span>
          </div>
        </div>

        {/* Info Grid */}
        <div className="grid grid-cols-2 gap-4 text-xs">
          <div className="p-3 rounded-2xl bg-stone-50 border border-stone-200/80">
            <span className="text-[10px] text-slate-400 font-medium block">客製方案</span>
            <span className="font-bold text-slate-800 text-sm mt-0.5 block">{getTierLabel(submission.plan)}</span>
          </div>

          <div className="p-3 rounded-2xl bg-stone-50 border border-stone-200/80">
            <span className="text-[10px] text-slate-400 font-medium block">設計狀態</span>
            <span className="inline-block mt-0.5 px-2 py-0.5 rounded-full text-[11px] font-bold bg-amber-100 text-amber-800 border border-amber-200">
              待處理 (Pending)
            </span>
          </div>

          <div className="p-3 rounded-2xl bg-stone-50 border border-stone-200/80">
            <span className="text-[10px] text-slate-400 font-medium block">聯絡姓名</span>
            <span className="font-bold text-slate-800 mt-0.5 block truncate">{submission.customer_name}</span>
          </div>

          <div className="p-3 rounded-2xl bg-stone-50 border border-stone-200/80">
            <span className="text-[10px] text-slate-400 font-medium block">電子信箱</span>
            <span className="font-bold text-slate-800 mt-0.5 block truncate">{submission.customer_email}</span>
          </div>
        </div>

        {/* Preview Image Thumbnail if available */}
        {submission.preview_image_url && (
          <div className="p-3 rounded-2xl bg-stone-100/70 border border-stone-200 flex items-center gap-4">
            <img 
              src={submission.preview_image_url} 
              alt="展示框成品打樣預覽" 
              className="w-16 h-24 object-contain rounded-xl bg-white shadow-sm border border-stone-200 flex-shrink-0"
            />
            <div className="text-xs space-y-1 min-w-0">
              <span className="font-bold text-slate-800 block">3D 壓克力打樣預覽</span>
              <p className="text-[11px] text-slate-500">
                已成功產生高畫質成品渲染照，後台團隊可隨時還原查看。
              </p>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
          <button
            onClick={() => setIsDetailOpen(true)}
            className="w-full sm:flex-1 py-3.5 px-5 rounded-2xl font-bold text-xs bg-white hover:bg-stone-50 text-slate-800 border border-stone-300 shadow-sm transition-all flex items-center justify-center gap-2"
          >
            <Eye className="w-4 h-4 text-pink-500" />
            <span>查看我的設計明細</span>
          </button>

          <button
            onClick={onReset}
            className="w-full sm:flex-1 py-3.5 px-5 rounded-2xl font-bold text-xs bg-gradient-to-r from-pink-500 via-rose-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white shadow-lg shadow-pink-500/25 transition-all flex items-center justify-center gap-2 active:scale-95"
          >
            <RotateCcw className="w-4 h-4" />
            <span>重新製作另一個卡框</span>
          </button>
        </div>

      </div>

      {/* Detail Modal */}
      {isDetailOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md">
          <div className="relative w-full max-w-lg rounded-3xl bg-[#FAF8F5] border border-stone-200 shadow-2xl p-6 sm:p-7 space-y-5 text-slate-800 max-h-[90vh] overflow-y-auto">
            
            <button
              onClick={() => setIsDetailOpen(false)}
              className="absolute top-5 right-5 p-2 rounded-full bg-stone-200/60 hover:bg-stone-200 text-slate-600 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-lg font-black text-slate-900">
              設計明細 · {submission.submission_code}
            </h3>

            <div className="space-y-2 text-xs border-y border-stone-200 py-3">
              <div className="flex justify-between py-1">
                <span className="text-slate-500">固定框體:</span>
                <span className="font-bold text-slate-800">{submission.frame_style}</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-slate-500">框體外觀色系:</span>
                <span className="font-bold text-slate-800">{submission.frame_color}</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-slate-500">背景樣式:</span>
                <span className="font-bold text-slate-800">{submission.background}</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-slate-500">裝飾配件:</span>
                <span className="font-bold text-slate-800">{submission.decorations}</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-slate-500">刻字內容:</span>
                <span className="font-bold text-slate-800">{submission.custom_text}</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-slate-500">字體選用:</span>
                <span className="font-bold text-slate-800">{submission.font}</span>
              </div>
            </div>

            {submission.preview_image_url && (
              <div className="space-y-2">
                <span className="text-xs font-bold text-slate-700 block">打樣成品預覽：</span>
                <div className="rounded-2xl border border-stone-200 p-2 bg-white flex justify-center">
                  <img src={submission.preview_image_url} alt="預覽圖" className="max-h-60 object-contain rounded-xl" />
                </div>
              </div>
            )}

            <button
              onClick={() => setIsDetailOpen(false)}
              className="w-full py-2.5 rounded-xl bg-stone-200 hover:bg-stone-300 font-bold text-xs text-slate-700 transition-colors"
            >
              關閉明細
            </button>

          </div>
        </div>
      )}

    </div>
  );
};
