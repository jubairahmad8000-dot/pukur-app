import React, { useState, useMemo } from 'react';
import { Member } from '../types';
import {
  Users,
  Plus,
  Search,
  PieChart,
  Phone,
  Calendar,
  DollarSign,
  Edit2,
  Trash2,
  AlertCircle,
  TrendingUp,
  Coins,
  ShieldCheck,
  ArrowUpDown,
} from 'lucide-react';
import { toBnNumber, formatBnDate } from '../utils/storage';

interface MemberListSectionProps {
  members: Member[];
  totalProfit: number;
  onAddMember: () => void;
  onEditMember: (member: Member) => void;
  onDeleteMember: (member: Member) => void;
}

const AVATAR_COLORS = [
  'bg-emerald-100 text-emerald-800 border-emerald-300',
  'bg-teal-100 text-teal-800 border-teal-300',
  'bg-sky-100 text-sky-800 border-sky-300',
  'bg-indigo-100 text-indigo-800 border-indigo-300',
  'bg-amber-100 text-amber-800 border-amber-300',
  'bg-rose-100 text-rose-800 border-rose-300',
  'bg-purple-100 text-purple-800 border-purple-300',
];

export const MemberListSection: React.FC<MemberListSectionProps> = ({
  members,
  totalProfit,
  onAddMember,
  onEditMember,
  onDeleteMember,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<'shares' | 'name' | 'investment'>('shares');

  // মোট শেয়ার সংখ্যা হিসাব
  const totalShares = useMemo(() => {
    return members.reduce((sum, m) => sum + (Number(m.shareCount) || 0), 0);
  }, [members]);

  // মোট মূলধন / বিনিয়োগ হিসাব
  const totalInvestment = useMemo(() => {
    return members.reduce((sum, m) => sum + (Number(m.investmentAmount) || 0), 0);
  }, [members]);

  // প্রতি শেয়ারে লাভ বা ক্ষতি (টাকা)
  const perShareProfit = useMemo(() => {
    if (totalShares <= 0) return 0;
    return totalProfit / totalShares;
  }, [totalProfit, totalShares]);

  // ফিল্টার এবং বাছাই
  const filteredAndSortedMembers = useMemo(() => {
    const term = searchTerm.toLowerCase();
    const filtered = members.filter((m) => {
      return (
        m.name.toLowerCase().includes(term) ||
        (m.phone && m.phone.includes(term)) ||
        (m.role && m.role.toLowerCase().includes(term)) ||
        (m.notes && m.notes.toLowerCase().includes(term))
      );
    });

    return filtered.sort((a, b) => {
      if (sortBy === 'shares') {
        return (Number(b.shareCount) || 0) - (Number(a.shareCount) || 0);
      }
      if (sortBy === 'investment') {
        return (Number(b.investmentAmount) || 0) - (Number(a.investmentAmount) || 0);
      }
      return a.name.localeCompare(b.name, 'bn');
    });
  }, [members, searchTerm, sortBy]);

  return (
    <section className="mt-4" aria-label="সদস্য ও শেয়ার তালিকা">
      {/* ১. শীর্ষ হেডার ও অ্যাকশন বোতাম */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-lg sm:text-xl font-bold text-slate-800 flex items-center gap-2">
              <Users className="w-5 h-5 text-emerald-700" />
              <span>সদস্যগণের নামের লিস্ট ও শেয়ার সংখ্যা</span>
            </h2>
            <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200">
              {toBnNumber(members.length)} জন সদস্য
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            অংশীদারি খামারের সদস্যদের তালিকা, শেয়ারের অংশ ও লাভ-ক্ষতির হিসাব
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            id="add-member-section-btn"
            onClick={onAddMember}
            className="inline-flex items-center gap-1.5 bg-emerald-700 hover:bg-emerald-800 active:scale-95 text-white font-semibold text-xs sm:text-sm px-3.5 py-2 rounded-xl shadow-sm transition-all cursor-pointer whitespace-nowrap"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span>নতুন সদস্য যোগ করুন</span>
          </button>
        </div>
      </div>

      {/* ২. ৪-কার্ড সারসংক্ষেপ মেট্রিক */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-5">
        {/* মোট সদস্য */}
        <div className="bg-white rounded-xl p-3.5 border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">মোট সদস্য</span>
            <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center">
              <Users className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="mt-1.5 flex items-baseline gap-1">
            <span className="text-xl sm:text-2xl font-bold text-slate-800">
              {toBnNumber(members.length)}
            </span>
            <span className="text-xs text-slate-500 font-medium">জন</span>
          </div>
        </div>

        {/* সর্বমোট শেয়ার সংখ্যা */}
        <div className="bg-white rounded-xl p-3.5 border border-emerald-100 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">মোট শেয়ার সংখ্যা</span>
            <div className="w-7 h-7 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center">
              <PieChart className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="mt-1.5 flex items-baseline gap-1">
            <span className="text-xl sm:text-2xl font-black text-emerald-800">
              {toBnNumber(totalShares % 1 === 0 ? totalShares : totalShares.toFixed(1))}
            </span>
            <span className="text-xs text-slate-500 font-medium">টি শেয়ার</span>
          </div>
        </div>

        {/* মোট মূলধন / বিনিয়োগ */}
        <div className="bg-white rounded-xl p-3.5 border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">মোট সংগৃহীত জমা</span>
            <div className="w-7 h-7 rounded-lg bg-sky-50 text-sky-700 flex items-center justify-center">
              <Coins className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="mt-1.5 flex items-baseline gap-1">
            <span className="text-xl sm:text-2xl font-bold text-sky-900">
              {toBnNumber(totalInvestment)}
            </span>
            <span className="text-xs text-slate-500 font-medium">৳</span>
          </div>
        </div>

        {/* প্রতি শেয়ারে লাভ / ক্ষতি */}
        <div className="bg-white rounded-xl p-3.5 border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">শেয়ার প্রতি হিসাব</span>
            <div
              className={`w-7 h-7 rounded-lg flex items-center justify-center ${
                perShareProfit >= 0
                  ? 'bg-emerald-50 text-emerald-700'
                  : 'bg-rose-50 text-rose-700'
              }`}
            >
              <TrendingUp className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="mt-1.5 flex items-baseline gap-1">
            <span
              className={`text-xl sm:text-2xl font-black ${
                perShareProfit >= 0 ? 'text-emerald-700' : 'text-rose-700'
              }`}
            >
              {perShareProfit >= 0 ? '+' : ''}
              {toBnNumber(Math.round(perShareProfit))}
            </span>
            <span className="text-xs text-slate-500 font-medium">৳/শেয়ার</span>
          </div>
        </div>
      </div>

      {/* ৩. শেয়ার বণ্টন অনুপাত ভিজ্যুয়াল বার */}
      {totalShares > 0 && members.length > 0 && (
        <div className="bg-white rounded-xl p-3.5 border border-slate-200/90 shadow-xs mb-4">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-1.5">
              <PieChart className="w-4 h-4 text-emerald-700" />
              <span className="text-xs font-bold text-slate-700">শেয়ারের আনুপাতিক বণ্টন (১০০%)</span>
            </div>
            <span className="text-[11px] text-slate-400">
              সর্বমোট {toBnNumber(totalShares)} টি শেয়ারের শতকরা হার
            </span>
          </div>
          {/* Progress bar segments */}
          <div className="h-3 w-full rounded-full bg-slate-100 overflow-hidden flex shadow-inner">
            {members.map((m, idx) => {
              const pct = (Number(m.shareCount) / totalShares) * 100;
              const bgClass =
                idx % 4 === 0
                  ? 'bg-emerald-600'
                  : idx % 4 === 1
                  ? 'bg-teal-500'
                  : idx % 4 === 2
                  ? 'bg-sky-500'
                  : 'bg-indigo-500';
              return (
                <div
                  key={m.id}
                  title={`${m.name}: ${toBnNumber(m.shareCount)} টি শেয়ার (${toBnNumber(pct.toFixed(1))}%)`}
                  style={{ width: `${pct}%` }}
                  className={`${bgClass} transition-all border-r border-white/40 last:border-none`}
                />
              );
            })}
          </div>
          <div className="flex items-center flex-wrap gap-2.5 mt-2.5 text-[11px]">
            {members.slice(0, 5).map((m, idx) => {
              const pct = (Number(m.shareCount) / totalShares) * 100;
              const dotClass =
                idx % 4 === 0
                  ? 'bg-emerald-600'
                  : idx % 4 === 1
                  ? 'bg-teal-500'
                  : idx % 4 === 2
                  ? 'bg-sky-500'
                  : 'bg-indigo-500';
              return (
                <span key={m.id} className="inline-flex items-center gap-1 text-slate-600">
                  <span className={`w-2 h-2 rounded-full ${dotClass}`} />
                  <span className="font-medium text-slate-800 truncate max-w-[120px]">{m.name}</span>
                  <span className="text-slate-400">({toBnNumber(pct.toFixed(1))}%)</span>
                </span>
              );
            })}
            {members.length > 5 && (
              <span className="text-slate-400 font-medium">
                + আরও {toBnNumber(members.length - 5)} জন
              </span>
            )}
          </div>
        </div>
      )}

      {/* ৪. সার্চ ও সর্টিং টুলবার */}
      {members.length > 0 && (
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5 mb-4">
          <div className="relative flex-1 max-w-sm">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              id="search-member-input"
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="সদস্যের নাম বা মোবাইল নম্বর দিয়ে খুঁজুন..."
              className="w-full pl-9 pr-3 py-1.5 text-xs sm:text-sm bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all placeholder:text-slate-400"
            />
          </div>

          <div className="flex items-center gap-2 self-end sm:self-auto text-xs">
            <ArrowUpDown className="w-3.5 h-3.5 text-slate-400" />
            <span className="text-slate-500 font-medium">সাজান:</span>
            <select
              id="sort-member-select"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as 'shares' | 'name' | 'investment')}
              className="bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs font-semibold text-slate-700 focus:outline-none focus:ring-1 focus:ring-emerald-500 cursor-pointer"
            >
              <option value="shares">বেশি শেয়ার অনুযায়ী</option>
              <option value="investment">জমা টাকা অনুযায়ী</option>
              <option value="name">নাম অনুযায়ী</option>
            </select>
          </div>
        </div>
      )}

      {/* ৫. খালি অবস্থা বা ফলাফল নেই */}
      {members.length === 0 ? (
        <div
          id="empty-members-state"
          className="bg-white rounded-2xl border-2 border-dashed border-emerald-200 p-8 text-center my-4 max-w-lg mx-auto shadow-xs"
        >
          <div className="w-16 h-16 bg-emerald-50 text-emerald-700 rounded-2xl flex items-center justify-center mx-auto mb-3 shadow-inner">
            <Users className="w-8 h-8" />
          </div>
          <h3 className="text-base sm:text-lg font-bold text-slate-800">
            এখনও কোনো অংশীদার সদস্য যোগ করা হয়নি
          </h3>
          <p className="text-xs sm:text-sm text-slate-500 max-w-sm mx-auto mt-1 mb-5">
            খামারের অংশীদার বা সদস্যদের তালিকা ও তাদের শেয়ার সংখ্যা যুক্ত করুন। এতে করে মোট আয়ের লাভ-ক্ষতি সহজে ভাগ করা যাবে।
          </p>
          <button
            id="empty-state-add-member-btn"
            onClick={onAddMember}
            className="inline-flex items-center gap-2 bg-emerald-700 hover:bg-emerald-800 text-white font-semibold text-sm px-5 py-2.5 rounded-xl shadow-md active:scale-95 transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span>নতুন সদস্য যোগ করুন</span>
          </button>
        </div>
      ) : filteredAndSortedMembers.length === 0 ? (
        <div className="bg-white rounded-xl border border-slate-200 p-8 text-center">
          <AlertCircle className="w-8 h-8 text-slate-400 mx-auto mb-2" />
          <p className="text-sm font-semibold text-slate-700">
            &ldquo;{searchTerm}&rdquo; দিয়ে কোনো সদস্য পাওয়া যায়নি
          </p>
          <button
            onClick={() => setSearchTerm('')}
            className="mt-2 text-xs font-semibold text-emerald-700 hover:underline cursor-pointer"
          >
            সব সদস্য দেখুন
          </button>
        </div>
      ) : (
        /* ৬. সদস্যগণের তালিকা কার্ডসমূহ */
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
          {filteredAndSortedMembers.map((member, index) => {
            const shareCount = Number(member.shareCount) || 0;
            const percentage = totalShares > 0 ? (shareCount / totalShares) * 100 : 0;
            const memberProfitShare = perShareProfit * shareCount;
            const avatarColor = AVATAR_COLORS[index % AVATAR_COLORS.length];

            return (
              <div
                key={member.id}
                id={`member-card-${member.id}`}
                className="bg-white rounded-xl border border-slate-200/90 hover:border-emerald-300 shadow-xs hover:shadow-sm transition-all p-4 flex flex-col justify-between"
              >
                <div>
                  {/* Card Header: Avatar, Name, Role, & Actions */}
                  <div className="flex items-start justify-between gap-2.5">
                    <div className="flex items-start gap-3">
                      {/* Avatar with member initials */}
                      <div
                        className={`w-11 h-11 rounded-xl flex items-center justify-center font-bold text-sm shrink-0 border ${avatarColor}`}
                      >
                        {member.name.slice(0, 2)}
                      </div>

                      <div>
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <h3 className="text-sm sm:text-base font-bold text-slate-800">
                            {member.name}
                          </h3>
                        </div>

                        <div className="flex items-center gap-2 mt-0.5">
                          <span className="text-[11px] font-semibold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200/60">
                            {member.role || 'অংশীদার সদস্য'}
                          </span>

                          {member.joinDate && (
                            <span className="text-[11px] text-slate-400 flex items-center gap-1">
                              <Calendar className="w-3 h-3 text-slate-400" />
                              {formatBnDate(member.joinDate)}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Edit & Delete Actions */}
                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        onClick={() => onEditMember(member)}
                        title="সদস্য তথ্য সম্পাদনা করুন"
                        className="p-1.5 text-slate-400 hover:text-emerald-700 hover:bg-emerald-50 rounded-lg transition-colors cursor-pointer"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => onDeleteMember(member)}
                        title="সদস্য মুছে ফেলুন"
                        className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Share & Investment Highlights Box */}
                  <div className="mt-3.5 bg-slate-50/80 border border-slate-200/70 rounded-xl p-3 grid grid-cols-2 gap-2 text-xs">
                    {/* শেয়ার সংখ্যা ও শতকরা হার */}
                    <div>
                      <span className="text-[11px] text-slate-500 block">শেয়ার সংখ্যা:</span>
                      <div className="flex items-baseline gap-1 mt-0.5">
                        <span className="text-base font-black text-emerald-800">
                          {toBnNumber(shareCount % 1 === 0 ? shareCount : shareCount.toFixed(1))}
                        </span>
                        <span className="text-slate-600 font-semibold">টি শেয়ার</span>
                      </div>
                      <span className="text-[10px] text-emerald-700 font-bold bg-emerald-100/70 px-1.5 py-0.2 rounded mt-1 inline-block">
                        {toBnNumber(percentage.toFixed(1))}% অংশীদারিত্ব
                      </span>
                    </div>

                    {/* জমা / মূলধন */}
                    <div className="border-l border-slate-200 pl-3">
                      <span className="text-[11px] text-slate-500 block">জমা / মূলধন:</span>
                      <div className="flex items-baseline gap-1 mt-0.5">
                        <span className="text-base font-bold text-slate-800">
                          {member.investmentAmount !== undefined && member.investmentAmount !== null
                            ? toBnNumber(member.investmentAmount)
                            : '০'}
                        </span>
                        <span className="text-slate-600 font-semibold">৳</span>
                      </div>
                      <span className="text-[10px] text-slate-400 block mt-1">
                        বিনিয়োগকৃত টাকা
                      </span>
                    </div>
                  </div>

                  {/* আনুমানিক শেয়ার অনুপাতে লাভ/ক্ষতির প্রাপ্য অংশ */}
                  {totalShares > 0 && (
                    <div
                      className={`mt-2.5 px-3 py-2 rounded-lg text-xs flex items-center justify-between border ${
                        memberProfitShare >= 0
                          ? 'bg-emerald-50/70 border-emerald-200 text-emerald-900'
                          : 'bg-rose-50/70 border-rose-200 text-rose-900'
                      }`}
                    >
                      <span className="font-semibold flex items-center gap-1 text-[11px]">
                        <Coins className="w-3.5 h-3.5 opacity-80" />
                        <span>শেয়ার অনুপাতে নিট লাভ/ক্ষতি:</span>
                      </span>
                      <span className="font-extrabold text-xs sm:text-sm">
                        {memberProfitShare >= 0 ? '+' : ''}
                        {toBnNumber(Math.round(memberProfitShare))} ৳
                      </span>
                    </div>
                  )}

                  {/* মোবাইল নম্বর ও নোটস */}
                  {(member.phone || member.notes) && (
                    <div className="mt-3 pt-2.5 border-t border-slate-100 space-y-1 text-xs">
                      {member.phone && (
                        <div className="flex items-center gap-2">
                          <Phone className="w-3.5 h-3.5 text-emerald-700" />
                          <a
                            href={`tel:${member.phone}`}
                            className="text-slate-700 hover:text-emerald-700 font-medium"
                          >
                            {toBnNumber(member.phone)}
                          </a>
                        </div>
                      )}
                      {member.notes && (
                        <p className="text-[11px] text-slate-500 italic bg-slate-50 p-1.5 rounded-md">
                          &ldquo;{member.notes}&rdquo;
                        </p>
                      )}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
};
