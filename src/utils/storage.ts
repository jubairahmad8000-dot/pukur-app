import { Pond, FeedLog, Expense, Sale, Member } from '../types';

const STORAGE_KEY = 'pukur_hisab_ponds_v1';
const FEED_STORAGE_KEY = 'pukur_hisab_feed_v1';
const EXPENSES_STORAGE_KEY = 'pukur_hisab_expenses_v1';
const SALES_STORAGE_KEY = 'pukur_hisab_sales_v1';
const MEMBERS_STORAGE_KEY = 'pukur_hisab_members_v1';

// ইংরেজি সংখ্যাকে বাংলা সংখ্যায় রূপান্তর
export const toBnNumber = (num: number | string | undefined | null): string => {
  if (num === undefined || num === null || num === '') return '০';
  const banglaDigits = ['০', '১', '২', '৩', '৪', '৫', '৬', '৭', '৮', '৯'];
  return num.toString().replace(/\d/g, (d) => banglaDigits[parseInt(d, 10)]);
};

// তারিখ সুন্দর করে বাংলায় দেখানো (যেমন: ২০২৪-০৪-১৫ -> ১৫ এপ্রিল ২০২৪)
export const formatBnDate = (dateStr: string): string => {
  if (!dateStr) return '';
  const parts = dateStr.split('-');
  if (parts.length !== 3) return toBnNumber(dateStr);
  const year = parts[0];
  const monthIdx = parseInt(parts[1], 10) - 1;
  const day = parts[2];

  const banglaMonths = [
    'জানুয়ারি', 'ফেব্রুয়ারি', 'মার্চ', 'এপ্রিল', 'মে', 'জুন',
    'জুলাই', 'আগস্ট', 'সেপ্টেম্বর', 'অক্টোবর', 'নভেম্বর', 'ডিসেম্বর'
  ];

  const monthName = banglaMonths[monthIdx] || parts[1];
  return `${toBnNumber(parseInt(day, 10))} ${monthName}, ${toBnNumber(year)}`;
};

// প্রাথমিক নমুনা ডাটা (যদি ইউজার প্রথমবার অ্যাপ চালু করে)
const INITIAL_PONDS: Pond[] = [
  {
    id: 'p-1',
    name: 'উত্তর পাড়া বড় পুকুর',
    location: 'চর বাড়ি সংলগ্ন, উত্তর পাড়া',
    area: '২৫',
    areaUnit: 'শতক',
    depth: '৬ ফুট',
    acquisitionDate: '2024-01-10',
    notes: 'পোনা মাছ ও রুই-কাতলা চাষের জন্য প্রস্তুত। নিয়মিত চুন দেওয়া হয়।',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'p-2',
    name: 'দখিন বাড়ি মিষ্টি পানির পুকুর',
    location: 'নিজ বাড়ির পেছনের বাগান',
    area: '৪০',
    areaUnit: 'শতক',
    depth: '৭.৫ ফুট',
    acquisitionDate: '2024-03-01',
    notes: 'চারপাশে জাল দিয়ে ঘেরা, তেলাপিয়া ও কার্প মিশ্র চাষ।',
    createdAt: new Date().toISOString(),
  }
];

// লোকাল ডাটাবেস থেকে সব পুকুর লোড করা
export const getStoredPonds = (): Pond[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      // প্রথমবার অ্যাপ ওপেন করলে নমুনা ডাটা সেট করে দেওয়া
      localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_PONDS));
      return INITIAL_PONDS;
    }
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (error) {
    console.error('লোকাল ডাটাবেস পড়তে সমস্যা হয়েছে:', error);
    return [];
  }
};

// লোকাল ডাটাবেসে সেভ করা
export const saveStoredPonds = (ponds: Pond[]): void => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(ponds));
  } catch (error) {
    console.error('লোকাল ডাটাবেসে সংরক্ষণ করতে সমস্যা হয়েছে:', error);
  }
};

// আজকের তারিখ 'YYYY-MM-DD' ফরম্যাটে পাওয়া
export const getTodayDateStr = (): string => {
  return new Date().toISOString().split('T')[0];
};

// প্রাথমিক নমুনা খাবার ডাটা (যদি ইউজার প্রথমবার অ্যাপ চালু করে)
const INITIAL_FEED_LOGS: FeedLog[] = [
  {
    id: 'f-1',
    pondId: 'p-1',
    date: getTodayDateStr(),
    timeSlot: 'সকাল',
    feedType: 'ভাসমান ফিড (২.০ মিমি)',
    amount: '১২.৫',
    unit: 'কেজি',
    notes: 'মাছের খাবার গ্রহণের গতি ভালো ছিল।',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'f-2',
    pondId: 'p-2',
    date: getTodayDateStr(),
    timeSlot: 'বিকাল',
    feedType: 'মেগা ফিড গ্রোয়ার',
    amount: '২০',
    unit: 'কেজি',
    notes: 'পানির তাপমাত্রা স্বাভাবিক।',
    createdAt: new Date().toISOString(),
  },
];

// লোকাল ডাটাবেস থেকে খাবার হিসাব লোড করা
export const getStoredFeedLogs = (): FeedLog[] => {
  try {
    const raw = localStorage.getItem(FEED_STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(FEED_STORAGE_KEY, JSON.stringify(INITIAL_FEED_LOGS));
      return INITIAL_FEED_LOGS;
    }
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (error) {
    console.error('খাবার হিসাব পড়তে সমস্যা হয়েছে:', error);
    return [];
  }
};

// লোকাল ডাটাবেসে খাবার হিসাব সেভ করা
export const saveStoredFeedLogs = (logs: FeedLog[]): void => {
  try {
    localStorage.setItem(FEED_STORAGE_KEY, JSON.stringify(logs));
  } catch (error) {
    console.error('খাবার হিসাব সংরক্ষণ করতে সমস্যা হয়েছে:', error);
  }
};

// প্রাথমিক নমুনা খরচ ডাটা
const INITIAL_EXPENSES: Expense[] = [
  {
    id: 'e-1',
    pondId: 'p-1',
    category: 'খাবার ক্রয়',
    title: '১০ বস্তা কোয়ালিটি ফিড',
    amount: 24000,
    date: '2024-03-15',
    voucherNo: 'V-102',
    notes: 'ডিলারের কাছ থেকে নগদ কেনা',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'e-2',
    pondId: 'p-1',
    category: 'পোনা মাছ',
    title: '২০০০ রুই ও মৃগেল পোনা',
    amount: 15000,
    date: '2024-01-20',
    voucherNo: 'H-54',
    notes: 'হ্যাচারি থেকে পরিবহনসহ ডেলিভারি',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'e-3',
    pondId: 'p-2',
    category: 'সার ও চুন',
    title: '৫০ কেজি চুন ও টিএসপি সার',
    amount: 3500,
    date: '2024-02-10',
    voucherNo: '',
    notes: 'পানির অম্লতা নিয়ন্ত্রণ ও জীবানুমুক্তকরণ',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'e-4',
    pondId: 'p-2',
    category: 'সেচ ও বিদ্যুৎ',
    title: 'পুকুরে পানি তোলার বিদ্যুৎ বিল',
    amount: 2800,
    date: '2024-03-05',
    voucherNo: 'E-991',
    notes: 'ফেব্রুয়ারি মাসের বিদ্যুৎ বিল পরিশোধ',
    createdAt: new Date().toISOString(),
  },
];

// লোকাল ডাটাবেস থেকে সব খরচ লোড করা
export const getStoredExpenses = (): Expense[] => {
  try {
    const raw = localStorage.getItem(EXPENSES_STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(EXPENSES_STORAGE_KEY, JSON.stringify(INITIAL_EXPENSES));
      return INITIAL_EXPENSES;
    }
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (error) {
    console.error('খরচের হিসাব পড়তে সমস্যা হয়েছে:', error);
    return [];
  }
};

// লোকাল ডাটাবেসে খরচ সেভ করা
export const saveStoredExpenses = (expenses: Expense[]): void => {
  try {
    localStorage.setItem(EXPENSES_STORAGE_KEY, JSON.stringify(expenses));
  } catch (error) {
    console.error('খরচের হিসাব সংরক্ষণ করতে সমস্যা হয়েছে:', error);
  }
};

// প্রাথমিক নমুনা মাছ বিক্রির ডাটা
const INITIAL_SALES: Sale[] = [
  {
    id: 's-1',
    pondId: 'p-1',
    fishType: 'রুই মাছ',
    weight: 150,
    weightUnit: 'কেজি',
    unitPrice: 280,
    totalAmount: 42000,
    buyerName: 'করিম আড়তদার, বাজার ঘাট',
    date: '2024-04-10',
    notes: 'প্রথম লটের আংশিক আহরণ (গড় ওজন ১.২ কেজি)',
    createdAt: new Date().toISOString(),
  },
  {
    id: 's-2',
    pondId: 'p-2',
    fishType: 'পাঙ্গাস ও তেলাপিয়া',
    weight: 8,
    weightUnit: 'মণ',
    unitPrice: 5600,
    totalAmount: 44800,
    buyerName: 'পাইকার রফিক মিয়া',
    date: '2024-04-18',
    notes: 'জাল টেনে সরাসরি আড়তে বিক্রি',
    createdAt: new Date().toISOString(),
  },
];

// লোকাল ডাটাবেস থেকে মাছ বিক্রির হিসাব লোড করা
export const getStoredSales = (): Sale[] => {
  try {
    const raw = localStorage.getItem(SALES_STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(SALES_STORAGE_KEY, JSON.stringify(INITIAL_SALES));
      return INITIAL_SALES;
    }
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (error) {
    console.error('মাছ বিক্রির হিসাব পড়তে সমস্যা হয়েছে:', error);
    return [];
  }
};

// লোকাল ডাটাবেসে মাছ বিক্রির হিসাব সেভ করা
export const saveStoredSales = (sales: Sale[]): void => {
  try {
    localStorage.setItem(SALES_STORAGE_KEY, JSON.stringify(sales));
  } catch (error) {
    console.error('মাছ বিক্রির হিসাব সংরক্ষণ করতে সমস্যা হয়েছে:', error);
  }
};

// প্রাথমিক নমুনা সদস্য ও শেয়ার ডাটা (যদি ইউজার প্রথমবার চালু করে)
const INITIAL_MEMBERS: Member[] = [
  {
    id: 'm-1',
    name: 'মো: রফিকুল ইসলাম',
    shareCount: 10,
    phone: '01711000001',
    investmentAmount: 50000,
    role: 'ব্যবস্থাপক ও অংশীদার',
    joinDate: '2024-01-01',
    notes: 'খামারের সার্বিক পরিচালনা ও দৈনিক তদারকি দায়িত্বে নিয়োজিত।',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'm-2',
    name: 'হাজী মো: আবদুল করিম',
    shareCount: 8,
    phone: '01819000002',
    investmentAmount: 40000,
    role: 'সিনিয়র অংশীদার',
    joinDate: '2024-01-01',
    notes: 'বিনিয়োগকারী ও পরামর্শক সদস্য।',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'm-3',
    name: 'মো: জহিরুল হক',
    shareCount: 6,
    phone: '01912000003',
    investmentAmount: 30000,
    role: 'অংশীদার সদস্য',
    joinDate: '2024-01-15',
    notes: 'মাছ বিক্রয় ও আড়ত সমন্বয়ে সহায়তা করেন।',
    createdAt: new Date().toISOString(),
  },
];

// লোকাল ডাটাবেস থেকে সদস্য তালিকা লোড করা
export const getStoredMembers = (): Member[] => {
  try {
    const raw = localStorage.getItem(MEMBERS_STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(MEMBERS_STORAGE_KEY, JSON.stringify(INITIAL_MEMBERS));
      return INITIAL_MEMBERS;
    }
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (error) {
    console.error('সদস্য তালিকা পড়তে সমস্যা হয়েছে:', error);
    return [];
  }
};

// লোকাল ডাটাবেসে সদস্য তালিকা সেভ করা
export const saveStoredMembers = (members: Member[]): void => {
  try {
    localStorage.setItem(MEMBERS_STORAGE_KEY, JSON.stringify(members));
  } catch (error) {
    console.error('সদস্য তালিকা সংরক্ষণ করতে সমস্যা হয়েছে:', error);
  }
};
