import React from 'react';
import {
  Waves,
  Plus,
  HardDriveDownload,
  Utensils,
  Receipt,
  TrendingUp,
  Users,
  Smartphone,
  FileSpreadsheet,
  Lock,
  RefreshCw,
  CheckCircle2
} from 'lucide-react';
import { GoogleUser } from '../services/googleSheetsService';

export type ActiveTab = 'ponds' | 'expenses' | 'sales' | 'feed' | 'members';

interface HeaderProps {
  activeTab: ActiveTab;
  onTabChange: (tab: ActiveTab) => void;
  onOpenAddModal: () => void;
  onOpenInstallModal: () => void;
  googleUser: GoogleUser | null;
  onOpenSyncModal: () => void;
  isSyncing: boolean;
  hasPasswordProtection: boolean;
  onLockApp: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  onTabChange,
  onOpenAddModal,
  onOpenInstallModal,
  googleUser,
  onOpenSyncModal,
  isSyncing,
  hasPasswordProtection,
  onLockApp,
}) => {
  const getActionLabel = () => {
    switch (activeTab) {
      case 'ponds':
        return 'পুকুর যোগ করুন';
      case 'expenses':
        return 'খরচ যোগ করুন';
      case 'sales':
        return 'বিক্রি যোগ করুন';
      case 'feed':
        return 'খাবার যোগ করুন';
      case 'members':
        return 'সদস্য যোগ করুন';
      default:
        return 'যোগ করুন';
    }
  };

  return (
    <header className="sticky top-0 z-30 bg-emerald-800 text-white shadow-md">
      <div className="max-w-4xl mx-auto px-4 pt-3 pb-2 sm:px-6">
        <div className="flex items-center justify-between gap-2">
          {/* Logo & Title */}
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-white/15 flex items-center justify-center border border-white/20 shadow-inner shrink-0">
              <Waves className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h1 className="text-lg sm:text-2xl font-bold tracking-tight text-white leading-none truncate">
                  পুকুর হিসাব
                </h1>
                {googleUser ? (
                  <span className="hidden sm:inline-flex items-center gap-1 text-[11px] bg-emerald-900/90 text-emerald-200 font-semibold px-2 py-0.5 rounded-full border border-emerald-600/50">
                    <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                    শীট সিঙ্ক সক্রিয়
                  </span>
                ) : (
                  <span className="hidden sm:inline-flex items-center gap-1 text-[11px] bg-emerald-900/80 text-emerald-100 font-medium px-2 py-0.5 rounded-full border border-emerald-700/60">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                    অফলাইন মোড
                  </span>
                )}
              </div>
              <p className="text-[11px] sm:text-xs text-emerald-100/85 mt-0.5 font-normal truncate">
                পুকুর ব্যবস্থাপনা, খরচ ও বিক্রির সম্পূর্ণ হিসাব
              </p>
            </div>
          </div>

          {/* Quick Actions: Google Sync, Passcode Lock, Install APK, Add Data */}
          <div className="flex items-center gap-1.5 shrink-0">
            {/* Quick Lock Button if Password Protected */}
            {hasPasswordProtection && (
              <button
                id="header-lock-app-btn"
                onClick={onLockApp}
                className="w-8 h-8 sm:w-9 sm:h-9 rounded-lg bg-emerald-900/80 hover:bg-emerald-900 text-emerald-200 border border-emerald-600/60 flex items-center justify-center transition-colors cursor-pointer"
                title="অ্যাপ পাসওয়ার্ড দিয়ে লক করুন"
              >
                <Lock className="w-4 h-4 text-emerald-300" />
              </button>
            )}

            {/* Google Account & Sheets Sync Button */}
            <button
              id="header-google-sync-btn"
              onClick={onOpenSyncModal}
              className={`inline-flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 sm:py-2 rounded-lg border font-semibold text-xs sm:text-sm transition-all cursor-pointer shadow-xs whitespace-nowrap ${
                googleUser
                  ? 'bg-emerald-900/90 text-emerald-100 border-emerald-600 hover:bg-emerald-950'
                  : 'bg-emerald-700/80 hover:bg-emerald-700 text-white border-emerald-500'
              }`}
              title="Gmail লগইন, পাসওয়ার্ড ও গুগল শীট সিঙ্ক"
            >
              {googleUser?.picture ? (
                <img
                  src={googleUser.picture}
                  alt={googleUser.name}
                  className="w-4 h-4 rounded-full border border-white"
                />
              ) : (
                <FileSpreadsheet className="w-4 h-4 text-emerald-200" />
              )}
              {isSyncing ? (
                <span className="flex items-center gap-1">
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  <span className="hidden sm:inline">সিঙ্ক হচ্ছে...</span>
                </span>
              ) : googleUser ? (
                <span className="hidden xs:inline text-emerald-200">গুগল শীট</span>
              ) : (
                <span className="text-white">গুগল লগইন</span>
              )}
            </button>

            {/* APK Install Button */}
            <button
              id="header-install-app-btn"
              onClick={onOpenInstallModal}
              className="inline-flex items-center gap-1.5 bg-emerald-900/80 hover:bg-emerald-900 text-emerald-100 border border-emerald-600/60 active:scale-95 font-semibold text-xs sm:text-sm px-2.5 sm:px-3 py-1.5 sm:py-2 rounded-lg shadow-sm transition-all cursor-pointer whitespace-nowrap"
              title="মোবাইল অ্যাপ বা APK হিসেবে ফোনে ডাউনলোড / ইনস্টল করুন"
            >
              <Smartphone className="w-4 h-4 text-emerald-300" />
              <span className="hidden md:inline">অ্যাপ / APK</span>
            </button>

            {/* Add Record Button */}
            <button
              id="header-action-btn"
              onClick={onOpenAddModal}
              className="inline-flex items-center gap-1 bg-white text-emerald-800 hover:bg-emerald-50 active:scale-95 font-bold text-xs sm:text-sm px-2.5 sm:px-3 py-1.5 sm:py-2 rounded-lg shadow-sm transition-all cursor-pointer whitespace-nowrap"
            >
              <Plus className="w-4 h-4 text-emerald-700 stroke-[2.5]" />
              <span>{getActionLabel()}</span>
            </button>
          </div>
        </div>

        {/* Tab Navigation (পুকুরসমূহ, খরচ, বিক্রি, দৈনিক খাবার, সদস্য) */}
        <div className="flex items-center gap-1.5 mt-3 pt-1 border-t border-emerald-700/60 overflow-x-auto scrollbar-none pb-0.5">
          <button
            id="tab-ponds-btn"
            onClick={() => onTabChange('ponds')}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 sm:py-2 rounded-lg font-semibold text-xs sm:text-sm transition-all cursor-pointer whitespace-nowrap shrink-0 ${
              activeTab === 'ponds'
                ? 'bg-white text-emerald-900 shadow-xs'
                : 'text-emerald-100 hover:bg-emerald-700/60'
            }`}
          >
            <Waves className="w-4 h-4" />
            <span>পুকুরসমূহ</span>
          </button>

          <button
            id="tab-expenses-btn"
            onClick={() => onTabChange('expenses')}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 sm:py-2 rounded-lg font-semibold text-xs sm:text-sm transition-all cursor-pointer whitespace-nowrap shrink-0 ${
              activeTab === 'expenses'
                ? 'bg-white text-rose-900 shadow-xs'
                : 'text-emerald-100 hover:bg-emerald-700/60'
            }`}
          >
            <Receipt className="w-4 h-4" />
            <span>খরচ হিসাব</span>
          </button>

          <button
            id="tab-sales-btn"
            onClick={() => onTabChange('sales')}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 sm:py-2 rounded-lg font-semibold text-xs sm:text-sm transition-all cursor-pointer whitespace-nowrap shrink-0 ${
              activeTab === 'sales'
                ? 'bg-white text-emerald-900 shadow-xs'
                : 'text-emerald-100 hover:bg-emerald-700/60'
            }`}
          >
            <TrendingUp className="w-4 h-4" />
            <span>মাছ বিক্রি</span>
          </button>

          <button
            id="tab-feed-btn"
            onClick={() => onTabChange('feed')}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 sm:py-2 rounded-lg font-semibold text-xs sm:text-sm transition-all cursor-pointer whitespace-nowrap shrink-0 ${
              activeTab === 'feed'
                ? 'bg-white text-emerald-900 shadow-xs'
                : 'text-emerald-100 hover:bg-emerald-700/60'
            }`}
          >
            <Utensils className="w-4 h-4" />
            <span>দৈনিক খাবার</span>
          </button>

          <button
            id="tab-members-btn"
            onClick={() => onTabChange('members')}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 sm:py-2 rounded-lg font-semibold text-xs sm:text-sm transition-all cursor-pointer whitespace-nowrap shrink-0 ${
              activeTab === 'members'
                ? 'bg-white text-emerald-900 shadow-xs'
                : 'text-emerald-100 hover:bg-emerald-700/60'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>সদস্য ও শেয়ার</span>
          </button>
        </div>

        {/* Mobile Offline Indicator Bar */}
        <div className="sm:hidden mt-2 pt-1.5 border-t border-emerald-700/40 flex items-center justify-between text-[11px] text-emerald-100">
          <span className="inline-flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
            ফোনের লোকাল ডাটাবেসে সংরক্ষিত (ইন্টারনেট ছাড়া কাজ করে)
          </span>
          <HardDriveDownload className="w-3.5 h-3.5 opacity-80" />
        </div>
      </div>
    </header>
  );
};
