import React, { useState } from 'react';
import {
  X,
  FileSpreadsheet,
  CloudCheck,
  RefreshCw,
  LogOut,
  ExternalLink,
  ShieldCheck,
  Lock,
  Unlock,
  KeyRound,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  DownloadCloud,
  ChevronRight,
  Eye,
  EyeOff
} from 'lucide-react';
import { GoogleUser, SyncState } from '../services/googleSheetsService';
import {
  isPasswordProtectionEnabled,
  hasPasswordConfigured,
  getPasswordHint,
  setAppPassword,
  disableAppPassword
} from '../utils/security';

interface GoogleSyncModalProps {
  isOpen: boolean;
  onClose: () => void;
  googleUser: GoogleUser | null;
  onSignIn: () => Promise<void>;
  onSignOut: () => void;
  onManualSync: () => Promise<void>;
  onRestoreFromSheets: () => Promise<void>;
  isSyncing: boolean;
  syncState: SyncState;
  lastSyncTime: string | null;
  spreadsheetUrl: string | null;
  isAutoSync: boolean;
  onToggleAutoSync: (enabled: boolean) => void;
  onLockAppNow: () => void;
  hasScopeIssue?: boolean;
  onReauthorize?: () => Promise<void>;
}

export const GoogleSyncModal: React.FC<GoogleSyncModalProps> = ({
  isOpen,
  onClose,
  googleUser,
  onSignIn,
  onSignOut,
  onManualSync,
  onRestoreFromSheets,
  isSyncing,
  syncState,
  lastSyncTime,
  spreadsheetUrl,
  isAutoSync,
  onToggleAutoSync,
  onLockAppNow,
  hasScopeIssue,
  onReauthorize,
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'sync' | 'security'>('sync');

  // সিকিউরিটি পিন স্টেট
  const [isPasswordEnabled, setIsPasswordEnabled] = useState(isPasswordProtectionEnabled());
  const [newPin, setNewPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [hint, setHint] = useState(getPasswordHint());
  const [showPin, setShowPin] = useState(false);
  const [securityMessage, setSecurityMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // কনফার্ম রিস্টোর ডায়ালগ
  const [confirmingRestore, setConfirmingRestore] = useState(false);
  const [isRestoring, setIsRestoring] = useState(false);

  if (!isOpen) return null;

  const handleSaveSecurity = (e: React.FormEvent) => {
    e.preventDefault();
    setSecurityMessage(null);

    if (!isPasswordEnabled) {
      disableAppPassword();
      setSecurityMessage({ type: 'success', text: 'পাসওয়ার্ড সুরক্ষা নিষ্ক্রিয় করা হয়েছে।' });
      setTimeout(() => setSecurityMessage(null), 3000);
      return;
    }

    if (!newPin) {
      setSecurityMessage({ type: 'error', text: 'দয়া করে নতুন পাসওয়ার্ড লিখুন।' });
      return;
    }

    if (newPin !== confirmPin) {
      setSecurityMessage({ type: 'error', text: 'উভয় পাসওয়ার্ড একই হতে হবে।' });
      return;
    }

    setAppPassword(newPin, hint);
    setNewPin('');
    setConfirmPin('');
    setSecurityMessage({ type: 'success', text: 'পাসওয়ার্ড সফলভাবে সেট ও সংরক্ষিত হয়েছে!' });
    setTimeout(() => setSecurityMessage(null), 3500);
  };

  const handleDoRestore = async () => {
    setIsRestoring(true);
    try {
      await onRestoreFromSheets();
      setConfirmingRestore(false);
    } catch {
      // error handled in caller
    } finally {
      setIsRestoring(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div
        className="bg-white w-full max-w-lg rounded-2xl shadow-2xl border border-slate-100 overflow-hidden flex flex-col max-h-[92vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="bg-gradient-to-r from-emerald-800 to-teal-800 text-white px-5 py-4 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/15 border border-white/20 flex items-center justify-center text-white shadow-xs">
              <FileSpreadsheet className="w-5 h-5 text-emerald-200" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold">গুগল ড্রাইভ ও শীট সিঙ্ক</h2>
              <p className="text-xs text-emerald-100/90">Gmail দিয়ে লগইন, পাসওয়ার্ড ও স্বয়ংক্রিয় ব্যাকআপ</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-black/10 hover:bg-black/20 flex items-center justify-center transition-colors text-white cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Sub-tab Navigation */}
        <div className="flex border-b border-slate-200 bg-slate-50 px-4 pt-2">
          <button
            onClick={() => setActiveSubTab('sync')}
            className={`pb-2.5 px-3 text-xs sm:text-sm font-bold border-b-2 transition-all flex items-center gap-2 cursor-pointer ${
              activeSubTab === 'sync'
                ? 'border-emerald-600 text-emerald-800'
                : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
          >
            <FileSpreadsheet className="w-4 h-4" />
            <span>গুগল শীট সিঙ্ক</span>
          </button>
          <button
            onClick={() => setActiveSubTab('security')}
            className={`pb-2.5 px-3 text-xs sm:text-sm font-bold border-b-2 transition-all flex items-center gap-2 cursor-pointer ${
              activeSubTab === 'security'
                ? 'border-emerald-600 text-emerald-800'
                : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
          >
            <KeyRound className="w-4 h-4" />
            <span>অ্যাপ পাসওয়ার্ড</span>
            {hasPasswordConfigured() && (
              <span className="w-2 h-2 rounded-full bg-emerald-600"></span>
            )}
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-4 sm:p-5 overflow-y-auto space-y-4 text-slate-800">
          {activeSubTab === 'sync' ? (
            <>
              {/* Permission / Scope Issue Alert Banner */}
              {hasScopeIssue && (
                <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-300 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs text-amber-950 shadow-xs">
                  <div className="flex items-start gap-2.5">
                    <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                    <div>
                      <strong className="block font-bold text-amber-950 text-sm">গুগল ড্রাইভ ও শীট ব্যবহারের পারমিশন প্রয়োজন</strong>
                      <span className="text-amber-800 leading-relaxed block mt-0.5">
                        গুগল ড্রাইভে ফাইল তৈরি ও পড়ার জন্য প্রয়োজনীয় পারমিশন (OAuth Scope) অনুমোদন দিতে নিচের বাটনে ক্লিক করুন।
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={onReauthorize || onSignIn}
                    disabled={isSyncing}
                    className="shrink-0 px-3.5 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs transition-colors cursor-pointer shadow-xs disabled:opacity-50"
                  >
                    {isSyncing ? 'অনুমোদন হচ্ছে...' : 'অনুমোদন দিন (Re-authorize)'}
                  </button>
                </div>
              )}

              {/* Google User Profile Card */}
              {googleUser ? (
                <div className="p-4 rounded-xl bg-emerald-50/80 border border-emerald-200/90 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    {googleUser.picture ? (
                      <img
                        src={googleUser.picture}
                        alt={googleUser.name}
                        className="w-12 h-12 rounded-full border-2 border-emerald-600 shadow-xs"
                      />
                    ) : (
                      <div className="w-12 h-12 rounded-full bg-emerald-700 text-white font-bold text-lg flex items-center justify-center">
                        {googleUser.name.charAt(0) || 'G'}
                      </div>
                    )}
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-bold text-slate-900 text-sm">{googleUser.name}</h3>
                        <span className="px-2 py-0.5 rounded-full bg-emerald-700 text-white text-[10px] font-semibold">
                          সংযুক্ত
                        </span>
                      </div>
                      <p className="text-xs text-slate-600">{googleUser.email}</p>
                    </div>
                  </div>

                  <button
                    onClick={onSignOut}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white hover:bg-rose-50 text-rose-700 border border-rose-200 font-semibold text-xs transition-colors cursor-pointer self-start sm:self-auto"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>লগআউট</span>
                  </button>
                </div>
              ) : (
                <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 text-center space-y-3">
                  <div className="w-12 h-12 rounded-2xl bg-white shadow-xs border border-slate-200 flex items-center justify-center mx-auto text-emerald-700">
                    <svg className="w-6 h-6" viewBox="0 0 24 24">
                      <path
                        fill="#4285F4"
                        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                      />
                      <path
                        fill="#34A853"
                        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                      />
                      <path
                        fill="#FBBC05"
                        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                      />
                      <path
                        fill="#EA4335"
                        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                      />
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900 text-base">Gmail অ্যাকাউন্ট দিয়ে সাইন-ইন করুন</h3>
                    <p className="text-xs text-slate-600 mt-1 max-w-sm mx-auto">
                      লগইন করলেই আপনার সব পুকুর, খাবার, খরচ ও বিক্রির হিসাব স্বয়ংক্রিয়ভাবে গুগল ড্রাইভে আপনার নিজস্ব গুগল শীটে সংরক্ষিত হবে।
                    </p>
                  </div>

                  <button
                    id="modal-google-signin-btn"
                    onClick={onSignIn}
                    disabled={isSyncing}
                    className="w-full py-3 px-4 bg-white hover:bg-slate-50 border border-slate-300 active:scale-98 text-slate-700 font-bold text-sm rounded-xl shadow-xs transition-all flex items-center justify-center gap-3 cursor-pointer disabled:opacity-50"
                  >
                    <svg className="w-5 h-5 shrink-0" viewBox="0 0 48 48">
                      <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"></path>
                      <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"></path>
                      <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"></path>
                      <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"></path>
                    </svg>
                    <span>{isSyncing ? 'লগইন হচ্ছে...' : 'Sign in with Google (Gmail দিয়ে লগইন)'}</span>
                  </button>
                </div>
              )}

              {/* Google Sheets Status Card */}
              <div className="p-4 rounded-xl border border-slate-200 bg-white space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <FileSpreadsheet className="w-5 h-5 text-emerald-600" />
                    <span className="font-bold text-slate-900 text-sm">গুগল স্প্রেডশিট</span>
                  </div>
                  {lastSyncTime ? (
                    <span className="inline-flex items-center gap-1 text-[11px] text-emerald-800 bg-emerald-100 font-semibold px-2 py-0.5 rounded-full">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                      সিঙ্ক সক্রিয়
                    </span>
                  ) : (
                    <span className="text-[11px] text-slate-500">এখনও সিঙ্ক হয়নি</span>
                  )}
                </div>

                <div className="text-xs text-slate-600 space-y-1 bg-slate-50 p-3 rounded-lg border border-slate-100">
                  <p>
                    <strong>ফাইলের নাম:</strong> পুকুর হিসাব - মাছ চাষের হিসাব ও ডেটাবেস
                  </p>
                  <p>
                    <strong>ট্যাবসমূহ:</strong> সারসংক্ষেপ, পুকুরসমূহ, খাবারের হিসাব, খরচের হিসাব, মাছ বিক্রি, সদস্য ও শেয়ার
                  </p>
                  {lastSyncTime && (
                    <p className="text-emerald-800 font-medium">
                      <strong>সর্বশেষ সিঙ্ক:</strong> {lastSyncTime}
                    </p>
                  )}
                </div>

                {/* Direct Google Sheets Link Button */}
                {spreadsheetUrl && (
                  <a
                    href={spreadsheetUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full py-2.5 px-4 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-900 border border-emerald-300 font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all cursor-pointer shadow-xs"
                  >
                    <span>গুগল শীটে সরাসরি ডাটা দেখুন</span>
                    <ExternalLink className="w-4 h-4 text-emerald-700" />
                  </a>
                )}

                {/* Action Buttons: Sync Now & Auto-Sync toggle */}
                <div className="pt-1 flex flex-col sm:flex-row gap-2">
                  <button
                    onClick={onManualSync}
                    disabled={isSyncing || !googleUser}
                    className={`flex-1 py-2.5 px-4 rounded-xl font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all shadow-xs ${
                      !googleUser
                        ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                        : isSyncing
                        ? 'bg-emerald-600 text-white cursor-wait'
                        : 'bg-emerald-700 hover:bg-emerald-800 text-white cursor-pointer active:scale-98'
                    }`}
                  >
                    <RefreshCw className={`w-4 h-4 ${isSyncing ? 'animate-spin' : ''}`} />
                    <span>{isSyncing ? 'গুগল শীটে সেভ হচ্ছে...' : 'এখনই সিঙ্ক করুন'}</span>
                  </button>

                  <button
                    onClick={() => setConfirmingRestore(true)}
                    disabled={isSyncing || !googleUser}
                    className={`py-2.5 px-3 rounded-xl border font-semibold text-xs flex items-center justify-center gap-1.5 transition-all ${
                      !googleUser
                        ? 'bg-slate-50 text-slate-400 border-slate-200 cursor-not-allowed'
                        : 'bg-white hover:bg-slate-50 text-slate-700 border-slate-300 cursor-pointer'
                    }`}
                    title="নতুন ফোন বা ব্রাউজারে পুরনো ডাটা রিস্টোর করুন"
                  >
                    <DownloadCloud className="w-4 h-4 text-teal-600" />
                    <span>শীট থেকে রিস্টোর</span>
                  </button>
                </div>

                {/* Auto Sync Toggle */}
                <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs">
                  <div>
                    <span className="font-bold text-slate-800 block">স্বয়ংক্রিয় সিঙ্ক (Auto-Sync)</span>
                    <span className="text-slate-500 text-[11px]">ডাটা যোগ বা পরিবর্তন করলেই সাথে সাথে গুগল শীটে জমা হবে</span>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={isAutoSync}
                      onChange={(e) => onToggleAutoSync(e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-10 h-5 bg-slate-200 peer-focus:outline-hidden rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-emerald-600"></div>
                  </label>
                </div>
              </div>

              {/* Confirm Restore Modal Overlay */}
              {confirmingRestore && (
                <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 space-y-2 text-xs text-amber-900">
                  <p className="font-bold flex items-center gap-1.5 text-sm">
                    <AlertCircle className="w-4 h-4 text-amber-600" />
                    গুগল শীট থেকে ডাটা ফিরিয়ে আনবেন?
                  </p>
                  <p className="text-slate-700 leading-relaxed">
                    এটি গুগল শীট থেকে আপনার সংরক্ষিত সব পুকুর, খাবার, খরচ ও বিক্রির তথ্য ফোনে ডাউনলোড করে সিঙ্ক করবে।
                  </p>
                  <div className="flex items-center gap-2 pt-1">
                    <button
                      onClick={handleDoRestore}
                      disabled={isRestoring}
                      className="px-3.5 py-1.5 rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs cursor-pointer"
                    >
                      {isRestoring ? 'রিস্টোর হচ্ছে...' : 'হ্যাঁ, রিস্টোর করুন'}
                    </button>
                    <button
                      onClick={() => setConfirmingRestore(false)}
                      className="px-3 py-1.5 rounded-lg bg-white border border-slate-300 text-slate-700 font-semibold text-xs cursor-pointer"
                    >
                      বাতিল
                    </button>
                  </div>
                </div>
              )}
            </>
          ) : (
            /* Security Sub-Tab: Password & PIN Settings */
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center">
                      <KeyRound className="w-4 h-4" />
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-900 text-sm">অ্যাপ পাসওয়ার্ড সুরক্ষা</h3>
                      <p className="text-[11px] text-slate-500">
                        মোবাইল অন্যদের হাতে গেলেও আপনার ব্যবসায়িক হিসাব থাকবে গোপন
                      </p>
                    </div>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={isPasswordEnabled}
                      onChange={(e) => setIsPasswordEnabled(e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-10 h-5 bg-slate-200 peer-focus:outline-hidden rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-emerald-600"></div>
                  </label>
                </div>

                {securityMessage && (
                  <div
                    className={`p-2.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 ${
                      securityMessage.type === 'success'
                        ? 'bg-emerald-100 text-emerald-900 border border-emerald-200'
                        : 'bg-rose-100 text-rose-900 border border-rose-200'
                    }`}
                  >
                    {securityMessage.type === 'success' ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    ) : (
                      <AlertCircle className="w-4 h-4 text-rose-600" />
                    )}
                    <span>{securityMessage.text}</span>
                  </div>
                )}

                {isPasswordEnabled && (
                  <form onSubmit={handleSaveSecurity} className="space-y-3 pt-2">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        নতুন পাসওয়ার্ড বা পিন লিখুন
                      </label>
                      <div className="relative">
                        <input
                          type={showPin ? 'text' : 'password'}
                          value={newPin}
                          onChange={(e) => setNewPin(e.target.value)}
                          placeholder="৪-৮ সংখ্যার পিন বা পাসওয়ার্ড"
                          className="w-full px-3.5 py-2.5 pr-10 text-sm bg-white border border-slate-300 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-emerald-600"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPin(!showPin)}
                          className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600 p-1 cursor-pointer"
                        >
                          {showPin ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        পাসওয়ার্ড পুনরায় নিশ্চিত করুন
                      </label>
                      <input
                        type={showPin ? 'text' : 'password'}
                        value={confirmPin}
                        onChange={(e) => setConfirmPin(e.target.value)}
                        placeholder="একই পাসওয়ার্ড আবার লিখুন"
                        className="w-full px-3.5 py-2.5 text-sm bg-white border border-slate-300 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-emerald-600"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        পাসওয়ার্ড ইঙ্গিত (Password Hint - ঐচ্ছিক)
                      </label>
                      <input
                        type="text"
                        value={hint}
                        onChange={(e) => setHint(e.target.value)}
                        placeholder="পাসওয়ার্ড ভুলে গেলে মনে করার সূত্র"
                        className="w-full px-3.5 py-2 text-sm bg-white border border-slate-300 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-emerald-600"
                      />
                    </div>

                    <div className="pt-2 flex items-center gap-2">
                      <button
                        type="submit"
                        className="flex-1 py-2.5 px-4 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs sm:text-sm shadow-xs transition-colors cursor-pointer"
                      >
                        পাসওয়ার্ড সংরক্ষণ করুন
                      </button>

                      {hasPasswordConfigured() && (
                        <button
                          type="button"
                          onClick={onLockAppNow}
                          className="py-2.5 px-3.5 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-800 font-semibold text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
                        >
                          <Lock className="w-3.5 h-3.5 text-slate-700" />
                          <span>এখনই লক করুন</span>
                        </button>
                      )}
                    </div>
                  </form>
                )}
              </div>

              {/* Safety notice */}
              <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200 text-xs text-emerald-950 space-y-1">
                <p className="font-bold flex items-center gap-1">
                  <ShieldCheck className="w-4 h-4 text-emerald-700" />
                  দ্বৈত সুরক্ষা ব্যবস্থা
                </p>
                <p className="text-[11px] text-emerald-800 leading-relaxed">
                  পাসওয়ার্ড ভুলে গেলেও চিন্তা নেই! আপনার সাইন-ইন করা গুগল অ্যাকাউন্ট দিয়ে সহজেই যেকোনো সময় অ্যাপ আনলক করা যাবে।
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="bg-slate-50 px-5 py-3 border-t border-slate-100 flex items-center justify-between shrink-0">
          <span className="text-xs text-slate-500">
            {googleUser ? 'গুগল শিট ক্লাউড কানেক্টেড' : 'অফলাইন মোড'}
          </span>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-200 hover:bg-slate-300 font-semibold text-xs sm:text-sm text-slate-700 transition-colors cursor-pointer"
          >
            বন্ধ করুন
          </button>
        </div>
      </div>
    </div>
  );
};
