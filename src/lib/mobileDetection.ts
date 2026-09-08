// Utility to detect if app is running in mobile/APK context
export const isMobileApp = (): boolean => {
  // Check for common mobile app indicators
  const isStandalone = window.matchMedia('(display-mode: standalone)').matches;
  const isApplix = window.location.hostname.includes('applix') || 
                   document.referrer.includes('applix');
  // Injected by the native shell when the app runs inside Capacitor.
  const isCapacitor = 'Capacitor' in window;
  
  return isStandalone || isApplix || isCapacitor;
};

export const getAuthRedirectUrl = (): string => {
  // Use deep link for mobile apps, web URL for browsers
  if (isMobileApp()) {
    return 'bhoomix://auth';
  }
  return `${window.location.origin}/auth-callback`;
};
