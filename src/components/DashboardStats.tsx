import React from 'react';
import { Waves, Receipt, TrendingUp, DollarSign, Utensils, ArrowUpRight, ArrowDownRight, Sparkles, Users, PieChart } from 'lucide-react';
import { toBnNumber } from '../utils/storage';
import { DashboardStats as StatsType } from '../types';

interface DashboardStatsProps {
  stats: StatsType;
  onNavigateToPonds?: () => void;
  onNavigateToExpenses?: () => void;
  onNavigateToSales?: () => void;
  onNavigateToFeed?: () => void;
  onNavigateToMembers?: () => void;
}

export const DashboardStats: React.FC<DashboardStatsProps> = ({
  stats,
  onNavigateToPonds,
  onNavigateToExpenses,
  onNavigateToSales,
  onNavigateToFeed,
  onNavigateToMembers,
}) => {
  const isProfitable = stats.totalProfit >= 0;

  return (
    <section className="mb-6" aria-label="ড্যাশবোর্ড সারসংক্ষেপ">
      <div className="flex items-center justify-between mb-3.5">
        <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
          <span>সামগ্রিক খামার ড্যাশবোর্ড</span>
        </h2>
        <span className="text-xs font-semibold text-emerald-800 bg-emerald-100/90 border border-emerald-200 px-2.5 py-1 rounded-md flex items-center gap-1">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse"></span>
          খরচ, বিক্রি ও খাবার হিসাব সক্রিয়
        </span>
      </div>

      {/* 4 Dashboard Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {/* Card 1: মোট পুকুর */}
        <div
          id="stat-card-total-ponds"
          onClick={onNavigateToPonds}
          className="bg-white rounded-xl p-4 border border-emerald-100 shadow-sm hover:shadow transition-shadow relative overflow-hidden cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs sm:text-sm font-semibold text-slate-600 group-hover:text-emerald-800 transition-colors">
              মোট পুকুর
            </span>
            <div className="w-8 h-8 rounded-lg bg-emerald-100 flex items-center justify-center text-emerald-700">
              <Waves className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2.5 flex items-baseline gap-1.5">
            <span className="text-2xl sm:text-3xl font-extrabold text-emerald-800 tracking-tight">
              {toBnNumber(stats.totalPonds)}
            </span>
            <span className="text-xs sm:text-sm font-medium text-slate-500">
              টি পুকুর
            </span>
          </div>
          <p className="text-[11px] text-emerald-600 mt-1.5 font-medium flex items-center gap-1">
            <Sparkles className="w-3 h-3 inline" /> সক্রিয় খামারভুক্ত
          </p>
        </div>

        {/* Card 2: মোট খরচ */}
        <div
          id="stat-card-total-cost"
          onClick={onNavigateToExpenses}
          className="bg-white rounded-xl p-4 border border-rose-100 shadow-sm hover:shadow transition-shadow relative overflow-hidden cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs sm:text-sm font-semibold text-slate-600 group-hover:text-rose-800 transition-colors">
              মোট খরচ
            </span>
            <div className="w-8 h-8 rounded-lg bg-rose-100 flex items-center justify-center text-rose-700">
              <Receipt className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2.5 flex items-baseline gap-1">
            <span className="text-2xl sm:text-3xl font-extrabold text-rose-700 tracking-tight">
              {toBnNumber(stats.totalCost)}
            </span>
            <span className="text-xs sm:text-sm font-semibold text-slate-500">
              ৳
            </span>
          </div>
          <p className="text-[11px] text-rose-600 mt-1.5 font-medium flex items-center gap-1">
            <ArrowDownRight className="w-3 h-3 inline" /> খাবার, পোনা ও অন্যান্য
          </p>
        </div>

        {/* Card 3: মোট বিক্রি */}
        <div
          id="stat-card-total-sales"
          onClick={onNavigateToSales}
          className="bg-white rounded-xl p-4 border border-emerald-200 shadow-sm hover:shadow transition-shadow relative overflow-hidden cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs sm:text-sm font-semibold text-slate-600 group-hover:text-emerald-800 transition-colors">
              মোট বিক্রি
            </span>
            <div className="w-8 h-8 rounded-lg bg-emerald-100 flex items-center justify-center text-emerald-700">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2.5 flex items-baseline gap-1">
            <span className="text-2xl sm:text-3xl font-extrabold text-emerald-700 tracking-tight">
              {toBnNumber(stats.totalSales)}
            </span>
            <span className="text-xs sm:text-sm font-semibold text-slate-500">
              ৳
            </span>
          </div>
          <p className="text-[11px] text-emerald-600 mt-1.5 font-medium flex items-center gap-1">
            <ArrowUpRight className="w-3 h-3 inline" /> মাছ বিক্রির মোট আয়
          </p>
        </div>

        {/* Card 4: নিট লাভ / ক্ষতি */}
        <div
          id="stat-card-total-profit"
          className={`rounded-xl p-4 border shadow-sm relative overflow-hidden transition-shadow ${
            isProfitable
              ? 'bg-gradient-to-br from-emerald-50 to-teal-50 border-emerald-300/80 text-emerald-900'
              : 'bg-gradient-to-br from-amber-50 to-rose-50 border-amber-300 text-rose-950'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs sm:text-sm font-bold">
              {isProfitable ? 'নিট লাভ' : 'চলতি ঘাটতি / লোকসান'}
            </span>
            <div
              className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                isProfitable
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'bg-amber-600 text-white shadow-xs'
              }`}
            >
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2.5 flex items-baseline gap-1">
            <span
              className={`text-2xl sm:text-3xl font-black tracking-tight ${
                isProfitable ? 'text-emerald-800' : 'text-amber-800'
              }`}
            >
              {isProfitable ? '+' : '-'} {toBnNumber(Math.abs(stats.totalProfit))}
            </span>
            <span className="text-xs sm:text-sm font-bold">
              ৳
            </span>
          </div>
          <p
            className={`text-[11px] mt-1.5 font-semibold flex items-center gap-1 ${
              isProfitable ? 'text-emerald-700' : 'text-amber-800'
            }`}
          >
            {isProfitable ? '✓ লাভজনক খামার পরিচালনা' : '⚠ মোট খরচ বিক্রির চেয়ে বেশি'}
          </p>
        </div>
      </div>

      {/* Quick Action Sub-bar for Today's Feed & Members/Shares */}
      <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-2.5">
        {/* Today's Feed Quick Bar */}
        <div className="bg-white rounded-xl border border-slate-200/90 p-2.5 sm:p-3 flex items-center justify-between gap-2 text-xs">
          <div
            onClick={onNavigateToFeed}
            className="flex items-center gap-2 cursor-pointer hover:opacity-80 transition-opacity"
          >
            <div className="w-7 h-7 rounded-md bg-amber-100 text-amber-800 flex items-center justify-center shrink-0">
              <Utensils className="w-3.5 h-3.5" />
            </div>
            <div>
              <span className="font-semibold text-slate-700">আজকের খাবার: </span>
              <span className="font-bold text-amber-900">
                {toBnNumber(stats.todayFeedKg % 1 === 0 ? stats.todayFeedKg : stats.todayFeedKg.toFixed(1))} কেজি
              </span>
              <span className="text-slate-400 ml-1.5 text-[11px] hidden xs:inline">
                ({toBnNumber(stats.totalFeedRecords)} রেকর্ড)
              </span>
            </div>
          </div>

          <button
            onClick={onNavigateToFeed}
            className="text-xs font-semibold text-emerald-700 hover:text-emerald-800 hover:underline cursor-pointer shrink-0"
          >
            খাবার দেখুন →
          </button>
        </div>

        {/* Members & Shares Quick Bar */}
        <div className="bg-white rounded-xl border border-slate-200/90 p-2.5 sm:p-3 flex items-center justify-between gap-2 text-xs">
          <div
            onClick={onNavigateToMembers}
            className="flex items-center gap-2 cursor-pointer hover:opacity-80 transition-opacity"
          >
            <div className="w-7 h-7 rounded-md bg-emerald-100 text-emerald-800 flex items-center justify-center shrink-0">
              <Users className="w-3.5 h-3.5" />
            </div>
            <div>
              <span className="font-semibold text-slate-700">সদস্য ও শেয়ার: </span>
              <span className="font-bold text-emerald-900">
                {toBnNumber(stats.totalMembers)} জন
              </span>
              <span className="text-emerald-700 font-semibold ml-1.5 text-[11px]">
                ({toBnNumber(stats.totalShares)} টি শেয়ার)
              </span>
            </div>
          </div>

          <button
            id="dashboard-view-members-btn"
            onClick={onNavigateToMembers}
            className="text-xs font-semibold text-emerald-700 hover:text-emerald-800 hover:underline cursor-pointer shrink-0"
          >
            সদস্য লিস্ট →
          </button>
        </div>
      </div>
    </section>
  );
};
