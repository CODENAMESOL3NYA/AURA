import { apiClient } from './apiClient.js';
import { getFix } from './location.js';

let monitorCleanup = null;
let pushRegistered = false;

export async function registerGuardianPush() {
  if (pushRegistered || !window.Capacitor?.isNativePlatform?.() || window.Capacitor?.getPlatform?.() !== 'android') return;
  try {
    const { PushNotifications } = await import('@capacitor/push-notifications');
    let permission = await PushNotifications.checkPermissions();
    if (permission.receive !== 'granted') permission = await PushNotifications.requestPermissions();
    if (permission.receive !== 'granted') return;
    await PushNotifications.addListener('registration', async (token) => {
      try { await apiClient.registerDevice({ token: token.value, platform: 'android' }); } catch {}
    });
    await PushNotifications.addListener('registrationError', () => {});
    await PushNotifications.addListener('pushNotificationReceived', () => {});
    await PushNotifications.addListener('pushNotificationActionPerformed', async () => {
      window.dispatchEvent(new Event('guardian-push-opened'));
    });
    await PushNotifications.register();
    pushRegistered = true;
  } catch {}
}

export function startGuardianMonitoring(onAlerts) {
  if (monitorCleanup) monitorCleanup();
  let stopped = false;
  let presenceTimer = null;
  let alertTimer = null;
  let appStateListener = null;
  let enabled = false;
  const reportPresence = async () => {
    if (stopped || !enabled || document.visibilityState !== 'visible') return;
    try { const fix = await getFix({ highAccuracy: false }); await apiClient.sendGuardianPresence(fix); } catch {}
  };
  const poll = async () => {
    if (stopped || document.visibilityState !== 'visible') return;
    try { const result = await apiClient.getGuardianAlerts(); onAlerts?.(result?.alerts || []); } catch {}
  };
  const resume = () => { void poll(); void reportPresence(); };
  const settingsChanged = async () => { try { const settings = await apiClient.getGuardianSettings(); if (stopped) return; enabled = !!settings?.enabled; if (presenceTimer) window.clearInterval(presenceTimer); presenceTimer = enabled ? window.setInterval(reportPresence, 60_000) : null; if (enabled) { void reportPresence(); void registerGuardianPush(); } } catch { enabled = false; if (presenceTimer) window.clearInterval(presenceTimer); presenceTimer = null; } };
  void (async () => {
    try { if (window.Capacitor?.isNativePlatform?.()) { const { App } = await import('@capacitor/app'); appStateListener = await App.addListener('appStateChange', ({ isActive }) => { if (isActive) resume(); }); if (stopped) { await appStateListener.remove(); return; } } } catch {}
    try { const settings = await apiClient.getGuardianSettings(); if (stopped) return; enabled = !!settings?.enabled; if (enabled) { void reportPresence(); presenceTimer = window.setInterval(reportPresence, 60_000); void registerGuardianPush(); } } catch {}
    if (stopped) return; void poll(); alertTimer = window.setInterval(poll, 10_000);
  })();
  window.addEventListener('guardian-settings-changed', settingsChanged);
  window.addEventListener('guardian-push-opened', poll);
  document.addEventListener('visibilitychange', resume);
  window.addEventListener('focus', resume);
  monitorCleanup = () => { stopped = true; if (appStateListener) void appStateListener.remove(); if (presenceTimer) window.clearInterval(presenceTimer); if (alertTimer) window.clearInterval(alertTimer); window.removeEventListener('guardian-settings-changed', settingsChanged); window.removeEventListener('guardian-push-opened', poll); document.removeEventListener('visibilitychange', resume); window.removeEventListener('focus', resume); monitorCleanup = null; };
  return monitorCleanup;
}
