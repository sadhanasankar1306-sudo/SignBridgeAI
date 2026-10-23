import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar.tsx';
import { Footer } from './components/Footer.tsx';
import { LandingPage } from './pages/LandingPage.tsx';
import { DashboardPage } from './pages/DashboardPage.tsx';
import { SignRecognitionPage } from './pages/SignRecognitionPage.tsx';
import { SpeechToTextPage } from './pages/SpeechToTextPage.tsx';
import { ConversationWorkspacePage } from './pages/ConversationWorkspacePage.tsx';
import { SignLibraryPage } from './pages/SignLibraryPage.tsx';
import { HistoryPage } from './pages/HistoryPage.tsx';
import { ResearchEvaluationPage } from './pages/ResearchEvaluationPage.tsx';
import { AccessibilitySettingsPage } from './pages/AccessibilitySettingsPage.tsx';
import { AuthPage } from './pages/AuthPage.tsx';
import { HelpPrivacyPage } from './pages/HelpPrivacyPage.tsx';
import { fetchPreferences, savePreferences, getCurrentUser } from './services/api.ts';
import type { UserPreferences, UserProfile } from './types/index.ts';

const DEFAULT_PREFS: UserPreferences = {
  textScale: 'normal',
  highContrast: false,
  reducedMotion: false,
  minConfidenceThreshold: 0.70,
  temporalSmoothingFrames: 7,
  autoSpeakConfirmed: false,
  ttsRate: 1.0,
  ttsPitch: 1.0,
  soundCueOnRecognition: true
};

export default function App() {
  const [activePage, setActivePage] = useState<string>('landing');
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [preferences, setPreferences] = useState<UserPreferences>(DEFAULT_PREFS);

  // Sync hash routing
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.replace('#/', '').replace('#', '');
      if (hash) {
        setActivePage(hash);
      }
    };

    if (window.location.hash) {
      handleHashChange();
    }

    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  // Load initial preferences and session user
  useEffect(() => {
    fetchPreferences()
      .then((prefs) => setPreferences(prefs))
      .catch(() => {});

    getCurrentUser()
      .then((user) => setCurrentUser(user))
      .catch(() => {});
  }, []);

  const handleNavigate = (page: string) => {
    setActivePage(page);
    window.location.hash = `#/${page}`;
    window.scrollTo({ top: 0, behavior: preferences.reducedMotion ? 'auto' : 'smooth' });
  };

  const handleUpdatePreferences = async (newPrefs: Partial<UserPreferences>) => {
    const updated = { ...preferences, ...newPrefs };
    setPreferences(updated);
    try {
      await savePreferences(newPrefs);
    } catch (err) {
      console.error('Failed to sync preferences:', err);
    }
  };

  const handleLogout = () => {
    setCurrentUser(null);
    handleNavigate('landing');
  };

  return (
    <div
      className={`min-h-screen flex flex-col bg-slate-50 text-slate-900 font-sans ${
        preferences.highContrast ? 'contrast-125' : ''
      }`}
    >
      {/* Top Bar Contract compliant Navigation */}
      <Navbar
        activePage={activePage}
        onNavigate={handleNavigate}
        currentUser={currentUser}
        onLogout={handleLogout}
      />

      {/* Main Page Content */}
      <main className="flex-1">
        {activePage === 'landing' && <LandingPage onNavigate={handleNavigate} />}
        {activePage === 'dashboard' && (
          <DashboardPage onNavigate={handleNavigate} currentUser={currentUser} />
        )}
        {activePage === 'sign-recognition' && (
          <SignRecognitionPage onNavigate={handleNavigate} />
        )}
        {activePage === 'speech-to-text' && (
          <SpeechToTextPage onNavigate={handleNavigate} />
        )}
        {activePage === 'conversation' && (
          <ConversationWorkspacePage
            onNavigate={handleNavigate}
            textScale={preferences.textScale}
            highContrast={preferences.highContrast}
          />
        )}
        {activePage === 'library' && <SignLibraryPage onNavigate={handleNavigate} />}
        {activePage === 'history' && <HistoryPage onNavigate={handleNavigate} />}
        {activePage === 'research' && (
          <ResearchEvaluationPage onNavigate={handleNavigate} />
        )}
        {activePage === 'accessibility' && (
          <AccessibilitySettingsPage
            preferences={preferences}
            onUpdatePreferences={handleUpdatePreferences}
            onNavigate={handleNavigate}
          />
        )}
        {activePage === 'auth' && (
          <AuthPage
            onLoginSuccess={(user) => setCurrentUser(user)}
            onNavigate={handleNavigate}
          />
        )}
        {activePage === 'help' && <HelpPrivacyPage onNavigate={handleNavigate} />}
      </main>

      {/* Accessible Footer */}
      <Footer onNavigate={handleNavigate} />
    </div>
  );
}
