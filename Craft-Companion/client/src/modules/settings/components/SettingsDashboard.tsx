import React from 'react';
import { useSettings } from '../hooks/useSettings';
import { SettingsStatusToast } from './SettingsStatusToast';
import { SettingsUserProfileCard } from './SettingsUserProfileCard';
import { SettingsAppearanceCard } from './SettingsAppearanceCard';
import { SettingsNotificationsCard } from './SettingsNotificationsCard';
import { SettingsDataBackupCard } from './SettingsDataBackupCard';
import { SettingsFooter } from './SettingsFooter';

export const SettingsDashboard: React.FC = () => {
  const {
    user,
    status,
    clearStatus,
    isDarkMode,
    handleThemeToggle,
    solidBg,
    handleSolidBgToggle,
    solidColor,
    handleSolidColorChange,
    language,
    setLanguage,
    notificationsEnabled,
    notificationPermissionState,
    handleNotificationsToggle,
    requestNotificationPermission,
    handleTestNotification,
    copied,
    handleCopyJson,
    showImportBox,
    setShowImportBox,
    importJson,
    setImportJson,
    handleApplyImport,
    confirmReset,
    handleResetConfig,
  } = useSettings();

  return (
    <div className="max-w-[560px] mx-auto w-full px-3 sm:px-0 space-y-6 pb-20">
      {/* FLOATING STATUS TOAST */}
      <SettingsStatusToast status={status} onClose={clearStatus} />

      {/* 1. MOBILE USER PROFILE CARD */}
      <SettingsUserProfileCard user={user} language={language} />

      {/* 2. CARD: APARIENCIA & PANTALLA & IDIOMA */}
      <SettingsAppearanceCard
        isDarkMode={isDarkMode}
        onToggleTheme={handleThemeToggle}
        solidBg={solidBg}
        onToggleSolidBg={handleSolidBgToggle}
        solidColor={solidColor}
        onColorChange={handleSolidColorChange}
        language={language}
        setLanguage={setLanguage}
      />

      {/* 3. CARD: NOTIFICACIONES Y SONIDOS */}
      <SettingsNotificationsCard
        notificationsEnabled={notificationsEnabled}
        onToggleNotifications={handleNotificationsToggle}
        notificationPermissionState={notificationPermissionState}
        onRequestPermission={requestNotificationPermission}
        onTestNotification={handleTestNotification}
        language={language}
      />

      {/* 4. CARD: DATOS Y RESPALDO */}
      <SettingsDataBackupCard
        copied={copied}
        onCopyJson={handleCopyJson}
        showImportBox={showImportBox}
        setShowImportBox={setShowImportBox}
        importJson={importJson}
        setImportJson={setImportJson}
        onApplyImport={handleApplyImport}
        confirmReset={confirmReset}
        onResetConfig={handleResetConfig}
        language={language}
      />

      {/* 5. APP FOOTER INFO */}
      <SettingsFooter />
    </div>
  );
};
