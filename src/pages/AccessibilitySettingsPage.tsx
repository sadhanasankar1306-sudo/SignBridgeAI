import React, { useState, useEffect } from 'react';
import {
  Settings,
  Eye,
  Type,
  Volume2,
  CheckCircle2,
  Sliders,
  ShieldCheck,
  RotateCcw
} from 'lucide-react';
import { fetchPreferences, savePreferences } from '../services/api.ts';
import type { UserPreferences } from '../types/index.ts';

interface AccessibilitySettingsPageProps {
  preferences: UserPreferences;
  onUpdatePreferences: (prefs: Partial<UserPreferences>) => void;
  onNavigate: (page: string) => void;
}

export const AccessibilitySettingsPage: React.FC<AccessibilitySettingsPageProps> = ({
  preferences,
  onUpdatePreferences,
  onNavigate
}) => {
  const [localPrefs, setLocalPrefs] = useState<UserPreferences>(preferences);
  const [saveMessage, setSaveMessage] = useState(false);

  useEffect(() => {
    setLocalPrefs(preferences);
  }, [preferences]);

  const handleChange = <K extends keyof UserPreferences>(key: K, value: UserPreferences[K]) => {
    const updated = { ...localPrefs, [key]: value };
    setLocalPrefs(updated);
    onUpdatePreferences({ [key]: value });
    setSaveMessage(true);
    setTimeout(() => setSaveMessage(false), 2000);
  };

  const handleResetDefaults = () => {
    const defaults: UserPreferences = {
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
    setLocalPrefs(defaults);
    onUpdatePreferences(defaults);
    setSaveMessage(true);
    setTimeout(() => setSaveMessage(false), 2000);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="border-b border-slate-200 pb-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-blue-700 uppercase tracking-wider">
            <span>Universal Design</span>
            <span aria-hidden="true">·</span>
            <span>WCAG 2.2 AA Compliance</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 mt-1">
            Accessibility & Preference Settings
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 mt-1">
            Configure visual sizing, contrast, speech feedback, and recognition sensitivity to suit your communication needs.
          </p>
        </div>

        <button
          onClick={handleResetDefaults}
          className="px-3 py-1.5 rounded-lg border border-slate-300 hover:bg-slate-50 text-xs font-medium text-slate-600 flex items-center gap-1.5 self-start sm:self-auto transition-colors"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Reset Defaults</span>
        </button>
      </div>

      {saveMessage && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-xs text-emerald-800 flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span>Preferences updated and persisted.</span>
        </div>
      )}

      {/* Visual Settings Section */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 space-y-6 shadow-2xs">
        <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
          <Type className="w-4 h-4 text-blue-600" />
          <h3 className="text-sm font-bold text-slate-900">Visual Typography & Contrast</h3>
        </div>

        {/* Text Scaling */}
        <div className="space-y-2">
          <label className="text-xs font-semibold text-slate-800">
            Interface & Captions Text Scale
          </label>
          <div className="grid grid-cols-3 gap-3">
            {(['normal', 'large', 'extra-large'] as const).map((scale) => (
              <button
                key={scale}
                onClick={() => handleChange('textScale', scale)}
                className={`py-2.5 px-3 rounded-lg border text-xs font-medium capitalize transition-all ${
                  localPrefs.textScale === scale
                    ? 'border-blue-600 bg-blue-50 text-blue-900 font-bold shadow-2xs ring-1 ring-blue-600'
                    : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                }`}
              >
                {scale.replace('-', ' ')}
              </button>
            ))}
          </div>
          <p className="text-[11px] text-slate-500">
            Enlarges live sign captions, chat transcripts, and button labels for easier reading from a distance.
          </p>
        </div>

        {/* High Contrast Toggle */}
        <div className="flex items-center justify-between pt-2">
          <div>
            <label className="text-xs font-semibold text-slate-800 block">
              Enhanced High Contrast Mode
            </label>
            <p className="text-[11px] text-slate-500">
              Increases border contrast and darkens foreground typography to meet AAA standards.
            </p>
          </div>
          <button
            onClick={() => handleChange('highContrast', !localPrefs.highContrast)}
            className={`w-12 h-6 rounded-full transition-colors relative ${
              localPrefs.highContrast ? 'bg-blue-600' : 'bg-slate-300'
            }`}
            role="switch"
            aria-checked={localPrefs.highContrast}
          >
            <span
              className={`block w-4 h-4 rounded-full bg-white transition-transform ${
                localPrefs.highContrast ? 'translate-x-7' : 'translate-x-1'
              }`}
            />
          </button>
        </div>

        {/* Reduced Motion Toggle */}
        <div className="flex items-center justify-between pt-2">
          <div>
            <label className="text-xs font-semibold text-slate-800 block">
              Respect Reduced Motion (prefers-reduced-motion)
            </label>
            <p className="text-[11px] text-slate-500">
              Disables non-essential canvas transitions and smooth scrolling.
            </p>
          </div>
          <button
            onClick={() => handleChange('reducedMotion', !localPrefs.reducedMotion)}
            className={`w-12 h-6 rounded-full transition-colors relative ${
              localPrefs.reducedMotion ? 'bg-blue-600' : 'bg-slate-300'
            }`}
            role="switch"
            aria-checked={localPrefs.reducedMotion}
          >
            <span
              className={`block w-4 h-4 rounded-full bg-white transition-transform ${
                localPrefs.reducedMotion ? 'translate-x-7' : 'translate-x-1'
              }`}
            />
          </button>
        </div>
      </div>

      {/* Speech & Audio Settings */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 space-y-6 shadow-2xs">
        <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
          <Volume2 className="w-4 h-4 text-emerald-600" />
          <h3 className="text-sm font-bold text-slate-900">Speech Synthesis (TTS) Adjustments</h3>
        </div>

        {/* Speech Rate Slider */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="font-semibold text-slate-800">Voice Speech Rate</span>
            <span className="font-mono tabular-nums text-slate-600">{localPrefs.ttsRate.toFixed(1)}x</span>
          </div>
          <input
            type="range"
            min="0.6"
            max="1.4"
            step="0.1"
            value={localPrefs.ttsRate}
            onChange={(e) => handleChange('ttsRate', parseFloat(e.target.value))}
            className="w-full accent-emerald-600 cursor-pointer"
          />
          <div className="flex items-center justify-between text-[11px] text-slate-400">
            <span>0.6x (Slower)</span>
            <span>1.0x (Normal)</span>
            <span>1.4x (Faster)</span>
          </div>
        </div>

        {/* Audio Cue on Confirmation */}
        <div className="flex items-center justify-between pt-2">
          <div>
            <label className="text-xs font-semibold text-slate-800 block">
              Auditory Confirmation Tone
            </label>
            <p className="text-[11px] text-slate-500">
              Plays an audio chime when a sign is successfully verified and locked in.
            </p>
          </div>
          <button
            onClick={() => handleChange('soundCueOnRecognition', !localPrefs.soundCueOnRecognition)}
            className={`w-12 h-6 rounded-full transition-colors relative ${
              localPrefs.soundCueOnRecognition ? 'bg-emerald-600' : 'bg-slate-300'
            }`}
            role="switch"
            aria-checked={localPrefs.soundCueOnRecognition}
          >
            <span
              className={`block w-4 h-4 rounded-full bg-white transition-transform ${
                localPrefs.soundCueOnRecognition ? 'translate-x-7' : 'translate-x-1'
              }`}
            />
          </button>
        </div>
      </div>

      {/* Model Rejection Threshold Preference */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 space-y-4 shadow-2xs">
        <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
          <Sliders className="w-4 h-4 text-blue-600" />
          <h3 className="text-sm font-bold text-slate-900">Default Rejection Threshold</h3>
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="font-semibold text-slate-800">Global Minimum Confidence (τ)</span>
            <span className="font-mono tabular-nums font-bold text-blue-700">
              {(localPrefs.minConfidenceThreshold * 100).toFixed(0)}%
            </span>
          </div>
          <input
            type="range"
            min="0.50"
            max="0.95"
            step="0.05"
            value={localPrefs.minConfidenceThreshold}
            onChange={(e) => handleChange('minConfidenceThreshold', parseFloat(e.target.value))}
            className="w-full accent-blue-600 cursor-pointer"
          />
          <p className="text-[11px] text-slate-500">
            Controls how strictly uncertain hand gestures are rejected across Live Sign Recognition and the Two-Way Workspace.
          </p>
        </div>
      </div>
    </div>
  );
};
