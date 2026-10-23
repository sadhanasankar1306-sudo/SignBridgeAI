import React, { useEffect, useRef, useState } from 'react';
import {
  Video,
  VideoOff,
  AlertCircle,
  CheckCircle2,
  Volume2,
  Edit2,
  Copy,
  Trash2,
  HelpCircle,
  Sliders,
  Sparkles,
  RefreshCw,
  Layers,
  ArrowRight
} from 'lucide-react';
import { CameraVisionController, type HandLandmark } from '../services/vision.ts';
import { TemporalSmoother } from '../../ml/model.ts';
import { speakText, isSpeechSynthesisSupported } from '../services/speech.ts';
import { savePhrase, fetchSigns } from '../services/api.ts';
import type { PredictionResult, ISLSign } from '../types/index.ts';

interface SignRecognitionPageProps {
  onNavigate: (page: string) => void;
}

export const SignRecognitionPage: React.FC<SignRecognitionPageProps> = ({ onNavigate }) => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const controllerRef = useRef<CameraVisionController | null>(null);
  const smootherRef = useRef<TemporalSmoother>(new TemporalSmoother(7, 1200, 0.70));

  const [isCameraActive, setIsCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [minConfidence, setMinConfidence] = useState<number>(0.70);
  const [currentPrediction, setCurrentPrediction] = useState<PredictionResult | null>(null);
  const [smoothedResult, setSmoothedResult] = useState<{
    stableSignId: string;
    stableSignName: string;
    stableConfidence: number;
    isAnnounceReady: boolean;
    isUncertain: boolean;
    reason?: string;
  } | null>(null);

  const [confirmedPhrase, setConfirmedPhrase] = useState<string>('');
  const [manualText, setManualText] = useState<string>('');
  const [isEditing, setIsEditing] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [supportedSigns, setSupportedSigns] = useState<ISLSign[]>([]);
  const [simulatedSign, setSimulatedSign] = useState<string>('namaste');

  useEffect(() => {
    fetchSigns().then(res => setSupportedSigns(res.signs)).catch(() => {});

    return () => {
      // Clean up camera on unmount
      if (controllerRef.current) {
        controllerRef.current.stopCamera();
      }
    };
  }, []);

  const handleStartCamera = async () => {
    setCameraError(null);
    if (!videoRef.current || !canvasRef.current) return;

    try {
      smootherRef.current.setParameters(7, 1200, minConfidence);

      const controller = new CameraVisionController(
        videoRef.current,
        canvasRef.current,
        (result, _landmarks) => {
          setCurrentPrediction(result);
          if (result.signId !== 'none') {
            const smoothed = smootherRef.current.push(result);
            setSmoothedResult(smoothed);

            // If smooth and ready, populate candidate phrase
            if (smoothed.isAnnounceReady && !smoothed.isUncertain) {
              setConfirmedPhrase(smoothed.stableSignName);
            }
          }
        },
        minConfidence
      );

      controllerRef.current = controller;
      await controller.startCamera();
      setIsCameraActive(true);
    } catch (err: any) {
      setCameraError(err.message || 'Camera initialization error');
      setIsCameraActive(false);
    }
  };

  const handleStopCamera = () => {
    if (controllerRef.current) {
      controllerRef.current.stopCamera();
      controllerRef.current = null;
    }
    smootherRef.current.reset();
    setIsCameraActive(false);
    setCurrentPrediction(null);
    setSmoothedResult(null);
  };

  const handleConfidenceChange = (val: number) => {
    setMinConfidence(val);
    if (controllerRef.current) {
      controllerRef.current.setConfidenceThreshold(val);
    }
    smootherRef.current.setParameters(7, 1200, val);
  };

  const handleSpeakPhrase = async (textToSpeak: string) => {
    if (!textToSpeak.trim()) return;
    await speakText(textToSpeak);
  };

  const handleSaveToHistory = async () => {
    const textToSave = isEditing ? manualText : confirmedPhrase;
    if (!textToSave.trim()) return;

    try {
      await savePhrase({
        text: textToSave,
        source: 'sign',
        confidence: smoothedResult?.stableConfidence,
        category: 'Live Recognition'
      });
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 2500);
    } catch (err) {
      console.error('Failed to save phrase:', err);
    }
  };

  const handleSimulateTestSign = (signId: string) => {
    setSimulatedSign(signId);
    if (!controllerRef.current && videoRef.current && canvasRef.current) {
      controllerRef.current = new CameraVisionController(
        videoRef.current,
        canvasRef.current,
        (res) => {
          setCurrentPrediction(res);
          const smoothed = smootherRef.current.push(res);
          setSmoothedResult(smoothed);
          if (smoothed.isAnnounceReady && !smoothed.isUncertain) {
            setConfirmedPhrase(smoothed.stableSignName);
          }
        },
        minConfidence
      );
    }

    if (controllerRef.current) {
      const pred = controllerRef.current.simulateSign(signId);
      const smoothed = smootherRef.current.push(pred);
      setSmoothedResult(smoothed);
      if (smoothed.isAnnounceReady && !smoothed.isUncertain) {
        setConfirmedPhrase(smoothed.stableSignName);
      }
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="border-b border-slate-200 pb-5">
        <div className="flex items-center gap-2 text-xs font-semibold text-blue-700 uppercase tracking-wider">
          <span>Vision Inference Module</span>
          <span aria-hidden="true">·</span>
          <span>Indian Sign Language</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 mt-1">
          Live Sign-to-Text Recognition
        </h1>
        <p className="text-xs sm:text-sm text-slate-600 mt-1 max-w-3xl">
          Captures 21 3D hand landmarks via MediaPipe, normalizes translation and scale, applies temporal majority smoothing, and enforces a confidence rejection threshold to avoid spurious detections.
        </p>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Video Preview and Controls (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          <div className="relative aspect-4/3 w-full bg-slate-900 rounded-xl overflow-hidden border border-slate-200 shadow-sm flex items-center justify-center">
            {/* Native Video Feed */}
            <video
              ref={videoRef}
              playsInline
              muted
              className={`w-full h-full object-cover transform -scale-x-100 ${
                isCameraActive ? 'block' : 'hidden'
              }`}
            />

            {/* Skeleton Overlay Canvas */}
            <canvas
              ref={canvasRef}
              className={`absolute inset-0 w-full h-full pointer-events-none z-10 ${
                isCameraActive ? 'block' : 'hidden'
              }`}
            />

            {/* Inactive Camera State */}
            {!isCameraActive && (
              <div className="text-center p-8 space-y-3 z-0">
                <div className="w-16 h-16 rounded-full bg-slate-800 text-slate-400 flex items-center justify-center mx-auto">
                  <VideoOff className="w-8 h-8" />
                </div>
                <h3 className="text-sm font-semibold text-white">Camera is Inactive</h3>
                <p className="text-xs text-slate-400 max-w-xs mx-auto">
                  Click 'Start Recognition' below. You will be prompted to grant webcam access.
                </p>
              </div>
            )}

            {/* Live Indicator overlay */}
            {isCameraActive && (
              <div className="absolute top-3 left-3 z-20 flex items-center gap-2 px-2.5 py-1 rounded bg-black/60 backdrop-blur-xs text-white text-[11px] font-mono">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span>Camera Stream Active</span>
              </div>
            )}
          </div>

          {/* Camera Error banner */}
          {cameraError && (
            <div className="p-3.5 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2.5 text-xs text-red-800">
              <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold">Camera Access Error</p>
                <p>{cameraError}</p>
                <p className="mt-1 text-[11px] text-red-600">
                  You can still test model inference with real pre-recorded ISL landmark vectors using the Simulator below!
                </p>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center gap-3">
            {!isCameraActive ? (
              <button
                onClick={handleStartCamera}
                className="px-5 py-2.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-medium text-xs flex items-center gap-2 transition-colors shadow-xs"
              >
                <Video className="w-4 h-4" />
                <span>Start Recognition</span>
              </button>
            ) : (
              <button
                onClick={handleStopCamera}
                className="px-5 py-2.5 rounded-lg bg-red-600 hover:bg-red-700 text-white font-medium text-xs flex items-center gap-2 transition-colors shadow-xs"
              >
                <VideoOff className="w-4 h-4" />
                <span>Stop Recognition</span>
              </button>
            )}

            {/* Diagnostic Landmark Simulator for offline/no-webcam testing */}
            <div className="flex items-center gap-2 text-xs text-slate-600 ml-auto bg-white border border-slate-200 rounded-lg p-1.5">
              <span className="font-medium text-[11px] text-slate-500 pl-1">Diagnostic Simulator:</span>
              <select
                value={simulatedSign}
                onChange={(e) => handleSimulateTestSign(e.target.value)}
                className="text-xs bg-slate-50 border border-slate-200 rounded px-2 py-1 text-slate-800"
              >
                <option value="namaste">Namaste</option>
                <option value="thank_you">Thank You</option>
                <option value="stop">Stop</option>
                <option value="good">Good</option>
              </select>
              <button
                onClick={() => handleSimulateTestSign(simulatedSign)}
                className="px-2.5 py-1 text-xs bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium rounded transition-colors"
                title="Send landmark coordinates to inference engine"
              >
                Test Pose
              </button>
            </div>
          </div>

          {/* Confidence Threshold Configuration Slider */}
          <div className="bg-white border border-slate-200 rounded-xl p-4 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sliders className="w-4 h-4 text-blue-600" />
                <span className="text-xs font-bold text-slate-900">Minimum Confidence Threshold (τ)</span>
              </div>
              <span className="text-xs font-mono tabular-nums font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded">
                {(minConfidence * 100).toFixed(0)}%
              </span>
            </div>

            <input
              type="range"
              min="0.40"
              max="0.95"
              step="0.05"
              value={minConfidence}
              onChange={(e) => handleConfidenceChange(parseFloat(e.target.value))}
              className="w-full accent-blue-600 cursor-pointer"
            />

            <div className="flex items-center justify-between text-[11px] text-slate-500">
              <span>0.40 (Sensitive / Low Precision)</span>
              <span>0.70 (Recommended Default)</span>
              <span>0.95 (Strict / High Precision)</span>
            </div>

            <p className="text-[11px] text-slate-500 border-t border-slate-100 pt-2">
              Predictions scoring below {(minConfidence * 100).toFixed(0)}% are classified as uncertain and rejected to prevent false announcements.
            </p>
          </div>
        </div>

        {/* Right Column: Prediction Results & Confirmation (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          {/* Prediction Status Card */}
          <div className="bg-white border border-slate-200 rounded-xl p-6 space-y-4 shadow-2xs">
            <h2 className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Real-Time Inference Output
            </h2>

            {/* Predicted Sign Display */}
            <div className="min-h-24 p-4 rounded-lg bg-slate-50 border border-slate-200 flex flex-col justify-center">
              {smoothedResult?.isUncertain ? (
                <div className="text-center space-y-1">
                  <span className="text-sm font-semibold text-amber-700">
                    Uncertain sign — please repeat
                  </span>
                  <p className="text-[11px] text-slate-500">
                    Confidence ({((smoothedResult?.stableConfidence || 0) * 100).toFixed(1)}%) is below threshold ({(minConfidence * 100).toFixed(0)}%).
                  </p>
                </div>
              ) : smoothedResult && smoothedResult.stableSignId !== 'none' ? (
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-slate-500">Recognized Sign</span>
                    <span className="text-[11px] font-mono text-emerald-600 font-semibold flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      Stable across 7 frames
                    </span>
                  </div>
                  <div className="text-2xl font-bold text-slate-900">
                    {smoothedResult.stableSignName}
                  </div>
                  <div className="flex items-center justify-between text-xs text-slate-600 pt-1">
                    <span>Model Confidence:</span>
                    <span className="font-mono tabular-nums font-semibold text-blue-700">
                      {(smoothedResult.stableConfidence * 100).toFixed(1)}%
                    </span>
                  </div>
                  {/* Confidence meter */}
                  <div className="w-full h-1.5 bg-slate-200 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-blue-600 transition-all duration-150"
                      style={{ width: `${smoothedResult.stableConfidence * 100}%` }}
                    />
                  </div>
                </div>
              ) : (
                <div className="text-center text-xs text-slate-400 py-4">
                  {isCameraActive ? 'Position hand in frame...' : 'Start camera to begin sign inference'}
                </div>
              )}
            </div>

            {/* Confidence vs Correctness Note */}
            <div className="flex items-start gap-2 text-[11px] text-slate-500 bg-blue-50/40 p-2.5 rounded-lg border border-blue-100">
              <HelpCircle className="w-3.5 h-3.5 text-blue-600 shrink-0 mt-0.5" />
              <p>
                <strong>Scientific Note:</strong> High model confidence indicates mathematical similarity to training landmark clusters, not a 100% guarantee of conversational correctness. Always confirm before announcing.
              </p>
            </div>
          </div>

          {/* Candidate Phrase & Confirmation Controls */}
          <div className="bg-white border border-slate-200 rounded-xl p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                User Confirmation & Speech
              </h3>
              <span className="text-[11px] text-slate-400">Manual verification</span>
            </div>

            {isEditing ? (
              <div className="space-y-2">
                <input
                  type="text"
                  value={manualText}
                  onChange={(e) => setManualText(e.target.value)}
                  className="w-full text-sm px-3 py-2 border border-slate-300 rounded-lg focus-visible:ring-2 focus-visible:ring-blue-500"
                  placeholder="Edit recognized phrase..."
                />
                <div className="flex items-center justify-end gap-2">
                  <button
                    onClick={() => setIsEditing(false)}
                    className="px-3 py-1 text-xs text-slate-600 hover:text-slate-800"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => {
                      setConfirmedPhrase(manualText);
                      setIsEditing(false);
                    }}
                    className="px-3 py-1 text-xs bg-blue-600 text-white rounded font-medium hover:bg-blue-700"
                  >
                    Apply Correction
                  </button>
                </div>
              </div>
            ) : (
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg flex items-center justify-between">
                <span className="text-sm font-semibold text-slate-800 truncate">
                  {confirmedPhrase || '(No sign confirmed yet)'}
                </span>
                {confirmedPhrase && (
                  <button
                    onClick={() => {
                      setManualText(confirmedPhrase);
                      setIsEditing(true);
                    }}
                    className="p-1 text-slate-400 hover:text-blue-600"
                    title="Edit phrase"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            )}

            {/* Speak and Save Controls */}
            <div className="flex flex-wrap items-center gap-2 pt-1">
              <button
                disabled={!confirmedPhrase}
                onClick={() => handleSpeakPhrase(confirmedPhrase)}
                className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 disabled:opacity-40 text-white font-medium text-xs flex items-center gap-1.5 transition-colors shadow-2xs"
              >
                <Volume2 className="w-3.5 h-3.5" />
                <span>Confirm & Speak Aloud</span>
              </button>

              <button
                disabled={!confirmedPhrase}
                onClick={handleSaveToHistory}
                className="px-3.5 py-2 rounded-lg bg-white border border-slate-300 hover:bg-slate-50 disabled:opacity-40 text-slate-700 font-medium text-xs flex items-center gap-1.5 transition-colors"
              >
                <span>Save Phrase</span>
              </button>

              <button
                disabled={!confirmedPhrase}
                onClick={() => {
                  setConfirmedPhrase('');
                  smootherRef.current.reset();
                }}
                className="p-2 text-slate-400 hover:text-red-600 rounded-lg hover:bg-slate-100 disabled:opacity-40"
                title="Clear phrase"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>

            {saveSuccess && (
              <div className="text-xs text-emerald-700 flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Phrase persisted to database successfully.</span>
              </div>
            )}
          </div>

          {/* Quick link to library */}
          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-slate-900">Supported Vocabulary Guide</p>
              <p className="text-[11px] text-slate-500">Need help performing signs correctly?</p>
            </div>
            <button
              onClick={() => onNavigate('library')}
              className="text-xs font-semibold text-blue-600 hover:text-blue-800 flex items-center gap-1"
            >
              Sign Library <ArrowRight className="w-3 h-3" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
