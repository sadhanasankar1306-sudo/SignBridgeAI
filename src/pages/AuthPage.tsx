import React, { useState } from 'react';
import {
  User,
  Lock,
  Mail,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { loginUser, registerUser } from '../services/api.ts';
import type { UserProfile } from '../types/index.ts';

interface AuthPageProps {
  onLoginSuccess: (user: UserProfile) => void;
  onNavigate: (page: string) => void;
}

export const AuthPage: React.FC<AuthPageProps> = ({ onLoginSuccess, onNavigate }) => {
  const [isRegister, setIsRegister] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [role, setRole] = useState<'deaf_user' | 'hearing_companion' | 'researcher'>('deaf_user');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setLoading(true);

    try {
      if (isRegister) {
        if (!name.trim()) throw new Error('Please provide your name.');
        if (!email.trim()) throw new Error('Please provide your email address.');
        const res = await registerUser(name, email, role);
        onLoginSuccess(res.user);
        onNavigate('dashboard');
      } else {
        if (!email.trim()) throw new Error('Please enter your email.');
        const res = await loginUser(email);
        onLoginSuccess(res.user);
        onNavigate('dashboard');
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickGuestLogin = async (guestRole: 'deaf_user' | 'hearing_companion' | 'researcher') => {
    setErrorMsg(null);
    setLoading(true);
    try {
      const emailMap = {
        researcher: 'researcher@signbridge.ai',
        deaf_user: 'signer@signbridge.ai',
        hearing_companion: 'companion@signbridge.ai'
      };
      const res = await loginUser(emailMap[guestRole]);
      onLoginSuccess(res.user);
      onNavigate('dashboard');
    } catch (err) {
      // Fallback guest
      onLoginSuccess({
        id: `usr_guest_${Date.now()}`,
        name: guestRole === 'deaf_user' ? 'ISL Signer Guest' : guestRole === 'hearing_companion' ? 'Hearing Companion Guest' : 'Research Fellow',
        email: `${guestRole}@signbridge.ai`,
        role: guestRole
      });
      onNavigate('dashboard');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto px-4 py-12 space-y-6">
      <div className="text-center space-y-2">
        <div className="w-12 h-12 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold text-lg mx-auto shadow-sm">
          SB
        </div>
        <h1 className="text-2xl font-bold text-slate-900">
          {isRegister ? 'Create SignBridge Account' : 'Sign in to SignBridge AI'}
        </h1>
        <p className="text-xs text-slate-500">
          Personalize accessibility preferences and store saved phrase history.
        </p>
      </div>

      <div className="bg-white border border-slate-200 rounded-xl p-6 sm:p-8 space-y-5 shadow-xs">
        {errorMsg && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-xs text-red-700 flex items-start gap-2">
            <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {isRegister && (
            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">
                Full Name
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Priya Sharma"
                  className="w-full text-xs pl-9 pr-3 py-2 border border-slate-300 rounded-lg focus-visible:ring-2 focus-visible:ring-blue-500"
                />
              </div>
            </div>
          )}

          <div>
            <label className="text-xs font-semibold text-slate-700 block mb-1">
              Email Address
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@organization.org"
                className="w-full text-xs pl-9 pr-3 py-2 border border-slate-300 rounded-lg focus-visible:ring-2 focus-visible:ring-blue-500"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-700 block mb-1">
              Password
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full text-xs pl-9 pr-3 py-2 border border-slate-300 rounded-lg focus-visible:ring-2 focus-visible:ring-blue-500"
              />
            </div>
          </div>

          {isRegister && (
            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">
                Communication Role
              </label>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value as any)}
                className="w-full text-xs p-2 border border-slate-300 rounded-lg bg-white"
              >
                <option value="deaf_user">Deaf or Hard-of-Hearing (Signer)</option>
                <option value="hearing_companion">Hearing Communication Partner</option>
                <option value="researcher">Accessibility / ML Researcher</option>
              </select>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors shadow-2xs"
          >
            <span>{isRegister ? 'Register Account' : 'Sign In'}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </form>

        <div className="text-center pt-1 border-t border-slate-100">
          <button
            onClick={() => {
              setIsRegister(!isRegister);
              setErrorMsg(null);
            }}
            className="text-xs text-blue-600 hover:text-blue-800 font-medium"
          >
            {isRegister
              ? 'Already have an account? Sign in'
              : "Don't have an account? Create one"}
          </button>
        </div>

        {/* Quick Demo Access Buttons */}
        <div className="pt-3 border-t border-slate-100 space-y-2">
          <p className="text-[11px] text-slate-400 text-center font-medium uppercase tracking-wider">
            Quick Demonstration Access
          </p>
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => handleQuickGuestLogin('deaf_user')}
              className="px-2.5 py-1.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded text-[11px] font-medium text-slate-700"
            >
              Signer Mode
            </button>
            <button
              onClick={() => handleQuickGuestLogin('researcher')}
              className="px-2.5 py-1.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded text-[11px] font-medium text-slate-700"
            >
              Researcher Mode
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
