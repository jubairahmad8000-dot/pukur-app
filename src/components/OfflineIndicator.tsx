import React, { useEffect, useState } from 'react';
import { WifiOff, Wifi } from 'lucide-react';

export const OfflineIndicator: React.FC = () => {
  const [isOnline, setIsOnline] = useState(
    typeof navigator !== 'undefined' ? navigator.onLine : true
  );
  const [showReconnected, setShowReconnected] = useState(false);

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      setShowReconnected(true);
      const timer = setTimeout(() => setShowReconnected(false), 3000);
      return () => clearTimeout(timer);
    };

    const handleOffline = () => {
      setIsOnline(false);
      setShowReconnected(false);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  if (isOnline && !showReconnected) return null;

  if (showReconnected) {
    return (
      <div className="fixed bottom-20 left-4 z-50 flex items-center gap-2 rounded-xl bg-emerald-700 px-3.5 py-2 text-xs font-semibold text-white shadow-lg border border-emerald-500 animate-in fade-in slide-in-from-bottom-2">
        <Wifi className="w-3.5 h-3.5 text-emerald-200" />
        <span>ইন্টারনেট পুনঃসংযোগ হয়েছে</span>
      </div>
    );
  }

  return (
    <div className="fixed bottom-20 left-4 z-50 flex items-center gap-2 rounded-xl bg-slate-900/90 backdrop-blur-xs px-3.5 py-2 text-xs font-semibold text-white shadow-lg border border-slate-700 animate-in fade-in slide-in-from-bottom-2">
      <WifiOff className="w-3.5 h-3.5 text-amber-400" />
      <span>অফলাইন মোড — ফোনে ডাটা সংরক্ষিত আছে</span>
    </div>
  );
};
