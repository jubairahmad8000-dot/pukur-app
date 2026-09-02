import React, { useState, useEffect } from 'react';
import { Pond, Sale, SaleWeightUnit } from '../types';
import { X, Plus, Check, TrendingUp, AlertCircle, Calculator } from 'lucide-react';
import { getTodayDateStr } from '../utils/storage';

interface SaleFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (saleData: Omit<Sale, 'id' | 'createdAt'>, editingId?: string) => void;
  editingSale: Sale | null;
  ponds: Pond[];
  defaultPondId?: string;
}

const COMMON_FISH_TYPES = [
  'রুই মাছ',
  'কাতলা মাছ',
  'মৃগেল',
  'পাঙ্গাস',
  'তেলাপিয়া',
  'সিলভার কার্প',
  'গ্রাস কার্প',
  'কার্পিও',
  'কই / শিং',
  'পাবদা',
  'মিশ্র মাছ',
];

export const SaleFormModal: React.FC<SaleFormModalProps> = ({
  isOpen,
  onClose,
  onSave,
  editingSale,
  ponds,
  defaultPondId,
}) => {
  const [pondId, setPondId] = useState('');
  const [fishType, setFishType] = useState('');
  const [weight, setWeight] = useState('');
  const [weightUnit, setWeightUnit] = useState<SaleWeightUnit>('কেজি');
  const [unitPrice, setUnitPrice] = useState('');
  const [totalAmount, setTotalAmount] = useState('');
  const [isAutoCalc, setIsAutoCalc] = useState(true);
  const [buyerName, setBuyerName] = useState('');
  const [date, setDate] = useState('');
  const [notes, setNotes] = useState('');

  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  useEffect(() => {
    if (editingSale) {
      setPondId(editingSale.pondId);
      setFishType(editingSale.fishType);
      setWeight(editingSale.weight.toString());
      setWeightUnit(editingSale.weightUnit);
      setUnitPrice(editingSale.unitPrice.toString());
      setTotalAmount(editingSale.totalAmount.toString());
      setIsAutoCalc(false);
      setBuyerName(editingSale.buyerName || '');
      setDate(editingSale.date);
      setNotes(editingSale.notes || '');
    } else {
      setPondId(defaultPondId || (ponds.length > 0 ? ponds[0].id : ''));
      setFishType('রুই মাছ');
      setWeight('');
      setWeightUnit('কেজি');
      setUnitPrice('');
      setTotalAmount('');
      setIsAutoCalc(true);
      setBuyerName('');
      setDate(getTodayDateStr());
      setNotes('');
    }
    setErrors({});
  }, [editingSale, isOpen, ponds, defaultPondId]);

  // ওজন বা রেট পরিবর্তন হলে মোট মূল্য স্বয়ংক্রিয়ভাবে হিসাব করা
  useEffect(() => {
    if (isAutoCalc) {
      const w = Number(weight);
      const p = Number(unitPrice);
      if (!isNaN(w) && !isNaN(p) && w > 0 && p > 0) {
        setTotalAmount(Math.round(w * p).toString());
      }
    }
  }, [weight, unitPrice, isAutoCalc]);

  if (!isOpen) return null;

  const validate = () => {
    const newErrors: { [key: string]: string } = {};
    if (!pondId) {
      newErrors.pondId = 'একটি পুকুর নির্বাচন করুন';
    }
    if (!fishType.trim()) {
      newErrors.fishType = 'মাছের নাম বা ধরন লিখুন';
    }
    const numWeight = Number(weight);
    if (!weight.trim() || isNaN(numWeight) || numWeight <= 0) {
      newErrors.weight = 'সঠিক ওজন লিখুন (যেমন: ৫০)';
    }
    const numPrice = Number(unitPrice);
    if (!unitPrice.trim() || isNaN(numPrice) || numPrice <= 0) {
      newErrors.unitPrice = 'দর বা প্রতি এককের দাম লিখুন (যেমন: ২৬০)';
    }
    const numTotal = Number(totalAmount);
    if (!totalAmount.trim() || isNaN(numTotal) || numTotal <= 0) {
      newErrors.totalAmount = 'সঠিক মোট বিক্রয়মূল্য লিখুন';
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
        fishType: fishType.trim(),
        weight: Number(weight),
        weightUnit,
        unitPrice: Number(unitPrice),
        totalAmount: Number(totalAmount),
        buyerName: buyerName.trim(),
        date,
        notes: notes.trim(),
      },
      editingSale ? editingSale.id : undefined
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
      <div
        id="sale-form-modal-container"
        className="bg-white rounded-2xl w-full max-w-lg shadow-2xl border border-slate-100 overflow-hidden my-auto"
      >
        {/* Header */}
        <div className="bg-emerald-700 text-white px-5 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-bold">
                {editingSale ? 'মাছ বিক্রির তথ্য সম্পাদন' : 'মাছ বিক্রি যোগ করুন'}
              </h2>
              <p className="text-xs text-emerald-100">
                মাছ আহরণ, বিক্রির ওজন, দর ও মোট আয়ের সঠিক হিসাব
              </p>
            </div>
          </div>
          <button
            id="close-sale-modal-btn"
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
            <label htmlFor="sale-pond-select" className="block text-xs sm:text-sm font-semibold text-slate-700 mb-1">
              পুকুর নির্বাচন করুন <span className="text-rose-500">*</span>
            </label>
            {ponds.length === 0 ? (
              <p className="text-xs text-amber-700 bg-amber-50 p-2.5 rounded-lg border border-amber-200">
                প্রথমে অন্তত একটি পুকুর যোগ করুন।
              </p>
            ) : (
              <select
                id="sale-pond-select"
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

          {/* মাছের ধরন / নাম */}
          <div>
            <label htmlFor="sale-fish-type-input" className="block text-xs sm:text-sm font-semibold text-slate-700 mb-1">
              মাছের নাম / প্রজাতি <span className="text-rose-500">*</span>
            </label>
            <input
              id="sale-fish-type-input"
              type="text"
              value={fishType}
              onChange={(e) => setFishType(e.target.value)}
              placeholder="যেমন: রুই, কাতলা, পাঙ্গাস..."
              className={`w-full px-3.5 py-2.5 rounded-lg border text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all ${
                errors.fishType ? 'border-rose-400 bg-rose-50/20' : 'border-slate-300 bg-white'
              }`}
            />
            {errors.fishType && (
              <p className="text-xs text-rose-600 mt-1 flex items-center gap-1">
                <AlertCircle className="w-3.5 h-3.5" /> {errors.fishType}
              </p>
            )}

            {/* দ্রুত সাজেশন চিপস */}
            <div className="flex flex-wrap gap-1.5 mt-2">
              <span className="text-[11px] text-slate-400 self-center">সাজেশন:</span>
              {COMMON_FISH_TYPES.map((type) => (
                <button
                  key={type}
                  type="button"
                  onClick={() => setFishType(type)}
                  className="text-xs px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-800 hover:bg-emerald-100 border border-emerald-200/80 cursor-pointer transition-colors"
                >
                  {type}
                </button>
              ))}
            </div>
          </div>

          {/* ওজন ও একক */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label htmlFor="sale-weight-input" className="block text-xs sm:text-sm font-semibold text-slate-700 mb-1">
                মোট ওজন <span className="text-rose-500">*</span>
              </label>
              <input
                id="sale-weight-input"
                type="number"
                step="any"
                min="0.1"
                value={weight}
                onChange={(e) => setWeight(e.target.value)}
                placeholder="যেমন: ১২০"
                className={`w-full px-3.5 py-2.5 rounded-lg border text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all ${
                  errors.weight ? 'border-rose-400 bg-rose-50/20' : 'border-slate-300 bg-white'
                }`}
              />
              {errors.weight && (
                <p className="text-xs text-rose-600 mt-1 flex items-center gap-1">
                  <AlertCircle className="w-3.5 h-3.5" /> {errors.weight}
                </p>
              )}
            </div>

            <div>
              <label className="block text-xs sm:text-sm font-semibold text-slate-700 mb-1">
                ওজনের একক <span className="text-rose-500">*</span>
              </label>
              <div className="grid grid-cols-2 gap-1.5 p-1 bg-slate-100 rounded-lg border border-slate-200">
                <button
                  type="button"
                  onClick={() => setWeightUnit('কেজি')}
                  className={`py-2 text-xs font-semibold rounded-md transition-all cursor-pointer ${
                    weightUnit === 'কেজি'
                      ? 'bg-emerald-700 text-white shadow-xs'
                      : 'text-slate-600 hover:bg-slate-200/70'
                  }`}
                >
                  কেজি (Kg)
                </button>
                <button
                  type="button"
                  onClick={() => setWeightUnit('মণ')}
                  className={`py-2 text-xs font-semibold rounded-md transition-all cursor-pointer ${
                    weightUnit === 'মণ'
                      ? 'bg-emerald-700 text-white shadow-xs'
                      : 'text-slate-600 hover:bg-slate-200/70'
                  }`}
                >
                  মণ (৪০ কেজি)
                </button>
              </div>
            </div>
          </div>

          {/* দর (রেট) ও মোট টাকা */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label htmlFor="sale-unit-price-input" className="block text-xs sm:text-sm font-semibold text-slate-700 mb-1">
                দর (প্রতি {weightUnit} টাকা) <span className="text-rose-500">*</span>
              </label>
              <input
                id="sale-unit-price-input"
                type="number"
                step="any"
                min="1"
                value={unitPrice}
                onChange={(e) => setUnitPrice(e.target.value)}
                placeholder={weightUnit === 'কেজি' ? 'যেমন: ২৮০' : 'যেমন: ৬০০০'}
                className={`w-full px-3.5 py-2.5 rounded-lg border text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all ${
                  errors.unitPrice ? 'border-rose-400 bg-rose-50/20' : 'border-slate-300 bg-white'
                }`}
              />
              {errors.unitPrice && (
                <p className="text-xs text-rose-600 mt-1 flex items-center gap-1">
                  <AlertCircle className="w-3.5 h-3.5" /> {errors.unitPrice}
                </p>
              )}
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label htmlFor="sale-total-amount-input" className="block text-xs sm:text-sm font-semibold text-slate-700">
                  মোট বিক্রয়মূল্য (৳) <span className="text-rose-500">*</span>
                </label>
                <button
                  type="button"
                  onClick={() => setIsAutoCalc(!isAutoCalc)}
                  className="text-[11px] text-emerald-700 hover:underline flex items-center gap-1 cursor-pointer"
                  title="ওজন × দর অনুযায়ী হিসাব চালু/বন্ধ"
                >
                  <Calculator className="w-3 h-3" />
                  <span>{isAutoCalc ? 'স্বয়ংক্রিয়' : 'ম্যানুয়াল'}</span>
                </button>
              </div>
              <input
                id="sale-total-amount-input"
                type="number"
                min="1"
                step="any"
                value={totalAmount}
                onChange={(e) => {
                  setIsAutoCalc(false);
                  setTotalAmount(e.target.value);
                }}
                placeholder="যেমন: ৩৩৬০০"
                className={`w-full px-3.5 py-2.5 rounded-lg border text-sm font-bold text-emerald-800 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all ${
                  errors.totalAmount ? 'border-rose-400 bg-rose-50/20' : 'border-slate-300 bg-emerald-50/30'
                }`}
              />
              {errors.totalAmount && (
                <p className="text-xs text-rose-600 mt-1 flex items-center gap-1">
                  <AlertCircle className="w-3.5 h-3.5" /> {errors.totalAmount}
                </p>
              )}
            </div>
          </div>

          {/* ক্রেতা ও তারিখ */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label htmlFor="sale-buyer-input" className="block text-xs sm:text-sm font-semibold text-slate-700 mb-1">
                ক্রেতা বা আড়তের নাম (ঐচ্ছিক)
              </label>
              <input
                id="sale-buyer-input"
                type="text"
                value={buyerName}
                onChange={(e) => setBuyerName(e.target.value)}
                placeholder="যেমন: করিম আড়তদার, বাজার ঘাট"
                className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all"
              />
            </div>

            <div>
              <label htmlFor="sale-date-input" className="block text-xs sm:text-sm font-semibold text-slate-700 mb-1">
                বিক্রির তারিখ <span className="text-rose-500">*</span>
              </label>
              <input
                id="sale-date-input"
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
          </div>

          {/* মন্তব্য */}
          <div>
            <label htmlFor="sale-notes-input" className="block text-xs sm:text-sm font-semibold text-slate-700 mb-1">
              মন্তব্য (ঐচ্ছিক)
            </label>
            <textarea
              id="sale-notes-input"
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="যেমন: প্রথম লটের মাছ, সাইজ ভালো ছিল..."
              className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all resize-none"
            />
          </div>

          {/* Buttons */}
          <div className="pt-2 flex items-center justify-end gap-2.5 border-t border-slate-100">
            <button
              id="cancel-sale-modal-btn"
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
            >
              বাতিল
            </button>
            <button
              id="submit-sale-btn"
              type="submit"
              disabled={ponds.length === 0}
              className="px-5 py-2.5 text-sm font-semibold bg-emerald-700 hover:bg-emerald-800 disabled:opacity-50 text-white rounded-lg shadow-sm transition-all flex items-center gap-2 cursor-pointer active:scale-95"
            >
              {editingSale ? (
                <>
                  <Check className="w-4 h-4" />
                  <span>হালনাগাদ করুন</span>
                </>
              ) : (
                <>
                  <Plus className="w-4 h-4" />
                  <span>বিক্রি সংরক্ষণ করুন</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
