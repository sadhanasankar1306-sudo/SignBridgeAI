import React from 'react';
import { ShieldCheck, HeartHandshake, FileText, Info } from 'lucide-react';

interface FooterProps {
  onNavigate: (page: string) => void;
}

export const Footer: React.FC<FooterProps> = ({ onNavigate }) => {
  return (
    <footer className="bg-white border-t border-slate-200 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="space-y-3 md:col-span-1">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded bg-blue-600 text-white flex items-center justify-center font-bold text-xs">
                SB
              </div>
              <span className="font-bold text-slate-900 text-sm">SignBridge AI</span>
            </div>
            <p className="text-xs text-slate-500 leading-relaxed">
              An accessible, confidence-aware Indian Sign Language (ISL) communication platform designed for bridging deaf and hearing dialogue.
            </p>
            <div className="flex items-center gap-2 text-xs text-slate-500">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>WCAG 2.2 AA Accessibility Target</span>
            </div>
          </div>

          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-900 mb-3">
              Core Modules
            </h4>
            <ul className="space-y-2 text-xs text-slate-600">
              <li>
                <button onClick={() => onNavigate('sign-recognition')} className="hover:text-blue-600 transition-colors">
                  Live Sign Recognition
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('speech-to-text')} className="hover:text-blue-600 transition-colors">
                  Speech Transcription
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('conversation')} className="hover:text-blue-600 transition-colors">
                  Two-Way Workspace
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('library')} className="hover:text-blue-600 transition-colors">
                  ISL Sign Library
                </button>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-900 mb-3">
              Research & Compliance
            </h4>
            <ul className="space-y-2 text-xs text-slate-600">
              <li>
                <button onClick={() => onNavigate('research')} className="hover:text-blue-600 transition-colors">
                  Benchmark Evaluation
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('accessibility')} className="hover:text-blue-600 transition-colors">
                  Accessibility Preferences
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('help')} className="hover:text-blue-600 transition-colors">
                  Known Limitations
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('help')} className="hover:text-blue-600 transition-colors">
                  Privacy Policy & Data Ethics
                </button>
              </li>
            </ul>
          </div>

          <div className="space-y-2 text-xs text-slate-500">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-900 mb-3">
              Ethical Statement
            </h4>
            <p className="leading-relaxed">
              SignBridge AI is developed for verified instructional and assisted communication purposes. It does not replace professional certified ISL interpreters in legal or emergency medical proceedings.
            </p>
            <p className="text-slate-400 pt-2">
              Camera feeds are processed strictly in client-side memory. No biometric frames are stored without explicit user command.
            </p>
          </div>
        </div>

        <div className="border-t border-slate-100 mt-8 pt-6 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-4">
          <p>© 2026 SignBridge AI Research Project. Indian Sign Language Research and Training Centre (ISLRTC) referenced vocabulary.</p>
          <div className="flex items-center gap-4">
            <button onClick={() => onNavigate('help')} className="hover:text-slate-900">
              Attribution
            </button>
            <span aria-hidden="true">·</span>
            <button onClick={() => onNavigate('help')} className="hover:text-slate-900">
              Privacy
            </button>
            <span aria-hidden="true">·</span>
            <button onClick={() => onNavigate('research')} className="hover:text-slate-900">
              Export CSV
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
};
