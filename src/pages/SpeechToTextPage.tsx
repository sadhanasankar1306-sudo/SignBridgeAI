import React, { useState, useEffect, useRef } from 'react';
import {
  Mic,
  MicOff,
  Copy,
  Trash2,
  Edit3,
  Check,
  AlertCircle,
  HelpCircle,
  Save,
  Volume2
} from 'lucide-react';
import {
  SpeechToTextController,
  isSpeechRecognitionSupported,
  speakText
} from '../services/speech.ts';
import { savePhrase } from '../services/api.ts';

interface SpeechToTextPageProps {
  onNavigate: (page: string) => void;
}

export const SpeechToTextPage: React.FC<SpeechToTextPageProps> = ({ onNavigate }) => {
  const [isListening, setIsListening] = useState(false);
  const [interimText, setInterimText] = useState('');
  const [finalText, setFinalText] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isSupported, setIsSupported] = useState(true);
  const [manualInput, setManualInput] = useState('');
  const [copied, setCopied] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  const controllerRef = useRef<SpeechToTextController | null>(null);

  useEffect(() => {
    const supported = isSpeechRecognitionSupported();
    setIsSupported(supported);

    if (supported) {
      controllerRef.current = new SpeechToTextController({
        onStart: () => {
          setIsListening(true);
          setErrorMsg(null);
        },
        onInterimResult: (interim) => {
          setInterimText(interim);
        },
        onFinalResult: (finalChunk) => {
          setFinalText((prev) => (prev ? `${prev} ${finalChunk}` : finalChunk));
          setInterimText('');
        },
        onError: (err) => {
          setErrorMsg(err);
          setIsListening(false);
        },
        onEnd: () => {
          setIsListening(false);
        }
      });
    }

    return () => {
      if (controllerRef.current) {
        controllerRef.current.stop();
      }
    };
  }, []);

  const toggleListening = () => {
    if (!isSupported) return;

    if (isListening) {
      controllerRef.current?.stop();
    } else {
      setErrorMsg(null);
      controllerRef.current?.start();
    }
  };

  const handleClear = () => {
    controllerRef.current?.clear();
    setFinalText('');
    setInterimText('');
  };

  const handleCopy = () => {
    const textToCopy = (finalText + (interimText ? ` ${interimText}` : '')).trim();
    if (!textToCopy) return;

    navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSave = async () => {
    const textToSave = (finalText + (interimText ? ` ${interimText}` : '')).trim();
    if (!textToSave) return;

    try {
      await savePhrase({
        text: textToSave,
        source: 'speech',
        category: 'Hearing Speech'
      });
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 2500);
    } catch (e) {
      console.error('Failed to save speech phrase:', e);
    }
  };

  const handleAppendManual = () => {
    if (!manualInput.trim()) return;
    setFinalText((prev) => (prev ? `${prev} ${manualInput.trim()}` : manualInput.trim()));
    setManualInput('');
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="border-b border-slate-200 pb-5">
        <div className="flex items-center gap-2 text-xs font-semibold text-emerald-700 uppercase tracking-wider">
          <span>Hearing Companion Module</span>
          <span aria-hidden="true">·</span>
          <span>Web Speech API</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 mt-1">
          Live Speech-to-Text Captions
        </h1>
        <p className="text-xs sm:text-sm text-slate-600 mt-1 max-w-2xl">
          Converts spoken words from hearing communication partners into real-time visual captions with editing, copy, and persistent SQLite storage.
        </p>
      </div>

      {/* Browser Support Warning if not supported */}
      {!isSupported && (
        <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-900 space-y-2">
          <div className="flex items-center gap-2 font-semibold text-amber-800">
            <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
            <span>Browser Speech Recognition API is not supported in this browser.</span>
          </div>
          <p>
            The standard Web Speech API is supported natively in modern Google Chrome, Microsoft Edge, and Safari on desktop and mobile. You can still use the accessible manual keyboard transcription input below!
          </p>
        </div>
      )}

      {/* Main Microphone Card */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 sm:p-8 space-y-6 shadow-2xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <button
              disabled={!isSupported}
              onClick={toggleListening}
              className={`w-14 h-14 rounded-full flex items-center justify-center transition-all shadow-sm ${
                isListening
                  ? 'bg-red-600 text-white animate-pulse ring-4 ring-red-100'
                  : 'bg-emerald-600 hover:bg-emerald-700 text-white'
              } disabled:opacity-40 disabled:cursor-not-allowed`}
              aria-label={isListening ? 'Stop microphone' : 'Start microphone'}
            >
              {isListening ? <Mic className="w-6 h-6" /> : <Mic className="w-6 h-6" />}
            </button>

            <div>
              <div className="flex items-center gap-2">
                <span className={`w-2.5 h-2.5 rounded-full ${
                  isListening ? 'bg-red-500 animate-pulse' : 'bg-slate-300'
                }`} />
                <h3 className="text-sm font-bold text-slate-900">
                  {isListening ? 'Microphone Active — Listening...' : 'Microphone Paused'}
                </h3>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                {isListening ? 'Speak naturally in English or conversational phrases.' : 'Click the microphone button to start transcribing.'}
              </p>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="flex items-center gap-2">
            <button
              onClick={handleCopy}
              disabled={!finalText && !interimText}
              className="px-3 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 disabled:opacity-40 text-xs font-medium text-slate-700 flex items-center gap-1.5 transition-colors"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5 text-slate-500" />}
              <span>{copied ? 'Copied' : 'Copy'}</span>
            </button>

            <button
              onClick={handleSave}
              disabled={!finalText && !interimText}
              className="px-3 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 disabled:opacity-40 text-xs font-medium text-slate-700 flex items-center gap-1.5 transition-colors"
            >
              <Save className="w-3.5 h-3.5 text-slate-500" />
              <span>Save</span>
            </button>

            <button
              onClick={handleClear}
              disabled={!finalText && !interimText}
              className="px-3 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 disabled:opacity-40 text-xs font-medium text-red-600 flex items-center gap-1.5 transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Clear</span>
            </button>
          </div>
        </div>

        {errorMsg && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-xs text-red-700 flex items-start gap-2">
            <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Live Caption Display Area */}
        <div className="min-h-48 p-6 bg-slate-50 rounded-xl border border-slate-200 text-slate-900 leading-relaxed font-sans text-base sm:text-lg">
          {finalText || interimText ? (
            <div>
              <span>{finalText}</span>
              {interimText && (
                <span className="text-slate-400 italic"> {interimText}</span>
              )}
            </div>
          ) : (
            <div className="text-slate-400 italic text-sm">
              Transcribed spoken words will stream here in real time...
            </div>
          )}
        </div>

        {savedSuccess && (
          <div className="text-xs text-emerald-700 flex items-center gap-1">
            <Check className="w-3.5 h-3.5" />
            <span>Saved to persistent phrase history.</span>
          </div>
        )}
      </div>

      {/* Manual Keyboard Fallback Input */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 space-y-4">
        <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
          Alternative Keyboard Input (Accessible Fallback)
        </h3>
        <div className="flex gap-3">
          <input
            type="text"
            value={manualInput}
            onChange={(e) => setManualInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleAppendManual()}
            placeholder="Type spoken response manually if microphone is unavailable..."
            className="flex-1 text-sm px-3.5 py-2.5 border border-slate-300 rounded-lg focus-visible:ring-2 focus-visible:ring-blue-500"
          />
          <button
            onClick={handleAppendManual}
            disabled={!manualInput.trim()}
            className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-40 text-white font-medium text-xs rounded-lg transition-colors shadow-2xs"
          >
            Append to Captions
          </button>
        </div>
      </div>

      {/* Speech Privacy and Offline Notice */}
      <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-600 space-y-1">
        <p className="font-semibold text-slate-800">Privacy & Technical Context:</p>
        <p className="leading-relaxed">
          Browser speech recognition uses the Web Speech API provided by your operating system or browser vendor. Audio captures are converted to text buffers and are not archived on SignBridge AI servers. Note that browser speech recognition typically requires an active network connection depending on the browser vendor engine.
        </p>
      </div>
    </div>
  );
};
