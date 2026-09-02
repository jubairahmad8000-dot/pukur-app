import React, { useState, useEffect } from 'react';
import { Pond, Expense, ExpenseCategory } from '../types';
import { X, Plus, Check, Receipt, AlertCircle } from 'lucide-react';
import { getTodayDateStr } from '../utils/storage';

interface ExpenseFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (expenseData: Omit<Expense, 'id' | 'createdAt'>, editingId?: string) => void;
  editingExpense: Expense | null;
  ponds: Pond[];
  defaultPondId?: string;
}

const EXPENSE_CATEGORIES: ExpenseCategory[] = [
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

export const ExpenseFormModal: React.FC<ExpenseFormModalProps> = ({
  isOpen,
  onClose,
  onSave,
  editingExpense,
  ponds,
  defaultPondId,
}) => {
  const [pondId, setPondId] = useState('');
  const [category, setCategory] = useState<ExpenseCategory>('খাবার ক্রয়');
  const [title, setTitle] = useState('');
  const [amount, setAmount] = useState('');
  const [date, setDate] = useState('');
  const [voucherNo, setVoucherNo] = useState('');
  const [notes, setNotes] = useState('');

  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  useEffect(() => {
    if (editingExpense) {
      setPondId(editingExpense.pondId);
      setCategory(editingExpense.category);
      setTitle(editingExpense.title);
      setAmount(editingExpense.amount.toString());
      setDate(editingExpense.date);
      setVoucherNo(editingExpense.voucherNo || '');
      setNotes(editingExpense.notes || '');
    } else {
      setPondId(defaultPondId || (ponds.length > 0 ? ponds[0].id : ''));
      setCategory('খাবার ক্রয়');
      setTitle('');
      setAmount('');
      setDate(getTodayDateStr());
      setVoucherNo('');
      setNotes('');
    }
    setErrors({});
  }, [editingExpense, isOpen, ponds, defaultPondId]);

  if (!isOpen) return null;

  const validate = () => {
    const newErrors: { [key: string]: string } = {};
    if (!pondId) {
      newErrors.pondId = 'একটি পুকুর নির্বাচন করুন';
    }
    if (!title.trim()) {
      newErrors.title = 'খরচের বিবরণ বা পণ্যের নাম লিখুন';
    }
    const numAmount = Number(amount);
    if (!amount.trim() || isNaN(numAmount) || numAmount <= 0) {
      newErrors.amount = 'সঠিক টাকার পরিমাণ লিখুন (যেমন: ৫০০০)';
    }
    if (!date) {
      newErrors.date = 'তারিখ নির্বাচন করুন';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    onSave(
      {
        pondId,
        category,
        title: title.trim(),
        amount: Number(amount),
        date,
        voucherNo: voucherNo.trim(),
        notes: notes.trim(),
      },
      editingExpense ? editingExpense.id : undefined
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
      <div
        id="expense-form-modal-container"
        className="bg-white rounded-2xl w-full max-w-lg shadow-2xl border border-slate-100 overflow-hidden my-auto"
      >
        {/* Header */}
        <div className="bg-rose-700 text-white px-5 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center">
              <Receipt className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-bold">
                {editingExpense ? 'খরচের তথ্য সম্পাদন' : 'নতুন খরচ যোগ করুন'}
              </h2>
              <p className="text-xs text-rose-100">
                পুকুরের যেকোনো ব্যয় বা খরচের সঠিক হিসাব সংরক্ষণ
              </p>
            </div>
          </div>
          <button
            id="close-expense-modal-btn"
            onClick={onClose}
            className="text-white/80 hover:text-white p-1.5 rounded-lg hover:bg-white/10 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4 max-h-[82vh] overflow-y-auto">
          {/* পুকুর নির্বাচন */}
          <div>
            <label htmlFor="expense-pond-select" className="block text-xs sm:text-sm font-semibold text-slate-700 mb-1">
              পুকুর নির্বাচন করুন <span className="text-rose-500">*</span>
            </label>
            {ponds.length === 0 ? (
              <p className="text-xs text-amber-700 bg-amber-50 p-2.5 rounded-lg border border-amber-200">
                প্রথমে অন্তত একটি পুকুর যোগ করুন।
              </p>
            ) : (
              <select
                id="expense-pond-select"
                value={pondId}
                onChange={(e) => setPondId(e.target.value)}
                className={`w-full px-3.5 py-2.5 rounded-lg border text-sm focus:outline-none focus:ring-2 focus:ring-rose-500 transition-all bg-white cursor-pointer ${
                  errors.pondId ? 'border-rose-400 bg-rose-50/20' : 'border-slate-300'
                }`}
              >
                {ponds.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name} ({p.location})
                  </option>
                ))}
              </select>
            )}
            {errors.pondId && (
              <p className="text-xs text-rose-600 mt-1 flex items-center gap-1">
                <AlertCircle className="w-3.5 h-3.5" /> {errors.pondId}
              </p>
            )}
          </div>

          {/* খরচের খাত */}
          <div>
            <label className="block text-xs sm:text-sm font-semibold text-slate-700 mb-1">
              খরচের খাত <span className="text-rose-500">*</span>
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5 max-h-36 overflow-y-auto p-1 bg-slate-50 rounded-lg border border-slate-200">
              {EXPENSE_CATEGORIES.map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setCategory(cat)}
                  className={`px-2.5 py-1.5 text-xs font-semibold rounded-md transition-all text-left truncate cursor-pointer ${
                    category === cat
                      ? 'bg-rose-700 text-white shadow-xs'
                      : 'bg-white text-slate-700 hover:bg-slate-200/80 border border-slate-200/60'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* বিবরণ বা পণ্যের নাম */}
          <div>
            <label htmlFor="expense-title-input" className="block text-xs sm:text-sm font-semibold text-slate-700 mb-1">
              খরচের বিবরণ / পণ্যের নাম <span className="text-rose-500">*</span>
            </label>
            <input
              id="expense-title-input"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="যেমন: ১০ বস্তা মেগা ফিড, ২০০০ রুই পোনা..."
              className={`w-full px-3.5 py-2.5 rounded-lg border text-sm focus:outline-none focus:ring-2 focus:ring-rose-500 transition-all ${
                errors.title ? 'border-rose-400 bg-rose-50/20' : 'border-slate-300 bg-white'
              }`}
            />
            {errors.title && (
              <p className="text-xs text-rose-600 mt-1 flex items-center gap-1">
                <AlertCircle className="w-3.5 h-3.5" /> {errors.title}
              </p>
            )}
          </div>

          {/* টাকার পরিমাণ ও তারিখ */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label htmlFor="expense-amount-input" className="block text-xs sm:text-sm font-semibold text-slate-700 mb-1">
                টাকার পরিমাণ (৳) <span className="text-rose-500">*</span>
              </label>
              <input
                id="expense-amount-input"
                type="number"
                min="1"
                step="any"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="যেমন: ১২৫০০"
                className={`w-full px-3.5 py-2.5 rounded-lg border text-sm focus:outline-none focus:ring-2 focus:ring-rose-500 transition-all ${
                  errors.amount ? 'border-rose-400 bg-rose-50/20' : 'border-slate-300 bg-white'
                }`}
              />
              {errors.amount && (
                <p className="text-xs text-rose-600 mt-1 flex items-center gap-1">
                  <AlertCircle className="w-3.5 h-3.5" /> {errors.amount}
                </p>
              )}
            </div>

            <div>
              <label htmlFor="expense-date-input" className="block text-xs sm:text-sm font-semibold text-slate-700 mb-1">
                খরচের তারিখ <span className="text-rose-500">*</span>
              </label>
              <input
                id="expense-date-input"
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className={`w-full px-3.5 py-2 rounded-lg border text-sm focus:outline-none focus:ring-2 focus:ring-rose-500 transition-all ${
                  errors.date ? 'border-rose-400 bg-rose-50/20' : 'border-slate-300 bg-white'
                }`}
              />
              {errors.date && (
                <p className="text-xs text-rose-600 mt-1 flex items-center gap-1">
                  <AlertCircle className="w-3.5 h-3.5" /> {errors.date}
                </p>
              )}
            </div>
          </div>

          {/* ভাউচার নং (ঐচ্ছিক) */}
          <div>
            <label htmlFor="expense-voucher-input" className="block text-xs sm:text-sm font-semibold text-slate-700 mb-1">
              রশিদ বা ভাউচার নম্বর (ঐচ্ছিক)
            </label>
            <input
              id="expense-voucher-input"
              type="text"
              value={voucherNo}
              onChange={(e) => setVoucherNo(e.target.value)}
              placeholder="যেমন: ভাউচার নং-১০৪"
              className="w-full px-3.5 py-2 rounded-lg border border-slate-300 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-rose-500 transition-all"
            />
          </div>

          {/* মন্তব্য (ঐচ্ছিক) */}
          <div>
            <label htmlFor="expense-notes-input" className="block text-xs sm:text-sm font-semibold text-slate-700 mb-1">
              মন্তব্য (ঐচ্ছিক)
            </label>
            <textarea
              id="expense-notes-input"
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="খরচ সম্পর্কিত কোনো বিশেষ তথ্য থাকলে লিখুন..."
              className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-rose-500 transition-all resize-none"
            />
          </div>

          {/* Buttons */}
          <div className="pt-2 flex items-center justify-end gap-2.5 border-t border-slate-100">
            <button
              id="cancel-expense-modal-btn"
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
            >
              বাতিল
            </button>
            <button
              id="submit-expense-btn"
              type="submit"
              disabled={ponds.length === 0}
              className="px-5 py-2.5 text-sm font-semibold bg-rose-700 hover:bg-rose-800 disabled:opacity-50 text-white rounded-lg shadow-sm transition-all flex items-center gap-2 cursor-pointer active:scale-95"
            >
              {editingExpense ? (
                <>
                  <Check className="w-4 h-4" />
                  <span>হালনাগাদ করুন</span>
                </>
              ) : (
                <>
                  <Plus className="w-4 h-4" />
                  <span>খরচ সংরক্ষণ করুন</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
