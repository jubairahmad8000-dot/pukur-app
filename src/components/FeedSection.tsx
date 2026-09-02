import React, { useState, useMemo } from 'react';
import { Pond, FeedLog } from '../types';
import { Utensils, Plus, Calendar, Clock, Edit, Trash2, FileText, Filter, AlertCircle, Waves } from 'lucide-react';
import { toBnNumber, formatBnDate, getTodayDateStr } from '../utils/storage';

interface FeedSectionProps {
  feedLogs: FeedLog[];
  ponds: Pond[];
  onAddFeed: (pondId?: string) => void;
  onEditFeed: (feed: FeedLog) => void;
  onDeleteFeed: (feed: FeedLog) => void;
}

export const FeedSection: React.FC<FeedSectionProps> = ({
  feedLogs,
  ponds,
  onAddFeed,
  onEditFeed,
  onDeleteFeed,
}) => {
  const [selectedPondId, setSelectedPondId] = useState<string>('all');
  const [dateFilter, setDateFilter] = useState<'all' | 'today'>('all');

  const todayStr = getTodayDateStr();

  // পুকুরের নাম পাওয়ার জন্য একটি লুকআপ ম্যাপ
  const pondMap = useMemo(() => {
    const map = new Map<string, Pond>();
    ponds.forEach((p) => map.set(p.id, p));
    return map;
  }, [ponds]);

  // ফিল্টার করা খাবার তালিকা
  const filteredLogs = useMemo(() => {
    return feedLogs
      .filter((log) => {
        if (selectedPondId !== 'all' && log.pondId !== selectedPondId) {
          return false;
        }
        if (dateFilter === 'today' && log.date !== todayStr) {
          return false;
        }
        return true;
      })
      .sort((a, b) => {
        // তারিখ অনুযায়ী ডিসেন্ডিং
        if (a.date !== b.date) {
          return b.date.localeCompare(a.date);
        }
        return (b.createdAt || '').localeCompare(a.createdAt || '');
      });
  }, [feedLogs, selectedPondId, dateFilter, todayStr]);

  // পরিসংখ্যান হিসাব
  const todayTotalKg = useMemo(() => {
    return feedLogs
      .filter((log) => log.date === todayStr)
      .reduce((acc, curr) => {
        const val = Number(curr.amount) || 0;
        if (curr.unit === 'কেজি') return acc + val;
        if (curr.unit === 'গ্রাম') return acc + val / 1000;
        if (curr.unit === 'বস্তা') return acc + val * 25; // ধরা যাক ১ বস্তা = ২৫ কেজি
        return acc + val;
      }, 0);
  }, [feedLogs, todayStr]);

  const totalLogsCount = feedLogs.length;

  return (
    <section className="mt-4" aria-label="দৈনিক খাবার হিসাব">
      {/* ১. খাবার সারসংক্ষেপ ব্যানার কার্ড */}
      <div className="bg-gradient-to-r from-emerald-800 to-teal-800 rounded-2xl text-white p-4 sm:p-5 shadow-sm mb-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-white/15 flex items-center justify-center border border-white/20">
              <Utensils className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-bold">দৈনিক খাবার হিসাব</h2>
              <p className="text-xs text-emerald-100">
                পুকুরে প্রতিদিন কী পরিমাণ খাদ্য দেওয়া হচ্ছে তার হিসাব
              </p>
            </div>
          </div>

          {/* Quick Metrics */}
          <div className="flex items-center gap-3 bg-black/20 p-2.5 rounded-xl border border-white/10">
            <div className="px-3 border-r border-white/15 text-center">
              <span className="text-[11px] text-emerald-200 block">আজকের খাবার</span>
              <span className="text-lg sm:text-xl font-bold text-white">
                {toBnNumber(todayTotalKg % 1 === 0 ? todayTotalKg : todayTotalKg.toFixed(1))} <span className="text-xs">কেজি</span>
              </span>
            </div>
            <div className="px-3 text-center">
              <span className="text-[11px] text-emerald-200 block">মোট এন্ট্রি</span>
              <span className="text-lg sm:text-xl font-bold text-white">
                {toBnNumber(totalLogsCount)} <span className="text-xs">টি</span>
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* ২. ফিল্টার ও বাটন বার */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 bg-white p-3.5 rounded-xl border border-slate-200">
        <div className="flex flex-wrap items-center gap-2 text-xs">
          <span className="text-slate-500 font-medium flex items-center gap-1">
            <Filter className="w-3.5 h-3.5" /> ফিল্টার:
          </span>

          {/* পুকুর ফিল্টার */}
          <select
            id="feed-pond-filter"
            value={selectedPondId}
            onChange={(e) => setSelectedPondId(e.target.value)}
            className="px-2.5 py-1.5 rounded-lg border border-slate-300 bg-slate-50 text-slate-700 font-medium focus:outline-none focus:ring-1 focus:ring-emerald-500 cursor-pointer text-xs"
          >
            <option value="all">সকল পুকুর ({toBnNumber(ponds.length)})</option>
            {ponds.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>

          {/* তারিখ ফিল্টার বাটন */}
          <div className="inline-flex rounded-lg border border-slate-300 p-0.5 bg-slate-50">
            <button
              onClick={() => setDateFilter('all')}
              className={`px-2.5 py-1 rounded-md text-xs font-semibold transition-all cursor-pointer ${
                dateFilter === 'all'
                  ? 'bg-emerald-700 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              সব তারিখ
            </button>
            <button
              onClick={() => setDateFilter('today')}
              className={`px-2.5 py-1 rounded-md text-xs font-semibold transition-all cursor-pointer ${
                dateFilter === 'today'
                  ? 'bg-emerald-700 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              শুধুমাত্র আজ
            </button>
          </div>
        </div>

        {/* নতুন খাবার যোগ বাটন */}
        <button
          id="add-feed-btn"
          onClick={() => onAddFeed(selectedPondId !== 'all' ? selectedPondId : undefined)}
          className="inline-flex items-center justify-center gap-1.5 bg-emerald-700 hover:bg-emerald-800 text-white px-3.5 py-2 rounded-lg font-semibold text-xs sm:text-sm shadow-sm transition-all cursor-pointer active:scale-95 shrink-0"
        >
          <Plus className="w-4 h-4 stroke-[2.5]" />
          <span>খাবার যোগ করুন</span>
        </button>
      </div>

      {/* ৩. খাবার এন্ট্রিসমূহ */}
      {feedLogs.length === 0 ? (
        <div
          id="empty-feed-state"
          className="bg-white rounded-2xl border-2 border-dashed border-emerald-200 p-8 text-center my-4 max-w-lg mx-auto shadow-xs"
        >
          <div className="w-16 h-16 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center mx-auto mb-3 shadow-inner">
            <Utensils className="w-8 h-8" />
          </div>
          <h3 className="text-base sm:text-lg font-bold text-slate-800">
            এখনও কোনো খাবার হিসাব যোগ করা হয়নি
          </h3>
          <p className="text-xs sm:text-sm text-slate-500 max-w-sm mx-auto mt-1 mb-5">
            প্রতিদিন পুকুরে মাছকে কতটুকু খাবার দিচ্ছেন তার সঠিক হিসাব রাখতে এখনই এন্ট্রি করুন।
          </p>
          <button
            id="empty-state-add-feed-btn"
            onClick={() => onAddFeed()}
            className="inline-flex items-center gap-2 bg-emerald-700 hover:bg-emerald-800 text-white font-semibold text-sm px-5 py-2.5 rounded-xl shadow-md active:scale-95 transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>প্রথম খাবার এন্ট্রি করুন</span>
          </button>
        </div>
      ) : filteredLogs.length === 0 ? (
        <div className="bg-white rounded-xl border border-slate-200 p-8 text-center">
          <AlertCircle className="w-8 h-8 text-slate-400 mx-auto mb-2" />
          <p className="text-sm font-semibold text-slate-700">
            এই ফিল্টারে কোনো খাবার এন্ট্রি পাওয়া যায়নি
          </p>
          <p className="text-xs text-slate-400 mt-1">
            ফিল্টার পরিবর্তন করুন অথবা নতুন খাবার যোগ করুন
          </p>
          <button
            onClick={() => {
              setSelectedPondId('all');
              setDateFilter('all');
            }}
            className="mt-3 text-xs font-semibold text-emerald-700 hover:underline cursor-pointer"
          >
            সব ফিল্টার সাফ করুন
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredLogs.map((log) => {
            const pond = pondMap.get(log.pondId);
            const isToday = log.date === todayStr;

            return (
              <article
                key={log.id}
                id={`feed-log-card-${log.id}`}
                className="bg-white rounded-xl border border-slate-200 shadow-xs hover:shadow-md transition-all p-3.5 sm:p-4"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      {/* Pond Name Badge */}
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-xs font-bold bg-emerald-100 text-emerald-900 border border-emerald-200">
                        <Waves className="w-3 h-3 text-emerald-700" />
                        {pond ? pond.name : 'অজানা পুকুর'}
                      </span>

                      {/* Time slot badge */}
                      <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-md bg-blue-50 text-blue-700 border border-blue-100">
                        <Clock className="w-3 h-3 text-blue-500" />
                        {log.timeSlot}
                      </span>

                      {isToday && (
                        <span className="text-[10px] font-bold bg-amber-100 text-amber-800 px-1.5 py-0.5 rounded border border-amber-200">
                          আজকের খাবার
                        </span>
                      )}
                    </div>

                    {/* Feed Name & Amount */}
                    <div className="pt-1 flex items-baseline gap-2">
                      <h3 className="text-base font-bold text-slate-800">
                        {log.feedType}
                      </h3>
                      <span className="text-emerald-700 font-extrabold text-base sm:text-lg">
                        {toBnNumber(log.amount)} {log.unit}
                      </span>
                    </div>

                    {/* Date */}
                    <p className="text-xs text-slate-500 flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5 text-slate-400" />
                      <span>{formatBnDate(log.date)}</span>
                    </p>
                  </div>

                  {/* Edit & Delete Action Buttons */}
                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      id={`edit-feed-btn-${log.id}`}
                      onClick={() => onEditFeed(log)}
                      aria-label="খাবার তথ্য সম্পাদন"
                      className="p-2 text-slate-500 hover:text-emerald-700 hover:bg-emerald-50 rounded-lg transition-colors cursor-pointer"
                      title="সম্পাদনা করুন"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      id={`delete-feed-btn-${log.id}`}
                      onClick={() => onDeleteFeed(log)}
                      aria-label="খাবার এন্ট্রি মুছুন"
                      className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                      title="মুছে ফেলুন"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Notes if present */}
                {log.notes && log.notes.trim() !== '' && (
                  <div className="mt-2.5 pt-2 border-t border-slate-100 text-xs text-slate-600 flex items-start gap-1.5 bg-slate-50 p-2 rounded-lg">
                    <FileText className="w-3.5 h-3.5 text-slate-400 mt-0.5 shrink-0" />
                    <div>
                      <span className="font-semibold text-slate-700">মন্তব্য:</span> {log.notes}
                    </div>
                  </div>
                )}
              </article>
            );
          })}
        </div>
      )}
    </section>
  );
};
