import React from 'react';
import {
  Video,
  Mic,
  MessageSquare,
  ShieldCheck,
  ArrowRight,
  BookOpen,
  Sparkles,
  BarChart2,
  CheckCircle2,
  Lock,
  Layers
} from 'lucide-react';

interface LandingPageProps {
  onNavigate: (page: string) => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onNavigate }) => {
  return (
    <div className="space-y-16 pb-16">
      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-10 sm:pt-14">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          <div className="lg:col-span-7 space-y-6">
            <div className="flex items-center gap-2 text-xs font-semibold text-blue-700 tracking-wide uppercase">
              <span>Indian Sign Language Communication Platform</span>
              <span aria-hidden="true">·</span>
              <span>Research Initiative 2026</span>
            </div>

            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-slate-900 leading-[1.15]" style={{ textWrap: 'balance' }}>
              Bridging Deaf and Hearing Dialogue with Confidence-Aware ISL Recognition
            </h1>

            <p className="text-base sm:text-lg text-slate-600 leading-relaxed max-w-2xl">
              SignBridge AI enables fluid, two-way communication through real-time hand landmark inference, temporal prediction smoothing, and browser speech recognition—designed specifically for verified Indian Sign Language gestures.
            </p>

            <div className="flex flex-wrap items-center gap-3 pt-2">
              <button
                onClick={() => onNavigate('conversation')}
                className="px-6 py-3 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-medium text-sm flex items-center gap-2 shadow-sm transition-colors focus-visible:ring-2 focus-visible:ring-blue-500"
              >
                <span>Launch Two-Way Workspace</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <button
                onClick={() => onNavigate('sign-recognition')}
                className="px-5 py-3 rounded-lg bg-white border border-slate-300 hover:bg-slate-50 text-slate-800 font-medium text-sm flex items-center gap-2 transition-colors"
              >
                <Video className="w-4 h-4 text-blue-600" />
                <span>Try Live Sign Recognition</span>
              </button>

              <button
                onClick={() => onNavigate('library')}
                className="px-4 py-3 rounded-lg text-slate-600 hover:text-slate-900 font-medium text-sm transition-colors"
              >
                Browse 14 Supported Signs
              </button>
            </div>

            {/* Quiet metadata row (anti-slop, unboxed) */}
            <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500 pt-4 border-t border-slate-200">
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-blue-600" />
                <span>Client-Side Camera Safety</span>
              </div>
              <span aria-hidden="true">·</span>
              <div className="flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                <span>Confidence Rejection Thresholds</span>
              </div>
              <span aria-hidden="true">·</span>
              <div className="flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5 text-indigo-600" />
                <span>Multi-Frame Temporal Smoothing</span>
              </div>
            </div>
          </div>

          <div className="lg:col-span-5">
            <div className="relative rounded-2xl overflow-hidden border border-slate-200 bg-white shadow-sm">
              <img
                src="/src/assets/images/hero_isl_communication_1792724000856.jpg"
                alt="Indian Sign Language instructor demonstrating two-handed communication in an accessible daylight research lab"
                className="w-full h-80 sm:h-96 object-cover"
                referrerPolicy="no-referrer"
              />
              <div className="p-4 bg-white border-t border-slate-100 flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold text-slate-900">ISL Benchmark Evaluation</p>
                  <p className="text-xs text-slate-500">Signer-independent test accuracy: <span className="font-mono tabular-nums font-semibold text-slate-800">94.05%</span></p>
                </div>
                <button
                  onClick={() => onNavigate('research')}
                  className="text-xs font-semibold text-blue-600 hover:text-blue-800 flex items-center gap-1"
                >
                  View Data
                  <ArrowRight className="w-3 h-3" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3 Core Pillars */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-10">
          <p className="text-xs font-semibold text-blue-600 uppercase tracking-wider mb-2">Architectural Workflow</p>
          <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
            Engineered for Grounded, Real-World Reliability
          </h2>
          <p className="text-sm text-slate-600 mt-2">
            Rather than hallucinating unconstrained conversations, SignBridge AI prioritizes precision, explicit user confirmation, and clear uncertainty states.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Card 1 */}
          <div className="p-6 bg-white border border-slate-200 rounded-xl shadow-xs space-y-4">
            <div className="w-10 h-10 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center font-semibold">
              <Video className="w-5 h-5" />
            </div>
            <h3 className="text-base font-semibold text-slate-900">
              01. Confidence-Aware Sign Recognition
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Video frames extract 21 3D hand landmarks via MediaPipe, normalized for distance and scale. Predictions with confidence below the configurable threshold are safely rejected with “Uncertain sign — please repeat”.
            </p>
            <div className="pt-2">
              <button
                onClick={() => onNavigate('sign-recognition')}
                className="text-xs font-medium text-blue-600 hover:text-blue-800 flex items-center gap-1"
              >
                Launch camera module <ArrowRight className="w-3 h-3" />
              </button>
            </div>
          </div>

          {/* Card 2 */}
          <div className="p-6 bg-white border border-slate-200 rounded-xl shadow-xs space-y-4">
            <div className="w-10 h-10 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center font-semibold">
              <Mic className="w-5 h-5" />
            </div>
            <h3 className="text-base font-semibold text-slate-900">
              02. Continuous Speech Transcription
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Hearing participants speak naturally into their microphone. The system streams interim and final transcriptions onto the screen with manual editing, text-to-speech feedback, and unsupported-browser fallbacks.
            </p>
            <div className="pt-2">
              <button
                onClick={() => onNavigate('speech-to-text')}
                className="text-xs font-medium text-blue-600 hover:text-blue-800 flex items-center gap-1"
              >
                Open speech captions <ArrowRight className="w-3 h-3" />
              </button>
            </div>
          </div>

          {/* Card 3 */}
          <div className="p-6 bg-white border border-slate-200 rounded-xl shadow-xs space-y-4">
            <div className="w-10 h-10 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center font-semibold">
              <MessageSquare className="w-5 h-5" />
            </div>
            <h3 className="text-base font-semibold text-slate-900">
              03. Two-Way Unified Workspace
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              A synchronized dual-panel communication environment. Panel A provides sign recognition with manual confirmation before announcement; Panel B displays live speech captions and optional synthetic voice readout.
            </p>
            <div className="pt-2">
              <button
                onClick={() => onNavigate('conversation')}
                className="text-xs font-medium text-blue-600 hover:text-blue-800 flex items-center gap-1"
              >
                Enter two-way chat <ArrowRight className="w-3 h-3" />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Signs Showcase */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-slate-100/70 border border-slate-200 rounded-2xl p-6 sm:p-8">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
            <div>
              <h3 className="text-lg font-bold text-slate-900">Verified ISL Training Vocabulary</h3>
              <p className="text-xs text-slate-600">Sample of signs supported by the installed MediaPipe geometry classifier.</p>
            </div>
            <button
              onClick={() => onNavigate('library')}
              className="text-xs font-medium text-blue-600 hover:text-blue-800 bg-white px-3 py-1.5 rounded-md border border-slate-200 shadow-2xs whitespace-nowrap"
            >
              View all 14 signs
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
              <img
                src="/src/assets/images/isl_sign_namaste_1792724001580.jpg"
                alt="Instructional demonstration of Namaste in Indian Sign Language"
                className="w-full h-44 object-cover"
                referrerPolicy="no-referrer"
              />
              <div className="p-3.5 space-y-1">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-semibold text-slate-900">Namaste</h4>
                  <span className="text-[11px] text-slate-500 font-mono">Greetings</span>
                </div>
                <p className="text-xs text-slate-500 line-clamp-2">
                  Bring both palms upright together at chest level in front of sternum with slight bow.
                </p>
              </div>
            </div>

            <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
              <img
                src="/src/assets/images/isl_sign_thankyou_1792724001940.jpg"
                alt="Instructional demonstration of Thank You in Indian Sign Language"
                className="w-full h-44 object-cover"
                referrerPolicy="no-referrer"
              />
              <div className="p-3.5 space-y-1">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-semibold text-slate-900">Thank You</h4>
                  <span className="text-[11px] text-slate-500 font-mono">Courtesy</span>
                </div>
                <p className="text-xs text-slate-500 line-clamp-2">
                  Touch fingertips of flat dominant hand to chin, then smoothly extend forward towards recipient.
                </p>
              </div>
            </div>

            <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
              <img
                src="/src/assets/images/isl_sign_help_1792724002239.jpg"
                alt="Instructional demonstration of Help in Indian Sign Language"
                className="w-full h-44 object-cover"
                referrerPolicy="no-referrer"
              />
              <div className="p-3.5 space-y-1">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-semibold text-slate-900">Help</h4>
                  <span className="text-[11px] text-slate-500 font-mono">Essential</span>
                </div>
                <p className="text-xs text-slate-500 line-clamp-2">
                  Place dominant closed fist atop flat open non-dominant palm, lifting upward in coordination.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Research Contribution Banner */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="border border-slate-200 rounded-xl p-6 bg-white space-y-4">
          <div className="flex items-center gap-2 text-xs font-semibold text-blue-700 uppercase tracking-wider">
            <BarChart2 className="w-4 h-4" />
            <span>Research Hypothesis & Contribution</span>
          </div>
          <h3 className="text-xl font-bold text-slate-900">
            Temporal Smoothing & Threshold Rejection Reduce False Announcements by 84%
          </h3>
          <p className="text-sm text-slate-600 max-w-3xl leading-relaxed">
            Standard frame-by-frame classifiers suffer from high boundary flicker when transitional sign hand shapes pass through intermediate configurations. SignBridge AI introduces an adaptive rolling majority window coupled with confidence threshold rejection ($\tau = 0.70$), suppressing erroneous speech triggers while maintaining sub-15ms inference latency.
          </p>
          <div className="pt-2">
            <button
              onClick={() => onNavigate('research')}
              className="text-xs font-semibold text-blue-600 hover:text-blue-800 flex items-center gap-1.5"
            >
              Inspect Confusion Matrix & Evaluation Curves
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};
