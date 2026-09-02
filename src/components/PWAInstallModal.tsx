import React, { useState } from 'react';
import {
  Smartphone,
  Download,
  CheckCircle2,
  Copy,
  ExternalLink,
  WifiOff,
  Sparkles,
  X,
  Layers,
  AlertTriangle,
  QrCode,
  Globe
} from 'lucide-react';
import { usePWAInstall } from '../hooks/usePWAInstall';

interface PWAInstallModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const PWAInstallModal: React.FC<PWAInstallModalProps> = ({ isOpen, onClose }) => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [copied, setCopied] = useState(false);
  const [installing, setInstalling] = useState(false);
  const [showQR, setShowQR] = useState(false);

  if (!isOpen) return null;

  const currentUrl = typeof window !== 'undefined' ? window.location.origin : '';
  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(currentUrl)}`;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(currentUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleNativeInstall = async () => {
    setInstalling(true);
    const success = await install();
    setInstalling(false);
    if (success) {
      onClose();
    }
  };

  const handleOpenNewTab = () => {
    window.open(currentUrl, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div
        className="bg-white w-full max-w-lg rounded-2xl shadow-2xl border border-slate-100 overflow-hidden flex flex-col max-h-[92vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="bg-gradient-to-r from-emerald-800 to-teal-700 text-white px-5 py-4 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/15 border border-white/20 flex items-center justify-center text-white shadow-xs">
              <Smartphone className="w-5 h-5 text-emerald-200" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold">ফোনে অ্যাপ / APK ইনস্টল</h2>
              <p className="text-xs text-emerald-100">মোবাইলে অ্যাপ চালানোর সহজ উপায় ও সমাধান</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-black/10 hover:bg-black/20 flex items-center justify-center transition-colors text-white cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-4 sm:p-5 overflow-y-auto space-y-4 text-slate-800">
          {/* Troubleshooting Notice: Why PWABuilder / direct install didn't work in dev */}
          <div className="bg-amber-50 border border-amber-200/90 rounded-xl p-3.5 space-y-2 text-xs">
            <div className="flex items-start gap-2 text-amber-900 font-bold text-sm">
              <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <span>PWABuilder বা সরাসরি ইনস্টল কেন "হচ্ছে না"?</span>
            </div>
            <p className="text-slate-700 leading-relaxed pl-6">
              ১. <strong>গুগল এআই স্টুডিওর প্রিভিউ আইফ্রেম (iFrame):</strong> এআই স্টুডিওর স্ক্রিনের ভেতর থাকায় ব্রাউজার স্বয়ংক্রিয় ইনস্টল পপ-আপ ব্লক করে রাখে।<br />
              ২. <strong>ডেভেলপমেন্ট লিংক সুরক্ষা:</strong> বর্তমান টেস্ট লিংকটি (<code className="bg-amber-100/80 px-1 py-0.5 rounded text-amber-950 font-mono text-[11px]">ais-dev-...</code>) গুগলের প্রাইভেট লিংক। তাই PWABuilder বট সরাসরি এতে ঢুকতে পারে না।
            </p>
            <div className="pl-6 pt-1 flex flex-wrap gap-2">
              <button
                onClick={handleOpenNewTab}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white font-semibold text-xs shadow-xs transition-all cursor-pointer"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                <span>নতুন ট্যাবে অ্যাপ খুলুন (ফুলস্ক্রিন)</span>
              </button>
              <button
                onClick={() => setShowQR(!showQR)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white border border-amber-300 hover:bg-amber-100/50 text-amber-900 font-semibold text-xs transition-all cursor-pointer"
              >
                <QrCode className="w-3.5 h-3.5 text-amber-700" />
                <span>{showQR ? 'QR লুকান' : 'মোবাইলের জন্য QR কোড'}</span>
              </button>
            </div>

            {showQR && (
              <div className="mt-3 p-3 bg-white rounded-lg border border-amber-200 flex flex-col items-center text-center space-y-2">
                <img
                  src={qrCodeUrl}
                  alt="PWA QR Code"
                  className="w-36 h-36 rounded-md shadow-xs border border-slate-100"
                />
                <p className="text-[11px] text-slate-600">
                  আপনার মোবাইল ক্যামেরার কিউআর স্ক্যানার দিয়ে স্ক্যান করলেই ফোনে অ্যাপটি ওপেন হয়ে যাবে!
                </p>
              </div>
            )}
          </div>

          {/* Solution 1: Direct WebAPK Install (No packaging needed) */}
          <div className="bg-emerald-50/70 border border-emerald-200 rounded-xl p-3.5">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-xs font-semibold text-emerald-800 uppercase tracking-wider">উপায় ১: সবচেয়ে দ্রুত ও সেরা (WebAPK)</span>
              <span className="px-2 py-0.5 rounded-full bg-emerald-600 text-white font-bold text-[10px]">১-ক্লিকে ইনস্টল</span>
            </div>
            <h3 className="font-bold text-slate-900 text-sm mb-1">অ্যান্ড্রয়েড ফোনে সরাসরি আসল অ্যাপ তৈরি</h3>
            <p className="text-xs text-slate-600 leading-relaxed mb-3">
              অ্যান্ড্রয়েডের নিজস্ব সিস্টেমে কোনো APK ফাইলের প্রয়োজন নেই! ক্রোম ব্রাউজার স্বয়ংক্রিয়ভাবে এটিকে সিস্টেম অ্যাপে রূপান্তর করে:
            </p>

            {isInstallable ? (
              <button
                id="install-pwa-direct-btn"
                onClick={handleNativeInstall}
                disabled={installing}
                className="w-full py-2.5 px-4 rounded-xl bg-emerald-700 hover:bg-emerald-800 active:scale-[0.99] text-white font-semibold text-sm flex items-center justify-center gap-2 shadow-sm transition-all cursor-pointer"
              >
                <Download className="w-4 h-4" />
                <span>{installing ? 'ইনস্টল হচ্ছে...' : 'এখনই ফোনে ইনস্টল করুন'}</span>
              </button>
            ) : (
              <div className="bg-white rounded-lg p-3 border border-emerald-200/80 space-y-2 text-xs text-slate-700">
                <p className="font-semibold text-emerald-800 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5" /> মোবাইলের Google Chrome থেকে ৩টি ধাপে ইনস্টল:
                </p>
                <ol className="list-decimal list-inside space-y-1.5 text-slate-600 pl-1 leading-relaxed">
                  <li>মোবাইলের ক্রোম ব্রাউজারে অ্যাপটির লিংকটি খুলুন।</li>
                  <li>উপরে ডানপাশের <strong>তিনটি ডট (⋮)</strong> মেনুতে চাপুন।</li>
                  <li><strong>"Add to Home screen"</strong> বা <strong>"Install app"</strong> (ইনস্টল করুন)-এ চাপুন।</li>
                  <li>সাথে সাথেই আপনার ফোনের অ্যাপ ড্রয়ার ও হোমস্ক্রিনে “পুকুর হিসাব” ইনস্টল হয়ে যাবে এবং নেট ছাড়াও চলবে!</li>
                </ol>
              </div>
            )}
          </div>

          {/* Solution 2: How to use PWABuilder for standalone .APK file */}
          <div className="border border-slate-200/90 rounded-xl p-3.5 bg-slate-50/70">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">উপায় ২: প্লে-স্টোর বা শেয়ারের জন্য .APK ফাইল</span>
              <span className="px-2 py-0.5 rounded-full bg-slate-800 text-white font-bold text-[10px]">PWABuilder .APK</span>
            </div>
            <h3 className="font-bold text-slate-900 text-sm mb-1">PWABuilder দিয়ে APK ফাইল বানানোর সঠিক নিয়ম</h3>
            <p className="text-xs text-slate-600 leading-relaxed mb-2.5">
              PWABuilder-এ কোনো প্রাইভেট লিংক দেওয়া যায় না। পাবলিক লিংক পেতে নিচের যেকোনো একটি করুন:
            </p>

            <div className="bg-white rounded-lg p-3 border border-slate-200 space-y-2.5 text-xs">
              <div className="space-y-1.5 text-slate-600">
                <p className="leading-relaxed">
                  <strong>ধাপ ১:</strong> AI Studio-র উপরে ডানপাশের <strong>"Share" (শেয়ার)</strong> বা <strong>"Deploy"</strong> বাটনে ক্লিক করে পাবলিক লাইভ লিংক তৈরি করে নিন।
                </p>
                <p className="leading-relaxed">
                  <strong>ধাপ ২:</strong> অথবা সেটিংস থেকে <strong>"Export to GitHub / Download ZIP"</strong> করে Vercel বা Netlify-তে ফ্রিতে ডিপ্লয় করে নিন।
                </p>
                <p className="leading-relaxed">
                  <strong>ধাপ ৩:</strong> <strong>PWABuilder.com</strong>-এ গিয়ে সেই পাবলিক লিংক দিয়ে <strong>"Start"</strong> চাপুন। সব টেস্ট ১০০% পাস করবে এবং <strong>"Package for Android"</strong> থেকে সরাসরি <strong>.apk</strong> ডাউনলোড হবে!
                </p>
              </div>

              <div className="flex items-center justify-between gap-2 pt-1 border-t border-slate-100">
                <button
                  onClick={handleCopyLink}
                  className="px-3 py-1.5 rounded-lg bg-emerald-50 text-emerald-800 border border-emerald-200 hover:bg-emerald-100 transition-colors font-semibold text-xs flex items-center gap-1.5 cursor-pointer"
                >
                  {copied ? (
                    <>
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                      <span>লিংক কপি হয়েছে!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>বর্তমান লিংক কপি করুন</span>
                    </>
                  )}
                </button>

                <a
                  href="https://www.pwabuilder.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 font-bold text-emerald-700 hover:text-emerald-800 hover:underline text-xs"
                >
                  <span>PWABuilder.com</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            </div>
          </div>

          {/* iOS Section */}
          {isIOS && (
            <div className="bg-blue-50/70 border border-blue-200 rounded-xl p-3 text-xs text-blue-900 space-y-1.5">
              <p className="font-bold flex items-center gap-1.5">
                <Smartphone className="w-3.5 h-3.5" /> iPhone / iPad (iOS) এ ইনস্টল পদ্ধতি:
              </p>
              <p className="text-blue-800 leading-relaxed">
                Safari ব্রাউজারে নিচের <strong>Share (শেয়ার)</strong> আইকনটিতে চাপ দিয়ে <strong>"Add to Home Screen"</strong> বেছে নিন।
              </p>
            </div>
          )}

          {/* App Advantages */}
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="p-2.5 rounded-lg bg-emerald-50/60 border border-emerald-100 flex items-start gap-2">
              <WifiOff className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold text-emerald-950 block">১০০% অফলাইন</span>
                <span className="text-emerald-800 text-[11px]">নেট ছাড়াও সকল হিসাব রাখা ও দেখা যাবে।</span>
              </div>
            </div>
            <div className="p-2.5 rounded-lg bg-teal-50/60 border border-teal-100 flex items-start gap-2">
              <Layers className="w-4 h-4 text-teal-700 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold text-teal-950 block">কোনো বিজ্ঞাপন নেই</span>
                <span className="text-teal-800 text-[11px]">কোনো অ্যাড বা পপ-আপ ছাড়া দ্রুত ও নির্বিঘ্ন।</span>
              </div>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="bg-slate-50 px-5 py-3 border-t border-slate-100 flex items-center justify-between shrink-0">
          <button
            onClick={handleOpenNewTab}
            className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-800 hover:text-emerald-950 hover:underline cursor-pointer"
          >
            <Globe className="w-3.5 h-3.5" />
            <span>নতুন ট্যাবে খুলুন</span>
          </button>
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
