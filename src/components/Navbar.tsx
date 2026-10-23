import React, { useState } from 'react';
import {
  Video,
  Mic,
  MessageSquare,
  BookOpen,
  BarChart3,
  Settings,
  History,
  Shield,
  Menu,
  X,
  User,
  ChevronDown
} from 'lucide-react';
import type { UserProfile } from '../types/index.ts';

interface NavbarProps {
  activePage: string;
  onNavigate: (page: string) => void;
  currentUser: UserProfile | null;
  onLogout: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activePage,
  onNavigate,
  currentUser,
  onLogout
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);

  const navLinks = [
    { id: 'dashboard', label: 'Dashboard' },
    { id: 'sign-recognition', label: 'Sign-to-Text' },
    { id: 'speech-to-text', label: 'Speech Captions' },
    { id: 'conversation', label: 'Two-Way Chat' },
    { id: 'library', label: 'Sign Library' },
    { id: 'research', label: 'Research Evaluation' },
  ];

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-8">
          {/* Zone 1: Brand Wordmark */}
          <button
            onClick={() => onNavigate('landing')}
            className="flex items-center gap-2.5 text-left text-slate-900 font-bold text-lg tracking-tight whitespace-nowrap shrink-0 hover:text-blue-600 transition-colors focus-visible:ring-2 focus-visible:ring-blue-500 rounded-md"
            aria-label="SignBridge AI Homepage"
          >
            <div className="w-8 h-8 rounded-lg bg-blue-600 text-white flex items-center justify-center font-bold text-base shadow-sm">
              SB
            </div>
            <span>SignBridge AI</span>
          </button>

          {/* Zone 2: 4-6 concise single-line nav links */}
          <nav className="hidden lg:flex items-center gap-6 text-sm font-medium text-slate-600" aria-label="Main Navigation">
            {navLinks.map((link) => {
              const isActive = activePage === link.id;
              return (
                <button
                  key={link.id}
                  onClick={() => onNavigate(link.id)}
                  className={`whitespace-nowrap shrink-0 transition-colors hover:text-slate-900 py-1 relative ${
                    isActive ? 'text-blue-600 font-semibold' : 'text-slate-600'
                  }`}
                >
                  {link.label}
                  {isActive && (
                    <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600 rounded-full" />
                  )}
                </button>
              );
            })}
          </nav>

          {/* Zone 3: 1 Primary Action / Profile */}
          <div className="flex items-center gap-3 shrink-0">
            {/* Quick accessibility jump */}
            <button
              onClick={() => onNavigate('accessibility')}
              className="p-2 text-slate-500 hover:text-slate-800 rounded-lg hover:bg-slate-100 transition-colors"
              title="Accessibility Settings"
              aria-label="Accessibility Settings"
            >
              <Settings className="w-5 h-5" />
            </button>

            {/* User Account / Session */}
            {currentUser ? (
              <div className="relative">
                <button
                  onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                  className="flex items-center gap-2 px-3 py-1.5 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors whitespace-nowrap"
                  aria-expanded={userDropdownOpen}
                >
                  <User className="w-3.5 h-3.5 text-blue-600" />
                  <span className="max-w-[110px] truncate">{currentUser.name}</span>
                  <ChevronDown className="w-3 h-3 text-slate-400" />
                </button>

                {userDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white border border-slate-200 rounded-lg shadow-lg py-1 z-50 text-xs">
                    <div className="px-3 py-2 border-b border-slate-100">
                      <p className="font-semibold text-slate-800 truncate">{currentUser.name}</p>
                      <p className="text-slate-500 truncate">{currentUser.email}</p>
                    </div>
                    <button
                      onClick={() => {
                        onNavigate('history');
                        setUserDropdownOpen(false);
                      }}
                      className="w-full text-left px-3 py-2 text-slate-700 hover:bg-slate-50 flex items-center gap-2"
                    >
                      <History className="w-3.5 h-3.5 text-slate-400" />
                      Saved Phrases & History
                    </button>
                    <button
                      onClick={() => {
                        onNavigate('help');
                        setUserDropdownOpen(false);
                      }}
                      className="w-full text-left px-3 py-2 text-slate-700 hover:bg-slate-50 flex items-center gap-2"
                    >
                      <Shield className="w-3.5 h-3.5 text-slate-400" />
                      Limitations & Privacy
                    </button>
                    <div className="border-t border-slate-100 my-1" />
                    <button
                      onClick={() => {
                        onLogout();
                        setUserDropdownOpen(false);
                      }}
                      className="w-full text-left px-3 py-2 text-red-600 hover:bg-red-50"
                    >
                      Sign Out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <button
                onClick={() => onNavigate('auth')}
                className="px-3.5 py-1.5 text-xs font-semibold text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors whitespace-nowrap"
              >
                Sign In
              </button>
            )}

            <button
              onClick={() => onNavigate('conversation')}
              className="hidden sm:inline-flex items-center gap-1.5 px-4 py-2 text-xs font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors whitespace-nowrap shadow-sm"
            >
              <MessageSquare className="w-3.5 h-3.5" />
              <span>Open Chat</span>
            </button>

            {/* Mobile menu button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 text-slate-600 hover:text-slate-900 rounded-lg hover:bg-slate-100"
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-slate-200 bg-white px-4 pt-3 pb-6 space-y-1">
          {navLinks.map((link) => (
            <button
              key={link.id}
              onClick={() => {
                onNavigate(link.id);
                setMobileMenuOpen(false);
              }}
              className={`w-full text-left px-3 py-2 rounded-md text-sm font-medium ${
                activePage === link.id
                  ? 'bg-blue-50 text-blue-700'
                  : 'text-slate-700 hover:bg-slate-50'
              }`}
            >
              {link.label}
            </button>
          ))}
          <div className="border-t border-slate-100 pt-2 mt-2 space-y-1">
            <button
              onClick={() => {
                onNavigate('history');
                setMobileMenuOpen(false);
              }}
              className="w-full text-left px-3 py-2 rounded-md text-sm text-slate-700 hover:bg-slate-50"
            >
              Saved Phrases & History
            </button>
            <button
              onClick={() => {
                onNavigate('accessibility');
                setMobileMenuOpen(false);
              }}
              className="w-full text-left px-3 py-2 rounded-md text-sm text-slate-700 hover:bg-slate-50"
            >
              Accessibility Settings
            </button>
            <button
              onClick={() => {
                onNavigate('help');
                setMobileMenuOpen(false);
              }}
              className="w-full text-left px-3 py-2 rounded-md text-sm text-slate-700 hover:bg-slate-50"
            >
              Help & Privacy Policy
            </button>
          </div>
        </div>
      )}
    </header>
  );
};
