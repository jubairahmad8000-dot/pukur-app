import React, { useState } from 'react';
import { Pond } from '../types';
import { PondCard } from './PondCard';
import { Search, Plus, Waves, AlertCircle } from 'lucide-react';
import { toBnNumber } from '../utils/storage';

interface PondFinancialSummary {
  expense: number;
  sale: number;
  profit: number;
}

interface PondListSectionProps {
  ponds: Pond[];
  onAddPond: () => void;
  onEditPond: (pond: Pond) => void;
  onDeletePond: (pond) => void;
  onAddFeed?: (pondId: string) => void;
  onAddExpense?: (pondId: string) => void;
  onAddSale?: (pondId: string) => void;
  pondFinancialMap?: Map<string, PondFinancialSummary>;
}

export const PondListSection: React.FC<PondListSectionProps> = ({
  ponds,
  onAddPond,
  onEditPond,
  onDeletePond,
  onAddFeed,
  onAddExpense,
  onAddSale,
  pondFinancialMap,
}) => {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredPonds = ponds.filter((p) => {
    const term = searchTerm.toLowerCase();
    return (
      p.name.toLowerCase().includes(term) ||
      p.location.toLowerCase().includes(term) ||
      (p.notes && p.notes.toLowerCase().includes(term))
    );
  });

  return (
    <section className="mt-4" aria-label="পুকুরের তালিকা">
      {/* Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
        <div>
          <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
            <span>পুকুরসমূহের তালিকা</span>
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-slate-200 text-slate-700">
              {toBnNumber(ponds.length)} টি
            </span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            নিচে আপনার সংরক্ষিত সকল পুকুরের বিবরণ ও আর্থিক সারাংশ প্রদর্শিত হচ্ছে
          </p>
        </div>

        {/* Search Bar */}
        {ponds.length > 0 && (
          <div className="relative min-w-[220px] max-w-xs">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              id="search-pond-input"
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="পুকুরের নাম বা অবস্থান খুঁজুন..."
              className="w-full pl-9 pr-3.5 py-1.5 text-xs sm:text-sm bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all placeholder:text-slate-400"
            />
          </div>
        )}
      </div>

      {/* When No Ponds Exist */}
      {ponds.length === 0 ? (
        <div
          id="empty-pond-state"
          className="bg-white rounded-2xl border-2 border-dashed border-emerald-200 p-8 text-center my-4 max-w-lg mx-auto shadow-xs"
        >
          <div className="w-16 h-16 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center mx-auto mb-3 shadow-inner">
            <Waves className="w-8 h-8" />
          </div>
          <h3 className="text-base sm:text-lg font-bold text-slate-800">
            এখনও কোনো পুকুর যোগ করা হয়নি
          </h3>
          <p className="text-xs sm:text-sm text-slate-500 max-w-sm mx-auto mt-1 mb-5">
            আপনার খামারের প্রথম পুকুরটি যোগ করে হিসাব সংরক্ষণ শুরু করুন। এটি সরাসরি আপনার ফোনের লোকাল মেমরিতে সংরক্ষিত থাকবে।
          </p>
          <button
            id="empty-state-add-pond-btn"
            onClick={onAddPond}
            className="inline-flex items-center gap-2 bg-emerald-700 hover:bg-emerald-800 text-white font-semibold text-sm px-5 py-2.5 rounded-xl shadow-md active:scale-95 transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>নতুন পুকুর যোগ করুন</span>
          </button>
        </div>
      ) : filteredPonds.length === 0 ? (
        /* When search has no results */
        <div className="bg-white rounded-xl border border-slate-200 p-8 text-center">
          <AlertCircle className="w-8 h-8 text-slate-400 mx-auto mb-2" />
          <p className="text-sm font-semibold text-slate-700">
            &ldquo;{searchTerm}&rdquo; দিয়ে কোনো পুকুর পাওয়া যায়নি
          </p>
          <p className="text-xs text-slate-400 mt-1">
            বানান সঠিক কিনা যাচাই করুন অথবা অনুসন্ধান মুছুন
          </p>
          <button
            onClick={() => setSearchTerm('')}
            className="mt-3 text-xs font-semibold text-emerald-700 hover:underline cursor-pointer"
          >
            সব পুকুর দেখুন
          </button>
        </div>
      ) : (
        /* Ponds Grid */
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 sm:gap-4">
          {filteredPonds.map((pond) => (
            <PondCard
              key={pond.id}
              pond={pond}
              onEdit={onEditPond}
              onDelete={onDeletePond}
              onAddFeed={onAddFeed}
              onAddExpense={onAddExpense}
              onAddSale={onAddSale}
              financialSummary={pondFinancialMap?.get(pond.id)}
            />
          ))}
        </div>
      )}
    </section>
  );
};
