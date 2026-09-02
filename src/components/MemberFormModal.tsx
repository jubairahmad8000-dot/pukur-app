import React, { useState, useEffect } from 'react';
import { Member } from '../types';
import { X, Users, Phone, DollarSign, Calendar, FileText, Check, Shield } from 'lucide-react';
import { getTodayDateStr } from '../utils/storage';

interface MemberFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (
    memberData: Omit<Member, 'id' | 'createdAt'>,
    editingId?: string
  ) => void;
  editingMember?: Member | null;
}

const COMMON_ROLES = [
  'অংশীদার সদস্য',
  'ব্যবস্থাপক ও অংশীদার',
  'সভাপতি',
  'সাধারণ সম্পাদক',
  'কোষাধ্যক্ষ',
  'সিনিয়র অংশীদার',
];

export const MemberFormModal: React.FC<MemberFormModalProps> = ({
  isOpen,
  onClose,
  onSave,
  editingMember,
}) => {
  const [name, setName] = useState('');
  const [shareCount, setShareCount] = useState<string>('১');
  const [phone, setPhone] = useState('');
  const [role, setRole] = useState('অংশীদার সদস্য');
  const [investmentAmount, setInvestmentAmount] = useState<string>('');
  const [joinDate, setJoinDate] = useState(getTodayDateStr());
  const [notes, setNotes] = useState('');
  const [errors, setErrors] = useState<{ name?: string; shareCount?: string }>({});

  useEffect(() => {
    if (editingMember) {
      setName(editingMember.name);
      setShareCount(editingMember.shareCount ? editingMember.shareCount.toString() : '১');
      setPhone(editingMember.phone || '');
      setRole(editingMember.role || 'অংশীদার সদস্য');
      setInvestmentAmount(
        editingMember.investmentAmount !== undefined && editingMember.investmentAmount !== null
          ? editingMember.investmentAmount.toString()
          : ''
      );
      setJoinDate(editingMember.joinDate || getTodayDateStr());
      setNotes(editingMember.notes || '');
    } else {
      setName('');
      setShareCount('১');
      setPhone('');
      setRole('অংশীদার সদস্য');
      setInvestmentAmount('');
      setJoinDate(getTodayDateStr());
      setNotes('');
    }
    setErrors({});
  }, [editingMember, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const newErrors: { name?: string; shareCount?: string } = {};

    if (!name.trim()) {
      newErrors.name = 'সদস্যের নাম দেওয়া আবশ্যক';
    }

    const parsedShares = parseFloat(shareCount);
    if (isNaN(parsedShares) || parsedShares <= 0) {
      newErrors.shareCount = 'সঠিক শেয়ার সংখ্যা লিখুন (কমপক্ষে ১ বা তার বেশি)';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    const payload: Omit<Member, 'id' | 'createdAt'> = {
      name: name.trim(),
      shareCount: parsedShares,
      phone: phone.trim() || undefined,
      role: role.trim() || 'অংশীদার সদস্য',
      investmentAmount: investmentAmount ? parseFloat(investmentAmount) : undefined,
      joinDate: joinDate || getTodayDateStr(),
      notes: notes.trim() || undefined,
    };

    onSave(payload, editingMember ? editingMember.id : undefined);
  };

  return (
    <div
      id="member-form-modal-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs animate-fade-in overflow-y-auto"
      onClick={onClose}
    >
      <div
        id="member-form-modal-container"
        className="bg-white w-full max-w-lg rounded-2xl shadow-2xl border border-slate-200 overflow-hidden my-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="bg-emerald-800 text-white px-5 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-white/15 flex items-center justify-center">
              <Users className="w-4 h-4 text-white" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold">
                {editingMember ? 'সদস্যের তথ্য সম্পাদনা' : 'নতুন সদস্য ও শেয়ার যোগ করুন'}
              </h2>
              <p className="text-xs text-emerald-100/80">
                খামারের অংশীদার সদস্যের নাম ও শেয়ার সংরক্ষণ
              </p>
            </div>
          </div>
          <button
            id="close-member-modal-btn"
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-lg text-emerald-100 hover:text-white hover:bg-white/10 flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body Form */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4 max-h-[80vh] overflow-y-auto">
          {/* ১. সদস্যের নাম */}
          <div>
            <label
              htmlFor="member-name-input"
              className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1"
            >
              সদস্যের পুরো নাম <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <input
                id="member-name-input"
                type="text"
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  if (errors.name) setErrors({ ...errors, name: undefined });
                }}
                placeholder="যেমন: মো: রফিকুল ইসলাম"
                className={`w-full px-3.5 py-2 text-sm bg-slate-50 border rounded-xl focus:bg-white focus:outline-none focus:ring-2 transition-all ${
                  errors.name
                    ? 'border-rose-400 focus:ring-rose-300'
                    : 'border-slate-300 focus:ring-emerald-500 focus:border-emerald-500'
                }`}
              />
            </div>
            {errors.name && (
              <p className="text-xs text-rose-600 mt-1 font-medium">{errors.name}</p>
            )}
          </div>

          {/* ২. শেয়ার সংখ্যা ও মূলধন/জমা */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            {/* শেয়ার সংখ্যা */}
            <div>
              <label
                htmlFor="member-share-count-input"
                className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1"
              >
                শেয়ার সংখ্যা <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <input
                  id="member-share-count-input"
                  type="number"
                  step="any"
                  min="0.1"
                  value={shareCount}
                  onChange={(e) => {
                    setShareCount(e.target.value);
                    if (errors.shareCount) setErrors({ ...errors, shareCount: undefined });
                  }}
                  placeholder="যেমন: ৫ বা ১০"
                  className={`w-full px-3.5 py-2 text-sm bg-slate-50 border rounded-xl focus:bg-white focus:outline-none focus:ring-2 transition-all font-semibold ${
                    errors.shareCount
                      ? 'border-rose-400 focus:ring-rose-300'
                      : 'border-slate-300 focus:ring-emerald-500 focus:border-emerald-500'
                  }`}
                />
                <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs font-semibold text-slate-400">
                  টি শেয়ার
                </span>
              </div>
              {errors.shareCount && (
                <p className="text-xs text-rose-600 mt-1 font-medium">{errors.shareCount}</p>
              )}
            </div>

            {/* জমা / মূলধনের টাকা (ঐচ্ছিক) */}
            <div>
              <label
                htmlFor="member-investment-input"
                className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1"
              >
                জমা / মূলধন (টাকা) <span className="text-slate-400 font-normal">(ঐচ্ছিক)</span>
              </label>
              <div className="relative">
                <input
                  id="member-investment-input"
                  type="number"
                  step="any"
                  min="0"
                  value={investmentAmount}
                  onChange={(e) => setInvestmentAmount(e.target.value)}
                  placeholder="যেমন: ৫০,০০০"
                  className="w-full pl-8 pr-3.5 py-2 text-sm bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all font-medium"
                />
                <DollarSign className="w-4 h-4 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
              </div>
            </div>
          </div>

          {/* ৩. মোবাইল নম্বর ও ভূমিকা/পদবি */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            {/* মোবাইল নম্বর */}
            <div>
              <label
                htmlFor="member-phone-input"
                className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1"
              >
                মোবাইল নম্বর <span className="text-slate-400 font-normal">(ঐচ্ছিক)</span>
              </label>
              <div className="relative">
                <input
                  id="member-phone-input"
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="যেমন: ০১৭১১০০০০০১"
                  className="w-full pl-8 pr-3.5 py-2 text-sm bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all"
                />
                <Phone className="w-4 h-4 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
              </div>
            </div>

            {/* যোগদানের তারিখ */}
            <div>
              <label
                htmlFor="member-join-date-input"
                className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1"
              >
                যোগদানের তারিখ
              </label>
              <div className="relative">
                <input
                  id="member-join-date-input"
                  type="date"
                  value={joinDate}
                  onChange={(e) => setJoinDate(e.target.value)}
                  className="w-full pl-8 pr-3 py-2 text-xs sm:text-sm bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all"
                />
                <Calendar className="w-4 h-4 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
              </div>
            </div>
          </div>

          {/* ৪. ভূমিকা বা পদবি নির্বাচন */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
              <Shield className="w-3.5 h-3.5 text-emerald-700" />
              <span>ভূমিকা / পদবি</span>
            </label>
            <div className="flex flex-wrap gap-1.5 mb-2">
              {COMMON_ROLES.map((r) => (
                <button
                  key={r}
                  type="button"
                  onClick={() => setRole(r)}
                  className={`text-xs px-2.5 py-1 rounded-lg border transition-all cursor-pointer ${
                    role === r
                      ? 'bg-emerald-700 text-white border-emerald-700 font-semibold shadow-xs'
                      : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  {r}
                </button>
              ))}
            </div>
            <input
              id="member-custom-role-input"
              type="text"
              value={role}
              onChange={(e) => setRole(e.target.value)}
              placeholder="অন্য কোনো পদবি লিখুন..."
              className="w-full px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
            />
          </div>

          {/* ৫. মন্তব্য / বিবরণ */}
          <div>
            <label
              htmlFor="member-notes-input"
              className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1 flex items-center gap-1"
            >
              <FileText className="w-3.5 h-3.5 text-slate-400" />
              <span>মন্তব্য বা বিশেষ বিবরণ <span className="text-slate-400 font-normal">(ঐচ্ছিক)</span></span>
            </label>
            <textarea
              id="member-notes-input"
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="সদস্য সম্পর্কিত অতিরিক্ত কোনো তথ্য থাকলে লিখুন..."
              className="w-full px-3.5 py-2 text-xs sm:text-sm bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all resize-none"
            />
          </div>

          {/* Form Action Buttons */}
          <div className="pt-2 flex items-center justify-end gap-2.5 border-t border-slate-100">
            <button
              id="cancel-member-form-btn"
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs sm:text-sm font-semibold text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
            >
              বাতিল
            </button>
            <button
              id="save-member-submit-btn"
              type="submit"
              className="inline-flex items-center gap-1.5 px-5 py-2 bg-emerald-700 hover:bg-emerald-800 text-white font-semibold text-xs sm:text-sm rounded-xl shadow-md active:scale-95 transition-all cursor-pointer"
            >
              <Check className="w-4 h-4 stroke-[2.5]" />
              <span>{editingMember ? 'আপডেট করুন' : 'সংরক্ষণ করুন'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
