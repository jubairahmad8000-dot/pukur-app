// Google OAuth এবং Google Sheets স্বয়ংক্রিয় সিঙ্ক সার্ভিস

import { Pond, FeedLog, Expense, Sale, Member, DashboardStats } from '../types';
import { formatBnDate, toBnNumber } from '../utils/storage';
import { googleSignIn as firebaseGoogleSignIn, logout as firebaseLogout, setAccessToken } from './firebaseAuth';
import firebaseConfig from '../../firebase-applet-config.json';

export interface GoogleUser {
  id: string;
  name: string;
  email: string;
  picture?: string;
  accessToken: string;
  expiresAt: number;
}

export type SyncState = 'idle' | 'syncing' | 'synced' | 'error';

export class InsufficientScopeError extends Error {
  constructor(message = 'গুগল ড্রাইভ ও শীট ব্যবহারের জন্য প্রয়োজনীয় পারমিশন (OAuth Scope) পাওয়া যায়নি।') {
    super(message);
    this.name = 'InsufficientScopeError';
  }
}

export function isInsufficientScopeError(error: any): boolean {
  if (!error) return false;
  if (error instanceof InsufficientScopeError || error?.name === 'InsufficientScopeError') return true;
  const msg = String(error?.message || error || '');
  return (
    msg.includes('insufficient authentication scopes') ||
    msg.includes('ACCESS_TOKEN_SCOPE_IS_INSUFFICIENT') ||
    msg.includes('InsufficientScopeError') ||
    msg.includes('insufficient') ||
    msg.includes('PERMISSION_DENIED')
  );
}

const GOOGLE_USER_KEY = 'pukur_hisab_google_user_v1';
const SPREADSHEET_ID_KEY = 'pukur_hisab_spreadsheet_id_v1';
const SPREADSHEET_URL_KEY = 'pukur_hisab_spreadsheet_url_v1';
const LAST_SYNC_KEY = 'pukur_hisab_last_sync_v1';
const AUTO_SYNC_ENABLED_KEY = 'pukur_hisab_auto_sync_enabled_v1';

declare global {
  interface Window {
    google?: any;
    __applet_oauth_client_id?: string;
  }
}

// Client ID সংগৃহীত করার নির্ভরযোগ্য ফাংশন
export function getGoogleClientId(): string {
  if (firebaseConfig?.oAuthClientId) {
    return firebaseConfig.oAuthClientId;
  }
  if (typeof window !== 'undefined' && window.__applet_oauth_client_id) {
    return window.__applet_oauth_client_id;
  }
  const viteEnv = import.meta.env.VITE_GOOGLE_CLIENT_ID;
  if (viteEnv) return viteEnv;

  return '916605619032-u102vhtv7mjq5qlbp1gbdjgoii9rshc6.apps.googleusercontent.com';
}

// লোকাল স্টোরেজ থেকে গুগল ইউজার লোড
export function getStoredGoogleUser(): GoogleUser | null {
  try {
    const raw = localStorage.getItem(GOOGLE_USER_KEY);
    if (!raw) return null;
    const user: GoogleUser = JSON.parse(raw);
    // টোকেন মেয়াদোত্তীর্ণ কিনা চেক (৫ মিনিট বাফার)
    if (user.expiresAt && Date.now() > user.expiresAt - 300000) {
      // টোকেন রিনিউ হওয়া দরকার, তবে ইউজার তথ্য রাখা যায়
    }
    return user;
  } catch {
    return null;
  }
}

// গুগল ইউজার সেভ
export function saveStoredGoogleUser(user: GoogleUser | null): void {
  try {
    if (user) {
      localStorage.setItem(GOOGLE_USER_KEY, JSON.stringify(user));
    } else {
      localStorage.removeItem(GOOGLE_USER_KEY);
    }
  } catch (e) {
    console.error('Failed to save google user:', e);
  }
}

// শিট আইডি ও লিংক
export function getStoredSpreadsheetId(): string | null {
  return localStorage.getItem(SPREADSHEET_ID_KEY);
}

export function getStoredSpreadsheetUrl(): string | null {
  return localStorage.getItem(SPREADSHEET_URL_KEY);
}

export function getLastSyncTime(): string | null {
  return localStorage.getItem(LAST_SYNC_KEY);
}

export function setLastSyncTime(timeStr: string): void {
  localStorage.setItem(LAST_SYNC_KEY, timeStr);
}

export function isAutoSyncEnabled(): boolean {
  try {
    const val = localStorage.getItem(AUTO_SYNC_ENABLED_KEY);
    return val === null ? true : val === 'true'; // Default true
  } catch {
    return true;
  }
}

export function setAutoSyncEnabled(enabled: boolean): void {
  localStorage.setItem(AUTO_SYNC_ENABLED_KEY, enabled ? 'true' : 'false');
}

// গুগল লগইন প্রম্পট (Firebase Auth পপ-আপ + GIS টোকেন ফলব্যাক)
export async function requestGoogleSignIn(forceConsent: boolean = true): Promise<GoogleUser> {
  // ১. সর্বাগ্রে অফিসিয়াল Firebase Auth পপ-আপ চেষ্টা করুন
  try {
    const { user: fbUser, accessToken } = await firebaseGoogleSignIn(forceConsent);
    const expiresIn = 3600;
    const expiresAt = Date.now() + expiresIn * 1000;

    const googleUser: GoogleUser = {
      id: fbUser.uid || 'fb_' + Date.now(),
      name: fbUser.displayName || 'পুকুর হিসাব ব্যবহারকারী',
      email: fbUser.email || '',
      picture: fbUser.photoURL || '',
      accessToken,
      expiresAt,
    };

    setAccessToken(accessToken);
    saveStoredGoogleUser(googleUser);
    return googleUser;
  } catch (firebaseErr: any) {
    console.warn('Firebase signInWithPopup failed or falling back:', firebaseErr);

    // যদি ব্যবহারকারী নিজেই পপআপ বন্ধ করেন, তাহলে ত্রুটি ছুড়ে দিন
    if (
      firebaseErr?.message?.includes('লগইন পপ-আপ উইন্ডো বন্ধ করা হয়েছে') ||
      firebaseErr?.code === 'auth/popup-closed-by-user'
    ) {
      throw firebaseErr;
    }

    // ২. ফলব্যাক: Google Identity Services (GIS) TokenClient
    if (typeof window !== 'undefined' && window.google?.accounts?.oauth2) {
      const clientId = getGoogleClientId();
      return new Promise((resolve, reject) => {
        try {
          const tokenClient = window.google.accounts.oauth2.initTokenClient({
            client_id: clientId,
            scope:
              'https://www.googleapis.com/auth/spreadsheets https://www.googleapis.com/auth/drive.file https://www.googleapis.com/auth/userinfo.profile https://www.googleapis.com/auth/userinfo.email',
            callback: async (tokenResponse: any) => {
              if (tokenResponse.error) {
                return reject(new Error(tokenResponse.error_description || tokenResponse.error));
              }

              const accessToken = tokenResponse.access_token;
              const expiresIn = parseInt(tokenResponse.expires_in, 10) || 3600;
              const expiresAt = Date.now() + expiresIn * 1000;

              try {
                const profileRes = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
                  headers: { Authorization: `Bearer ${accessToken}` },
                });

                let userData: any = {};
                if (profileRes.ok) {
                  userData = await profileRes.json();
                }

                const gUser: GoogleUser = {
                  id: userData.sub || 'g_' + Date.now(),
                  name: userData.name || 'পুকুর হিসাব ব্যবহারকারী',
                  email: userData.email || '',
                  picture: userData.picture || '',
                  accessToken,
                  expiresAt,
                };

                setAccessToken(accessToken);
                saveStoredGoogleUser(gUser);
                resolve(gUser);
              } catch {
                const fallbackUser: GoogleUser = {
                  id: 'g_' + Date.now(),
                  name: 'গুগল ব্যবহারকারী',
                  email: '',
                  accessToken,
                  expiresAt,
                };
                setAccessToken(accessToken);
                saveStoredGoogleUser(fallbackUser);
                resolve(fallbackUser);
              }
            },
            error_callback: (err: any) => {
              reject(new Error(err?.message || 'গুগল সাইন-ইন সম্পন্ন হয়নি।'));
            },
          });

          tokenClient.requestAccessToken({ prompt: forceConsent ? 'consent' : 'select_account' });
        } catch (gisErr: any) {
          reject(new Error(firebaseErr.message || gisErr.message || 'গুগল সাইন-ইন সম্পন্ন হয়নি।'));
        }
      });
    }

    throw new Error(firebaseErr.message || 'গুগল সাইন-ইন লাইব্রেরি লোড হয়নি। দয়া করে পেজটি রিলোড করুন।');
  }
}

// লগআউট
export function signOutGoogle(): void {
  firebaseLogout().catch(console.warn);
  setAccessToken(null);
  saveStoredGoogleUser(null);
  localStorage.removeItem(SPREADSHEET_ID_KEY);
  localStorage.removeItem(SPREADSHEET_URL_KEY);
  localStorage.removeItem(LAST_SYNC_KEY);
}

// গুগল ড্রাইভে স্প্রেডশিট খোঁজা অথবা নতুন তৈরি করা
export async function getOrCreateSpreadsheet(accessToken: string): Promise<{ id: string; url: string }> {
  const SPREADSHEET_TITLE = 'পুকুর হিসাব - মাছ চাষের হিসাব ও ডেটাবেস';

  // পূর্বে সংরক্ষিত থাকলে তা ফিরিয়ে দেওয়া
  const cachedId = getStoredSpreadsheetId();
  const cachedUrl = getStoredSpreadsheetUrl();
  if (cachedId && cachedUrl) {
    return { id: cachedId, url: cachedUrl };
  }

  // ১. গুগল ড্রাইভে আগে থেকে এই নামে শিট আছে কিনা সার্চ করা
  try {
    const searchUrl = `https://www.googleapis.com/drive/v3/files?q=${encodeURIComponent(
      `name='${SPREADSHEET_TITLE}' and mimeType='application/vnd.google-apps.spreadsheet' and trashed=false`
    )}&fields=files(id,name,webViewLink)`;

    const searchRes = await fetch(searchUrl, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });

    if (searchRes.ok) {
      const data = await searchRes.json();
      if (data.files && data.files.length > 0) {
        const file = data.files[0];
        const url = file.webViewLink || `https://docs.google.com/spreadsheets/d/${file.id}/edit`;
        localStorage.setItem(SPREADSHEET_ID_KEY, file.id);
        localStorage.setItem(SPREADSHEET_URL_KEY, url);
        return { id: file.id, url };
      }
    } else if (searchRes.status === 403 || searchRes.status === 401) {
      const errText = await searchRes.text().catch(() => '');
      if (errText.includes('insufficient') || errText.includes('SCOPE') || searchRes.status === 403) {
        throw new InsufficientScopeError(
          'গুগল ড্রাইভ ও শীট ব্যবহারের জন্য প্রয়োজনীয় পারমিশন (OAuth Scope) অনুপস্থিত।'
        );
      }
    }
  } catch (e) {
    if (e instanceof InsufficientScopeError) {
      throw e;
    }
    console.warn('Drive search failed, falling back to create:', e);
  }

  // ২. শিট না থাকলে নতুন তৈরি করা
  const createRes = await fetch('https://sheets.googleapis.com/v4/spreadsheets', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      properties: {
        title: SPREADSHEET_TITLE,
      },
      sheets: [
        { properties: { title: 'সারসংক্ষেপ' } },
        { properties: { title: 'পুকুরসমূহ' } },
        { properties: { title: 'খাবারের হিসাব' } },
        { properties: { title: 'খরচের হিসাব' } },
        { properties: { title: 'মাছ বিক্রি' } },
        { properties: { title: 'সদস্য ও শেয়ার' } },
      ],
    }),
  });

  if (!createRes.ok) {
    const errText = await createRes.text();
    if (
      createRes.status === 403 &&
      (errText.includes('insufficient') || errText.includes('SCOPE') || errText.includes('PERMISSION_DENIED'))
    ) {
      throw new InsufficientScopeError(
        'Google Sheets তৈরির পারমিশন পাওয়া যায়নি (403 ACCESS_TOKEN_SCOPE_IS_INSUFFICIENT)। নতুন পারমিশন কার্যকর করতে অনুগ্রহ করে পুনরায় লগইন করে অনুমোদন দিন।'
      );
    }
    throw new Error(`গুগল শিট তৈরি করতে ব্যর্থ: ${createRes.status} ${errText}`);
  }

  const createdData = await createRes.json();
  const id = createdData.spreadsheetId;
  const url = createdData.spreadsheetUrl || `https://docs.google.com/spreadsheets/d/${id}/edit`;

  localStorage.setItem(SPREADSHEET_ID_KEY, id);
  localStorage.setItem(SPREADSHEET_URL_KEY, url);

  return { id, url };
}

// সকল পুকুর, খাবার, খরচ, বিক্রি ও সদস্য ডাটা গুগল শিটে সিঙ্ক করা
export async function syncAllDataToGoogleSheets(
  accessToken: string,
  ponds: Pond[],
  feedLogs: FeedLog[],
  expenses: Expense[],
  sales: Sale[],
  members: Member[],
  stats: DashboardStats
): Promise<{ success: boolean; spreadsheetUrl: string; timestamp: string }> {
  const { id: spreadsheetId, url: spreadsheetUrl } = await getOrCreateSpreadsheet(accessToken);

  // পুকুরের আইডি দিয়ে নাম বের করার ম্যাপ
  const pondMap = new Map<string, string>();
  ponds.forEach((p) => pondMap.set(p.id, p.name));

  const nowStr = new Date().toLocaleString('bn-BD', {
    dateStyle: 'full',
    timeStyle: 'medium',
  });

  // ১. সারসংক্ষেপ শীট ভ্যালু
  const summaryValues: (string | number)[][] = [
    ['পুকুর হিসাব - মাছ চাষ ব্যবস্থাপনা ড্যাশবোর্ড'],
    ['শেষ সিঙ্ক সময়:', nowStr],
    [''],
    ['খাত', 'পরিমাণ / তথ্য', 'মন্তব্য'],
    ['মোট সক্রিয় পুকুর', ponds.length, `${ponds.reduce((acc, p) => acc + (Number(p.area) || 0), 0)} শতক মোট আয়তন`],
    ['মোট খরচ', stats.totalCost, 'টাকা (খাবার, পোনা, ওষুধ ইত্যাদি)'],
    ['মোট বিক্রি', stats.totalSales, 'টাকা (মাছ বিক্রয় আয়)'],
    [
      stats.totalProfit >= 0 ? 'বর্তমান নিট লাভ' : 'বর্তমান ক্ষতি',
      stats.totalProfit,
      stats.totalProfit >= 0 ? 'লাভে চলমান' : 'ঘাটতি'
    ],
    ['আজকের খাবার প্রদান', stats.todayFeedKg, 'কেজি'],
    ['মোট খাবার এন্ট্রি সংখ্যা', feedLogs.length, 'টি'],
    ['মোট খরচ এন্ট্রি সংখ্যা', expenses.length, 'টি'],
    ['মোট মাছ বিক্রি এন্ট্রি', sales.length, 'টি'],
    ['মোট অংশীদার / সদস্য', members.length, 'জন'],
    ['মোট জমাকৃত মূলধন', stats.totalInvestment, 'টাকা'],
    [''],
    ['নোট:', 'এই গুগল শিটের ডেটা পুকুর হিসাব মোবাইল অ্যাপের সাথে স্বয়ংক্রিয়ভাবে সিঙ্কড থাকে।']
  ];

  // ২. পুকুরসমূহ শীট ভ্যালু
  const pondHeaders = [
    'আইডি',
    'পুকুরের নাম',
    'অবস্থান',
    'আয়তন',
    'একক',
    'গভীরতা',
    'পুকুর নেওয়ার তারিখ',
    'মন্তব্য / বিবরণ',
    'রেকর্ড তারিখ',
  ];
  const pondRows = ponds.map((p) => [
    p.id,
    p.name,
    p.location || '-',
    Number(p.area) || 0,
    p.areaUnit,
    p.depth || '-',
    p.acquisitionDate || '-',
    p.notes || '-',
    p.createdAt ? p.createdAt.split('T')[0] : '-',
  ]);
  const pondValues = [pondHeaders, ...pondRows];

  // ৩. খাবারের হিসাব শীট ভ্যালু
  const feedHeaders = [
    'আইডি',
    'তারিখ',
    'পুকুরের নাম',
    'সময়',
    'খাবারের নাম ও ব্র্যান্ড',
    'পরিমাণ',
    'একক',
    'মন্তব্য',
    'এন্ট্রি সময়',
  ];
  const feedRows = feedLogs.map((f) => [
    f.id,
    f.date,
    pondMap.get(f.pondId) || 'সাধারণ পুকুর',
    f.timeSlot,
    f.feedType,
    Number(f.amount) || 0,
    f.unit,
    f.notes || '-',
    f.createdAt ? f.createdAt.split('T')[0] : '-',
  ]);
  const feedValues = [feedHeaders, ...feedRows];

  // ৪. খরচের হিসাব শীট ভ্যালু
  const expenseHeaders = [
    'আইডি',
    'তারিখ',
    'পুকুরের নাম',
    'খরচের খাত',
    'বিবরণ',
    'টাকার পরিমাণ (৳)',
    'ভাউচার / রশিদ নং',
    'মন্তব্য',
  ];
  const expenseRows = expenses.map((e) => [
    e.id,
    e.date,
    pondMap.get(e.pondId) || 'সাধারণ হিসাব',
    e.category,
    e.title,
    e.amount,
    e.voucherNo || '-',
    e.notes || '-',
  ]);
  const expenseValues = [expenseHeaders, ...expenseRows];

  // ৫. মাছ বিক্রির হিসাব শীট ভ্যালু
  const saleHeaders = [
    'আইডি',
    'তারিখ',
    'পুকুরের নাম',
    'মাছের নাম / জাত',
    'মোট ওজন',
    'ওজনের একক',
    'প্রতি একক দর (৳)',
    'মোট বিক্রয়মূল্য (৳)',
    'ক্রেতা / আড়তের নাম',
    'মন্তব্য',
  ];
  const saleRows = sales.map((s) => [
    s.id,
    s.date,
    pondMap.get(s.pondId) || 'সকল পুকুর',
    s.fishType,
    s.weight,
    s.weightUnit,
    s.unitPrice,
    s.totalAmount,
    s.buyerName || '-',
    s.notes || '-',
  ]);
  const saleValues = [saleHeaders, ...saleRows];

  // ৬. সদস্য ও শেয়ার শীট ভ্যালু
  const memberHeaders = [
    'আইডি',
    'সদস্যের নাম',
    'মোবাইল নম্বর',
    'শেয়ার সংখ্যা',
    'বিনিয়োগ / জমার পরিমাণ (৳)',
    'পদবি / দায়িত্ব',
    'যোগদানের তারিখ',
    'মন্তব্য',
  ];
  const memberRows = members.map((m) => [
    m.id,
    m.name,
    m.phone || '-',
    m.shareCount,
    m.investmentAmount || 0,
    m.role || '-',
    m.joinDate || '-',
    m.notes || '-',
  ]);
  const memberValues = [memberHeaders, ...memberRows];

  // গুগল শিটস ব্যাচ আপডেট রিকোয়েস্ট পাঠানো
  const batchUrl = `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values:batchUpdate`;

  // পুরাতন রো ক্লিয়ার ও আপডেট একসাথে করার জন্য রেঞ্জ প্রস্তুত
  const dataPayload = [
    { range: "'সারসংক্ষেপ'!A1:C30", values: summaryValues },
    { range: "'পুকুরসমূহ'!A1:I200", values: pondValues },
    { range: "'খাবারের হিসাব'!A1:I500", values: feedValues },
    { range: "'খরচের হিসাব'!A1:H500", values: expenseValues },
    { range: "'মাছ বিক্রি'!A1:J500", values: saleValues },
    { range: "'সদস্য ও শেয়ার'!A1:H100", values: memberValues },
  ];

  const updateRes = await fetch(batchUrl, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      valueInputOption: 'USER_ENTERED',
      data: dataPayload,
    }),
  });

  if (!updateRes.ok) {
    const err = await updateRes.text();
    if (
      updateRes.status === 403 &&
      (err.includes('insufficient') || err.includes('SCOPE') || err.includes('PERMISSION_DENIED'))
    ) {
      throw new InsufficientScopeError(
        'Google Sheets আপডেটের পারমিশন নেই (403 ACCESS_TOKEN_SCOPE_IS_INSUFFICIENT)। অনুগ্রহ করে পুনরায় গুগল অনুমোদন দিন।'
      );
    }
    // যদি শিট ডিলিট হয়ে গিয়ে থাকে (404 Not Found), আইডি রিসেট করে দিন
    if (updateRes.status === 404) {
      localStorage.removeItem(SPREADSHEET_ID_KEY);
      localStorage.removeItem(SPREADSHEET_URL_KEY);
      throw new Error('গুগল শিটটি খুঁজে পাওয়া যায়নি (হয়তো ড্রাইভ থেকে মুছে ফেলা হয়েছে)। পুনরায় সিঙ্ক করুন নতুন শিট তৈরি হবে।');
    }
    throw new Error(`শিট আপডেট হতে সমস্যা হয়েছে: ${updateRes.status} ${err}`);
  }

  setLastSyncTime(nowStr);

  return {
    success: true,
    spreadsheetUrl,
    timestamp: nowStr,
  };
}

// গুগল শিট থেকে ডাটা উদ্ধার / ইম্পোর্ট করার ফাংশন (অন্য ফোনে লগইন করলে)
export async function restoreDataFromGoogleSheets(
  accessToken: string,
  spreadsheetId: string
): Promise<{
  ponds: Pond[];
  feedLogs: FeedLog[];
  expenses: Expense[];
  sales: Sale[];
  members: Member[];
}> {
  const ranges = [
    "'পুকুরসমূহ'!A2:I200",
    "'খাবারের হিসাব'!A2:I500",
    "'খরচের হিসাব'!A2:H500",
    "'মাছ বিক্রি'!A2:J500",
    "'সদস্য ও শেয়ার'!A2:H100",
  ];

  const url = `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values:batchGet?${ranges
    .map((r) => `ranges=${encodeURIComponent(r)}`)
    .join('&')}`;

  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });

  if (!res.ok) {
    const errText = await res.text().catch(() => '');
    if (
      res.status === 403 &&
      (errText.includes('insufficient') || errText.includes('SCOPE') || errText.includes('PERMISSION_DENIED'))
    ) {
      throw new InsufficientScopeError(
        'গুগল শিট থেকে ডাটা পড়ার পারমিশন পাওয়া যায়নি (403 Insufficient Scopes)। পুনরায় অনুমোদন দিয়ে লগইন করুন।'
      );
    }
    throw new Error(`গুগল শিট থেকে ডাটা পড়তে সমস্যা হয়েছে: ${res.status} ${errText}`);
  }

  const result = await res.json();
  const valueRanges = result.valueRanges || [];

  const pondsRaw = valueRanges[0]?.values || [];
  const feedsRaw = valueRanges[1]?.values || [];
  const expensesRaw = valueRanges[2]?.values || [];
  const salesRaw = valueRanges[3]?.values || [];
  const membersRaw = valueRanges[4]?.values || [];

  const ponds: Pond[] = pondsRaw.map((row: any[], i: number) => ({
    id: row[0] || `p-${i + 1}`,
    name: row[1] || 'পুকুর',
    location: row[2] === '-' ? '' : row[2] || '',
    area: row[3] || 0,
    areaUnit: (row[4] as any) || 'শতক',
    depth: row[5] === '-' ? '' : row[5] || '',
    acquisitionDate: row[6] === '-' ? '' : row[6] || '',
    notes: row[7] === '-' ? '' : row[7] || '',
    createdAt: row[8] ? `${row[8]}T00:00:00.000Z` : new Date().toISOString(),
  }));

  const pondNameToId = new Map<string, string>();
  ponds.forEach((p) => pondNameToId.set(p.name, p.id));
  const defaultPondId = ponds[0]?.id || 'p-1';

  const feedLogs: FeedLog[] = feedsRaw.map((row: any[], i: number) => ({
    id: row[0] || `f-${i + 1}`,
    date: row[1] || new Date().toISOString().split('T')[0],
    pondId: pondNameToId.get(row[2]) || defaultPondId,
    timeSlot: (row[3] as any) || 'সকাল',
    feedType: row[4] || 'ফিড',
    amount: row[5] || 0,
    unit: (row[6] as any) || 'কেজি',
    notes: row[7] === '-' ? '' : row[7] || '',
    createdAt: row[8] ? `${row[8]}T00:00:00.000Z` : new Date().toISOString(),
  }));

  const expenses: Expense[] = expensesRaw.map((row: any[], i: number) => ({
    id: row[0] || `e-${i + 1}`,
    date: row[1] || new Date().toISOString().split('T')[0],
    pondId: pondNameToId.get(row[2]) || defaultPondId,
    category: (row[3] as any) || 'অন্যান্য',
    title: row[4] || 'খরচ',
    amount: Number(row[5]) || 0,
    voucherNo: row[6] === '-' ? '' : row[6] || '',
    notes: row[7] === '-' ? '' : row[7] || '',
    createdAt: new Date().toISOString(),
  }));

  const sales: Sale[] = salesRaw.map((row: any[], i: number) => ({
    id: row[0] || `s-${i + 1}`,
    date: row[1] || new Date().toISOString().split('T')[0],
    pondId: pondNameToId.get(row[2]) || defaultPondId,
    fishType: row[3] || 'মাছ',
    weight: Number(row[4]) || 0,
    weightUnit: (row[5] as any) || 'কেজি',
    unitPrice: Number(row[6]) || 0,
    totalAmount: Number(row[7]) || 0,
    buyerName: row[8] === '-' ? '' : row[8] || '',
    notes: row[9] === '-' ? '' : row[9] || '',
    createdAt: new Date().toISOString(),
  }));

  const members: Member[] = membersRaw.map((row: any[], i: number) => ({
    id: row[0] || `m-${i + 1}`,
    name: row[1] || 'সদস্য',
    phone: row[2] === '-' ? '' : row[2] || '',
    shareCount: Number(row[3]) || 1,
    investmentAmount: Number(row[4]) || 0,
    role: row[5] === '-' ? '' : row[5] || '',
    joinDate: row[6] === '-' ? '' : row[6] || '',
    notes: row[7] === '-' ? '' : row[7] || '',
    createdAt: new Date().toISOString(),
  }));

  return { ponds, feedLogs, expenses, sales, members };
}
