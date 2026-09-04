import React, { useState } from 'react';
import { Lock, Unlock, ShieldAlert, KeyRound, Check, Eye, EyeOff, LogIn } from 'lucide-react';
import { verifyAppPassword, getPasswordHint } from '../utils/security';
import { GoogleUser } from '../services/googleSheetsService';

interface PasscodeLockModalProps {
  isLocked: boolean;
  onUnlock: () => void;
  googleUser: GoogleUser | null;
}

export const PasscodeLockModal: React.FC<PasscodeLockModalProps> = ({
  isLocked,
  onUnlock,
  googleUser,
}) => {
  const [pin, setPin] = useState('');
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showHint, setShowHint] = useState(false);

  if (!isLocked) return null;

  const hint = getPasswordHint();

  const handleDigit = (digit: string) => {
    if (pin.length >= 8) return;
    const nextPin = pin + digit;
    setPin(nextPin);
    setError('');
  };

  const handleDelete = () => {
    setPin((prev) => prev.slice(0, -1));
    setError('');
  };

  const handleClear = () => {
    setPin('');
    setError('');
  };

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!pin) {
      setError('দয়া করে পাসওয়ার্ড বা পিন লিখুন');
      return;
    }

    if (verifyAppPassword(pin)) {
      setError('');
      setPin('');
      onUnlock();
    } else {
      setError('ভুল পাসওয়ার্ড! আবার চেষ্টা করুন।');
      setPin('');
    }
  };

  const handleUnlockWithGoogle = () => {
    if (googleUser) {
      onUnlock();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/90 backdrop-blur-md p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-sm bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden flex flex-col items-center text-center p-6 sm:p-7">
        {/* Lock Icon */}
        <div className="w-16 h-16 rounded-2xl bg-emerald-100 text-emerald-800 flex items-center justify-center shadow-inner mb-3">
          <Lock className="w-8 h-8 text-emerald-700" />
        </div>

        <h2 className="text-xl font-bold text-slate-900">পুকুর হিসাব</h2>
        <p className="text-xs text-slate-500 mt-0.5 mb-5">
          আপনার ব্যবসার হিসাব ও ডাটা সুরক্ষিত রয়েছে। আনলক করতে পাসওয়ার্ড লিখুন।
        </p>

        {/* PIN Input field */}
        <form onSubmit={handleSubmit} className="w-full mb-4">
          <div className="relative flex items-center">
            <input
              id="app-passcode-input"
              type={showPassword ? 'text' : 'password'}
              value={pin}
              onChange={(e) => {
                setPin(e.target.value);
                setError('');
              }}
              placeholder="পাসওয়ার্ড / ৪ সংখ্যার পিন"
              autoFocus
              className="w-full px-4 py-3.5 pr-12 text-center text-lg sm:text-xl tracking-widest font-bold text-slate-900 bg-slate-50 border border-slate-200 rounded-2xl focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-emerald-600 focus:border-emerald-600 transition-all placeholder:text-slate-400 placeholder:text-sm placeholder:tracking-normal"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3.5 text-slate-400 hover:text-slate-600 p-1 cursor-pointer"
            >
              {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            </button>
          </div>

          {error && (
            <p className="text-xs font-semibold text-rose-600 mt-2 flex items-center justify-center gap-1">
              <ShieldAlert className="w-3.5 h-3.5" />
              <span>{error}</span>
            </p>
          )}
        </form>

        {/* Numeric Touch Keypad for Mobile */}
        <div className="grid grid-cols-3 gap-2.5 w-full max-w-xs mb-4">
          {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((d) => (
            <button
              key={d}
              type="button"
              onClick={() => handleDigit(d)}
              className="h-12 sm:h-13 rounded-xl bg-slate-100/90 hover:bg-slate-200/90 active:scale-95 font-bold text-lg text-slate-800 transition-all cursor-pointer shadow-xs"
            >
              {d}
            </button>
          ))}
          <button
            type="button"
            onClick={handleClear}
            className="h-12 sm:h-13 rounded-xl bg-rose-50 hover:bg-rose-100 active:scale-95 font-semibold text-xs text-rose-700 transition-all cursor-pointer"
          >
            মুছুন
          </button>
          <button
            type="button"
            onClick={() => handleDigit('0')}
            className="h-12 sm:h-13 rounded-xl bg-slate-100/90 hover:bg-slate-200/90 active:scale-95 font-bold text-lg text-slate-800 transition-all cursor-pointer shadow-xs"
          >
            0
          </button>
          <button
            type="button"
            onClick={handleDelete}
            className="h-12 sm:h-13 rounded-xl bg-slate-100/90 hover:bg-slate-200/90 active:scale-95 font-semibold text-xs text-slate-700 transition-all cursor-pointer"
          >
            ⌫
          </button>
        </div>

        {/* Unlock Button */}
        <button
          type="button"
          onClick={() => handleSubmit()}
          className="w-full py-3 px-4 bg-emerald-700 hover:bg-emerald-800 active:scale-98 text-white font-bold text-sm sm:text-base rounded-2xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer mb-3"
        >
          <Unlock className="w-4 h-4" />
          <span>অ্যাপ আনলক করুন</span>
        </button>

        {/* Hint and Google Fallback */}
        <div className="w-full space-y-2 pt-2 border-t border-slate-100 text-xs">
          {hint && (
            <div>
              {showHint ? (
                <div className="p-2 rounded-lg bg-amber-50 text-amber-900 border border-amber-200 text-[11px]">
                  <strong>পাসওয়ার্ড ইঙ্গিত:</strong> {hint}
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => setShowHint(true)}
                  className="text-slate-500 hover:text-emerald-700 underline text-[11px] cursor-pointer"
                >
                  ইঙ্গিত (Hint) দেখুন
                </button>
              )}
            </div>
          )}

          {googleUser && (
            <button
              type="button"
              onClick={handleUnlockWithGoogle}
              className="w-full py-2 px-3 bg-slate-50 hover:bg-slate-100 text-slate-700 font-semibold text-xs rounded-xl border border-slate-200 transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <LogIn className="w-3.5 h-3.5 text-emerald-600" />
              <span>সংযুক্ত গুগল একাউন্ট ({googleUser.email || googleUser.name}) দিয়ে খুলুন</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
