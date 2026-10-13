import React, { useState } from 'react';
import { supabase, isSupabaseConfigured, isDemoMode, supabaseConfigurationError, isUserResearchAdmin } from '../../lib/supabase';
import { Mail, KeyRound, Loader2, ArrowLeft, ShieldAlert } from 'lucide-react';

interface AdminLoginProps {
  onLoginSuccess: (userEmail: string) => void;
  onBackToStore: () => void;
}

export const AdminLogin: React.FC<AdminLoginProps> = ({
  onLoginSuccess,
  onBackToStore
}) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (supabaseConfigurationError) { setErrorMsg(supabaseConfigurationError); return; }

    if (!email.trim() || !password) {
      setErrorMsg('請輸入管理者 Email 與密碼');
      return;
    }

    setLoading(true);

    if (isSupabaseConfigured() && supabase) {
      try {
        const { data, error } = await supabase.auth.signInWithPassword({
          email: email.trim(),
          password: password
        });

        if (error) {
          setErrorMsg(`登入失敗：${error.message}`);
        } else if (data.user) {
          if (await isUserResearchAdmin(data.user.id)) {
            onLoginSuccess(data.user.email || email);
          } else {
            await supabase.auth.signOut();
            setErrorMsg('此帳號尚未加入 ONLYFRAME 管理者名單，請先設定後台權限。');
          }
        }
      } catch (err: any) {
        setErrorMsg(`連線異常：${err.message || '請確認 Supabase 設定'}`);
      } finally {
        setLoading(false);
      }
    } else {
      // 離線模擬登入模式（用於尚未配置 Supabase 專案金鑰時進行本地專題展示）
      setTimeout(() => {
        setLoading(false);
        onLoginSuccess(email || 'admin@onlyframe.edu.tw');
      }, 400);
    }
  };

  const handleDemoBypass = () => {
    onLoginSuccess('demo-admin@onlyframe.edu.tw');
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center p-4">
      <div className="w-full max-w-md rounded-3xl bg-white border border-stone-200 shadow-2xl p-7 sm:p-8 space-y-6 text-slate-800">
        
        {/* Top Back Link */}
        <button
          onClick={onBackToStore}
          className="inline-flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-900 transition-colors font-semibold"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>返回小卡框客製前台</span>
        </button>

        {/* Brand Logo & Title */}
        <div className="text-center space-y-3">
          <img 
            src="/logo.png" 
            alt="ONLYFRAME" 
            className="w-14 h-14 rounded-2xl mx-auto shadow-md shadow-stone-300/40 object-contain"
          />
          <h2 className="text-2xl font-black text-slate-900 tracking-tight">
            ONLYFRAME 後台管理
          </h2>
          <p className="text-xs text-slate-500">
            畢業專題管理者後台 · 查看消費者送出之小卡框設計
          </p>
        </div>

        {/* Supabase Status Banner */}
        {isDemoMode() && (
          <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-200 text-xs text-amber-800 space-y-1">
            <div className="flex items-center gap-1.5 font-bold">
              <ShieldAlert className="w-4 h-4 text-amber-600 flex-shrink-0" />
              <span>本機展示模式提醒</span>
            </div>
            <p className="text-[11px] text-amber-700 leading-normal">
              目前尚未在 <code className="bg-amber-100 px-1 py-0.5 rounded font-mono">.env</code> 填入正式 Supabase 金鑰，系統已啟用本機安全展示模式，可直接點擊「展示模式直接登入」進行完整審查。
            </p>
          </div>
        )}

        {supabaseConfigurationError && <p role="alert" className="p-3 rounded-xl bg-red-50 text-xs text-red-700">{supabaseConfigurationError}</p>}

        {errorMsg && (
          <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-xs text-red-600 font-medium">
            {errorMsg}
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleLogin} className="space-y-4">
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
              <Mail className="w-3.5 h-3.5 text-slate-400" />
              <span>管理者信箱</span>
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@onlyframe.edu.tw"
              className="w-full px-3.5 py-2.5 rounded-xl bg-stone-50 border border-stone-300 focus:bg-white focus:border-pink-500 focus:ring-2 focus:ring-pink-500/20 text-xs text-slate-800 outline-none transition-all"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
              <KeyRound className="w-3.5 h-3.5 text-slate-400" />
              <span>管理者密碼</span>
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full px-3.5 py-2.5 rounded-xl bg-stone-50 border border-stone-300 focus:bg-white focus:border-pink-500 focus:ring-2 focus:ring-pink-500/20 text-xs text-slate-800 outline-none transition-all"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-xl font-bold text-xs bg-slate-900 hover:bg-slate-800 text-white shadow-md transition-all flex items-center justify-center gap-2 active:scale-95 disabled:opacity-50"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>正在驗證管理者權限……</span>
              </>
            ) : (
              <span>登入管理系統</span>
            )}
          </button>
        </form>

        {/* Quick Demo Bypass for local assessment */}
        {isDemoMode() && (
          <div className="pt-2 border-t border-stone-100 text-center">
            <button
              onClick={handleDemoBypass}
              type="button"
              className="w-full py-2.5 px-3 rounded-xl text-xs font-bold bg-pink-50 hover:bg-pink-100 text-pink-600 border border-pink-200 transition-colors flex items-center justify-center gap-2"
            >
              <img src="/logo.png" alt="ONLYFRAME" className="w-4 h-4 rounded-sm object-contain" />
              <span>展示模式直接進入管理後台 ➔</span>
            </button>
          </div>
        )}

      </div>
    </div>
  );
};
