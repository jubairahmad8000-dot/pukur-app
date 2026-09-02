import React from 'react';
import { Pond } from '../types';
import { MapPin, Maximize2, Droplets, Calendar, Edit, Trash2, FileText, Utensils, Receipt, TrendingUp } from 'lucide-react';
import { toBnNumber, formatBnDate } from '../utils/storage';

interface PondFinancialSummary {
  expense: number;
  sale: number;
  profit: number;
}

interface PondCardProps {
  pond: Pond;
  onEdit: (pond: Pond) => void;
  onDelete: (pond: Pond) => void;
  onAddFeed?: (pondId: string) => void;
  onAddExpense?: (pondId: string) => void;
  onAddSale?: (pondId: string) => void;
  financialSummary?: PondFinancialSummary;
}

export const PondCard: React.FC<PondCardProps> = ({
  pond,
  onEdit,
  onDelete,
  onAddFeed,
  onAddExpense,
  onAddSale,
  financialSummary,
}) => {
  const isProfitable = (financialSummary?.profit ?? 0) >= 0;

  return (
    <article
      id={`pond-card-${pond.id}`}
      className="bg-white rounded-xl border border-slate-200/90 shadow-sm hover:shadow-md transition-all p-4 sm:p-5 relative group"
    >
      {/* Card Header: Pond Title & Edit/Delete Buttons */}
      <div className="flex items-start justify-between gap-3 border-b border-slate-100 pb-3">
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className="text-base sm:text-lg font-bold text-slate-800 leading-snug">
              {pond.name}
            </h3>
            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 border border-emerald-200/70">
              {toBnNumber(pond.area)} {pond.areaUnit}
            </span>
          </div>

          <p className="text-xs sm:text-sm text-slate-500 flex items-center gap-1.5 mt-1">
            <MapPin className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
            <span className="line-clamp-1">{pond.location}</span>
          </p>
        </div>

        {/* Edit and Delete Action Buttons */}
        <div className="flex items-center gap-1 shrink-0">
          <button
            id={`edit-pond-btn-${pond.id}`}
            onClick={() => onEdit(pond)}
            aria-label={`${pond.name} তথ্য সম্পাদনা করুন`}
            className="p-1.5 sm:p-2 text-slate-600 hover:text-emerald-700 hover:bg-emerald-50 active:bg-emerald-100 rounded-lg transition-colors border border-transparent hover:border-emerald-200 cursor-pointer"
            title="তথ্য সম্পাদনা"
          >
            <Edit className="w-4 h-4" />
          </button>

          <button
            id={`delete-pond-btn-${pond.id}`}
            onClick={() => onDelete(pond)}
            aria-label={`${pond.name} মুছে ফেলুন`}
            className="p-1.5 sm:p-2 text-slate-500 hover:text-rose-600 hover:bg-rose-50 active:bg-rose-100 rounded-lg transition-colors border border-transparent hover:border-rose-200 cursor-pointer"
            title="পুকুর মুছুন"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Pond Details Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 py-2.5 text-xs sm:text-sm">
        {/* আয়তন */}
        <div className="bg-slate-50 rounded-lg p-2 border border-slate-100 flex items-center gap-2">
          <div className="w-7 h-7 rounded-md bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0">
            <Maximize2 className="w-3.5 h-3.5" />
          </div>
          <div>
            <span className="text-[10px] text-slate-400 block font-medium">আয়তন</span>
            <span className="font-semibold text-slate-700 text-xs">
              {toBnNumber(pond.area)} {pond.areaUnit}
            </span>
          </div>
        </div>

        {/* গভীরতা */}
        <div className="bg-slate-50 rounded-lg p-2 border border-slate-100 flex items-center gap-2">
          <div className="w-7 h-7 rounded-md bg-blue-50 text-blue-700 flex items-center justify-center shrink-0">
            <Droplets className="w-3.5 h-3.5" />
          </div>
          <div>
            <span className="text-[10px] text-slate-400 block font-medium">গভীরতা</span>
            <span className="font-semibold text-slate-700 text-xs">
              {pond.depth ? pond.depth : 'তথ্য নেই'}
            </span>
          </div>
        </div>

        {/* নেওয়ার তারিখ */}
        <div className="col-span-2 sm:col-span-1 bg-slate-50 rounded-lg p-2 border border-slate-100 flex items-center gap-2">
          <div className="w-7 h-7 rounded-md bg-amber-50 text-amber-700 flex items-center justify-center shrink-0">
            <Calendar className="w-3.5 h-3.5" />
          </div>
          <div>
            <span className="text-[10px] text-slate-400 block font-medium">নেওয়ার তারিখ</span>
            <span className="font-semibold text-slate-700 text-xs">
              {pond.acquisitionDate ? formatBnDate(pond.acquisitionDate) : 'তথ্য নেই'}
            </span>
          </div>
        </div>
      </div>

      {/* Financial Summary of this Pond (খরচ, বিক্রি ও লাভ) */}
      {financialSummary && (
        <div className="my-2 p-2.5 rounded-lg bg-slate-50 border border-slate-200/80 flex items-center justify-between text-xs flex-wrap gap-2">
          <div className="flex items-center gap-3">
            <div>
              <span className="text-[10px] text-slate-500 block">খরচ:</span>
              <span className="font-bold text-rose-700">{toBnNumber(financialSummary.expense)} ৳</span>
            </div>
            <div className="border-l border-slate-300 pl-3">
              <span className="text-[10px] text-slate-500 block">বিক্রি:</span>
              <span className="font-bold text-emerald-700">{toBnNumber(financialSummary.sale)} ৳</span>
            </div>
          </div>

          <div className="text-right">
            <span className="text-[10px] text-slate-500 block">লাভ / ক্ষতি:</span>
            <span
              className={`font-black text-xs px-2 py-0.5 rounded-md ${
                isProfitable
                  ? 'bg-emerald-100 text-emerald-800'
                  : 'bg-rose-100 text-rose-800'
              }`}
            >
              {isProfitable ? '+' : '-'} {toBnNumber(Math.abs(financialSummary.profit))} ৳
            </span>
          </div>
        </div>
      )}

      {/* Quick Action Buttons: খাবার দিন, খরচ যোগ, বিক্রি যোগ */}
      <div className="mt-2.5 pt-2 border-t border-slate-100 flex items-center gap-1.5 flex-wrap">
        {onAddFeed && (
          <button
            id={`quick-feed-btn-${pond.id}`}
            onClick={() => onAddFeed(pond.id)}
            className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-emerald-50 text-emerald-800 hover:bg-emerald-100 border border-emerald-200/80 transition-colors cursor-pointer"
            title="এই পুকুরে খাবার দিন"
          >
            <Utensils className="w-3.5 h-3.5 text-emerald-700" />
            <span>খাবার দিন</span>
          </button>
        )}

        {onAddExpense && (
          <button
            id={`quick-expense-btn-${pond.id}`}
            onClick={() => onAddExpense(pond.id)}
            className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-rose-50 text-rose-800 hover:bg-rose-100 border border-rose-200/80 transition-colors cursor-pointer"
            title="এই পুকুরে খরচ যোগ করুন"
          >
            <Receipt className="w-3.5 h-3.5 text-rose-700" />
            <span>খরচ লিখুন</span>
          </button>
        )}

        {onAddSale && (
          <button
            id={`quick-sale-btn-${pond.id}`}
            onClick={() => onAddSale(pond.id)}
            className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-teal-50 text-teal-800 hover:bg-teal-100 border border-teal-200/80 transition-colors cursor-pointer"
            title="এই পুকুর থেকে মাছ বিক্রি যোগ করুন"
          >
            <TrendingUp className="w-3.5 h-3.5 text-teal-700" />
            <span>মাছ বিক্রি</span>
          </button>
        )}
      </div>

      {/* মন্তব্য (Notes) */}
      {pond.notes && pond.notes.trim() !== '' && (
        <div className="mt-2 pt-2 border-t border-slate-100/90 text-xs text-slate-600 flex items-start gap-1.5 bg-emerald-50/40 p-2 rounded-lg border border-emerald-100/60">
          <FileText className="w-3.5 h-3.5 text-emerald-600 mt-0.5 shrink-0" />
          <div>
            <span className="font-semibold text-emerald-800 mr-1">মন্তব্য:</span>
            <span>{pond.notes}</span>
          </div>
        </div>
      )}
    </article>
  );
};
