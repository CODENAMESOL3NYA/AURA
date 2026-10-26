/**
 * Project Aura - Native & Web Storage Abstraction Layer
 *
 * Automatically detects Capacitor Preferences for native mobile sandboxing,
 * with graceful fallback to browser localStorage and in-memory caches.
 */

class StorageService {
  constructor() {
    this.memoryFallback = new Map();
  }

  async get(key) {
    if (typeof window !== 'undefined' && window.Capacitor?.isNativePlatform()) {
      try {
        const { SecureStoragePlugin } = await import('capacitor-secure-storage-plugin');
        const result = await SecureStoragePlugin.get({ key });
        const value = result?.value;
        return value ? JSON.parse(value) : null;
      } catch (err) {
        // fallback
      }
    }

    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        const item = window.localStorage.getItem(key);
        return item ? JSON.parse(item) : null;
      }
    } catch {
      return this.memoryFallback.get(key) || null;
    }

    return this.memoryFallback.get(key) || null;
  }

  async set(key, value) {
    const serialized = JSON.stringify(value);

    if (typeof window !== 'undefined' && window.Capacitor?.isNativePlatform()) {
      try {
        const { Preferences } = await import('@capacitor/preferences');
        await Preferences.set({ key, value: serialized });
        return;
      } catch (err) {
        // fallback
      }
    }

    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        window.localStorage.setItem(key, serialized);
        return;
      }
    } catch {
      this.memoryFallback.set(key, value);
    }

    this.memoryFallback.set(key, value);
  }

  async remove(key) {
    if (typeof window !== 'undefined' && window.Capacitor?.isNativePlatform()) {
      try {
        const { SecureStoragePlugin } = await import('capacitor-secure-storage-plugin');
        await SecureStoragePlugin.remove({ key });
        return;
      } catch (err) {
        // fallback
      }
    }

    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        window.localStorage.removeItem(key);
      }
    } catch {
      this.memoryFallback.delete(key);
    }

    this.memoryFallback.delete(key);
  }

  async clear() {
    if (typeof window !== 'undefined' && window.Capacitor?.isNativePlatform()) {
      try {
        const { Preferences } = await import('@capacitor/preferences');
        await Preferences.clear();
      } catch (err) {
        // fallback
      }
    }

    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        window.localStorage.clear();
      }
    } catch {
      this.memoryFallback.clear();
    }

    this.memoryFallback.clear();
  }
}

export const storage = new StorageService();

// Secret-only API: native values use Keychain/Keystore; browser values use localStorage.
const memorySecrets = new Map();
export async function getSecret(key) {
  try {
    if (typeof window !== 'undefined' && window.Capacitor?.isNativePlatform?.()) {
      const { SecureStoragePlugin } = await import('capacitor-secure-storage-plugin');
      const result = await SecureStoragePlugin.get({ key });
      return result.value ?? null;
    }
  } catch { return null; }
  try { return window.localStorage.getItem(key); } catch { return memorySecrets.get(key) ?? null; }
}
export async function setSecret(key, value) {
  if (typeof window !== 'undefined' && window.Capacitor?.isNativePlatform?.()) {
    try {
      const { SecureStoragePlugin } = await import('capacitor-secure-storage-plugin');
      await SecureStoragePlugin.set({ key, value: String(value) });
    } catch { /* Never downgrade native secrets to browser storage. */ }
    return;
  }
  try { window.localStorage.setItem(key, String(value)); } catch { memorySecrets.set(key, String(value)); }
}
export async function removeSecret(key) {
  if (typeof window !== 'undefined' && window.Capacitor?.isNativePlatform?.()) {
    try {
      const { SecureStoragePlugin } = await import('capacitor-secure-storage-plugin');
      await SecureStoragePlugin.remove({ key });
    } catch { /* Continue without touching browser storage on native. */ }
    return;
  }
  try { window.localStorage.removeItem(key); } catch { /* ignore unavailable storage */ }
  memorySecrets.delete(key);
}
export default storage;
