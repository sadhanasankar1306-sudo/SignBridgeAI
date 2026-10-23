export interface ISLSign {
  id: string;
  name: string;
  category: 'Greetings' | 'Courtesy' | 'Essential' | 'Social' | 'Health' | 'Commands';
  verifiedMeaning: string;
  instructions: string[];
  keyLandmarks: string;
  imagePath: string;
  attribution: string;
  datasetSource: string;
  isSupported: boolean;
  twoHanded: boolean;
}

export interface LandmarkPoint {
  x: number;
  y: number;
  z: number;
}

export interface PredictionResult {
  signId: string;
  signName: string;
  confidence: number; // 0.0 to 1.0
  isCertain: boolean;
  isSupported: boolean;
  rawDistribution: Record<string, number>;
  latencyMs: number;
  smoothedFromFrames?: number;
  timestamp: string;
}

export interface ConversationMessage {
  id: string;
  sender: 'signer' | 'hearing';
  text: string;
  confidence?: number;
  timestamp: string;
  confirmed: boolean;
}

export interface SavedPhrase {
  id: string;
  text: string;
  category?: string;
  source: 'sign' | 'speech' | 'manual';
  confidence?: number;
  createdAt: string;
  notes?: string;
}

export interface ClassMetric {
  signId: string;
  signName: string;
  precision: number;
  recall: number;
  f1Score: number;
  support: number;
}

export interface EvaluationResults {
  modelName: string;
  modelVersion: string;
  evaluationDate: string;
  datasetName: string;
  datasetSize: number;
  trainSamples: number;
  valSamples: number;
  testSamples: number;
  classesCount: number;
  top1Accuracy: number;
  macroPrecision: number;
  macroRecall: number;
  macroF1: number;
  averageLatencyMs: number;
  perClassMetrics: ClassMetric[];
  confusionMatrix: {
    labels: string[];
    matrix: number[][]; // [actual][predicted]
  };
  confidenceThresholdCurve: {
    threshold: number;
    accuracy: number;
    rejectionRate: number;
  }[];
  baselineComparison: {
    model: string;
    top1Accuracy: number;
    macroF1: number;
    falseAnnouncementRate: number;
    latencyMs: number;
  }[];
  topMisclassifications: {
    actual: string;
    predicted: string;
    count: number;
    cause: string;
  }[];
}

export interface UserPreferences {
  textScale: 'normal' | 'large' | 'extra-large';
  highContrast: boolean;
  reducedMotion: boolean;
  minConfidenceThreshold: number; // e.g. 0.70
  temporalSmoothingFrames: number; // e.g. 7
  autoSpeakConfirmed: boolean;
  ttsRate: number; // 0.5 to 1.5
  ttsPitch: number;
  soundCueOnRecognition: boolean;
}

export interface UserProfile {
  id: string;
  email: string;
  name: string;
  role: 'researcher' | 'deaf_user' | 'hearing_companion' | 'guest';
}
