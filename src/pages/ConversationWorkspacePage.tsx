import React, { useState, useEffect, useRef } from 'react';
import {
  Video,
  VideoOff,
  Mic,
  MicOff,
  Volume2,
  Trash2,
  Copy,
  Check,
  Edit2,
  ArrowRight,
  BookOpen,
  Send,
  AlertCircle,
  Shield,
  Download,
  CheckCircle2,
  Sliders,
  Type
} from 'lucide-react';
import { CameraVisionController } from '../services/vision.ts';
import { TemporalSmoother } from '../../ml/model.ts';
import {
  SpeechToTextController,
  isSpeechRecognitionSupported,
  isSpeechSynthesisSupported,
  speakText
} from '../services/speech.ts';
import { savePhrase } from '../services/api.ts';
import type { ConversationMessage, PredictionResult } from '../types/index.ts';

interface ConversationWorkspacePageProps {
  onNavigate: (page: string) => void;
  textScale: 'normal' | 'large' | 'extra-large';
  highContrast: boolean;
}

export const ConversationWorkspacePage: React.FC<ConversationWorkspacePageProps> = ({
  onNavigate,
  textScale,
  highContrast
}) => {
  // Session messages
  const [messages, setMessages] = useState<ConversationMessage[]>([
    {
      id: 'msg_init_1',
      sender: 'signer',
      text: 'Namaste',
      confidence: 0.967,
      timestamp: new Date(Date.now() - 120000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      confirmed: true
    },
    {
      id: 'msg_init_2',
      sender: 'hearing',
      text: 'Hello! It is a pleasure to meet you.',
      timestamp: new Date(Date.now() - 90000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      confirmed: true
    }
  ]);

  // Panel A (Signer) States
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const visionControllerRef = useRef<CameraVisionController | null>(null);
  const smootherRef = useRef<TemporalSmoother>(new TemporalSmoother(7, 1200, 0.70));

  const [isCameraActive, setIsCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [minConfidence, setMinConfidence] = useState(0.70);
  const [candidateSign, setCandidateSign] = useState<string>('');
  const [candidateConf, setCandidateConf] = useState<number>(0);
  const [isUncertain, setIsUncertain] = useState(false);
  const [signerManualInput, setSignerManualInput] = useState('');

  // Panel B (Hearing) States
  const speechControllerRef = useRef<SpeechToTextController | null>(null);
  const [isMicActive, setIsMicActive] = useState(false);
  const [interimHearingText, setInterimHearingText] = useState('');
  const [hearingDraft, setHearingDraft] = useState('');
  const [micError, setMicError] = useState<string | null>(null);

  // Common UI states
  const [copiedTranscript, setCopiedTranscript] = useState(false);
  const [showClearConfirm, setShowClearConfirm] = useState(false);

  // Initialize Speech
  useEffect(() => {
    if (isSpeechRecognitionSupported()) {
      speechControllerRef.current = new SpeechToTextController({
        onStart: () => {
          setIsMicActive(true);
          setMicError(null);
        },
        onInterimResult: (interim) => {
          setInterimHearingText(interim);
        },
        onFinalResult: (finalChunk) => {
          setHearingDraft((prev) => (prev ? `${prev} ${finalChunk}` : finalChunk));
          setInterimHearingText('');
        },
        onError: (err) => {
          setMicError(err);
          setIsMicActive(false);
        },
        onEnd: () => {
          setIsMicActive(false);
        }
      });
    }

    return () => {
      if (visionControllerRef.current) {
        visionControllerRef.current.stopCamera();
      }
      if (speechControllerRef.current) {
        speechControllerRef.current.stop();
      }
    };
  }, []);

  // Camera toggle
  const toggleCamera = async () => {
    if (isCameraActive) {
      visionControllerRef.current?.stopCamera();
      visionControllerRef.current = null;
      setIsCameraActive(false);
      setCandidateSign('');
    } else {
      setCameraError(null);
      if (!videoRef.current || !canvasRef.current) return;

      try {
        smootherRef.current.setParameters(7, 1200, minConfidence);
        const controller = new CameraVisionController(
          videoRef.current,
          canvasRef.current,
          (pred) => {
            if (pred.signId !== 'none') {
              const smoothed = smootherRef.current.push(pred);
              setIsUncertain(smoothed.isUncertain);
              setCandidateConf(smoothed.stableConfidence);
              if (smoothed.isAnnounceReady && !smoothed.isUncertain) {
                setCandidateSign(smoothed.stableSignName);
              }
            }
          },
          minConfidence
        );
        visionControllerRef.current = controller;
        await controller.startCamera();
        setIsCameraActive(true);
      } catch (err: any) {
        setCameraError(err.message || 'Camera error');
        setIsCameraActive(false);
      }
    }
  };

  // Mic toggle
  const toggleMic = () => {
    if (isMicActive) {
      speechControllerRef.current?.stop();
    } else {
      setMicError(null);
      speechControllerRef.current?.start();
    }
  };

  // Signer confirms message
  const handleConfirmSignMessage = async (speakAloud = false) => {
    const text = (signerManualInput || candidateSign).trim();
    if (!text) return;

    const newMsg: ConversationMessage = {
      id: `msg_${Date.now()}`,
      sender: 'signer',
      text,
      confidence: candidateConf || undefined,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      confirmed: true
    };

    setMessages((prev) => [...prev, newMsg]);
    setCandidateSign('');
    setSignerManualInput('');
    smootherRef.current.reset();

    if (speakAloud) {
      await speakText(text);
    }
  };

  // Hearing user confirms message
  const handleSendHearingMessage = () => {
    const text = hearingDraft.trim();
    if (!text) return;

    const newMsg: ConversationMessage = {
      id: `msg_${Date.now()}`,
      sender: 'hearing',
      text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      confirmed: true
    };

    setMessages((prev) => [...prev, newMsg]);
    setHearingDraft('');
    setInterimHearingText('');
  };

  const handleCopyTranscript = () => {
    const transcriptText = messages
      .map((m) => `[${m.timestamp}] ${m.sender === 'signer' ? 'Signer' : 'Hearing'}: ${m.text}`)
      .join('\n');

    navigator.clipboard.writeText(transcriptText);
    setCopiedTranscript(true);
    setTimeout(() => setCopiedTranscript(false), 2000);
  };

  const handleExportTextFile = () => {
    const transcriptText = messages
      .map((m) => `[${m.timestamp}] ${m.sender === 'signer' ? 'Signer' : 'Hearing'}: ${m.text}`)
      .join('\n');

    const blob = new Blob([transcriptText], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `signbridge_conversation_${new Date().toISOString().slice(0, 10)}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleClearSession = () => {
    setMessages([]);
    setShowClearConfirm(false);
  };

  const getTextScaleClass = () => {
    if (textScale === 'extra-large') return 'text-xl sm:text-2xl';
    if (textScale === 'large') return 'text-base sm:text-lg';
    return 'text-sm sm:text-base';
  };

  return (
    <div className={`max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6 ${highContrast ? 'contrast-125' : ''}`}>
      {/* Top Session Toolbar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-blue-700 uppercase tracking-wider">
            <span>Collaborative Communication Workspace</span>
            <span aria-hidden="true">·</span>
            <span>Two-Way Dialogue</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 mt-0.5">
            Synchronized Conversation Session
          </h1>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={handleCopyTranscript}
            disabled={messages.length === 0}
            className="px-3 py-1.5 rounded-lg border border-slate-300 hover:bg-slate-50 disabled:opacity-40 text-xs font-medium text-slate-700 flex items-center gap-1.5 transition-colors"
          >
            {copiedTranscript ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5 text-slate-500" />}
            <span>{copiedTranscript ? 'Copied' : 'Copy Log'}</span>
          </button>

          <button
            onClick={handleExportTextFile}
            disabled={messages.length === 0}
            className="px-3 py-1.5 rounded-lg border border-slate-300 hover:bg-slate-50 disabled:opacity-40 text-xs font-medium text-slate-700 flex items-center gap-1.5 transition-colors"
          >
            <Download className="w-3.5 h-3.5 text-slate-500" />
            <span>Export .txt</span>
          </button>

          <button
            onClick={() => setShowClearConfirm(true)}
            disabled={messages.length === 0}
            className="px-3 py-1.5 rounded-lg border border-slate-300 hover:bg-red-50 hover:text-red-700 disabled:opacity-40 text-xs font-medium text-slate-600 flex items-center gap-1.5 transition-colors"
          >
            <Trash2 className="w-3.5 h-3.5 text-slate-400" />
            <span>Clear</span>
          </button>
        </div>
      </div>

      {/* Clear Confirmation Modal */}
      {showClearConfirm && (
        <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl flex items-center justify-between text-xs text-amber-900">
          <span>Are you sure you want to clear the active conversation transcript?</span>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowClearConfirm(false)}
              className="px-3 py-1 rounded bg-white border border-slate-200 text-slate-700 hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              onClick={handleClearSession}
              className="px-3 py-1 rounded bg-red-600 text-white font-medium hover:bg-red-700"
            >
              Confirm Clear
            </button>
          </div>
        </div>
      )}

      {/* Two Input Panels Split */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
        {/* PANEL A: Sign Language User */}
        <div className="bg-white border border-blue-200 rounded-xl p-5 space-y-4 shadow-2xs">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-xs">
                A
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900">Panel A: Sign-Language User</h3>
                <p className="text-[11px] text-slate-500">Camera landmark detection & manual confirmation</p>
              </div>
            </div>

            <button
              onClick={() => onNavigate('library')}
              className="text-xs text-blue-600 hover:text-blue-800 flex items-center gap-1"
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span>Signs</span>
            </button>
          </div>

          {/* Camera Frame */}
          <div className="relative aspect-4/3 w-full bg-slate-900 rounded-lg overflow-hidden border border-slate-200 flex items-center justify-center">
            <video
              ref={videoRef}
              playsInline
              muted
              className={`w-full h-full object-cover transform -scale-x-100 ${
                isCameraActive ? 'block' : 'hidden'
              }`}
            />
            <canvas
              ref={canvasRef}
              className={`absolute inset-0 w-full h-full pointer-events-none z-10 ${
                isCameraActive ? 'block' : 'hidden'
              }`}
            />

            {!isCameraActive && (
              <div className="text-center p-6 space-y-2">
                <VideoOff className="w-8 h-8 text-slate-500 mx-auto" />
                <p className="text-xs text-slate-400">Webcam inactive</p>
              </div>
            )}
          </div>

          {cameraError && (
            <p className="text-xs text-red-600 bg-red-50 p-2 rounded border border-red-200">
              {cameraError}
            </p>
          )}

          {/* Controls */}
          <div className="flex items-center justify-between gap-2">
            <button
              onClick={toggleCamera}
              className={`px-4 py-2 rounded-lg text-xs font-medium flex items-center gap-2 transition-colors ${
                isCameraActive
                  ? 'bg-red-600 hover:bg-red-700 text-white'
                  : 'bg-blue-600 hover:bg-blue-700 text-white'
              }`}
            >
              {isCameraActive ? <VideoOff className="w-3.5 h-3.5" /> : <Video className="w-3.5 h-3.5" />}
              <span>{isCameraActive ? 'Stop Camera' : 'Start Camera'}</span>
            </button>

            {/* Quick Test Simulator Button */}
            <button
              onClick={() => {
                const signs = ['namaste', 'thank_you', 'stop', 'good'];
                const randomSign = signs[Math.floor(Math.random() * signs.length)];
                if (visionControllerRef.current) {
                  const pred = visionControllerRef.current.simulateSign(randomSign);
                  setCandidateSign(pred.signName);
                  setCandidateConf(pred.confidence);
                } else {
                  setCandidateSign(randomSign === 'namaste' ? 'Namaste' : randomSign === 'thank_you' ? 'Thank You' : 'Good');
                  setCandidateConf(0.94);
                }
              }}
              className="px-2.5 py-2 text-xs bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition-colors font-medium"
              title="Simulate ISL gesture"
            >
              Simulate Gesture
            </button>
          </div>

          {/* Candidate Output Box */}
          <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 space-y-2">
            <div className="flex items-center justify-between text-xs text-slate-500">
              <span>Predicted Gesture:</span>
              {isUncertain && (
                <span className="text-amber-700 font-semibold text-[11px]">
                  Uncertain sign — please repeat
                </span>
              )}
            </div>

            <div className="flex items-center justify-between gap-2">
              <span className="text-base font-bold text-slate-900">
                {candidateSign || (isCameraActive ? 'Waiting for stable gesture...' : 'No sign active')}
              </span>
              {candidateConf > 0 && (
                <span className="text-xs font-mono tabular-nums text-blue-700 bg-blue-50 px-2 py-0.5 rounded">
                  {(candidateConf * 100).toFixed(0)}% conf
                </span>
              )}
            </div>

            {/* Manual correction fallback input */}
            <input
              type="text"
              value={signerManualInput}
              onChange={(e) => setSignerManualInput(e.target.value)}
              placeholder="Or type/correct message here..."
              className="w-full text-xs px-2.5 py-1.5 border border-slate-200 rounded bg-white focus-visible:ring-2 focus-visible:ring-blue-500"
            />

            <div className="flex items-center gap-2 pt-1">
              <button
                disabled={!candidateSign && !signerManualInput}
                onClick={() => handleConfirmSignMessage(false)}
                className="flex-1 py-1.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-40 text-white rounded text-xs font-medium transition-colors shadow-2xs"
              >
                Send to Chat
              </button>
              <button
                disabled={!candidateSign && !signerManualInput}
                onClick={() => handleConfirmSignMessage(true)}
                className="py-1.5 px-3 bg-blue-50 hover:bg-blue-100 text-blue-700 disabled:opacity-40 rounded text-xs font-medium flex items-center gap-1"
                title="Speak message aloud to hearing partner"
              >
                <Volume2 className="w-3.5 h-3.5" />
                <span>Send & Speak</span>
              </button>
            </div>
          </div>
        </div>

        {/* PANEL B: Hearing Companion User */}
        <div className="bg-white border border-emerald-200 rounded-xl p-5 space-y-4 shadow-2xs">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-xs">
                B
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900">Panel B: Hearing User</h3>
                <p className="text-[11px] text-slate-500">Live speech captions & audio synthesis</p>
              </div>
            </div>

            <div className="flex items-center gap-1.5 text-xs text-slate-500">
              <span className={`w-2 h-2 rounded-full ${isMicActive ? 'bg-red-500 animate-pulse' : 'bg-slate-300'}`} />
              <span>{isMicActive ? 'Listening' : 'Paused'}</span>
            </div>
          </div>

          {/* Hearing Microphone Controls */}
          <div className="flex items-center gap-3">
            <button
              onClick={toggleMic}
              className={`px-4 py-2 rounded-lg text-xs font-medium flex items-center gap-2 transition-colors ${
                isMicActive
                  ? 'bg-red-600 hover:bg-red-700 text-white animate-pulse'
                  : 'bg-emerald-600 hover:bg-emerald-700 text-white'
              }`}
            >
              {isMicActive ? <MicOff className="w-3.5 h-3.5" /> : <Mic className="w-3.5 h-3.5" />}
              <span>{isMicActive ? 'Pause Mic' : 'Record Voice'}</span>
            </button>

            <span className="text-xs text-slate-500">
              {isMicActive ? 'Speak into microphone...' : 'Press to transcribe speech.'}
            </span>
          </div>

          {micError && (
            <p className="text-xs text-red-600 bg-red-50 p-2 rounded border border-red-200">
              {micError}
            </p>
          )}

          {/* Draft Voice Input Area */}
          <div className="space-y-2">
            <label className="text-xs font-medium text-slate-600">
              Speech Transcript / Editable Input:
            </label>
            <textarea
              rows={4}
              value={hearingDraft}
              onChange={(e) => setHearingDraft(e.target.value)}
              placeholder="Spoken words appear here automatically, or you can type directly..."
              className="w-full text-xs p-3 border border-slate-200 rounded-lg bg-slate-50/50 focus-visible:ring-2 focus-visible:ring-emerald-500 resize-none"
            />
            {interimHearingText && (
              <p className="text-[11px] text-slate-400 italic">
                Hearing interim: "{interimHearingText}"
              </p>
            )}
          </div>

          <div className="flex items-center justify-end gap-2">
            <button
              onClick={() => {
                setHearingDraft('');
                setInterimHearingText('');
              }}
              className="px-3 py-1.5 text-xs text-slate-600 hover:text-slate-800"
            >
              Clear Draft
            </button>
            <button
              disabled={!hearingDraft.trim()}
              onClick={handleSendHearingMessage}
              className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-40 text-white rounded text-xs font-medium flex items-center gap-1.5 shadow-2xs"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Send Message</span>
            </button>
          </div>
        </div>
      </div>

      {/* Synchronized Conversation Timeline */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <h3 className="text-sm font-bold text-slate-900">Conversation Timeline</h3>
          <span className="text-xs text-slate-500 font-mono tabular-nums">
            {messages.length} message{messages.length !== 1 ? 's' : ''} in session
          </span>
        </div>

        <div className="space-y-3 min-h-64 max-h-96 overflow-y-auto pr-2">
          {messages.length === 0 ? (
            <div className="text-center py-12 text-xs text-slate-400">
              No messages yet in this session. Send a sign from Panel A or voice caption from Panel B.
            </div>
          ) : (
            messages.map((msg) => {
              const isSigner = msg.sender === 'signer';
              return (
                <div
                  key={msg.id}
                  className={`p-3.5 rounded-xl border flex flex-col gap-1 transition-all ${
                    isSigner
                      ? 'bg-blue-50/70 border-blue-200 mr-8'
                      : 'bg-emerald-50/70 border-emerald-200 ml-8'
                  }`}
                >
                  <div className="flex items-center justify-between text-xs">
                    <span className={`font-semibold ${isSigner ? 'text-blue-900' : 'text-emerald-900'}`}>
                      {isSigner ? 'Signer (ISL User)' : 'Hearing Companion'}
                    </span>
                    <span className="text-[11px] text-slate-400 font-mono">{msg.timestamp}</span>
                  </div>

                  <p className={`font-medium ${getTextScaleClass()} ${isSigner ? 'text-blue-950' : 'text-emerald-950'}`}>
                    {msg.text}
                  </p>

                  <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1 border-t border-black/5 mt-1">
                    {msg.confidence ? (
                      <span className="font-mono tabular-nums text-slate-500">
                        Confidence: {(msg.confidence * 100).toFixed(0)}%
                      </span>
                    ) : (
                      <span>Direct Transcript</span>
                    )}

                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => speakText(msg.text)}
                        className="text-slate-500 hover:text-slate-800 flex items-center gap-1"
                        title="Read message aloud"
                      >
                        <Volume2 className="w-3.5 h-3.5" />
                        <span>Play Audio</span>
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
