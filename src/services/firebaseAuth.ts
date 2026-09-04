import { initializeApp, getApps, getApp } from 'firebase/app';
import {
  getAuth,
  signInWithPopup,
  GoogleAuthProvider,
  onAuthStateChanged,
  User,
  signOut as fbSignOut,
} from 'firebase/auth';
import firebaseConfig from '../../firebase-applet-config.json';

// Initialize Firebase App
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
export const auth = getAuth(app);

// Provider with Google Workspace Scopes
export const provider = new GoogleAuthProvider();
provider.addScope('https://www.googleapis.com/auth/spreadsheets');
provider.addScope('https://www.googleapis.com/auth/drive.file');
provider.setCustomParameters({
  prompt: 'consent select_account',
  access_type: 'offline',
});

// Flag & In-memory cached access token (per Workspace Integration guidelines)
let isSigningIn = false;
let cachedAccessToken: string | null = null;

export const initAuth = (
  onAuthSuccess?: (user: User, token: string) => void,
  onAuthFailure?: () => void
) => {
  return onAuthStateChanged(auth, async (user: User | null) => {
    if (user) {
      if (cachedAccessToken) {
        if (onAuthSuccess) onAuthSuccess(user, cachedAccessToken);
      } else if (!isSigningIn) {
        // Token not in memory (e.g. fresh page reload).
        if (onAuthFailure) onAuthFailure();
      }
    } else {
      cachedAccessToken = null;
      if (onAuthFailure) onAuthFailure();
    }
  });
};

export const googleSignIn = async (forceConsent: boolean = true): Promise<{ user: User; accessToken: string }> => {
  try {
    isSigningIn = true;
    provider.setCustomParameters({
      prompt: forceConsent ? 'consent select_account' : 'select_account',
      access_type: 'offline',
    });

    const result = await signInWithPopup(auth, provider);
    const credential = GoogleAuthProvider.credentialFromResult(result);
    if (!credential?.accessToken) {
      throw new Error('গুগল অথেন্টিকেশন থেকে অ্যাক্সেস টোকেন পাওয়া যায়নি।');
    }

    cachedAccessToken = credential.accessToken;
    return { user: result.user, accessToken: cachedAccessToken };
  } catch (error: any) {
    console.error('Firebase Google sign-in error:', error);
    if (error.code === 'auth/popup-closed-by-user') {
      throw new Error('লগইন পপ-আপ উইন্ডো বন্ধ করা হয়েছে।');
    }
    if (error.code === 'auth/cancelled-popup-request') {
      throw new Error('আরেকটি লগইন অনুরোধ প্রক্রিয়াধীন রয়েছে।');
    }
    if (error.code === 'auth/network-request-failed') {
      throw new Error('ইন্টারনেট সংযোগ চেক করে আবার চেষ্টা করুন।');
    }
    throw new Error(error.message || 'গুগল সাইন-ইন সম্পন্ন হয়নি।');
  } finally {
    isSigningIn = false;
  }
};

export const getAccessToken = async (): Promise<string | null> => {
  return cachedAccessToken;
};

export const setAccessToken = (token: string | null): void => {
  cachedAccessToken = token;
};

export const logout = async (): Promise<void> => {
  await fbSignOut(auth);
  cachedAccessToken = null;
};
