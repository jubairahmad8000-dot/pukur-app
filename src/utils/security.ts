// অ্যাপের পাসওয়ার্ড ও নিরাপত্তা ব্যবস্থাপনা

const SECURITY_ENABLED_KEY = 'pukur_hisab_sec_enabled_v1';
const SECURITY_PIN_HASH_KEY = 'pukur_hisab_sec_pin_hash_v1';
const SECURITY_HINT_KEY = 'pukur_hisab_sec_hint_v1';
const SECURITY_SESSION_KEY = 'pukur_hisab_sec_session_unlocked_v1';

// সাধারণ নিরাপদ হ্যাশ ফাংশন
function hashString(str: string): string {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash |= 0; // Convert to 32bit integer
  }
  return 'ph_' + Math.abs(hash).toString(36) + '_' + btoa(str).slice(0, 8);
}

export function isPasswordProtectionEnabled(): boolean {
  try {
    return localStorage.getItem(SECURITY_ENABLED_KEY) === 'true';
  } catch {
    return false;
  }
}

export function hasPasswordConfigured(): boolean {
  try {
    return isPasswordProtectionEnabled() && !!localStorage.getItem(SECURITY_PIN_HASH_KEY);
  } catch {
    return false;
  }
}

export function getPasswordHint(): string {
  try {
    return localStorage.getItem(SECURITY_HINT_KEY) || '';
  } catch {
    return '';
  }
}

export function verifyAppPassword(inputPassword: string): boolean {
  try {
    const storedHash = localStorage.getItem(SECURITY_PIN_HASH_KEY);
    if (!storedHash) return true;
    return hashString(inputPassword) === storedHash;
  } catch {
    return false;
  }
}

export function setAppPassword(password: string, hint: string = ''): void {
  try {
    localStorage.setItem(SECURITY_PIN_HASH_KEY, hashString(password));
    localStorage.setItem(SECURITY_ENABLED_KEY, 'true');
    if (hint) {
      localStorage.setItem(SECURITY_HINT_KEY, hint);
    } else {
      localStorage.removeItem(SECURITY_HINT_KEY);
    }
    setSessionUnlocked(true);
  } catch (e) {
    console.error('Failed to set password:', e);
  }
}

export function disableAppPassword(): void {
  try {
    localStorage.setItem(SECURITY_ENABLED_KEY, 'false');
    localStorage.removeItem(SECURITY_PIN_HASH_KEY);
    localStorage.removeItem(SECURITY_HINT_KEY);
    setSessionUnlocked(true);
  } catch (e) {
    console.error('Failed to disable password:', e);
  }
}

export function isSessionUnlocked(): boolean {
  try {
    if (!hasPasswordConfigured()) return true;
    return sessionStorage.getItem(SECURITY_SESSION_KEY) === 'true';
  } catch {
    return true;
  }
}

export function setSessionUnlocked(unlocked: boolean): void {
  try {
    if (unlocked) {
      sessionStorage.setItem(SECURITY_SESSION_KEY, 'true');
    } else {
      sessionStorage.removeItem(SECURITY_SESSION_KEY);
    }
  } catch (e) {
    console.error('Failed to set session unlock state:', e);
  }
}
