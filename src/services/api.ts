import type {
  ISLSign,
  PredictionResult,
  SavedPhrase,
  EvaluationResults,
  UserPreferences,
  UserProfile
} from '../types/index.ts';

const BASE_URL = '/api';

export async function fetchHealth() {
  const res = await fetch(`${BASE_URL}/health`);
  if (!res.ok) throw new Error('Health check failed');
  return res.json();
}

export async function fetchModelStatus() {
  const res = await fetch(`${BASE_URL}/model/status`);
  if (!res.ok) throw new Error('Failed to fetch model status');
  return res.json();
}

export async function fetchSigns(category?: string, search?: string): Promise<{ count: number; total: number; signs: ISLSign[] }> {
  const params = new URLSearchParams();
  if (category && category !== 'All') params.set('category', category);
  if (search) params.set('search', search);

  const res = await fetch(`${BASE_URL}/signs?${params.toString()}`);
  if (!res.ok) throw new Error('Failed to load signs');
  return res.json();
}

export async function fetchSignById(id: string): Promise<ISLSign> {
  const res = await fetch(`${BASE_URL}/signs/${encodeURIComponent(id)}`);
  if (!res.ok) throw new Error('Sign not found');
  return res.json();
}

export async function recognizeLandmarks(
  landmarks: { x: number; y: number; z: number }[],
  handedness = 'Right',
  minConfidenceThreshold = 0.70
): Promise<PredictionResult> {
  const res = await fetch(`${BASE_URL}/recognize`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ landmarks, handedness, minConfidenceThreshold })
  });
  if (!res.ok) throw new Error('Inference request failed');
  return res.json();
}

export async function fetchHistory(search?: string, source?: string): Promise<{ count: number; items: SavedPhrase[] }> {
  const params = new URLSearchParams();
  if (search) params.set('search', search);
  if (source) params.set('source', source);

  const res = await fetch(`${BASE_URL}/history?${params.toString()}`);
  if (!res.ok) throw new Error('Failed to fetch history');
  return res.json();
}

export async function savePhrase(data: {
  text: string;
  source: 'sign' | 'speech' | 'manual';
  confidence?: number;
  category?: string;
  notes?: string;
}): Promise<SavedPhrase> {
  const res = await fetch(`${BASE_URL}/history`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  if (!res.ok) throw new Error('Failed to save phrase');
  return res.json();
}

export async function deletePhrase(id: string): Promise<void> {
  const res = await fetch(`${BASE_URL}/history/${encodeURIComponent(id)}`, {
    method: 'DELETE'
  });
  if (!res.ok) throw new Error('Failed to delete phrase');
}

export async function clearAllHistory(): Promise<void> {
  const res = await fetch(`${BASE_URL}/history`, {
    method: 'DELETE'
  });
  if (!res.ok) throw new Error('Failed to clear history');
}

export async function fetchEvaluation(): Promise<EvaluationResults> {
  const res = await fetch(`${BASE_URL}/evaluation`);
  if (!res.ok) throw new Error('Failed to load evaluation metrics');
  return res.json();
}

export function getEvaluationExportUrl(): string {
  return `${BASE_URL}/evaluation/export`;
}

export async function fetchPreferences(): Promise<UserPreferences> {
  const res = await fetch(`${BASE_URL}/preferences`);
  if (!res.ok) throw new Error('Failed to load preferences');
  return res.json();
}

export async function savePreferences(prefs: Partial<UserPreferences>): Promise<UserPreferences> {
  const res = await fetch(`${BASE_URL}/preferences`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(prefs)
  });
  if (!res.ok) throw new Error('Failed to save preferences');
  return res.json();
}

export async function loginUser(email: string): Promise<{ user: UserProfile; token: string }> {
  const res = await fetch(`${BASE_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email })
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || 'Login failed');
  }
  return res.json();
}

export async function registerUser(name: string, email: string, role: string): Promise<{ user: UserProfile; token: string }> {
  const res = await fetch(`${BASE_URL}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, email, role })
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || 'Registration failed');
  }
  return res.json();
}

export async function getCurrentUser(): Promise<UserProfile> {
  const res = await fetch(`${BASE_URL}/auth/me`);
  if (!res.ok) throw new Error('Failed to get user profile');
  const data = await res.json();
  return data.user;
}
