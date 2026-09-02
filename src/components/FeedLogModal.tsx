import React, { useState, useEffect } from 'react';
import { Pond, FeedLog, FeedUnit, FeedTime } from '../types';
import { X, Plus, Check, Utensils, AlertCircle } from 'lucide-react';
import { getTodayDateStr } from '../utils/storage';

interface FeedLogModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (feedData: Omit<FeedLog, 'id' | 'createdAt'>, editingId?: string) => void;
  editingFeed: FeedLog | null;
  ponds: Pond[];
  defaultPondId?: string;
}

const AVAILABLE_UNITS: FeedUnit[] = ['কেজি', 'বস্তা', 'গ্রাম'];
const TIME_SLOTS: FeedTime[] = ['সকাল', 'দুপুর', 'বিকাল', 'সন্ধ্যা'];
const QUICK_FEED_TYPES = ['ভাসমান ফিড', 'ডুবন্ত ফিড', 'সরিষার খৈল', 'চালের কুঁড়া', 'গ্রোয়ার ফিড'];

export const FeedLogModal: React.FC<FeedLogModalProps> = ({
  isOpen,
  onClose,
  onSave,
  editingFeed,
  ponds,
  defaultPondId,
}) => {
  const [pondId, setPondId] = useState('');
  const [date, setDate] = useState('');
  const [timeSlot, setTimeSlot] = useState<FeedTime>('সকাল');
  const [feedType, setFeedType] = useState('');
  const [amount, setAmount] = useState('');
  const [unit, setUnit] = useState<FeedUnit>('কেজি');
  const [notes, setNotes] = useState('');

  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  useEffect(() => {
    if (editingFeed) {
      setPondId(editingFeed.pondId);
      setDate(editingFeed.date);
      setTimeSlot(editingFeed.timeSlot || 'সকাল');
      setFeedType(editingFeed.feedType);
      setAmount(editingFeed.amount.toString());
      setUnit(editingFeed.unit || 'কেজি');
      setNotes(editingFeed.notes || '');
    } else {
      setPondId(defaultPondId || (ponds.length > 0 ? ponds[0].id : ''));
      setDate(getTodayDateStr());
      setTimeSlot('সকাল');
      setFeedType('ভাসমান ফিড');
      setAmount('');
      setUnit('কেজি');
      setNotes('');
    }
    setErrors({});
  }, [editingFeed, isOpen, ponds, defaultPondId]);

  if (!isOpen) return null;

  const validate = () => {
    const newErrors: { [key: string]: string } = {};
    if (!pondId) {
      newErrors.pondId = 'একটি পুকুর নির্বাচন করুন';
    }
    if (!date) {
      newErrors.date = 'তারিখ নির্বাচন করুন';
    }
    if (!feedType.trim()) {
      newErrors.feedType = 'খাবারের নাম বা ধরন লিখুন';
    }
    if (!amount.trim() || isNaN(Number(amount)) || Number(amount) <= 0) {
      newErrors.amount = 'সঠিক খাবারের পরিমাণ লিখুন (যেমন: ১০)';
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
        date,
        timeSlot,
        feedType: feedType.trim(),
        amount: amount.trim(),
        unit,
        notes: notes.trim(),
      },
      editingFeed ? editingFeed.id : undefined
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
      <div
        id="feed-log-modal-container"
        className="bg-white rounded-2xl w-full max-w-lg shadow-2xl border border-slate-100 overflow-hidden my-auto"
      >
        {/* Modal Header */}
        <div className="bg-emerald-700 text-white px-5 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center">
              <Utensils className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-bold">
                {editingFeed ? 'খাবার হিসাব সম্পাদন' : 'দৈনিক খাবার যোগ করুন'}
              </h2>
              <p className="text-xs text-emerald-100">
                পুকুরে দেওয়া খাবারের পরিমাণ ও তথ্য লিপিবদ্ধ করুন
              </p>
            </div>
          </div>
          <button
            id="close-feed-modal-btn"
            onClick={onClose}
            className="text-white/80 hover:text-white p-1.5 rounded-lg hover:bg-white/10 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body Form */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4 max-h-[80vh] overflow-y-auto">
          {/* ১. পুকুর নির্বাচন */}
          <div>
            <label htmlFor="feed-pond-select" className="block text-xs sm:text-sm font-semibold text-slate-700 mb-1">
              পুকুর নির্বাচন করুন <span className="text-rose-500">*</span>
            </label>
            {ponds.length === 0 ? (
              <p className="text-xs text-amber-700 bg-amber-50 p-2.5 rounded-lg border border-amber-200">
                প্রথমে অন্তত একটি পুকুর যোগ করুন।
              </p>
            ) : (
              <select
                id="feed-pond-select"
                value={pondId}
                onChange={(e) => setPondId(e.target.value)}
                className={`w-full px-3.5 py-2.5 rounded-lg border text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all bg-white cursor-pointer ${
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

          {/* ২. তারিখ এবং সময় */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label htmlFor="feed-date-input" className="block text-xs sm:text-sm font-semibold text-slate-700 mb-1">
                তারিখ <span className="text-rose-500">*</span>
              </label>
              <input
                id="feed-date-input"
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className={`w-full px-3.5 py-2 rounded-lg border text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all ${
                  errors.date ? 'border-rose-400 bg-rose-50/20' : 'border-slate-300 bg-white'
                }`}
              />
              {errors.date && (
                <p className="text-xs text-rose-600 mt-1 flex items-center gap-1">
                  <AlertCircle className="w-3.5 h-3.5" /> {errors.date}
                </p>
              )}
            </div>

            <div>
              <label className="block text-xs sm:text-sm font-semibold text-slate-700 mb-1">
                খাবারের সময়
              </label>
              <div className="grid grid-cols-4 gap-1 p-1 bg-slate-100 rounded-lg border border-slate-200">
                {TIME_SLOTS.map((slot) => (
                  <button
                    key={slot}
                    type="button"
                    onClick={() => setTimeSlot(slot)}
                    className={`py-1.5 text-xs font-semibold rounded-md transition-all cursor-pointer ${
                      timeSlot === slot
                        ? 'bg-emerald-700 text-white shadow-xs'
                        : 'text-slate-600 hover:bg-slate-200/70'
                    }`}
                  >
                    {slot}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* ৩. খাবারের নাম / ধরন */}
          <div>
            <label htmlFor="feed-type-input" className="block text-xs sm:text-sm font-semibold text-slate-700 mb-1">
              খাবারের ধরন / নাম <span className="text-rose-500">*</span>
            </label>
            <input
              id="feed-type-input"
              type="text"
              value={feedType}
              onChange={(e) => setFeedType(e.target.value)}
              placeholder="যেমন: ভাসমান ফিড, খৈল, কুঁড়া..."
              className={`w-full px-3.5 py-2.5 rounded-lg border text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all ${
                errors.feedType ? 'border-rose-400 bg-rose-50/20' : 'border-slate-300 bg-white'
              }`}
            />
            {errors.feedType && (
              <p className="text-xs text-rose-600 mt-1 flex items-center gap-1">
                <AlertCircle className="w-3.5 h-3.5" /> {errors.feedType}
              </p>
            )}

            {/* দ্রুত সাজেশনের চিপস */}
            <div className="flex flex-wrap gap-1.5 mt-2">
              <span className="text-[11px] text-slate-400 self-center">দ্রুত বাছুন:</span>
              {QUICK_FEED_TYPES.map((type) => (
                <button
                  key={type}
                  type="button"
                  onClick={() => setFeedType(type)}
                  className="text-xs px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-800 hover:bg-emerald-100 border border-emerald-200/80 cursor-pointer transition-colors"
                >
                  {type}
                </button>
              ))}
            </div>
          </div>

          {/* ৪. পরিমাণ এবং ইউনিট */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label htmlFor="feed-amount-input" className="block text-xs sm:text-sm font-semibold text-slate-700 mb-1">
                খাবারের পরিমাণ <span className="text-rose-500">*</span>
              </label>
              <input
                id="feed-amount-input"
                type="number"
                step="any"
                min="0"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="যেমন: ১৫"
                className={`w-full px-3.5 py-2.5 rounded-lg border text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all ${
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
              <label className="block text-xs sm:text-sm font-semibold text-slate-700 mb-1">
                একক (ইউনিট) <span className="text-rose-500">*</span>
              </label>
              <div className="grid grid-cols-3 gap-1.5 p-1 bg-slate-100 rounded-lg border border-slate-200">
                {AVAILABLE_UNITS.map((u) => (
                  <button
                    key={u}
                    type="button"
                    onClick={() => setUnit(u)}
                    className={`py-1.5 text-xs font-semibold rounded-md transition-all cursor-pointer ${
                      unit === u
                        ? 'bg-emerald-700 text-white shadow-xs'
                        : 'text-slate-600 hover:bg-slate-200/70'
                    }`}
                  >
                    {u}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* ৫. মন্তব্য (ঐচ্ছিক) */}
          <div>
            <label htmlFor="feed-notes-input" className="block text-xs sm:text-sm font-semibold text-slate-700 mb-1">
              মন্তব্য (ঐচ্ছিক)
            </label>
            <textarea
              id="feed-notes-input"
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="যেমন: মাছ খাবার কম খেয়েছে বা পানির অবস্থা..."
              className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all resize-none"
            />
          </div>

          {/* Actions */}
          <div className="pt-2 flex items-center justify-end gap-2.5 border-t border-slate-100">
            <button
              id="cancel-feed-modal-btn"
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
            >
              বাতিল
            </button>
            <button
              id="submit-feed-btn"
              type="submit"
              disabled={ponds.length === 0}
              className="px-5 py-2.5 text-sm font-semibold bg-emerald-700 hover:bg-emerald-800 disabled:opacity-50 text-white rounded-lg shadow-sm transition-all flex items-center gap-2 cursor-pointer active:scale-95"
            >
              {editingFeed ? (
                <>
                  <Check className="w-4 h-4" />
                  <span>হালনাগাদ করুন</span>
                </>
              ) : (
                <>
                  <Plus className="w-4 h-4" />
                  <span>খাবার সংরক্ষণ করুন</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
