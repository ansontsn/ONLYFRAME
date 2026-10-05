import React, { useState } from 'react';
import { DesignSubmission, SubmissionStatus } from '../../types';
import { TIER_OPTIONS, getTierLabel } from '../../data/tiers';
import { updateSubmissionStatus } from '../../lib/supabase';
import { 
  X, 
  ExternalLink, 
  Copy, 
  Check, 
  Calendar, 
  User, 
  Mail, 
  Code, 
  Layers, 
  Image as ImageIcon, 
  Loader2 
} from 'lucide-react';

interface SubmissionDetailModalProps {
  submission: DesignSubmission;
  onClose: () => void;
  onStatusChange: (newStatus: SubmissionStatus) => void;
}

export const SubmissionDetailModal: React.FC<SubmissionDetailModalProps> = ({
  submission,
  onClose,
  onStatusChange
}) => {
  const { verifiedPricing: _legacyCalculation, ...displayDesignData } = submission.design_data;
  const [currentStatus, setCurrentStatus] = useState<SubmissionStatus>(submission.status);
  const [isUpdating, setIsUpdating] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);
  const [copiedJson, setCopiedJson] = useState(false);

  const handleStatusUpdate = async (status: SubmissionStatus) => {
    setIsUpdating(true);
    try {
      await updateSubmissionStatus(submission.id, status);
      setCurrentStatus(status);
      onStatusChange(status);
    } catch (err: any) {
      alert(`狀態更新失敗: ${err.message || '請稍候重試'}`);
    } finally {
      setIsUpdating(false);
    }
  };

  const copyToClipboard = (text: string, isJson = false) => {
    navigator.clipboard?.writeText(text);
    if (isJson) {
      setCopiedJson(true);
      setTimeout(() => setCopiedJson(false), 2000);
    } else {
      setCopiedCode(true);
      setTimeout(() => setCopiedCode(false), 2000);
    }
  };

  const statusOptions: { value: SubmissionStatus; label: string; badge: string }[] = [
    { value: 'pending', label: '待處理 (Pending)', badge: 'bg-amber-100 text-amber-800 border-amber-300' },
    { value: 'processing', label: '製作中 (Processing)', badge: 'bg-blue-100 text-blue-800 border-blue-300' },
    { value: 'completed', label: '已完成 (Completed)', badge: 'bg-emerald-100 text-emerald-800 border-emerald-300' },
    { value: 'cancelled', label: '已取消 (Cancelled)', badge: 'bg-rose-100 text-rose-800 border-rose-300' }
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-900/60 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-4xl rounded-3xl bg-[#FAF8F5] border border-stone-200 shadow-2xl p-6 sm:p-8 space-y-6 text-slate-800 max-h-[92vh] overflow-y-auto">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-full bg-stone-200/70 hover:bg-stone-300 text-slate-600 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Top Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-stone-200">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xl sm:text-2xl font-black text-slate-900 font-mono tracking-tight">
                {submission.submission_code}
              </span>
              <button
                onClick={() => copyToClipboard(submission.submission_code)}
                className="p-1.5 rounded-lg bg-white border border-stone-200 text-slate-500 hover:text-slate-900 shadow-sm"
                title="複製編號"
              >
                {copiedCode ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
              </button>
            </div>
            <div className="text-xs text-slate-500 mt-1 flex flex-wrap items-center gap-3">
              <span className="flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5" />
                {new Date(submission.created_at).toLocaleString('zh-TW', { hour12: false })}
              </span>
              <span className="flex items-center gap-1">
                <User className="w-3.5 h-3.5" />
                {submission.customer_name}
              </span>
              <span className="flex items-center gap-1">
                <Mail className="w-3.5 h-3.5" />
                {submission.customer_email}
              </span>
            </div>
          </div>

          {/* Status Dropdown */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-600">管理狀態：</span>
            <select
              value={currentStatus}
              disabled={isUpdating}
              onChange={(e) => handleStatusUpdate(e.target.value as SubmissionStatus)}
              className="px-3 py-1.5 rounded-xl bg-white border border-stone-300 font-bold text-xs text-slate-800 shadow-sm outline-none focus:ring-2 focus:ring-pink-500/20"
            >
              {statusOptions.map(opt => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
            {isUpdating && <Loader2 className="w-4 h-4 animate-spin text-pink-500" />}
          </div>
        </div>

        {/* Plan Banner */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="p-4 rounded-2xl bg-white border border-stone-200 shadow-sm">
            <span className="text-[10px] font-mono uppercase text-slate-400 font-bold block">方案規格</span>
            <span className="text-base font-black text-slate-900 block mt-0.5">{getTierLabel(submission.plan)}</span>
          </div>

          <div className="p-4 rounded-2xl bg-white border border-stone-200 shadow-sm">
            <span className="text-[10px] font-mono uppercase text-slate-400 font-bold block">客製程度</span>
            <span className="text-base font-bold text-slate-700 block mt-0.5 font-mono">{TIER_OPTIONS[submission.plan].level}</span>
          </div>

          <div className="p-4 rounded-2xl bg-white border border-stone-200 shadow-sm">
            <span className="text-[10px] font-mono uppercase text-slate-400 font-bold block">方案功能摘要</span>
            <span className="text-lg font-black text-pink-600 block mt-0.5 font-mono">{TIER_OPTIONS[submission.plan].summary}</span>
          </div>
        </div>

        {/* Main 2-Column: Images & Specs */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
          
          {/* Section 1: Images Display */}
          <div className="space-y-4">
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
              <ImageIcon className="w-4 h-4 text-pink-500" />
              <span>圖片素材與 3D 成品預覽</span>
            </h4>

            {/* Preview Image */}
            <div className="p-4 rounded-2xl bg-white border border-stone-200 shadow-sm space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-slate-700">【3D 展示框完整打樣渲染】</span>
                {submission.preview_image_url && (
                  <a
                    href={submission.preview_image_url}
                    target="_blank"
                    rel="noreferrer"
                    className="text-pink-600 hover:text-pink-700 flex items-center gap-1 text-[11px] font-semibold"
                  >
                    <span>開新分頁看大圖</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                )}
              </div>
              <div className="h-64 rounded-xl bg-stone-100 flex items-center justify-center overflow-hidden border border-stone-200/80">
                {submission.preview_image_url ? (
                  <img
                    src={submission.preview_image_url}
                    alt="展示框預覽"
                    className="h-full object-contain"
                  />
                ) : (
                  <span className="text-xs text-slate-400">未擷取到渲染預覽圖</span>
                )}
              </div>
            </div>

            {/* Customer Photocard Image */}
            <div className="p-4 rounded-2xl bg-white border border-stone-200 shadow-sm space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-slate-700">【消費者指定小卡原圖】</span>
                {submission.card_image_url && (
                  <a
                    href={submission.card_image_url}
                    target="_blank"
                    rel="noreferrer"
                    className="text-pink-600 hover:text-pink-700 flex items-center gap-1 text-[11px] font-semibold"
                  >
                    <span>原始圖片</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                )}
              </div>
              <div className="h-44 rounded-xl bg-stone-100 flex items-center justify-center overflow-hidden border border-stone-200/80">
                {submission.card_image_url ? (
                  <img
                    src={submission.card_image_url}
                    alt="小卡素材"
                    className="h-full object-contain"
                  />
                ) : (
                  <span className="text-xs text-slate-400">使用純空框無小卡展示</span>
                )}
              </div>
            </div>
          </div>

          {/* Section 2: Detailed Customizer Options */}
          <div className="space-y-4">
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
              <Layers className="w-4 h-4 text-purple-600" />
              <span>客製化規格明細</span>
            </h4>

            <div className="p-4 rounded-2xl bg-white border border-stone-200 shadow-sm space-y-3 text-xs">
              <div className="flex justify-between py-1 border-b border-stone-100">
                <span className="text-slate-500 font-medium">固定框體外型:</span>
                <span className="font-bold text-slate-800">{submission.frame_style}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-stone-100">
                <span className="text-slate-500 font-medium">框體透光顏色:</span>
                <span className="font-bold text-slate-800">{submission.frame_color}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-stone-100">
                <span className="text-slate-500 font-medium">背景樣式設定:</span>
                <span className="font-bold text-slate-800">{submission.background}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-stone-100">
                <span className="text-slate-500 font-medium">原創裝飾貼飾:</span>
                <span className="font-bold text-slate-800">{submission.decorations}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-stone-100">
                <span className="text-slate-500 font-medium">客製刻印文字:</span>
                <span className="font-bold text-slate-800 font-mono">{submission.custom_text}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-stone-100">
                <span className="text-slate-500 font-medium">字體風格:</span>
                <span className="font-bold text-slate-800">{submission.font}</span>
              </div>
            </div>

            {/* Section 3: Full JSON Design Data */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                  <Code className="w-4 h-4 text-emerald-600" />
                  <span>完整 JSON 設計資料 (可還原)</span>
                </h4>
                <button
                  onClick={() => copyToClipboard(JSON.stringify(displayDesignData, null, 2), true)}
                  className="px-2.5 py-1 rounded-lg bg-white border border-stone-200 text-slate-600 hover:text-slate-900 text-xs font-semibold flex items-center gap-1 shadow-sm"
                >
                  {copiedJson ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedJson ? '已複製 JSON' : '複製 JSON'}</span>
                </button>
              </div>

              <pre className="p-3.5 rounded-2xl bg-stone-900 text-emerald-400 font-mono text-[11px] overflow-x-auto max-h-52 shadow-inner">
                {JSON.stringify(displayDesignData, null, 2)}
              </pre>
            </div>

          </div>

        </div>

        {/* Footer */}
        <div className="pt-3 border-t border-stone-200 flex justify-end">
          <button
            onClick={onClose}
            className="py-2.5 px-6 rounded-xl font-bold text-xs bg-stone-200 hover:bg-stone-300 text-slate-800 transition-colors"
          >
            關閉檢視
          </button>
        </div>

      </div>
    </div>
  );
};
