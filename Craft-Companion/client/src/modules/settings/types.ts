export interface UserProfile {
  displayName: string;
  level?: number;
  avatarUrl?: string;
  uid?: string;
}

export interface ColorPreset {
  label: string;
  value: string;
}

export interface UseSettingsReturn {
  user: UserProfile | null;
  status: string;
  clearStatus: () => void;
  // Appearance
  isDarkMode: boolean;
  handleThemeToggle: (nextDark: boolean) => void;
  solidBg: boolean;
  handleSolidBgToggle: (val: boolean) => void;
  solidColor: string;
  handleSolidColorChange: (val: string) => void;
  // Language
  language: 'es' | 'en';
  setLanguage: (lang: 'es' | 'en') => void;
  // Notifications
  notificationsEnabled: boolean;
  notificationPermissionState: string;
  handleNotificationsToggle: (val: boolean) => void;
  requestNotificationPermission: () => Promise<void>;
  handleTestNotification: () => void;
  // Data & Backup
  copied: boolean;
  handleCopyJson: () => void;
  showImportBox: boolean;
  setShowImportBox: (val: boolean | ((prev: boolean) => boolean)) => void;
  importJson: string;
  setImportJson: (val: string) => void;
  handleApplyImport: () => void;
  confirmReset: boolean;
  handleResetConfig: () => void;
}
