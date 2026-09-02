import React, { useState, useMemo } from 'react';
import { Pond, Expense, ExpenseCategory } from '../types';
import { Receipt, Plus, Calendar, Edit, Trash2, FileText, Filter, AlertCircle, Waves, Tag } from 'lucide-react';
import { toBnNumber, formatBnDate } from '../utils/storage';

interface ExpenseSectionProps {
  expenses: Expense[];
  ponds: Pond[];
  onAddExpense: (pondId?: string) => void;
  onEditExpense: (expense: Expense) => void;
  onDeleteExpense: (expense: Expense) => void;
}

const ALL_CATEGORIES: ExpenseCategory[] = [
  'খাবার ক্রয়',
  'পোনা মাছ',
  'সার ও চুন',
  'ওষুধ ও ভিটামিন',
  'সেচ ও বিদ্যুৎ',
  'শ্রমিক মজুরি',
  'পুকুর সংস্কার',
  'লিজ বা ভাড়া',
  'পরিবহন',
  'অন্যান্য',
];

export const ExpenseSection: React.FC<ExpenseSectionProps> = ({
  expenses,
  ponds,
  onAddExpense,
  onEditExpense,
  onDeleteExpense,
}) => {
  const [selectedPondId, setSelectedPondId] = useState<string>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  // পুকুরের লুকআপ ম্যাপ
  const pondMap = useMemo(() => {
    const map = new Map<string, Pond>();
    ponds.forEach((p) => map.set(p.id, p));
    return map;
  }, [ponds]);

  // ফিল্টার করা খরচের তালিকা
  const filteredExpenses = useMemo(() => {
    return expenses
      .filter((item) => {
        if (selectedPondId !== 'all' && item.pondId !== selectedPondId) {
          return false;
        }
        if (selectedCategory !== 'all' && item.category !== selectedCategory) {
          return false;
        }
        return true;
      })
      .sort((a, b) => {
        if (a.date !== b.date) {
          return b.date.localeCompare(a.date);
        }
        return (b.createdAt || '').localeCompare(a.createdAt || '');
      });
  }, [expenses, selectedPondId, selectedCategory]);

  // মোট খরচ হিসাব
  const totalCostFiltered = useMemo(() => {
    return filteredExpenses.reduce((sum, item) => sum + Number(item.amount || 0), 0);
  }, [filteredExpenses]);

  const totalCostAll = useMemo(() => {
    return expenses.reduce((sum, item) => sum + Number(item.amount || 0), 0);
  }, [expenses]);

  return (
    <section className="mt-4" aria-label="পুকুরের খরচ হিসাব">
      {/* ১. খরচ সারসংক্ষেপ ব্যানার কার্ড */}
      <div className="bg-gradient-to-r from-rose-800 to-rose-950 rounded-2xl text-white p-4 sm:p-5 shadow-sm mb-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-white/15 flex items-center justify-center border border-white/20">
              <Receipt className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-bold">পুকুরের খরচের হিসাব</h2>
              <p className="text-xs text-rose-100">
                খাবার, পোনা, ওষুধ, সেচ ও শ্রমিকের খরচের নিখুঁত হিসাব
              </p>
            </div>
          </div>

          {/* Metrics */}
          <div className="flex items-center gap-3 bg-black/20 p-2.5 rounded-xl border border-white/10">
            <div className="px-3 border-r border-white/15 text-center">
              <span className="text-[11px] text-rose-200 block">
                {selectedPondId !== 'all' || selectedCategory !== 'all' ? 'ফিল্টারকৃত মোট খরচ' : 'সর্বমোট খরচ'}
              </span>
              <span className="text-lg sm:text-xl font-bold text-white">
                {toBnNumber(totalCostFiltered)} <span className="text-xs">৳</span>
              </span>
            </div>
            <div className="px-3 text-center">
              <span className="text-[11px] text-rose-200 block">মোট ভাউচার</span>
              <span className="text-lg sm:text-xl font-bold text-white">
                {toBnNumber(filteredExpenses.length)} <span className="text-xs">টি</span>
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
            id="expense-pond-filter"
            value={selectedPondId}
            onChange={(e) => setSelectedPondId(e.target.value)}
            className="px-2.5 py-1.5 rounded-lg border border-slate-300 bg-slate-50 text-slate-700 font-medium focus:outline-none focus:ring-1 focus:ring-rose-500 cursor-pointer text-xs"
          >
            <option value="all">সকল পুকুর ({toBnNumber(ponds.length)})</option>
            {ponds.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>

          {/* ক্যাটাগরি ফিল্টার */}
          <select
            id="expense-category-filter"
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-2.5 py-1.5 rounded-lg border border-slate-300 bg-slate-50 text-slate-700 font-medium focus:outline-none focus:ring-1 focus:ring-rose-500 cursor-pointer text-xs"
          >
            <option value="all">সকল খরচের খাত</option>
            {ALL_CATEGORIES.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>

          {(selectedPondId !== 'all' || selectedCategory !== 'all') && (
            <button
              onClick={() => {
                setSelectedPondId('all');
                setSelectedCategory('all');
              }}
              className="text-xs text-rose-700 hover:underline font-semibold ml-1 cursor-pointer"
            >
              সাফ করুন
            </button>
          )}
        </div>

        {/* নতুন খরচ যোগ বাটন */}
        <button
          id="add-expense-btn"
          onClick={() => onAddExpense(selectedPondId !== 'all' ? selectedPondId : undefined)}
          className="inline-flex items-center justify-center gap-1.5 bg-rose-700 hover:bg-rose-800 text-white px-3.5 py-2 rounded-lg font-semibold text-xs sm:text-sm shadow-sm transition-all cursor-pointer active:scale-95 shrink-0"
        >
          <Plus className="w-4 h-4 stroke-[2.5]" />
          <span>খরচ যোগ করুন</span>
        </button>
      </div>

      {/* ৩. খরচের তালিকাসমূহ */}
      {expenses.length === 0 ? (
        <div
          id="empty-expense-state"
          className="bg-white rounded-2xl border-2 border-dashed border-rose-200 p-8 text-center my-4 max-w-lg mx-auto shadow-xs"
        >
          <div className="w-16 h-16 bg-rose-50 text-rose-600 rounded-2xl flex items-center justify-center mx-auto mb-3 shadow-inner">
            <Receipt className="w-8 h-8" />
          </div>
          <h3 className="text-base sm:text-lg font-bold text-slate-800">
            এখনও কোনো খরচের হিসাব যোগ করা হয়নি
          </h3>
          <p className="text-xs sm:text-sm text-slate-500 max-w-sm mx-auto mt-1 mb-5">
            পুকুরের খাবার, পোনা, চুন-সার বা শ্রমিকের খরচ লিখে রাখুন যাতে বছর শেষে লাভ-ক্ষতি হিসাব করতে পারেন।
          </p>
          <button
            id="empty-state-add-expense-btn"
            onClick={() => onAddExpense()}
            className="inline-flex items-center gap-2 bg-rose-700 hover:bg-rose-800 text-white font-semibold text-sm px-5 py-2.5 rounded-xl shadow-md active:scale-95 transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>প্রথম খরচ যোগ করুন</span>
          </button>
        </div>
      ) : filteredExpenses.length === 0 ? (
        <div className="bg-white rounded-xl border border-slate-200 p-8 text-center">
          <AlertCircle className="w-8 h-8 text-slate-400 mx-auto mb-2" />
          <p className="text-sm font-semibold text-slate-700">
            এই ফিল্টারে কোনো খরচ পাওয়া যায়নি
          </p>
          <p className="text-xs text-slate-400 mt-1">
            ফিল্টার পরিবর্তন করুন অথবা নতুন খরচ এন্ট্রি করুন
          </p>
          <button
            onClick={() => {
              setSelectedPondId('all');
              setSelectedCategory('all');
            }}
            className="mt-3 text-xs font-semibold text-rose-700 hover:underline cursor-pointer"
          >
            সব ফিল্টার সাফ করুন
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredExpenses.map((expense) => {
            const pond = pondMap.get(expense.pondId);

            return (
              <article
                key={expense.id}
                id={`expense-card-${expense.id}`}
                className="bg-white rounded-xl border border-slate-200 shadow-xs hover:shadow-md transition-all p-3.5 sm:p-4"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      {/* Pond Name */}
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-xs font-bold bg-slate-100 text-slate-800 border border-slate-200">
                        <Waves className="w-3 h-3 text-slate-600" />
                        {pond ? pond.name : 'অজানা পুকুর'}
                      </span>

                      {/* Category Badge */}
                      <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-md bg-rose-50 text-rose-700 border border-rose-100">
                        <Tag className="w-3 h-3 text-rose-500" />
                        {expense.category}
                      </span>

                      {/* Voucher if present */}
                      {expense.voucherNo && (
                        <span className="text-[10px] font-medium text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded">
                          {expense.voucherNo}
                        </span>
                      )}
                    </div>

                    {/* Title */}
                    <h3 className="text-base font-bold text-slate-800 pt-0.5">
                      {expense.title}
                    </h3>

                    {/* Date */}
                    <p className="text-xs text-slate-500 flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5 text-slate-400" />
                      <span>{formatBnDate(expense.date)}</span>
                    </p>
                  </div>

                  {/* Amount & Actions */}
                  <div className="flex flex-col items-end gap-1.5 shrink-0">
                    <span className="text-lg sm:text-xl font-black text-rose-700 tracking-tight">
                      - {toBnNumber(expense.amount)} ৳
                    </span>

                    <div className="flex items-center gap-1">
                      <button
                        id={`edit-expense-btn-${expense.id}`}
                        onClick={() => onEditExpense(expense)}
                        aria-label="খরচ সম্পাদন করুন"
                        className="p-1.5 text-slate-500 hover:text-rose-700 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                        title="সম্পাদনা করুন"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        id={`delete-expense-btn-${expense.id}`}
                        onClick={() => onDeleteExpense(expense)}
                        aria-label="খরচ মুছে ফেলুন"
                        className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                        title="মুছে ফেলুন"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Notes if present */}
                {expense.notes && expense.notes.trim() !== '' && (
                  <div className="mt-2.5 pt-2 border-t border-slate-100 text-xs text-slate-600 flex items-start gap-1.5 bg-slate-50 p-2 rounded-lg">
                    <FileText className="w-3.5 h-3.5 text-slate-400 mt-0.5 shrink-0" />
                    <div>
                      <span className="font-semibold text-slate-700">মন্তব্য:</span> {expense.notes}
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
