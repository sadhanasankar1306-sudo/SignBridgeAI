import React from 'react';
import {
  ShieldCheck,
  AlertTriangle,
  Lock,
  Eye,
  Camera,
  Mic,
  Database,
  HelpCircle,
  ExternalLink,
  BookOpen
} from 'lucide-react';

interface HelpPrivacyPageProps {
  onNavigate: (page: string) => void;
}

export const HelpPrivacyPage: React.FC<HelpPrivacyPageProps> = ({ onNavigate }) => {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-10">
      {/* Header */}
      <div className="border-b border-slate-200 pb-5">
        <div className="flex items-center gap-2 text-xs font-semibold text-blue-700 uppercase tracking-wider">
          <span>Documentation & Compliance</span>
          <span aria-hidden="true">·</span>
          <span>Responsible AI Guidelines</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 mt-1">
          Help, System Limitations & Privacy Architecture
        </h1>
        <p className="text-xs sm:text-sm text-slate-600 mt-1 max-w-2xl leading-relaxed">
          Comprehensive explanation of current technical boundaries, privacy protections, camera safety, and dataset attributions for the SignBridge AI platform.
        </p>
      </div>

      {/* Crucial Scientific Scope & Limitations Section */}
      <div className="bg-white border border-amber-200 rounded-xl p-6 sm:p-7 space-y-4 shadow-2xs">
        <div className="flex items-center gap-2.5 text-amber-800">
          <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0" />
          <h2 className="text-base font-bold text-slate-900">
            System Vocabulary Limitations & Scientific Disclaimer
          </h2>
        </div>

        <div className="space-y-3 text-xs text-slate-700 leading-relaxed">
          <p>
            <strong>Small-Vocabulary Scope:</strong> SignBridge AI currently operates with a trained classifier covering <strong>14 verified Indian Sign Language (ISL) gestures</strong>. It is not an unconstrained natural language machine translator and cannot interpret arbitrary regional dialectical conversations, full grammar syntax trees, or continuous non-manual facial markers.
          </p>

          <p>
            <strong>Confidence Rejection Rule:</strong> To protect against hallucinated translations, the system enforces a minimum confidence threshold ($\tau = 0.70$). Any movement outside the documented 14 signs is safely designated as <em>“Uncertain sign — please repeat”</em> rather than outputting false words.
          </p>

          <p>
            <strong>Environmental Sensitivity:</strong> MediaPipe 3D hand tracking performance relies on reasonable frontal illumination, non-occluded wrist/fingertip visibility, and camera distance between 0.5m and 1.5m. Rapid camera panning or extreme backlight can lower confidence scores.
          </p>

          <p>
            <strong>Not a Legal / Medical Substitute:</strong> SignBridge AI is designed for assistive peer communication and research evaluation. In critical medical diagnosis, emergency healthcare, or legal courtroom environments, human certified ISL interpreters must always be utilized.
          </p>
        </div>
      </div>

      {/* Privacy Architecture & Zero-Biometric Storage */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 sm:p-7 space-y-5 shadow-2xs">
        <div className="flex items-center gap-2.5">
          <Lock className="w-5 h-5 text-blue-600 shrink-0" />
          <h3 className="text-base font-bold text-slate-900">
            Privacy & Data Ethics Architecture
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-1">
          <div className="p-4 rounded-lg bg-slate-50 border border-slate-100 space-y-2">
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-800">
              <Camera className="w-4 h-4 text-blue-600" />
              <span>Camera Feed Privacy</span>
            </div>
            <p className="text-[11px] text-slate-600 leading-relaxed">
              Video frames are processed in volatile client-side browser memory. Raw camera images are never stored, streamed to remote disks, or saved on any server.
            </p>
          </div>

          <div className="p-4 rounded-lg bg-slate-50 border border-slate-100 space-y-2">
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-800">
              <Mic className="w-4 h-4 text-emerald-600" />
              <span>Microphone & Audio</span>
            </div>
            <p className="text-[11px] text-slate-600 leading-relaxed">
              Spoken audio captured during Speech-to-Text is transcribed into text buffers via the browser's native Web Speech API. No persistent audio recordings are collected.
            </p>
          </div>

          <div className="p-4 rounded-lg bg-slate-50 border border-slate-100 space-y-2">
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-800">
              <Database className="w-4 h-4 text-indigo-600" />
              <span>Persistent Storage</span>
            </div>
            <p className="text-[11px] text-slate-600 leading-relaxed">
              Only text phrases explicitly approved by the user clicking "Save Phrase" are persisted into the local SQLite database. Users can clear this history at any time.
            </p>
          </div>
        </div>
      </div>

      {/* Dataset Attribution & References */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 sm:p-7 space-y-4 shadow-2xs">
        <div className="flex items-center gap-2.5">
          <BookOpen className="w-5 h-5 text-slate-700 shrink-0" />
          <h3 className="text-base font-bold text-slate-900">
            Corpus Reference & Academic Attribution
          </h3>
        </div>

        <div className="space-y-3 text-xs text-slate-600 leading-relaxed">
          <p>
            The training gestures and landmark verification schemas in SignBridge AI are grounded in verified documentation from authoritative Indian Sign Language organizations:
          </p>

          <ul className="list-disc pl-5 space-y-1.5 text-slate-700">
            <li>
              <strong>Indian Sign Language Research and Training Centre (ISLRTC):</strong> Standardized ISL dictionary and lexicon corpus (Department of Empowerment of Persons with Disabilities, Govt. of India).
            </li>
            <li>
              <strong>ISL-CSLTR Benchmark Dataset (2024):</strong> Multi-signer benchmark recordings utilized for establishing held-out signer test splits and calculating baseline comparison figures.
            </li>
            <li>
              <strong>Deaf Enabled Foundation (DEF):</strong> Educational curriculum guidance on conversational courtesy tokens and accessibility requirements.
            </li>
          </ul>
        </div>
      </div>

      {/* Quick Troubleshooting Guide */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 sm:p-7 space-y-4 shadow-2xs">
        <h3 className="text-base font-bold text-slate-900">
          Troubleshooting & FAQs
        </h3>

        <div className="space-y-3 text-xs divide-y divide-slate-100">
          <div className="pt-2 space-y-1">
            <p className="font-semibold text-slate-800">Q: Why does the camera preview say "Camera permission denied"?</p>
            <p className="text-slate-600">
              A: Browser security requires explicit camera consent. Click the lock icon in your browser URL bar, ensure "Camera" is set to "Allow", and refresh the tab.
            </p>
          </div>

          <div className="pt-3 space-y-1">
            <p className="font-semibold text-slate-800">Q: How do I test recognition if I do not have a working webcam?</p>
            <p className="text-slate-600">
              A: Navigate to "Live Sign Recognition" and use the <strong>Diagnostic Simulator</strong> dropdown in the toolbar to feed verified landmark coordinates directly into the model.
            </p>
          </div>

          <div className="pt-3 space-y-1">
            <p className="font-semibold text-slate-800">Q: Why does speech-to-text not work on Firefox?</p>
            <p className="text-slate-600">
              A: Mozilla Firefox currently disables the Web Speech API by default. For voice capture, use Chromium-based browsers (Chrome, Edge, Brave) or use the accessible manual keyboard fallback input provided in the Speech Captions panel.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
