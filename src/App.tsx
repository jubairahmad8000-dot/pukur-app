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
import { Plus, CheckCircle2, ShieldCheck, Database, Smartphone } from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState<ActiveTab>('ponds');
  const [ponds, setPonds] = useState<Pond[]>([]);
  const [feedLogs, setFeedLogs] = useState<FeedLog[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [sales, setSales] = useState<Sale[]>([]);
  const [members, setMembers] = useState<Member[]>([]);

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
      {/* ১. শীর্ষ হেডার ও ৪-ট্যাব নেভিগেশন */}
      <Header
        activeTab={activeTab}
        onTabChange={(tab) => setActiveTab(tab)}
        onOpenAddModal={handleHeaderAction}
        onOpenInstallModal={() => setIsInstallModalOpen(true)}
      />

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

      {/* ১১. অফলাইন স্টেট সূচক */}
      <OfflineIndicator />

      {/* ১২. টোস্ট নোটিফিকেশন */}
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
