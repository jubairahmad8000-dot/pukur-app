import React, { useState, useEffect } from 'react';
import { Pond, AreaUnit } from '../types';
import { X, Plus, Check, Waves, AlertCircle } from 'lucide-react';

interface PondFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (pondData: Omit<Pond, 'id' | 'createdAt'>, editingId?: string) => void;
  editingPond: Pond | null;
}

const AVAILABLE_UNITS: AreaUnit[] = ['শতক', 'বিঘা', 'একর'];

export const PondFormModal: React.FC<PondFormModalProps> = ({
  isOpen,
  onClose,
  onSave,
  editingPond,
}) => {
  const [name, setName] = useState('');
  const [location, setLocation] = useState('');
  const [area, setArea] = useState('');
  const [areaUnit, setAreaUnit] = useState<AreaUnit>('শতক');
  const [depth, setDepth] = useState('');
  const [acquisitionDate, setAcquisitionDate] = useState('');
  const [notes, setNotes] = useState('');

  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  // Reset or fill form when opening/changing editingPond
  useEffect(() => {
    if (editingPond) {
      setName(editingPond.name);
      setLocation(editingPond.location);
      setArea(editingPond.area.toString());
      setAreaUnit(editingPond.areaUnit || 'শতক');
      setDepth(editingPond.depth || '');
      setAcquisitionDate(editingPond.acquisitionDate || '');
      setNotes(editingPond.notes || '');
    } else {
      setName('');
      setLocation('');
      setArea('');
      setAreaUnit('শতক');
      setDepth('');
      // Default to today's date in YYYY-MM-DD
      const today = new Date().toISOString().split('T')[0];
      setAcquisitionDate(today);
      setNotes('');
    }
    setErrors({});
  }, [editingPond, isOpen]);

  if (!isOpen) return null;

  const validate = () => {
    const newErrors: { [key: string]: string } = {};
    if (!name.trim()) {
      newErrors.name = 'পুকুরের নাম লিখুন';
    }
    if (!location.trim()) {
      newErrors.location = 'পুকুরের অবস্থান বা ঠিকানা লিখুন';
    }
    if (!area.trim() || isNaN(Number(area)) || Number(area) <= 0) {
      newErrors.area = 'সঠিক আয়তন লিখুন (যেমন: ২৫)';
    }
    if (!acquisitionDate) {
      newErrors.acquisitionDate = 'পুকুর নেওয়ার তারিখ নির্বাচন করুন';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    onSave(
      {
        name: name.trim(),
        location: location.trim(),
        area: area.trim(),
        areaUnit,
        depth: depth.trim() || '৫-৬ ফুট',
        acquisitionDate,
        notes: notes.trim(),
      },
      editingPond ? editingPond.id : undefined
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
      <div
        id="pond-form-modal-container"
        className="bg-white rounded-2xl w-full max-w-lg shadow-2xl border border-slate-100 overflow-hidden my-auto"
      >
        {/* Modal Header */}
        <div className="bg-emerald-700 text-white px-5 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center">
              <Waves className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-bold">
                {editingPond ? 'পুকুরের তথ্য সম্পাদন' : 'নতুন পুকুর যোগ করুন'}
              </h2>
              <p className="text-xs text-emerald-100">
                {editingPond ? 'পুকুরের পরিবর্তিত বিবরণ লিখুন' : 'পুকুরের বিস্তারিত বিবরণ পূরণ করুন'}
              </p>
            </div>
          </div>
          <button
            id="close-pond-modal-btn"
            onClick={onClose}
            className="text-white/80 hover:text-white p-1.5 rounded-lg hover:bg-white/10 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body Form */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4 max-h-[80vh] overflow-y-auto">
          {/* 1. পুকুরের নাম */}
          <div>
            <label htmlFor="pond-name-input" className="block text-xs sm:text-sm font-semibold text-slate-700 mb-1">
              পুকুরের নাম <span className="text-rose-500">*</span>
            </label>
            <input
              id="pond-name-input"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="যেমন: উত্তর পাড়া বড় পুকুর"
              className={`w-full px-3.5 py-2.5 rounded-lg border text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all ${
                errors.name ? 'border-rose-400 bg-rose-50/20' : 'border-slate-300 bg-white'
              }`}
            />
            {errors.name && (
              <p className="text-xs text-rose-600 mt-1 flex items-center gap-1">
                <AlertCircle className="w-3.5 h-3.5" /> {errors.name}
              </p>
            )}
          </div>

          {/* 2. পুকুরের অবস্থান */}
          <div>
            <label htmlFor="pond-location-input" className="block text-xs sm:text-sm font-semibold text-slate-700 mb-1">
              পুকুরের অবস্থান <span className="text-rose-500">*</span>
            </label>
            <input
              id="pond-location-input"
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="যেমন: নিজ বাড়ির পেছনে, চর পাড়া"
              className={`w-full px-3.5 py-2.5 rounded-lg border text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all ${
                errors.location ? 'border-rose-400 bg-rose-50/20' : 'border-slate-300 bg-white'
              }`}
            />
            {errors.location && (
              <p className="text-xs text-rose-600 mt-1 flex items-center gap-1">
                <AlertCircle className="w-3.5 h-3.5" /> {errors.location}
              </p>
            )}
          </div>

          {/* 3. পুকুরের আয়তন এবং ইউনিট */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label htmlFor="pond-area-input" className="block text-xs sm:text-sm font-semibold text-slate-700 mb-1">
                পুকুরের আয়তন <span className="text-rose-500">*</span>
              </label>
              <input
                id="pond-area-input"
                type="number"
                step="any"
                min="0"
                value={area}
                onChange={(e) => setArea(e.target.value)}
                placeholder="যেমন: ২৫"
                className={`w-full px-3.5 py-2.5 rounded-lg border text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all ${
                  errors.area ? 'border-rose-400 bg-rose-50/20' : 'border-slate-300 bg-white'
                }`}
              />
              {errors.area && (
                <p className="text-xs text-rose-600 mt-1 flex items-center gap-1">
                  <AlertCircle className="w-3.5 h-3.5" /> {errors.area}
                </p>
              )}
            </div>

            <div>
              <label className="block text-xs sm:text-sm font-semibold text-slate-700 mb-1">
                আয়তনের ইউনিট <span className="text-rose-500">*</span>
              </label>
              <div className="grid grid-cols-3 gap-1.5 p-1 bg-slate-100 rounded-lg border border-slate-200">
                {AVAILABLE_UNITS.map((unit) => (
                  <button
                    key={unit}
                    type="button"
                    onClick={() => setAreaUnit(unit)}
                    className={`py-1.5 text-xs font-semibold rounded-md transition-all cursor-pointer ${
                      areaUnit === unit
                        ? 'bg-emerald-700 text-white shadow-xs'
                        : 'text-slate-600 hover:bg-slate-200/70'
                    }`}
                  >
                    {unit}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* 4. পুকুরের গভীরতা এবং নেওয়ার তারিখ */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label htmlFor="pond-depth-input" className="block text-xs sm:text-sm font-semibold text-slate-700 mb-1">
                পুকুরের গভীরতা
              </label>
              <input
                id="pond-depth-input"
                type="text"
                value={depth}
                onChange={(e) => setDepth(e.target.value)}
                placeholder="যেমন: ৬ ফুট"
                className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all"
              />
            </div>

            <div>
              <label htmlFor="pond-date-input" className="block text-xs sm:text-sm font-semibold text-slate-700 mb-1">
                পুকুর নেওয়ার তারিখ <span className="text-rose-500">*</span>
              </label>
              <input
                id="pond-date-input"
                type="date"
                value={acquisitionDate}
                onChange={(e) => setAcquisitionDate(e.target.value)}
                className={`w-full px-3.5 py-2.5 rounded-lg border text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all ${
                  errors.acquisitionDate ? 'border-rose-400 bg-rose-50/20' : 'border-slate-300 bg-white'
                }`}
              />
              {errors.acquisitionDate && (
                <p className="text-xs text-rose-600 mt-1 flex items-center gap-1">
                  <AlertCircle className="w-3.5 h-3.5" /> {errors.acquisitionDate}
                </p>
              )}
            </div>
          </div>

          {/* 5. মন্তব্য (মন্তব্য) */}
          <div>
            <label htmlFor="pond-notes-input" className="block text-xs sm:text-sm font-semibold text-slate-700 mb-1">
              মন্তব্য (ঐচ্ছিক)
            </label>
            <textarea
              id="pond-notes-input"
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="যেমন: মাছের প্রজাতি, পানির অবস্থা বা লিজ সংক্রান্ত কোনো তথ্য..."
              className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all resize-none"
            />
          </div>

          {/* Actions */}
          <div className="pt-2 flex items-center justify-end gap-2.5 border-t border-slate-100">
            <button
              id="cancel-pond-btn"
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
            >
              বাতিল
            </button>
            <button
              id="submit-pond-btn"
              type="submit"
              className="px-5 py-2.5 text-sm font-semibold bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg shadow-sm transition-all flex items-center gap-2 cursor-pointer active:scale-95"
            >
              {editingPond ? (
                <>
                  <Check className="w-4 h-4" />
                  <span>হালনাগাদ করুন</span>
                </>
              ) : (
                <>
                  <Plus className="w-4 h-4" />
                  <span>পুকুর সংরক্ষণ করুন</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
