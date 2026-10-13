import React, { useState, useEffect, useMemo } from 'react';
import { DesignSubmission, SubmissionStatus, CustomizationTier } from '../../types';
import { fetchAllSubmissions, supabase, isSupabaseConfigured, isUserResearchAdmin } from '../../lib/supabase';
import { Session } from '@supabase/supabase-js';
import { AdminLogin } from './AdminLogin';
import { SubmissionDetailModal } from './SubmissionDetailModal';
import { 
  Search, 
  RefreshCw, 
  LogOut, 
  ArrowLeft, 
  Eye, 
  ShieldCheck, 
  FileSpreadsheet
} from 'lucide-react';

interface AdminDashboardProps {
  onBackToStore: () => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ onBackToStore }) => {
  const [currentUserEmail, setCurrentUserEmail] = useState<string | null>(null);
  const [submissions, setSubmissions] = useState<DesignSubmission[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [selectedSubmission, setSelectedSubmission] = useState<DesignSubmission | null>(null);

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [planFilter, setPlanFilter] = useState<'ALL' | CustomizationTier>('ALL');
  const [statusFilter, setStatusFilter] = useState<'ALL' | SubmissionStatus>('ALL');
  const [sortOrder, setSortOrder] = useState<'desc' | 'asc'>('desc');

  // Check Auth State on mount
  useEffect(() => {
    if (isSupabaseConfigured() && supabase) {
      let active = true;
      let checkNumber = 0;
      const checkSession = async (session: Session | null) => {
        const currentCheck = ++checkNumber;
        if (!session?.user.email) { setCurrentUserEmail(null); return; }
        try {
          const allowed = await isUserResearchAdmin(session.user.id);
          if (active && currentCheck === checkNumber) setCurrentUserEmail(allowed ? session.user.email : null);
        } catch {
          if (active && currentCheck === checkNumber) setCurrentUserEmail(null);
        }
      };
      supabase.auth.getSession().then(({ data }) => { if (active) void checkSession(data.session); });

      const { data: authListener } = supabase.auth.onAuthStateChange((_, session) => {
        // Run database calls after the auth callback releases its session lock.
        setTimeout(() => { if (active) void checkSession(session); }, 0);
      });

      return () => {
        active = false;
        authListener.subscription.unsubscribe();
      };
    }
  }, []);

  // Fetch submissions when authenticated
  const loadData = async () => {
    setLoading(true);
    setLoadError('');
    try {
      const data = await fetchAllSubmissions();
      setSubmissions(data);
    } catch (err: any) {
      console.error('Failed to load submissions:', err);
      setLoadError(err.message || '無法載入雲端資料，請稍後重新整理。');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (currentUserEmail) {
      loadData();
    }
  }, [currentUserEmail]);

  const handleLogout = async () => {
    if (isSupabaseConfigured() && supabase) {
      await supabase.auth.signOut();
    }
    setCurrentUserEmail(null);
  };

  // Metrics calculation
  const metrics = useMemo(() => {
    const total = submissions.length;
    const basicCount = submissions.filter(s => s.plan === 'BASIC').length;
    const customCount = submissions.filter(s => s.plan === 'CUSTOM').length;
    const premiumCount = submissions.filter(s => s.plan === 'PREMIUM').length;
    

    const todayStr = new Date().toISOString().slice(0, 10);
    const todayCount = submissions.filter(s => s.created_at && s.created_at.slice(0, 10) === todayStr).length;

    return {
      total,
      basicCount,
      customCount,
      premiumCount,
      todayCount
    };
  }, [submissions]);

  // Filtered & Sorted Submissions
  const filteredSubmissions = useMemo(() => {
    return submissions.filter(item => {
      // Search
      const query = searchQuery.trim().toLowerCase();
      if (query) {
        const matchCode = item.submission_code.toLowerCase().includes(query);
        const matchName = item.customer_name.toLowerCase().includes(query);
        const matchEmail = item.customer_email.toLowerCase().includes(query);
        if (!matchCode && !matchName && !matchEmail) return false;
      }

      // Plan
      if (planFilter !== 'ALL' && item.plan !== planFilter) {
        return false;
      }

      // Status
      if (statusFilter !== 'ALL' && item.status !== statusFilter) {
        return false;
      }

      return true;
    }).sort((a, b) => {
      const timeA = new Date(a.created_at).getTime();
      const timeB = new Date(b.created_at).getTime();
      return sortOrder === 'desc' ? timeB - timeA : timeA - timeB;
    });
  }, [submissions, searchQuery, planFilter, statusFilter, sortOrder]);

  // If not logged in, show Admin Login view
  if (!currentUserEmail) {
    return (
      <AdminLogin
        onLoginSuccess={(email) => setCurrentUserEmail(email)}
        onBackToStore={onBackToStore}
      />
    );
  }

  const getStatusBadge = (status: SubmissionStatus) => {
    switch (status) {
      case 'pending':
        return <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-amber-100 text-amber-800 border border-amber-200">待處理</span>;
      case 'processing':
        return <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-blue-100 text-blue-800 border border-blue-200">製作中</span>;
      case 'completed':
        return <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">已完成</span>;
      case 'cancelled':
        return <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-rose-100 text-rose-800 border border-rose-200">已取消</span>;
      default:
        return <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-stone-100 text-stone-700">待處理</span>;
    }
  };

  const getPlanBadge = (plan: CustomizationTier) => {
    switch (plan) {
      case 'BASIC':
        return <span className="px-2.5 py-0.5 rounded-md text-[11px] font-bold bg-stone-100 text-stone-700 border border-stone-300">BASIC 簡易客製</span>;
      case 'CUSTOM':
        return <span className="px-2.5 py-0.5 rounded-md text-[11px] font-bold bg-purple-100 text-purple-700 border border-purple-200">CUSTOM 文字客製</span>;
      case 'PREMIUM':
        return <span className="px-2.5 py-0.5 rounded-md text-[11px] font-bold bg-pink-100 text-pink-700 border border-pink-200">PREMIUM 自由客製</span>;
      default:
        return <span className="px-2.5 py-0.5 rounded-md text-[11px] font-bold bg-stone-100 text-stone-700">{plan}</span>;
    }
  };

  return (
    <div className="min-h-screen bg-[#FAF8F5] text-slate-800 p-4 sm:p-6 lg:p-8 space-y-6">
      
      {/* Top Navbar */}
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-3xl bg-white border border-stone-200 shadow-sm">
        <div className="flex items-center gap-3">
          <button
            onClick={onBackToStore}
            className="p-2 rounded-xl bg-stone-100 hover:bg-stone-200 text-slate-600 transition-colors"
            title="返回客製化商店首頁"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <img 
            src="/logo.png" 
            alt="ONLYFRAME" 
            className="w-9 h-9 rounded-xl shadow-sm object-contain"
          />
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-black text-slate-900 tracking-tight">
                ONLYFRAME · 管理者後台
              </h1>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-pink-100 text-pink-600 border border-pink-200 font-mono">
                ADMIN
              </span>
            </div>
            <p className="text-xs text-slate-500">
              畢業專題研究 · 實時消費者客製化設計數據監控
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="hidden sm:flex items-center gap-1.5 text-xs text-slate-600 font-medium px-3 py-1.5 rounded-xl bg-stone-100">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            <span>{currentUserEmail}</span>
          </div>

          <button
            onClick={loadData}
            disabled={loading}
            className="p-2 rounded-xl bg-stone-100 hover:bg-stone-200 text-slate-700 transition-colors"
            title="重新整理數據"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-pink-500' : ''}`} />
          </button>

          <button
            onClick={handleLogout}
            className="px-3.5 py-1.5 rounded-xl text-xs font-bold bg-stone-100 hover:bg-rose-50 hover:text-rose-600 text-slate-700 transition-colors flex items-center gap-1.5"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>登出</span>
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto space-y-6">

        {loadError && <p role="alert" className="p-3 rounded-xl border border-red-200 bg-red-50 text-sm text-red-700">{loadError}</p>}

        {/* Research metrics */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4">
          
          <div className="p-4 rounded-2xl bg-white border border-stone-200 shadow-sm space-y-1">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">總設計數</span>
            <div className="text-2xl font-black text-slate-900 font-mono">{metrics.total}</div>
            <span className="text-[10px] text-slate-400">累計收到客製提交</span>
          </div>

          <div className="p-4 rounded-2xl bg-white border border-stone-200 shadow-sm space-y-1">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">BASIC 簡易客製</span>
            <div className="text-2xl font-black text-slate-800 font-mono">{metrics.basicCount}</div>
            <span className="text-[10px] text-stone-500 font-medium">低客製化 · 框體外觀</span>
          </div>

          <div className="p-4 rounded-2xl bg-white border border-stone-200 shadow-sm space-y-1">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">CUSTOM 文字客製</span>
            <div className="text-2xl font-black text-purple-600 font-mono">{metrics.customCount}</div>
            <span className="text-[10px] text-purple-500 font-medium">中客製化 · 外觀與文字</span>
          </div>

          <div className="p-4 rounded-2xl bg-white border border-stone-200 shadow-sm space-y-1">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">PREMIUM 自由客製</span>
            <div className="text-2xl font-black text-pink-600 font-mono">{metrics.premiumCount}</div>
            <span className="text-[10px] text-pink-500 font-medium">高客製化 · 全部設計工具</span>
          </div>

          <div className="p-4 rounded-2xl bg-white border border-stone-200 shadow-sm space-y-1">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">今日提交</span>
            <div className="text-2xl font-black text-slate-900 font-mono">{metrics.todayCount}</div>
            <span className="text-[10px] text-slate-400">當日即時收件</span>
          </div>

        </div>

        {/* Filter & Search Bar */}
        <div className="p-4 rounded-2xl bg-white border border-stone-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs">
          
          {/* Search Box */}
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="搜尋設計編號 (DES-...)、顧客姓名或 Email"
              className="w-full pl-9 pr-3.5 py-2 rounded-xl bg-stone-50 border border-stone-200 focus:bg-white focus:border-pink-500 focus:ring-2 focus:ring-pink-500/20 text-xs text-slate-800 outline-none transition-all"
            />
          </div>

          {/* Filters Selectors */}
          <div className="flex flex-wrap items-center gap-2">
            
            {/* Plan Filter */}
            <div className="flex items-center gap-1.5 bg-stone-50 px-2.5 py-1.5 rounded-xl border border-stone-200">
              <span className="text-slate-500 font-medium">方案:</span>
              <select
                value={planFilter}
                onChange={(e) => setPlanFilter(e.target.value as any)}
                className="bg-transparent font-bold text-slate-800 outline-none cursor-pointer"
              >
                <option value="ALL">全部方案</option>
                <option value="BASIC">BASIC 簡易客製</option>
                <option value="CUSTOM">CUSTOM 文字客製</option>
                <option value="PREMIUM">PREMIUM 自由客製</option>
              </select>
            </div>

            {/* Status Filter */}
            <div className="flex items-center gap-1.5 bg-stone-50 px-2.5 py-1.5 rounded-xl border border-stone-200">
              <span className="text-slate-500 font-medium">狀態:</span>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as any)}
                className="bg-transparent font-bold text-slate-800 outline-none cursor-pointer"
              >
                <option value="ALL">全部狀態</option>
                <option value="pending">待處理</option>
                <option value="processing">製作中</option>
                <option value="completed">已完成</option>
                <option value="cancelled">已取消</option>
              </select>
            </div>

            {/* Sort Order */}
            <div className="flex items-center gap-1.5 bg-stone-50 px-2.5 py-1.5 rounded-xl border border-stone-200">
              <span className="text-slate-500 font-medium">排序:</span>
              <select
                value={sortOrder}
                onChange={(e) => setSortOrder(e.target.value as any)}
                className="bg-transparent font-bold text-slate-800 outline-none cursor-pointer"
              >
                <option value="desc">最新優先</option>
                <option value="asc">最舊優先</option>
              </select>
            </div>

          </div>
        </div>

        {/* Submissions Table */}
        <div className="rounded-3xl bg-white border border-stone-200 shadow-sm overflow-hidden">
          
          <div className="p-4 sm:p-5 border-b border-stone-100 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FileSpreadsheet className="w-4 h-4 text-pink-500" />
              <h2 className="text-sm sm:text-base font-bold text-slate-900">
                設計提交紀錄列表 ({filteredSubmissions.length} 筆)
              </h2>
            </div>
            <span className="text-xs text-slate-400">點擊「查看」可展開完整打樣參數與原始圖檔</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-stone-50/80 text-slate-500 font-bold uppercase tracking-wider border-b border-stone-200">
                <tr>
                  <th className="py-3 px-4 sm:px-6">設計編號</th>
                  <th className="py-3 px-4">提交日期</th>
                  <th className="py-3 px-4">客戶名稱</th>
                  <th className="py-3 px-4">方案</th>
                  <th className="py-3 px-4">狀態</th>
                  <th className="py-3 px-4 text-right">操作</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {filteredSubmissions.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-12 text-center text-slate-400">
                      {loading ? '正在載入後端資料……' : '目前尚無符合篩選條件的設計提交資料。'}
                    </td>
                  </tr>
                ) : (
                  filteredSubmissions.map((sub) => (
                    <tr key={sub.id} className="hover:bg-stone-50/70 transition-colors">
                      <td className="py-3.5 px-4 sm:px-6 font-mono font-bold text-slate-900">
                        {sub.submission_code}
                      </td>
                      <td className="py-3.5 px-4 text-slate-500">
                        {new Date(sub.created_at).toLocaleDateString('zh-TW')}
                        <span className="text-[10px] text-slate-400 block font-mono">
                          {new Date(sub.created_at).toLocaleTimeString('zh-TW', { hour12: false, hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="font-bold text-slate-800 block truncate max-w-[120px]">
                          {sub.customer_name}
                        </span>
                        <span className="text-[11px] text-slate-400 block truncate max-w-[140px]">
                          {sub.customer_email}
                        </span>
                      </td>
                      <td className="py-3.5 px-4">
                        {getPlanBadge(sub.plan)}
                      </td>
                      <td className="py-3.5 px-4">
                        {getStatusBadge(sub.status)}
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <button
                          onClick={() => setSelectedSubmission(sub)}
                          className="py-1.5 px-3 rounded-lg bg-pink-50 hover:bg-pink-100 text-pink-600 font-bold text-xs transition-colors inline-flex items-center gap-1 shadow-sm border border-pink-200"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>查看</span>
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

        </div>

      </div>

      {/* Detail Modal */}
      {selectedSubmission && (
        <SubmissionDetailModal
          submission={selectedSubmission}
          onClose={() => setSelectedSubmission(null)}
          onStatusChange={(newStatus) => {
            setSubmissions(prev =>
              prev.map(item => item.id === selectedSubmission.id ? { ...item, status: newStatus } : item)
            );
            setSelectedSubmission(prev => prev ? { ...prev, status: newStatus } : null);
          }}
        />
      )}

    </div>
  );
};
