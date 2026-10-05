import React from 'react';
import { X, Sliders, Eye, Palette, CheckCircle } from 'lucide-react';

interface HowItWorksModalProps {
  isOpen: boolean;
  onClose: () => void;
  onStartCustomizing: () => void;
}

export const HowItWorksModal: React.FC<HowItWorksModalProps> = ({
  isOpen,
  onClose,
  onStartCustomizing
}) => {
  if (!isOpen) return null;

  const steps = [
    {
      step: '01',
      title: '選擇客製化程度',
      desc: '依據個人需求選擇 BASIC（簡易客製）、CUSTOM（文字客製）或 PREMIUM（自由客製）。不用一次面對複雜功能。',
      icon: Sliders
    },
    {
      step: '02',
      title: '進入互動式編輯器',
      desc: '系統根據您選擇的方案開放對應工具。三種方案皆可上傳小卡與選框色；CUSTOM 以上可加入文字；PREMIUM 可選主題背景與自由裝飾。',
      icon: Palette
    },
    {
      step: '03',
      title: '即時光影 3D 預覽',
      desc: '每一次顏色、背景、刻字或貼飾的更動，中央壓克力展示框都會零時差即時反應。',
      icon: Eye
    },
    {
      step: '04',
      title: '完成專屬展示框',
      desc: '確認最終設計內容與規格清單，保存您的專屬展示框設計概念！',
      icon: CheckCircle
    }
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-3xl bg-[#12141c] border border-white/15 p-6 sm:p-8 shadow-2xl space-y-6">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-full bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-pink-400 text-xs font-bold uppercase tracking-wider">
            <img src="/logo.png" alt="ONLYFRAME" className="w-4 h-4 rounded-sm object-contain" />
            <span>HOW IT WORKS ‧ 製作流程</span>
          </div>
          <h2 className="text-2xl font-black text-white">
            如何製作你的專屬收藏展示框？
          </h2>
          <p className="text-xs sm:text-sm text-slate-400">
            簡單 4 步驟，由你完全掌握客製化的深淺度。
          </p>
        </div>

        {/* Steps Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {steps.map((s, idx) => {
            const Icon = s.icon;
            return (
              <div
                key={idx}
                className="p-4 rounded-2xl bg-white/[0.02] border border-white/10 space-y-2 relative overflow-hidden group hover:border-pink-500/40 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono font-black text-pink-400">
                    STEP {s.step}
                  </span>
                  <Icon className="w-4 h-4 text-slate-400 group-hover:text-pink-400 transition-colors" />
                </div>
                <h3 className="text-sm font-bold text-white">{s.title}</h3>
                <p className="text-xs text-slate-400 leading-relaxed">{s.desc}</p>
              </div>
            );
          })}
        </div>

        {/* Footer Action */}
        <div className="pt-2 flex items-center justify-between border-t border-white/10">
          <span className="text-[11px] text-slate-500">
            * 企管系畢業專題 Prototype 概念平台
          </span>
          <button
            onClick={() => {
              onClose();
              onStartCustomizing();
            }}
            className="px-6 py-2.5 rounded-xl text-xs sm:text-sm font-bold bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white shadow-lg shadow-pink-500/20 transition-all flex items-center gap-2"
          >
            <img src="/logo.png" alt="ONLYFRAME" className="w-4 h-4 rounded-sm object-contain" />
            <span>立即挑選方案開始製作</span>
          </button>
        </div>

      </div>
    </div>
  );
};
