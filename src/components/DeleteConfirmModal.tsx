import React from 'react';
import { AlertTriangle, Trash2, X } from 'lucide-react';

interface DeleteConfirmModalProps {
  isOpen: boolean;
  title?: string;
  itemName?: string;
  itemType?: string;
  warningText?: string;
  onClose: () => void;
  onConfirm: () => void;
}

export const DeleteConfirmModal: React.FC<DeleteConfirmModalProps> = ({
  isOpen,
  title = 'মুছে ফেলার নিশ্চিতকরণ',
  itemName,
  itemType = 'আইটেমটি',
  warningText = 'সতর্কতা: এটি মুছে ফেললে স্থানীয় মেমরি থেকে এর সমস্ত তথ্য স্থায়ীভাবে মুছে যাবে।',
  onClose,
  onConfirm,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div
        id="delete-confirm-modal"
        className="bg-white rounded-2xl w-full max-w-md shadow-2xl border border-slate-100 overflow-hidden"
      >
        {/* Modal Top Bar */}
        <div className="px-5 py-4 flex items-center justify-between border-b border-slate-100">
          <div className="flex items-center gap-2.5 text-rose-600">
            <div className="w-8 h-8 rounded-lg bg-rose-100 flex items-center justify-center">
              <AlertTriangle className="w-4 h-4 text-rose-600" />
            </div>
            <h3 className="text-base font-bold text-slate-800">{title}</h3>
          </div>
          <button
            id="cancel-delete-x-btn"
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5">
          <p className="text-sm text-slate-600 leading-relaxed">
            আপনি কি নিশ্চিতভাবে{' '}
            {itemName && (
              <span className="font-bold text-slate-900 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200">
                {itemName}
              </span>
            )}{' '}
            {itemType} মুছে ফেলতে চান?
          </p>
          <p className="text-xs text-rose-600 mt-2 bg-rose-50 p-2.5 rounded-lg border border-rose-100">
            {warningText}
          </p>
        </div>

        {/* Actions */}
        <div className="px-5 py-3.5 bg-slate-50 border-t border-slate-100 flex items-center justify-end gap-2.5">
          <button
            id="cancel-delete-btn"
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-200/60 rounded-lg transition-colors cursor-pointer"
          >
            না, বাতিল
          </button>
          <button
            id="confirm-delete-btn"
            type="button"
            onClick={onConfirm}
            className="px-4 py-2 text-sm font-semibold bg-rose-600 hover:bg-rose-700 text-white rounded-lg shadow-sm transition-all flex items-center gap-1.5 cursor-pointer active:scale-95"
          >
            <Trash2 className="w-4 h-4" />
            <span>হ্যাঁ, মুছে ফেলুন</span>
          </button>
        </div>
      </div>
    </div>
  );
};
