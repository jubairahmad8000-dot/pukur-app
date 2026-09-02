import React, { useState, useMemo } from 'react';
import { Pond, Sale } from '../types';
import { TrendingUp, Plus, Calendar, Edit, Trash2, FileText, Filter, AlertCircle, Waves, User, Scale } from 'lucide-react';
import { toBnNumber, formatBnDate } from '../utils/storage';

interface SaleSectionProps {
  sales: Sale[];
  ponds: Pond[];
  onAddSale: (pondId?: string) => void;
  onEditSale: (sale: Sale) => void;
  onDeleteSale: (sale: Sale) => void;
}

export const SaleSection: React.FC<SaleSectionProps> = ({
  sales,
  ponds,
  onAddSale,
  onEditSale,
  onDeleteSale,
}) => {
  const [selectedPondId, setSelectedPondId] = useState<string>('all');

  // পুকুরের লুকআপ ম্যাপ
  const pondMap = useMemo(() => {
    const map = new Map<string, Pond>();
    ponds.forEach((p) => map.set(p.id, p));
    return map;
  }, [ponds]);

  // ফিল্টার করা বিক্রির তালিকা
  const filteredSales = useMemo(() => {
    return sales
      .filter((item) => {
        if (selectedPondId !== 'all' && item.pondId !== selectedPondId) {
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
  }, [sales, selectedPondId]);

  // মোট আয় হিসাব
  const totalRevenueFiltered = useMemo(() => {
    return filteredSales.reduce((sum, item) => sum + Number(item.totalAmount || 0), 0);
  }, [filteredSales]);

  // মোট ওজন (কেজি হিসেবে সমন্বিত)
  const totalWeightKg = useMemo(() => {
    return filteredSales.reduce((acc, item) => {
      const w = Number(item.weight || 0);
      if (item.weightUnit === 'মণ') return acc + w * 40;
      return acc + w;
    }, 0);
  }, [filteredSales]);

  return (
    <section className="mt-4" aria-label="মাছ বিক্রির হিসাব">
      {/* ১. বিক্রি সারসংক্ষেপ ব্যানার কার্ড */}
      <div className="bg-gradient-to-r from-emerald-800 to-teal-900 rounded-2xl text-white p-4 sm:p-5 shadow-sm mb-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-white/15 flex items-center justify-center border border-white/20">
              <TrendingUp className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-bold">মাছ বিক্রির হিসাব</h2>
              <p className="text-xs text-emerald-100">
                আহরণকৃত মাছের ওজন, বিক্রয় দর ও মোট আয়ের হিসাব
              </p>
            </div>
          </div>

          {/* Metrics */}
          <div className="flex items-center gap-3 bg-black/20 p-2.5 rounded-xl border border-white/10">
            <div className="px-3 border-r border-white/15 text-center">
              <span className="text-[11px] text-emerald-200 block">
                {selectedPondId !== 'all' ? 'ফিল্টারকৃত মোট বিক্রি' : 'সর্বমোট বিক্রি'}
              </span>
              <span className="text-lg sm:text-xl font-bold text-white">
                {toBnNumber(totalRevenueFiltered)} <span className="text-xs">৳</span>
              </span>
            </div>
            <div className="px-3 text-center">
              <span className="text-[11px] text-emerald-200 block">মোট ওজন</span>
              <span className="text-lg sm:text-xl font-bold text-white">
                {toBnNumber(Math.round(totalWeightKg))} <span className="text-xs">কেজি</span>
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
            id="sale-pond-filter"
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

          {selectedPondId !== 'all' && (
            <button
              onClick={() => setSelectedPondId('all')}
              className="text-xs text-emerald-700 hover:underline font-semibold ml-1 cursor-pointer"
            >
              সাফ করুন
            </button>
          )}
        </div>

        {/* নতুন বিক্রি যোগ বাটন */}
        <button
          id="add-sale-btn"
          onClick={() => onAddSale(selectedPondId !== 'all' ? selectedPondId : undefined)}
          className="inline-flex items-center justify-center gap-1.5 bg-emerald-700 hover:bg-emerald-800 text-white px-3.5 py-2 rounded-lg font-semibold text-xs sm:text-sm shadow-sm transition-all cursor-pointer active:scale-95 shrink-0"
        >
          <Plus className="w-4 h-4 stroke-[2.5]" />
          <span>মাছ বিক্রি যোগ করুন</span>
        </button>
      </div>

      {/* ৩. বিক্রির তালিকাসমূহ */}
      {sales.length === 0 ? (
        <div
          id="empty-sale-state"
          className="bg-white rounded-2xl border-2 border-dashed border-emerald-200 p-8 text-center my-4 max-w-lg mx-auto shadow-xs"
        >
          <div className="w-16 h-16 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center mx-auto mb-3 shadow-inner">
            <TrendingUp className="w-8 h-8" />
          </div>
          <h3 className="text-base sm:text-lg font-bold text-slate-800">
            এখনও কোনো মাছ বিক্রির হিসাব যোগ করা হয়নি
          </h3>
          <p className="text-xs sm:text-sm text-slate-500 max-w-sm mx-auto mt-1 mb-5">
            পুকুর থেকে মাছ বিক্রির পর ওজন ও টাকার সঠিক এন্ট্রি রাখুন।
          </p>
          <button
            id="empty-state-add-sale-btn"
            onClick={() => onAddSale()}
            className="inline-flex items-center gap-2 bg-emerald-700 hover:bg-emerald-800 text-white font-semibold text-sm px-5 py-2.5 rounded-xl shadow-md active:scale-95 transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>প্রথম বিক্রি যোগ করুন</span>
          </button>
        </div>
      ) : filteredSales.length === 0 ? (
        <div className="bg-white rounded-xl border border-slate-200 p-8 text-center">
          <AlertCircle className="w-8 h-8 text-slate-400 mx-auto mb-2" />
          <p className="text-sm font-semibold text-slate-700">
            এই ফিল্টারে কোনো বিক্রির রেকর্ড নেই
          </p>
          <p className="text-xs text-slate-400 mt-1">
            ফিল্টার পরিবর্তন করুন অথবা নতুন বিক্রি যোগ করুন
          </p>
          <button
            onClick={() => setSelectedPondId('all')}
            className="mt-3 text-xs font-semibold text-emerald-700 hover:underline cursor-pointer"
          >
            সব ফিল্টার সাফ করুন
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredSales.map((sale) => {
            const pond = pondMap.get(sale.pondId);

            return (
              <article
                key={sale.id}
                id={`sale-card-${sale.id}`}
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

                      {/* Weight info */}
                      <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-800 border border-emerald-100">
                        <Scale className="w-3 h-3 text-emerald-600" />
                        {toBnNumber(sale.weight)} {sale.weightUnit}
                      </span>

                      {/* Unit price */}
                      <span className="text-[11px] font-medium text-slate-600 bg-slate-50 px-2 py-0.5 rounded border border-slate-200">
                        দর: {toBnNumber(sale.unitPrice)} ৳/{sale.weightUnit}
                      </span>
                    </div>

                    {/* Fish Type */}
                    <h3 className="text-base font-bold text-slate-800 pt-0.5">
                      {sale.fishType}
                    </h3>

                    {/* Buyer and Date */}
                    <div className="flex items-center gap-3 text-xs text-slate-500 flex-wrap">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5 text-slate-400" />
                        {formatBnDate(sale.date)}
                      </span>

                      {sale.buyerName && (
                        <span className="flex items-center gap-1 text-slate-600">
                          <User className="w-3.5 h-3.5 text-slate-400" />
                          <span>ক্রেতা: {sale.buyerName}</span>
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Revenue & Actions */}
                  <div className="flex flex-col items-end gap-1.5 shrink-0">
                    <span className="text-lg sm:text-xl font-black text-emerald-700 tracking-tight">
                      + {toBnNumber(sale.totalAmount)} ৳
                    </span>

                    <div className="flex items-center gap-1">
                      <button
                        id={`edit-sale-btn-${sale.id}`}
                        onClick={() => onEditSale(sale)}
                        aria-label="বিক্রি সম্পাদন করুন"
                        className="p-1.5 text-slate-500 hover:text-emerald-700 hover:bg-emerald-50 rounded-lg transition-colors cursor-pointer"
                        title="সম্পাদনা করুন"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        id={`delete-sale-btn-${sale.id}`}
                        onClick={() => onDeleteSale(sale)}
                        aria-label="বিক্রি মুছে ফেলুন"
                        className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                        title="মুছে ফেলুন"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Notes if present */}
                {sale.notes && sale.notes.trim() !== '' && (
                  <div className="mt-2.5 pt-2 border-t border-slate-100 text-xs text-slate-600 flex items-start gap-1.5 bg-slate-50 p-2 rounded-lg">
                    <FileText className="w-3.5 h-3.5 text-slate-400 mt-0.5 shrink-0" />
                    <div>
                      <span className="font-semibold text-slate-700">মন্তব্য:</span> {sale.notes}
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
