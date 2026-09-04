export type AreaUnit = 'শতক' | 'বিঘা' | 'একর';

export interface Pond {
  id: string;
  name: string;             // পুকুরের নাম
  location: string;         // পুকুরের অবস্থান
  area: number | string;    // পুকুরের আয়তন
  areaUnit: AreaUnit;       // আয়তনের ইউনিট: শতক / বিঘা / একর
  depth: string;            // পুকুরের গভীরতা
  acquisitionDate: string;  // পুকুর নেওয়ার তারিখ
  notes?: string;           // মন্তব্য
  createdAt: string;        // তৈরির তারিখ
  userEmail?: string;       // মালিকের জিমেইল
  userId?: string;          // ইউজার আইডি
}

export type FeedUnit = 'কেজি' | 'বস্তা' | 'গ্রাম';
export type FeedTime = 'সকাল' | 'দুপুর' | 'বিকাল' | 'সন্ধ্যা';

export interface FeedLog {
  id: string;
  pondId: string;           // পুকুরের আইডি
  date: string;             // খাবার দেওয়ার তারিখ (YYYY-MM-DD)
  timeSlot: FeedTime;       // সময় (সকাল/দুপুর/বিকাল ইত্যাদি)
  feedType: string;         // খাবারের নাম/ধরন (ভাসমান ফিড, কুঁড়া, ইত্যাদি)
  amount: number | string;  // পরিমাণ
  unit: FeedUnit;           // কেজি / বস্তা
  notes?: string;           // মন্তব্য
  createdAt: string;        // এন্ট্রি করার সময়
}

export type ExpenseCategory =
  | 'খাবার ক্রয়'
  | 'পোনা মাছ'
  | 'সার ও চুন'
  | 'ওষুধ ও ভিটামিন'
  | 'সেচ ও বিদ্যুৎ'
  | 'শ্রমিক মজুরি'
  | 'পুকুর সংস্কার'
  | 'লিজ বা ভাড়া'
  | 'পরিবহন'
  | 'অন্যান্য';

export interface Expense {
  id: string;
  pondId: string;           // পুকুরের আইডি
  category: ExpenseCategory; // খরচের খাত
  title: string;            // বিবরণ (যেমন: ৫ বস্তা ফিড, ২০০০ রুই পোনা)
  amount: number;           // খরচের টাকা
  date: string;             // তারিখ (YYYY-MM-DD)
  voucherNo?: string;       // রশিদ / ভাউচার নং
  notes?: string;           // মন্তব্য
  createdAt: string;
}

export type SaleWeightUnit = 'কেজি' | 'মণ';

export interface Sale {
  id: string;
  pondId: string;           // পুকুরের আইডি
  fishType: string;         // মাছের নাম (রুই, কাতলা, পাঙ্গাস, তেলাপিয়া ইত্যাদি)
  weight: number;           // মোট ওজন
  weightUnit: SaleWeightUnit; // কেজি বা মণ
  unitPrice: number;        // দর (টাকা প্রতি কেজি বা মণ)
  totalAmount: number;      // মোট বিক্রয়মূল্য (টাকা)
  buyerName?: string;       // ক্রেতা বা আড়তের নাম
  date: string;             // বিক্রির তারিখ (YYYY-MM-DD)
  notes?: string;           // মন্তব্য
  createdAt: string;
}

export interface Member {
  id: string;
  name: string;             // সদস্যের নাম
  shareCount: number;       // শেয়ার সংখ্যা
  phone?: string;           // মোবাইল নম্বর
  investmentAmount?: number; // জমা বা মূলধনের পরিমাণ (টাকা)
  role?: string;            // পদবি / ভূমিকা (যেমন: সভাপতি, ব্যবস্থাপক, সদস্য)
  joinDate: string;         // যোগদানের তারিখ
  notes?: string;           // মন্তব্য
  createdAt: string;
}

export interface DashboardStats {
  totalPonds: number;
  totalCost: number;
  totalSales: number;
  totalProfit: number;
  todayFeedKg: number;
  totalFeedRecords: number;
  totalExpenseRecords: number;
  totalSaleRecords: number;
  totalMembers: number;
  totalShares: number;
  totalInvestment: number;
}
