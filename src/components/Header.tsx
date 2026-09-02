import React from 'react';
import { Waves, Plus, HardDriveDownload, Utensils, Receipt, TrendingUp, Users, Smartphone } from 'lucide-react';

export type ActiveTab = 'ponds' | 'expenses' | 'sales' | 'feed' | 'members';

interface HeaderProps {
  activeTab: ActiveTab;
  onTabChange: (tab: ActiveTab) => void;
  onOpenAddModal: () => void;
  onOpenInstallModal: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  onTabChange,
  onOpenAddModal,
  onOpenInstallModal,
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
      <div className="max-w-4xl mx-auto px-4 pt-3.5 pb-2 sm:px-6">
        <div className="flex items-center justify-between gap-3">
          {/* Logo & Title */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/15 flex items-center justify-center border border-white/20 shadow-inner">
              <Waves className="w-6 h-6 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white leading-none">
                  পুকুর হিসাব
                </h1>
                <span className="hidden sm:inline-flex items-center gap-1 text-[11px] bg-emerald-900/80 text-emerald-100 font-medium px-2 py-0.5 rounded-full border border-emerald-700/60">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                  অফলাইন মোড
                </span>
              </div>
              <p className="text-xs text-emerald-100/85 mt-0.5 font-normal">
                পুকুর ব্যবস্থাপনা, খরচ ও বিক্রির সম্পূর্ণ হিসাব
              </p>
            </div>
          </div>

          {/* Quick Action Button based on Active Tab & APK install button */}
          <div className="flex items-center gap-2">
            <button
              id="header-install-app-btn"
              onClick={onOpenInstallModal}
              className="inline-flex items-center gap-1.5 bg-emerald-900/80 hover:bg-emerald-900 text-emerald-100 border border-emerald-600/60 active:scale-95 font-semibold text-xs sm:text-sm px-2.5 sm:px-3 py-2 rounded-lg shadow-sm transition-all cursor-pointer whitespace-nowrap"
              title="মোবাইল অ্যাপ বা APK হিসেবে ফোনে ডাউনলোড / ইনস্টল করুন"
            >
              <Smartphone className="w-4 h-4 text-emerald-300" />
              <span className="hidden xs:inline">অ্যাপ / APK</span>
            </button>

            <button
              id="header-action-btn"
              onClick={onOpenAddModal}
              className="inline-flex items-center gap-1.5 bg-white text-emerald-800 hover:bg-emerald-50 active:scale-95 font-semibold text-xs sm:text-sm px-3 sm:px-3.5 py-2 rounded-lg shadow-sm transition-all cursor-pointer whitespace-nowrap"
            >
              <Plus className="w-4 h-4 text-emerald-700 stroke-[2.5]" />
              <span>{getActionLabel()}</span>
            </button>
          </div>
        </div>

        {/* Tab Navigation (পুকুরসমূহ, খরচ, বিক্রি, দৈনিক খাবার) */}
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
