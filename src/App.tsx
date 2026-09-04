import { useState, useEffect, useCallback, useMemo } from 'react';
import { Pond, FeedLog, Expense, Sale, Member, DashboardStats as StatsType } from './types';
import {
  getStoredPonds,
  saveStoredPonds,
  getStoredFeedLogs,
  saveStoredFeedLogs,
  getStoredExpenses,
  saveStoredExpenses,
  getStoredSales,
  saveStoredSales,
  getStoredMembers,
  saveStoredMembers,
  getTodayDateStr,
} from './utils/storage';
import {
  GoogleUser,
  SyncState,
  getStoredGoogleUser,
  getStoredSpreadsheetUrl,
  getLastSyncTime,
  isAutoSyncEnabled,
  setAutoSyncEnabled,
  requestGoogleSignIn,
  signOutGoogle,
  syncAllDataToGoogleSheets,
  restoreDataFromGoogleSheets,
  isInsufficientScopeError,
  getOrCreateSpreadsheet,
} from './services/googleSheetsService';
import { initAuth } from './services/firebaseAuth';
import {
  hasPasswordConfigured,
  isSessionUnlocked,
  setSessionUnlocked,
} from './utils/security';
import { Header, ActiveTab } from './components/Header';
import { DashboardStats } from './components/DashboardStats';
import { PondListSection } from './components/PondListSection';
import { PondFormModal } from './components/PondFormModal';
import { FeedSection } from './components/FeedSection';
import { FeedLogModal } from './components/FeedLogModal';
import { ExpenseSection } from './components/ExpenseSection';
import { ExpenseFormModal } from './components/ExpenseFormModal';
import { SaleSection } from './components/SaleSection';
import { SaleFormModal } from './components/SaleFormModal';
import { MemberListSection } from './components/MemberListSection';
import { MemberFormModal } from './components/MemberFormModal';
import { DeleteConfirmModal } from './components/DeleteConfirmModal';
import { PWAInstallModal } from './components/PWAInstallModal';
import { OfflineIndicator } from './components/OfflineIndicator';
import { GoogleSyncModal } from './components/GoogleSyncModal';
import { PasscodeLockModal } from './components/PasscodeLockModal';
import { Plus, CheckCircle2, ShieldCheck, Database, Smartphone, FileSpreadsheet, RefreshCw, ExternalLink } from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState<ActiveTab>('ponds');
  const [ponds, setPonds] = useState<Pond[]>([]);
  const [feedLogs, setFeedLogs] = useState<FeedLog[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [sales, setSales] = useState<Sale[]>([]);
  const [members, setMembers] = useState<Member[]>([]);

  // গুগল একাউন্ট ও শিট সিঙ্ক স্টেট
  const [googleUser, setGoogleUser] = useState<GoogleUser | null>(() => getStoredGoogleUser());
  const [isSyncModalOpen, setIsSyncModalOpen] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncState, setSyncState] = useState<SyncState>('idle');
  const [lastSyncTime, setLastSyncTime] = useState<string | null>(() => getLastSyncTime());
  const [spreadsheetUrl, setSpreadsheetUrl] = useState<string | null>(() => getStoredSpreadsheetUrl());
  const [isAutoSync, setIsAutoSync] = useState<boolean>(() => isAutoSyncEnabled());
  const [hasScopeIssue, setHasScopeIssue] = useState<boolean>(false);

  // অ্যাপ পাসওয়ার্ড ও নিরাপত্তা লক স্টেট
  const [isLocked, setIsLocked] = useState<boolean>(() => hasPasswordConfigured() && !isSessionUnlocked());
  const [hasPassword, setHasPassword] = useState<boolean>(() => hasPasswordConfigured());

  // PWA / APK ইনস্টল মোডাল স্টেট
  const [isInstallModalOpen, setIsInstallModalOpen] = useState(false);

  // পুকুর মোডাল স্টেট
  const [isPondModalOpen, setIsPondModalOpen] = useState(false);
  const [editingPond, setEditingPond] = useState<Pond | null>(null);
  const [deletingPond, setDeletingPond] = useState<Pond | null>(null);

  // খাবার মোডাল স্টেট
  const [isFeedModalOpen, setIsFeedModalOpen] = useState(false);
  const [editingFeed, setEditingFeed] = useState<FeedLog | null>(null);
  const [deletingFeed, setDeletingFeed] = useState<FeedLog | null>(null);
  const [defaultFeedPondId, setDefaultFeedPondId] = useState<string | undefined>(undefined);

  // খরচ মোডাল স্টেট
  const [isExpenseModalOpen, setIsExpenseModalOpen] = useState(false);
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);
  const [deletingExpense, setDeletingExpense] = useState<Expense | null>(null);
  const [defaultExpensePondId, setDefaultExpensePondId] = useState<string | undefined>(undefined);

  // বিক্রি মোডাল স্টেট
  const [isSaleModalOpen, setIsSaleModalOpen] = useState(false);
  const [editingSale, setEditingSale] = useState<Sale | null>(null);
  const [deletingSale, setDeletingSale] = useState<Sale | null>(null);
  const [defaultSalePondId, setDefaultSalePondId] = useState<string | undefined>(undefined);

  // সদস্য ও শেয়ার মোডাল স্টেট
  const [isMemberModalOpen, setIsMemberModalOpen] = useState(false);
  const [editingMember, setEditingMember] = useState<Member | null>(null);
  const [deletingMember, setDeletingMember] = useState<Member | null>(null);

  // নোটিফিকেশন টোস্ট
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // লোকাল ডাটাবেস থেকে ডাটা লোড
  useEffect(() => {
    const loadedPonds = getStoredPonds();
    const loadedFeed = getStoredFeedLogs();
    const loadedExpenses = getStoredExpenses();
    const loadedSales = getStoredSales();
    const loadedMembers = getStoredMembers();

    setPonds(loadedPonds);
    setFeedLogs(loadedFeed);
    setExpenses(loadedExpenses);
    setSales(loadedSales);
    setMembers(loadedMembers);

    const unsubscribe = initAuth(
      (user, token) => {
        setGoogleUser({
          id: user.uid,
          name: user.displayName || 'পুকুর হিসাব ব্যবহারকারী',
          email: user.email || '',
          picture: user.photoURL || '',
          accessToken: token,
          expiresAt: Date.now() + 3600 * 1000,
        });
      },
      () => {
        // user signed out or token invalidated
      }
    );

    return () => {
      unsubscribe();
    };
  }, []);

  // টোস্ট মেসেজ প্রদর্শন
  const showToast = useCallback((msg: string) => {
    setToastMessage(msg);
    const timer = setTimeout(() => {
      setToastMessage(null);
    }, 3200);
    return () => clearTimeout(timer);
  }, []);

  // ====================== পুকুর হ্যান্ডলার ======================
  const handleSavePond = (pondData: Omit<Pond, 'id' | 'createdAt'>, editingId?: string) => {
    if (editingId) {
      const updated = ponds.map((p) =>
        p.id === editingId ? { ...p, ...pondData } : p
      );
      setPonds(updated);
      saveStoredPonds(updated);
      showToast('পুকুরের তথ্য সফলভাবে আপডেট হয়েছে!');
    } else {
      const newPond: Pond = {
        ...pondData,
        id: 'pond-' + Date.now().toString(),
        createdAt: new Date().toISOString(),
      };
      const updated = [newPond, ...ponds];
      setPonds(updated);
      saveStoredPonds(updated);
      showToast('নতুন পুকুর সফলভাবে যুক্ত হয়েছে!');
    }
    setIsPondModalOpen(false);
    setEditingPond(null);
  };

  const handleConfirmDeletePond = () => {
    if (!deletingPond) return;
    const pondId = deletingPond.id;
    const updatedPonds = ponds.filter((p) => p.id !== pondId);
    // পুকুর মুছলে তার সংশ্লিষ্ট খাবার, খরচ ও বিক্রির রেকর্ডগুলোও বাদ দেওয়া হবে
    const updatedFeed = feedLogs.filter((f) => f.pondId !== pondId);
    const updatedExpenses = expenses.filter((e) => e.pondId !== pondId);
    const updatedSales = sales.filter((s) => s.pondId !== pondId);

    setPonds(updatedPonds);
    saveStoredPonds(updatedPonds);

    setFeedLogs(updatedFeed);
    saveStoredFeedLogs(updatedFeed);

    setExpenses(updatedExpenses);
    saveStoredExpenses(updatedExpenses);

    setSales(updatedSales);
    saveStoredSales(updatedSales);

    setDeletingPond(null);
    showToast('পুকুরটি সফলভাবে মুছে ফেলা হয়েছে!');
  };

  const handleOpenEditPond = (pond: Pond) => {
    setEditingPond(pond);
    setIsPondModalOpen(true);
  };

  const handleOpenAddPond = () => {
    setEditingPond(null);
    setIsPondModalOpen(true);
  };

  // ====================== খাবার হিসাব হ্যান্ডলার ======================
  const handleOpenAddFeed = (pondId?: string) => {
    if (ponds.length === 0) {
      showToast('খাবার যোগ করার আগে অনুগ্রহ করে অন্তত একটি পুকুর যোগ করুন!');
      setIsPondModalOpen(true);
      return;
    }
    setDefaultFeedPondId(pondId || (ponds[0]?.id));
    setEditingFeed(null);
    setIsFeedModalOpen(true);
  };

  const handleOpenEditFeed = (feed: FeedLog) => {
    setEditingFeed(feed);
    setDefaultFeedPondId(feed.pondId);
    setIsFeedModalOpen(true);
  };

  const handleSaveFeed = (
    feedData: Omit<FeedLog, 'id' | 'createdAt'>,
    editingId?: string
  ) => {
    if (editingId) {
      const updated = feedLogs.map((f) =>
        f.id === editingId ? { ...f, ...feedData } : f
      );
      setFeedLogs(updated);
      saveStoredFeedLogs(updated);
      showToast('খাবারের হিসাব সফলভাবে আপডেট হয়েছে!');
    } else {
      const newFeed: FeedLog = {
        ...feedData,
        id: 'feed-' + Date.now().toString(),
        createdAt: new Date().toISOString(),
      };
      const updated = [newFeed, ...feedLogs];
      setFeedLogs(updated);
      saveStoredFeedLogs(updated);
      showToast('নতুন খাবার সফলভাবে যোগ হয়েছে!');
    }
    setIsFeedModalOpen(false);
    setEditingFeed(null);
  };

  const handleConfirmDeleteFeed = () => {
    if (!deletingFeed) return;
    const updated = feedLogs.filter((f) => f.id !== deletingFeed.id);
    setFeedLogs(updated);
    saveStoredFeedLogs(updated);
    setDeletingFeed(null);
    showToast('খাবার রেকর্ডটি মুছে ফেলা হয়েছে!');
  };

  // ====================== খরচ হিসাব হ্যান্ডলার ======================
  const handleOpenAddExpense = (pondId?: string) => {
    if (ponds.length === 0) {
      showToast('খরচ যোগ করার আগে অনুগ্রহ করে অন্তত একটি পুকুর যোগ করুন!');
      setIsPondModalOpen(true);
      return;
    }
    setDefaultExpensePondId(pondId || (ponds[0]?.id));
    setEditingExpense(null);
    setIsExpenseModalOpen(true);
  };

  const handleOpenEditExpense = (expense: Expense) => {
    setEditingExpense(expense);
    setDefaultExpensePondId(expense.pondId);
    setIsExpenseModalOpen(true);
  };

  const handleSaveExpense = (
    expenseData: Omit<Expense, 'id' | 'createdAt'>,
    editingId?: string
  ) => {
    if (editingId) {
      const updated = expenses.map((e) =>
        e.id === editingId ? { ...e, ...expenseData } : e
      );
      setExpenses(updated);
      saveStoredExpenses(updated);
      showToast('খরচের হিসাব সফলভাবে আপডেট হয়েছে!');
    } else {
      const newExpense: Expense = {
        ...expenseData,
        id: 'expense-' + Date.now().toString(),
        createdAt: new Date().toISOString(),
      };
      const updated = [newExpense, ...expenses];
      setExpenses(updated);
      saveStoredExpenses(updated);
      showToast('নতুন খরচ সফলভাবে সংরক্ষিত হয়েছে!');
    }
    setIsExpenseModalOpen(false);
    setEditingExpense(null);
  };

  const handleConfirmDeleteExpense = () => {
    if (!deletingExpense) return;
    const updated = expenses.filter((e) => e.id !== deletingExpense.id);
    setExpenses(updated);
    saveStoredExpenses(updated);
    setDeletingExpense(null);
    showToast('খরচের রেকর্ডটি মুছে ফেলা হয়েছে!');
  };

  // ====================== মাছ বিক্রি হ্যান্ডলার ======================
  const handleOpenAddSale = (pondId?: string) => {
    if (ponds.length === 0) {
      showToast('মাছ বিক্রি যোগ করার আগে অনুগ্রহ করে অন্তত একটি পুকুর যোগ করুন!');
      setIsPondModalOpen(true);
      return;
    }
    setDefaultSalePondId(pondId || (ponds[0]?.id));
    setEditingSale(null);
    setIsSaleModalOpen(true);
  };

  const handleOpenEditSale = (sale: Sale) => {
    setEditingSale(sale);
    setDefaultSalePondId(sale.pondId);
    setIsSaleModalOpen(true);
  };

  const handleSaveSale = (
    saleData: Omit<Sale, 'id' | 'createdAt'>,
    editingId?: string
  ) => {
    if (editingId) {
      const updated = sales.map((s) =>
        s.id === editingId ? { ...s, ...saleData } : s
      );
      setSales(updated);
      saveStoredSales(updated);
      showToast('মাছ বিক্রির হিসাব সফলভাবে আপডেট হয়েছে!');
    } else {
      const newSale: Sale = {
        ...saleData,
        id: 'sale-' + Date.now().toString(),
        createdAt: new Date().toISOString(),
      };
      const updated = [newSale, ...sales];
      setSales(updated);
      saveStoredSales(updated);
      showToast('মাছ বিক্রির হিসাব সফলভাবে সংরক্ষিত হয়েছে!');
    }
    setIsSaleModalOpen(false);
    setEditingSale(null);
  };

  const handleConfirmDeleteSale = () => {
    if (!deletingSale) return;
    const updated = sales.filter((s) => s.id !== deletingSale.id);
    setSales(updated);
    saveStoredSales(updated);
    setDeletingSale(null);
    showToast('মাছ বিক্রির রেকর্ডটি মুছে ফেলা হয়েছে!');
  };

  // ====================== সদস্য ও শেয়ার হ্যান্ডলার ======================
  const handleOpenAddMember = () => {
    setEditingMember(null);
    setIsMemberModalOpen(true);
  };

  const handleOpenEditMember = (member: Member) => {
    setEditingMember(member);
    setIsMemberModalOpen(true);
  };

  const handleSaveMember = (
    memberData: Omit<Member, 'id' | 'createdAt'>,
    editingId?: string
  ) => {
    if (editingId) {
      const updated = members.map((m) =>
        m.id === editingId ? { ...m, ...memberData } : m
      );
      setMembers(updated);
      saveStoredMembers(updated);
      showToast('সদস্য ও শেয়ারের তথ্য আপডেট হয়েছে!');
    } else {
      const newMember: Member = {
        ...memberData,
        id: 'member-' + Date.now().toString(),
        createdAt: new Date().toISOString(),
      };
      const updated = [newMember, ...members];
      setMembers(updated);
      saveStoredMembers(updated);
      showToast('নতুন সদস্য ও শেয়ার সফলভাবে যোগ হয়েছে!');
    }
    setIsMemberModalOpen(false);
    setEditingMember(null);
  };

  const handleConfirmDeleteMember = () => {
    if (!deletingMember) return;
    const updated = members.filter((m) => m.id !== deletingMember.id);
    setMembers(updated);
    saveStoredMembers(updated);
    setDeletingMember(null);
    showToast('সদস্যটি তালিকা থেকে মুছে ফেলা হয়েছে!');
  };

  // ====================== আর্থিক হিসাব ও ড্যাশবোর্ড পরিসংখ্যান ======================
  // আজকের খাবার (কেজিতে হিসাব)
  const todayFeedKg = useMemo(() => {
    const todayStr = getTodayDateStr();
    return feedLogs
      .filter((log) => log.date === todayStr)
      .reduce((acc, curr) => {
        const val = Number(curr.amount) || 0;
        if (curr.unit === 'কেজি') return acc + val;
        if (curr.unit === 'গ্রাম') return acc + val / 1000;
        if (curr.unit === 'বস্তা') return acc + val * 25; // ২৫ কেজি আনুমানিক
        return acc + val;
      }, 0);
  }, [feedLogs]);

  // মোট খরচ ও মোট বিক্রি
  const totalCost = useMemo(() => {
    return expenses.reduce((sum, e) => sum + Number(e.amount || 0), 0);
  }, [expenses]);

  const totalSales = useMemo(() => {
    return sales.reduce((sum, s) => sum + Number(s.totalAmount || 0), 0);
  }, [sales]);

  const totalProfit = useMemo(() => {
    return totalSales - totalCost;
  }, [totalSales, totalCost]);

  // মোট শেয়ার ও মোট মূলধন
  const totalShares = useMemo(() => {
    return members.reduce((sum, m) => sum + (Number(m.shareCount) || 0), 0);
  }, [members]);

  const totalInvestment = useMemo(() => {
    return members.reduce((sum, m) => sum + (Number(m.investmentAmount) || 0), 0);
  }, [members]);

  // প্রতিটি পুকুর অনুযায়ী আলাদা আর্থিক হিসাবের ম্যাপ
  const pondFinancialMap = useMemo(() => {
    const map = new Map<string, { expense: number; sale: number; profit: number }>();

    ponds.forEach((p) => {
      const pExpense = expenses
        .filter((e) => e.pondId === p.id)
        .reduce((sum, e) => sum + Number(e.amount || 0), 0);

      const pSale = sales
        .filter((s) => s.pondId === p.id)
        .reduce((sum, s) => sum + Number(s.totalAmount || 0), 0);

      map.set(p.id, {
        expense: pExpense,
        sale: pSale,
        profit: pSale - pExpense,
      });
    });

    return map;
  }, [ponds, expenses, sales]);

  // সামগ্রিক ড্যাশবোর্ড স্ট্যাটস
  const stats: StatsType = {
    totalPonds: ponds.length,
    totalCost,
    totalSales,
    totalProfit,
    todayFeedKg,
    totalFeedRecords: feedLogs.length,
    totalExpenseRecords: expenses.length,
    totalSaleRecords: sales.length,
    totalMembers: members.length,
    totalShares,
    totalInvestment,
  };

  // ডাটা পরিবর্তনে অটো-সিঙ্ক (Debounced Auto-Sync to Google Sheets)
  useEffect(() => {
    if (!googleUser || !isAutoSync || isLocked) return;

    const timer = setTimeout(async () => {
      try {
        setIsSyncing(true);
        const res = await syncAllDataToGoogleSheets(
          googleUser.accessToken,
          ponds,
          feedLogs,
          expenses,
          sales,
          members,
          stats
        );
        setSpreadsheetUrl(res.spreadsheetUrl);
        setLastSyncTime(res.timestamp);
        setSyncState('synced');
        setHasScopeIssue(false);
      } catch (err: any) {
        console.warn('Auto sync warning:', err);
        setSyncState('error');
        if (isInsufficientScopeError(err)) {
          setHasScopeIssue(true);
        }
      } finally {
        setIsSyncing(false);
      }
    }, 2200);

    return () => clearTimeout(timer);
  }, [ponds, feedLogs, expenses, sales, members, googleUser, isAutoSync, isLocked]);

  // ====================== গুগল লগইন ও সিঙ্ক হ্যান্ডলার ======================
  const handleGoogleSignIn = async (forceConsent: boolean = true) => {
    try {
      setIsSyncing(true);
      const user = await requestGoogleSignIn(forceConsent);
      setGoogleUser(user);
      setHasScopeIssue(false);
      showToast(`স্বাগতম! ${user.name} (${user.email || 'Gmail'}) দিয়ে লগইন সফল হয়েছে`);

      // লগইনের সাথে সাথে প্রাথমিক ব্যাকআপ
      const res = await syncAllDataToGoogleSheets(
        user.accessToken,
        ponds,
        feedLogs,
        expenses,
        sales,
        members,
        stats
      );
      setSpreadsheetUrl(res.spreadsheetUrl);
      setLastSyncTime(res.timestamp);
      setSyncState('synced');
      setHasScopeIssue(false);
      showToast('সব তথ্য স্বয়ংক্রিয়ভাবে আপনার গুগল শীটে ব্যাকআপ হয়েছে!');
    } catch (err: any) {
      if (isInsufficientScopeError(err)) {
        setHasScopeIssue(true);
        showToast('গুগল ড্রাইভ ও শীট ব্যবহারের পারমিশন অনুমোদন প্রয়োজন।');
      } else {
        showToast(`গুগল লগইন ত্রুটি: ${err?.message || 'লগইন সম্পন্ন করা যায়নি'}`);
      }
    } finally {
      setIsSyncing(false);
    }
  };

  const handleGoogleSignOut = () => {
    signOutGoogle();
    setGoogleUser(null);
    setSpreadsheetUrl(null);
    setLastSyncTime(null);
    setSyncState('idle');
    setHasScopeIssue(false);
    showToast('গুগল অ্যাকাউন্ট থেকে লগআউট করা হয়েছে।');
  };

  const handleManualSync = async () => {
    if (!googleUser) {
      setIsSyncModalOpen(true);
      return;
    }
    try {
      setIsSyncing(true);
      const res = await syncAllDataToGoogleSheets(
        googleUser.accessToken,
        ponds,
        feedLogs,
        expenses,
        sales,
        members,
        stats
      );
      setSpreadsheetUrl(res.spreadsheetUrl);
      setLastSyncTime(res.timestamp);
      setSyncState('synced');
      setHasScopeIssue(false);
      showToast('গুগল শীটে সমস্ত হিসাব সফলভাবে সংরক্ষিত হয়েছে!');
    } catch (err: any) {
      if (isInsufficientScopeError(err)) {
        setHasScopeIssue(true);
        showToast('গুগল পারমিশন নবায়ন করতে অনুমোদন উইন্ডো খোলা হচ্ছে...');
        try {
          const reauthUser = await requestGoogleSignIn(true);
          setGoogleUser(reauthUser);
          setHasScopeIssue(false);
          const retryRes = await syncAllDataToGoogleSheets(
            reauthUser.accessToken,
            ponds,
            feedLogs,
            expenses,
            sales,
            members,
            stats
          );
          setSpreadsheetUrl(retryRes.spreadsheetUrl);
          setLastSyncTime(retryRes.timestamp);
          setSyncState('synced');
          showToast('পারমিশন অনুমোদন সফল এবং গুগল শীটে তথ্য সংরক্ষিত হয়েছে!');
          return;
        } catch (reauthErr: any) {
          showToast(`অনুমোদন ব্যর্থ: ${reauthErr?.message || 'পারমিশন পাওয়া যায়নি'}`);
          setSyncState('error');
          setIsSyncModalOpen(true);
          return;
        }
      }
      showToast(`সিঙ্ক ব্যর্থ: ${err?.message || 'সমস্যা হয়েছে'}`);
    } finally {
      setIsSyncing(false);
    }
  };

  const handleRestoreFromSheets = async () => {
    if (!googleUser) return;
    let sheetId = localStorage.getItem('pukur_hisab_spreadsheet_id_v1');
    try {
      setIsSyncing(true);
      if (!sheetId) {
        const found = await getOrCreateSpreadsheet(googleUser.accessToken);
        sheetId = found.id;
      }
      if (!sheetId) {
        showToast('কোনো পূর্ববর্তী গুগল শীট পাওয়া যায়নি!');
        return;
      }

      const restored = await restoreDataFromGoogleSheets(googleUser.accessToken, sheetId);
      if (restored.ponds.length > 0) {
        setPonds(restored.ponds);
        saveStoredPonds(restored.ponds);
      }
      setFeedLogs(restored.feedLogs);
      saveStoredFeedLogs(restored.feedLogs);
      setExpenses(restored.expenses);
      saveStoredExpenses(restored.expenses);
      setSales(restored.sales);
      saveStoredSales(restored.sales);
      setMembers(restored.members);
      saveStoredMembers(restored.members);
      setHasScopeIssue(false);
      showToast('গুগল শীট থেকে সমস্ত ডাটা ফোনে সফলভাবে ফিরিয়ে আনা হয়েছে!');
    } catch (err: any) {
      if (isInsufficientScopeError(err)) {
        setHasScopeIssue(true);
        showToast('শীট পড়ার জন্য পারমিশন অনুমোদন উইন্ডো খোলা হচ্ছে...');
        try {
          const reauthUser = await requestGoogleSignIn(true);
          setGoogleUser(reauthUser);
          setHasScopeIssue(false);
          const found = await getOrCreateSpreadsheet(reauthUser.accessToken);
          if (found.id) {
            const retryRestored = await restoreDataFromGoogleSheets(reauthUser.accessToken, found.id);
            if (retryRestored.ponds.length > 0) {
              setPonds(retryRestored.ponds);
              saveStoredPonds(retryRestored.ponds);
            }
            setFeedLogs(retryRestored.feedLogs);
            saveStoredFeedLogs(retryRestored.feedLogs);
            setExpenses(retryRestored.expenses);
            saveStoredExpenses(retryRestored.expenses);
            setSales(retryRestored.sales);
            saveStoredSales(retryRestored.sales);
            setMembers(retryRestored.members);
            saveStoredMembers(retryRestored.members);
            showToast('অনুমোদন সফল এবং গুগল শীট থেকে সমস্ত ডাটা রিস্টোর করা হয়েছে!');
            return;
          }
        } catch (reauthErr: any) {
          showToast(`রিস্টোর ব্যর্থ: ${reauthErr?.message || 'অনুমোদন দেওয়া হয়নি'}`);
          return;
        }
      }
      showToast(`ডাটা রিস্টোর ব্যর্থ: ${err?.message || 'সমস্যা হয়েছে'}`);
    } finally {
      setIsSyncing(false);
    }
  };

  const handleToggleAutoSync = (enabled: boolean) => {
    setIsAutoSync(enabled);
    setAutoSyncEnabled(enabled);
    showToast(enabled ? 'স্বয়ংক্রিয় সিঙ্ক চালু করা হয়েছে।' : 'স্বয়ংক্রিয় সিঙ্ক বন্ধ করা হয়েছে।');
  };

  const handleUnlockApp = () => {
    setSessionUnlocked(true);
    setIsLocked(false);
    showToast('পুকুর হিসাব আনলক হয়েছে!');
  };

  const handleLockAppNow = () => {
    setSessionUnlocked(false);
    setIsLocked(true);
    setIsSyncModalOpen(false);
    showToast('পাসওয়ার্ড দিয়ে অ্যাপ লক করা হয়েছে।');
  };

  // হেডার বা ফ্লোটিং অ্যাকশন
  const handleHeaderAction = () => {
    switch (activeTab) {
      case 'ponds':
        handleOpenAddPond();
        break;
      case 'expenses':
        handleOpenAddExpense();
        break;
      case 'sales':
        handleOpenAddSale();
        break;
      case 'feed':
        handleOpenAddFeed();
        break;
      case 'members':
        handleOpenAddMember();
        break;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans text-slate-800">
      {/* ১. শীর্ষ হেডার ও নেভিগেশন */}
      <Header
        activeTab={activeTab}
        onTabChange={(tab) => setActiveTab(tab)}
        onOpenAddModal={handleHeaderAction}
        onOpenInstallModal={() => setIsInstallModalOpen(true)}
        googleUser={googleUser}
        onOpenSyncModal={() => setIsSyncModalOpen(true)}
        isSyncing={isSyncing}
        hasPasswordProtection={hasPassword}
        onLockApp={handleLockAppNow}
      />

      {/* গুগল শীট সিঙ্ক ব্যানার ও স্ট্যাটাস বার */}
      {hasScopeIssue ? (
        <div className="bg-amber-600 text-white border-b border-amber-700 px-4 py-2 text-xs shadow-xs">
          <div className="max-w-4xl mx-auto flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-200 animate-ping shrink-0"></span>
              <span>
                <strong>গুগল ড্রাইভ ও শীটের অনুমতি প্রয়োজন:</strong> আপনার লগইনে ফাইল তৈরি করার পূর্ণ পারমিশন নেই।
              </span>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={() => handleGoogleSignIn(true)}
                disabled={isSyncing}
                className="inline-flex items-center gap-1 bg-white text-amber-900 hover:bg-amber-50 px-3 py-1 rounded-md text-xs font-bold transition-all cursor-pointer shadow-xs"
              >
                <span>{isSyncing ? 'অনুমোদন হচ্ছে...' : 'অনুমোদন দিন (Re-authorize)'}</span>
              </button>
            </div>
          </div>
        </div>
      ) : googleUser ? (
        <div className="bg-emerald-900 text-white border-b border-emerald-700/70 px-4 py-2 text-xs">
          <div className="max-w-4xl mx-auto flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shrink-0"></span>
              <span className="truncate">
                গুগল শীটে স্বয়ংক্রিয় সংরক্ষণ: <strong>{googleUser.email || googleUser.name}</strong>
              </span>
              {lastSyncTime && (
                <span className="text-emerald-300 hidden md:inline text-[11px]">
                  • শেষ সিঙ্ক: {lastSyncTime}
                </span>
              )}
            </div>
            <div className="flex items-center gap-2 shrink-0">
              {spreadsheetUrl && (
                <a
                  href={spreadsheetUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 bg-emerald-700/80 hover:bg-emerald-600 text-white px-2 py-1 rounded text-[11px] font-semibold transition-colors shadow-xs"
                >
                  <span>গুগল শীট খুলুন</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              )}
              <button
                onClick={handleManualSync}
                disabled={isSyncing}
                className="inline-flex items-center gap-1 bg-white/15 hover:bg-white/25 text-white px-2 py-1 rounded text-[11px] font-semibold transition-colors cursor-pointer"
              >
                <RefreshCw className={`w-3 h-3 ${isSyncing ? 'animate-spin' : ''}`} />
                <span>{isSyncing ? 'সিঙ্ক হচ্ছে...' : 'এখনই সিঙ্ক'}</span>
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-emerald-50 border-b border-emerald-200/80 px-4 py-2 text-xs">
          <div className="max-w-4xl mx-auto flex flex-wrap items-center justify-between gap-2 text-emerald-950">
            <div className="flex items-center gap-2">
              <FileSpreadsheet className="w-4 h-4 text-emerald-700 shrink-0" />
              <span>
                <strong>ডাটা ক্লাউডে সুরক্ষিত রাখতে Gmail দিয়ে লগইন করুন</strong> — সমস্ত হিসাব স্বয়ংক্রিয়ভাবে গুগল শীটে জমা থাকবে।
              </span>
            </div>
            <button
              onClick={() => setIsSyncModalOpen(true)}
              className="inline-flex items-center gap-1 bg-emerald-700 hover:bg-emerald-800 text-white font-semibold px-3 py-1 rounded-md text-xs transition-colors cursor-pointer shadow-xs"
            >
              <span>গুগল সিঙ্ক সেটআপ</span>
            </button>
          </div>
        </div>
      )}

      {/* মূল কন্টেইনার */}
      <main className="flex-1 max-w-4xl w-full mx-auto px-4 py-5 sm:px-6">
        {/* ২. ড্যাশবোর্ড আর্থিক ও খামার পরিসংখ্যান */}
        <DashboardStats
          stats={stats}
          onNavigateToPonds={() => setActiveTab('ponds')}
          onNavigateToExpenses={() => setActiveTab('expenses')}
          onNavigateToSales={() => setActiveTab('sales')}
          onNavigateToFeed={() => setActiveTab('feed')}
          onNavigateToMembers={() => setActiveTab('members')}
        />

        {/* ৩. সক্রিয় ট্যাব অনুযায়ী ভিউ প্রদর্শন */}
        {activeTab === 'ponds' && (
          <PondListSection
            ponds={ponds}
            onAddPond={handleOpenAddPond}
            onEditPond={handleOpenEditPond}
            onDeletePond={(pond) => setDeletingPond(pond)}
            onAddFeed={(pondId) => {
              setActiveTab('feed');
              handleOpenAddFeed(pondId);
            }}
            onAddExpense={(pondId) => {
              setActiveTab('expenses');
              handleOpenAddExpense(pondId);
            }}
            onAddSale={(pondId) => {
              setActiveTab('sales');
              handleOpenAddSale(pondId);
            }}
            pondFinancialMap={pondFinancialMap}
          />
        )}

        {activeTab === 'expenses' && (
          <ExpenseSection
            expenses={expenses}
            ponds={ponds}
            onAddExpense={handleOpenAddExpense}
            onEditExpense={handleOpenEditExpense}
            onDeleteExpense={(expense) => setDeletingExpense(expense)}
          />
        )}

        {activeTab === 'sales' && (
          <SaleSection
            sales={sales}
            ponds={ponds}
            onAddSale={handleOpenAddSale}
            onEditSale={handleOpenEditSale}
            onDeleteSale={(sale) => setDeletingSale(sale)}
          />
        )}

        {activeTab === 'feed' && (
          <FeedSection
            feedLogs={feedLogs}
            ponds={ponds}
            onAddFeed={(pId) => handleOpenAddFeed(pId)}
            onEditFeed={handleOpenEditFeed}
            onDeleteFeed={(feed) => setDeletingFeed(feed)}
          />
        )}

        {activeTab === 'members' && (
          <MemberListSection
            members={members}
            totalProfit={totalProfit}
            onAddMember={handleOpenAddMember}
            onEditMember={handleOpenEditMember}
            onDeleteMember={(member) => setDeletingMember(member)}
          />
        )}
      </main>

      {/* মোবাইলের জন্য ফ্লোটিং অ্যাকশন বাটন (FAB) */}
      <button
        id="mobile-floating-action-btn"
        onClick={handleHeaderAction}
        aria-label="নতুন এন্ট্রি যোগ করুন"
        className="sm:hidden fixed bottom-6 right-5 z-40 w-14 h-14 bg-emerald-700 hover:bg-emerald-800 text-white rounded-full shadow-lg flex items-center justify-center cursor-pointer active:scale-90 transition-transform"
      >
        <Plus className="w-6 h-6 stroke-[2.5]" />
      </button>

      {/* ৪. পুকুর মোডাল */}
      <PondFormModal
        isOpen={isPondModalOpen}
        onClose={() => {
          setIsPondModalOpen(false);
          setEditingPond(null);
        }}
        onSave={handleSavePond}
        editingPond={editingPond}
      />

      {/* ৫. খাবার মোডাল */}
      <FeedLogModal
        isOpen={isFeedModalOpen}
        onClose={() => {
          setIsFeedModalOpen(false);
          setEditingFeed(null);
        }}
        onSave={handleSaveFeed}
        editingFeed={editingFeed}
        ponds={ponds}
        defaultPondId={defaultFeedPondId}
      />

      {/* ৬. খরচ মোডাল */}
      <ExpenseFormModal
        isOpen={isExpenseModalOpen}
        onClose={() => {
          setIsExpenseModalOpen(false);
          setEditingExpense(null);
        }}
        onSave={handleSaveExpense}
        editingExpense={editingExpense}
        ponds={ponds}
        defaultPondId={defaultExpensePondId}
      />

      {/* ৭. বিক্রি মোডাল */}
      <SaleFormModal
        isOpen={isSaleModalOpen}
        onClose={() => {
          setIsSaleModalOpen(false);
          setEditingSale(null);
        }}
        onSave={handleSaveSale}
        editingSale={editingSale}
        ponds={ponds}
        defaultPondId={defaultSalePondId}
      />

      {/* ৮. সদস্য ও শেয়ার মোডাল */}
      <MemberFormModal
        isOpen={isMemberModalOpen}
        onClose={() => {
          setIsMemberModalOpen(false);
          setEditingMember(null);
        }}
        onSave={handleSaveMember}
        editingMember={editingMember}
      />

      {/* ৯. ডিলিট নিশ্চিতকরণ মোডালসমূহ */}
      <DeleteConfirmModal
        isOpen={deletingPond !== null}
        title="পুকুর মুছে ফেলার নিশ্চয়তা"
        itemName={deletingPond ? deletingPond.name : ''}
        itemType="পুকুরটি"
        warningText="সতর্কতা: এটি মুছে ফেললে এই পুকুর এবং এর সংশ্লিষ্ট খাবার, খরচ ও বিক্রির সমস্ত তথ্য স্থায়ীভাবে মুছে যাবে।"
        onClose={() => setDeletingPond(null)}
        onConfirm={handleConfirmDeletePond}
      />

      <DeleteConfirmModal
        isOpen={deletingFeed !== null}
        title="খাবার রেকর্ড মুছে ফেলার নিশ্চয়তা"
        itemName={deletingFeed ? `${deletingFeed.feedType} (${deletingFeed.amount} ${deletingFeed.unit})` : ''}
        itemType="খাবার এন্ট্রিটি"
        warningText="সতর্কতা: এটি মুছে ফেললে খাবারের এই এন্ট্রিটি স্থানীয় মেমরি থেকে স্থায়ীভাবে মুছে যাবে।"
        onClose={() => setDeletingFeed(null)}
        onConfirm={handleConfirmDeleteFeed}
      />

      <DeleteConfirmModal
        isOpen={deletingExpense !== null}
        title="খরচের হিসাব মুছে ফেলার নিশ্চয়তা"
        itemName={deletingExpense ? `${deletingExpense.title} (${deletingExpense.amount} ৳)` : ''}
        itemType="খরচটি"
        warningText="সতর্কতা: এটি মুছে ফেললে খরচের এই ভাউচারটি হিসাব থেকে স্থায়ীভাবে বাদ পড়বে।"
        onClose={() => setDeletingExpense(null)}
        onConfirm={handleConfirmDeleteExpense}
      />

      <DeleteConfirmModal
        isOpen={deletingSale !== null}
        title="মাছ বিক্রির হিসাব মুছে ফেলার নিশ্চয়তা"
        itemName={deletingSale ? `${deletingSale.fishType} (${deletingSale.totalAmount} ৳)` : ''}
        itemType="বিক্রির চালানটি"
        warningText="সতর্কতা: এটি মুছে ফেললে মাছ বিক্রির এই এন্ট্রিটি এবং আয় হিসাব থেকে স্থায়ীভাবে বাদ পড়বে।"
        onClose={() => setDeletingSale(null)}
        onConfirm={handleConfirmDeleteSale}
      />

      <DeleteConfirmModal
        isOpen={deletingMember !== null}
        title="সদস্য মুছে ফেলার নিশ্চয়তা"
        itemName={deletingMember ? `${deletingMember.name} (${deletingMember.shareCount} টি শেয়ার)` : ''}
        itemType="সদস্যটি"
        warningText="সতর্কতা: এটি মুছে ফেললে সদস্য তালিকা ও শেয়ার হিসাব থেকে এই সদস্যের সমস্ত তথ্য বাদ পড়বে।"
        onClose={() => setDeletingMember(null)}
        onConfirm={handleConfirmDeleteMember}
      />

      {/* ১০. PWA ও মোবাইল APK ইনস্টল মোডাল */}
      <PWAInstallModal
        isOpen={isInstallModalOpen}
        onClose={() => setIsInstallModalOpen(false)}
      />

      {/* ১১. গুগল একাউন্ট ও গুগল শীট সিঙ্ক মোডাল */}
      <GoogleSyncModal
        isOpen={isSyncModalOpen}
        onClose={() => {
          setIsSyncModalOpen(false);
          setHasPassword(hasPasswordConfigured());
        }}
        googleUser={googleUser}
        onSignIn={handleGoogleSignIn}
        onSignOut={handleGoogleSignOut}
        onManualSync={handleManualSync}
        onRestoreFromSheets={handleRestoreFromSheets}
        isSyncing={isSyncing}
        syncState={syncState}
        lastSyncTime={lastSyncTime}
        spreadsheetUrl={spreadsheetUrl}
        isAutoSync={isAutoSync}
        onToggleAutoSync={handleToggleAutoSync}
        onLockAppNow={handleLockAppNow}
        hasScopeIssue={hasScopeIssue}
        onReauthorize={() => handleGoogleSignIn(true)}
      />

      {/* ১২. পাসওয়ার্ড লক স্ক্রিন মোডাল */}
      <PasscodeLockModal
        isLocked={isLocked}
        onUnlock={handleUnlockApp}
        googleUser={googleUser}
      />

      {/* ১৩. অফলাইন স্টেট সূচক */}
      <OfflineIndicator />

      {/* ১৪. টোস্ট নোটিফিকেশন */}
      {toastMessage && (
        <div
          id="toast-notification"
          role="status"
          className="fixed bottom-5 left-1/2 -translate-x-1/2 z-50 bg-slate-900/95 text-white px-4 py-2.5 rounded-full shadow-xl flex items-center gap-2 text-xs sm:text-sm border border-slate-700/80 animate-fade-in"
        >
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* ১৩. ফুটার */}
      <footer className="bg-white border-t border-slate-200/80 py-4 mt-8">
        <div className="max-w-4xl mx-auto px-4 text-center text-xs text-slate-500 space-y-2">
          <div className="flex items-center justify-center gap-2 text-emerald-800 font-medium">
            <Database className="w-3.5 h-3.5" />
            <span>লোকাল ডাটাবেস সক্রিয় • কোনো ইন্টারনেটের প্রয়োজন নেই</span>
          </div>
          <p className="flex items-center justify-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            <span>পুকুর হিসাব অ্যাপ • আপনার ডাটা সুরক্ষিতভাবে ফোনে জমা থাকে</span>
          </p>
          <div className="pt-1.5">
            <button
              id="footer-install-app-btn"
              onClick={() => setIsInstallModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-50 text-emerald-800 border border-emerald-200 hover:bg-emerald-100 font-semibold text-xs transition-colors cursor-pointer"
            >
              <Smartphone className="w-3.5 h-3.5" />
              <span>মোবাইলে অ্যাপ / APK হিসেবে ইনস্টল করুন</span>
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
}
