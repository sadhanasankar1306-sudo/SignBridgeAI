import React, { useEffect, useState } from 'react';
import {
  Video,
  Mic,
  MessageSquare,
  CheckCircle2,
  AlertTriangle,
  Clock,
  ArrowRight,
  Shield,
  Layers,
  Sparkles,
  BookOpen,
  Volume2,
  Cpu
} from 'lucide-react';
import { fetchModelStatus, fetchHistory, fetchSigns } from '../services/api.ts';
import { isSpeechRecognitionSupported, isSpeechSynthesisSupported } from '../services/speech.ts';
import type { SavedPhrase, ISLSign, UserProfile } from '../types/index.ts';

interface DashboardPageProps {
  onNavigate: (page: string) => void;
  currentUser: UserProfile | null;
}

export const DashboardPage: React.FC<DashboardPageProps> = ({ onNavigate, currentUser }) => {
  const [modelStatus, setModelStatus] = useState<any>(null);
  const [signs, setSigns] = useState<ISLSign[]>([]);
  const [recentPhrases, setRecentPhrases] = useState<SavedPhrase[]>([]);
  const [loading, setLoading] = useState(true);
  const [cameraPermission, setCameraPermission] = useState<'prompt' | 'granted' | 'denied' | 'unknown'>('unknown');
  const [micPermission, setMicPermission] = useState<'prompt' | 'granted' | 'denied' | 'unknown'>('unknown');

  useEffect(() => {
    async function loadData() {
      try {
        const [mStatus, signData, historyData] = await Promise.all([
          fetchModelStatus().catch(() => null),
          fetchSigns().catch(() => ({ signs: [] })),
          fetchHistory().catch(() => ({ items: [] }))
        ]);

        setModelStatus(mStatus);
        setSigns(signData.signs || []);
        setRecentPhrases((historyData.items || []).slice(0, 5));
      } catch (err) {
        console.error('Failed to load dashboard data:', err);
      } finally {
        setLoading(false);
      }
    }

    loadData();

    // Check device permissions if supported by browser Permissions API
    if (navigator.permissions && navigator.permissions.query) {
      navigator.permissions.query({ name: 'camera' as PermissionName })
        .then(perm => {
          setCameraPermission(perm.state);
          perm.onchange = () => setCameraPermission(perm.state);
        })
        .catch(() => setCameraPermission('unknown'));

      navigator.permissions.query({ name: 'microphone' as PermissionName })
        .then(perm => {
          setMicPermission(perm.state);
          perm.onchange = () => setMicPermission(perm.state);
        })
        .catch(() => setMicPermission('unknown'));
    }
  }, []);

  const sttSupported = isSpeechRecognitionSupported();
  const ttsSupported = isSpeechSynthesisSupported();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Welcome & Overview */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-200 pb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
            Welcome, {currentUser ? currentUser.name : 'Researcher'}
          </h1>
          <p className="text-sm text-slate-600 mt-1">
            System status: <span className="font-medium text-slate-800">MediaPipe Vision Engine & ISL Classifier Ready</span>
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => onNavigate('conversation')}
            className="px-4 py-2.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-medium text-xs flex items-center gap-2 shadow-xs transition-colors"
          >
            <MessageSquare className="w-4 h-4" />
            <span>Launch Two-Way Chat</span>
          </button>
        </div>
      </div>

      {/* Large Shortcuts Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div
          onClick={() => onNavigate('sign-recognition')}
          className="group cursor-pointer p-6 bg-white border border-slate-200 hover:border-blue-300 rounded-xl transition-all shadow-xs hover:shadow-sm"
        >
          <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center mb-4 group-hover:scale-105 transition-transform">
            <Video className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
            Sign Recognition
          </h3>
          <p className="text-xs text-slate-600 mt-1 leading-relaxed">
            Translate Indian Sign Language gestures into text via live webcam inference with confidence filtering.
          </p>
          <div className="flex items-center gap-1.5 text-xs font-semibold text-blue-600 mt-4">
            <span>Start camera session</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
          </div>
        </div>

        <div
          onClick={() => onNavigate('speech-to-text')}
          className="group cursor-pointer p-6 bg-white border border-slate-200 hover:border-blue-300 rounded-xl transition-all shadow-xs hover:shadow-sm"
        >
          <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-4 group-hover:scale-105 transition-transform">
            <Mic className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-slate-900 group-hover:text-emerald-700 transition-colors">
            Speech Captions
          </h3>
          <p className="text-xs text-slate-600 mt-1 leading-relaxed">
            Convert spoken voice from hearing communication partners into real-time visual captions with manual correction.
          </p>
          <div className="flex items-center gap-1.5 text-xs font-semibold text-emerald-600 mt-4">
            <span>Start microphone</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
          </div>
        </div>

        <div
          onClick={() => onNavigate('conversation')}
          className="group cursor-pointer p-6 bg-white border border-slate-200 hover:border-blue-300 rounded-xl transition-all shadow-xs hover:shadow-sm"
        >
          <div className="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center mb-4 group-hover:scale-105 transition-transform">
            <MessageSquare className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-slate-900 group-hover:text-indigo-700 transition-colors">
            Two-Way Workspace
          </h3>
          <p className="text-xs text-slate-600 mt-1 leading-relaxed">
            Synchronized dual-panel conversation view linking signer video prediction and hearing voice transcript.
          </p>
          <div className="flex items-center gap-1.5 text-xs font-semibold text-indigo-600 mt-4">
            <span>Open workspace</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
          </div>
        </div>
      </div>

      {/* System Readiness & Device Permission Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Model Status Card */}
        <div className="p-4 bg-white border border-slate-200 rounded-lg space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">Inference Model</span>
            <Cpu className="w-4 h-4 text-blue-600" />
          </div>
          <div className="flex items-center gap-2">
            <span className="inline-block w-2.5 h-2.5 rounded-full bg-emerald-500" />
            <span className="text-sm font-semibold text-slate-900">
              {modelStatus ? 'Model Loaded & Active' : 'Model Ready'}
            </span>
          </div>
          <p className="text-[11px] text-slate-500">
            {modelStatus?.modelName || 'ISL-MLP Geometry Classifier'} (<span className="font-mono tabular-nums">{modelStatus?.classesCount || 14}</span> classes)
          </p>
        </div>

        {/* Camera Permission Card */}
        <div className="p-4 bg-white border border-slate-200 rounded-lg space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">Camera Permission</span>
            <Video className="w-4 h-4 text-slate-600" />
          </div>
          <div className="flex items-center gap-2">
            <span className={`inline-block w-2.5 h-2.5 rounded-full ${
              cameraPermission === 'granted' ? 'bg-emerald-500' : cameraPermission === 'denied' ? 'bg-red-500' : 'bg-amber-400'
            }`} />
            <span className="text-sm font-semibold text-slate-900 capitalize">
              {cameraPermission === 'granted' ? 'Access Granted' : cameraPermission === 'denied' ? 'Access Denied' : 'Prompt on Start'}
            </span>
          </div>
          <p className="text-[11px] text-slate-500">
            Requested strictly when starting recognition
          </p>
        </div>

        {/* Microphone Permission Card */}
        <div className="p-4 bg-white border border-slate-200 rounded-lg space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">Microphone & Speech API</span>
            <Mic className="w-4 h-4 text-slate-600" />
          </div>
          <div className="flex items-center gap-2">
            <span className={`inline-block w-2.5 h-2.5 rounded-full ${
              sttSupported ? 'bg-emerald-500' : 'bg-amber-400'
            }`} />
            <span className="text-sm font-semibold text-slate-900">
              {sttSupported ? 'Speech API Supported' : 'Manual Fallback Only'}
            </span>
          </div>
          <p className="text-[11px] text-slate-500">
            Web Speech STT / Webkit speech recognition
          </p>
        </div>

        {/* Speech Synthesis Card */}
        <div className="p-4 bg-white border border-slate-200 rounded-lg space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">Speech Synthesis (TTS)</span>
            <Volume2 className="w-4 h-4 text-slate-600" />
          </div>
          <div className="flex items-center gap-2">
            <span className={`inline-block w-2.5 h-2.5 rounded-full ${
              ttsSupported ? 'bg-emerald-500' : 'bg-red-500'
            }`} />
            <span className="text-sm font-semibold text-slate-900">
              {ttsSupported ? 'TTS Audio Available' : 'TTS Unavailable'}
            </span>
          </div>
          <p className="text-[11px] text-slate-500">
            Browser voice synthesis for spoken readout
          </p>
        </div>
      </div>

      {/* Two Column Layout: Supported Signs & Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Supported ISL Signs */}
        <div className="lg:col-span-7 bg-white border border-slate-200 rounded-xl p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-slate-900">Installed ISL Vocabulary</h3>
              <p className="text-xs text-slate-500">
                Current model supports <span className="font-mono tabular-nums font-semibold">{signs.length}</span> verified Indian Sign Language signs.
              </p>
            </div>
            <button
              onClick={() => onNavigate('library')}
              className="text-xs font-semibold text-blue-600 hover:text-blue-800"
            >
              View Full Library
            </button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 pt-2">
            {signs.map((sign) => (
              <div
                key={sign.id}
                onClick={() => onNavigate('library')}
                className="cursor-pointer p-2.5 rounded-lg border border-slate-100 hover:border-slate-300 hover:bg-slate-50 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-900">{sign.name}</span>
                  <span className="text-[10px] text-slate-500 font-mono">{sign.category}</span>
                </div>
                <p className="text-[11px] text-slate-500 truncate mt-0.5">
                  {sign.verifiedMeaning}
                </p>
              </div>
            ))}
          </div>

          <div className="p-3 bg-blue-50/50 rounded-lg border border-blue-100 text-xs text-blue-900">
            <strong>Scope Notice:</strong> This research model is calibrated specifically for the 14 signs above. It will reject ambiguous hand configurations outside this vocabulary rather than fabricating translation text.
          </div>
        </div>

        {/* Right Column: Recent Saved Phrases */}
        <div className="lg:col-span-5 bg-white border border-slate-200 rounded-xl p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-slate-900">Recent Saved Phrases</h3>
              <p className="text-xs text-slate-500">Stored in persistent SQLite database.</p>
            </div>
            <button
              onClick={() => onNavigate('history')}
              className="text-xs font-semibold text-blue-600 hover:text-blue-800"
            >
              See All
            </button>
          </div>

          {recentPhrases.length === 0 ? (
            <div className="py-12 text-center text-xs text-slate-400">
              No phrases saved yet. Save a phrase from sign or speech recognition.
            </div>
          ) : (
            <div className="space-y-3 pt-1">
              {recentPhrases.map((phrase) => (
                <div
                  key={phrase.id}
                  className="p-3 rounded-lg border border-slate-100 bg-slate-50/60 space-y-1.5"
                >
                  <div className="flex items-center justify-between text-[11px] text-slate-500">
                    <span className="font-semibold text-slate-700 capitalize">
                      Source: {phrase.source}
                    </span>
                    <span className="font-mono tabular-nums">
                      {new Date(phrase.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <p className="text-xs font-medium text-slate-800">
                    "{phrase.text}"
                  </p>
                  {phrase.confidence && (
                    <div className="text-[10px] text-slate-500 font-mono tabular-nums">
                      Model confidence: {(phrase.confidence * 100).toFixed(1)}%
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
