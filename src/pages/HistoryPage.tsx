import React, { useState, useEffect } from 'react';
import {
  History,
  Search,
  Trash2,
  Edit2,
  Copy,
  Check,
  Download,
  Filter,
  Volume2,
  Clock,
  CheckCircle2,
  Plus
} from 'lucide-react';
import { fetchHistory, deletePhrase, clearAllHistory, savePhrase } from '../services/api.ts';
import { speakText } from '../services/speech.ts';
import type { SavedPhrase } from '../types/index.ts';

interface HistoryPageProps {
  onNavigate: (page: string) => void;
}

export const HistoryPage: React.FC<HistoryPageProps> = ({ onNavigate }) => {
  const [phrases, setPhrases] = useState<SavedPhrase[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [sourceFilter, setSourceFilter] = useState('all');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editText, setEditText] = useState('');
  const [newPhraseInput, setNewPhraseInput] = useState('');
  const [showNewModal, setShowNewModal] = useState(false);

  const loadData = async () => {
    try {
      setLoading(true);
      const res = await fetchHistory(search, sourceFilter !== 'all' ? sourceFilter : undefined);
      setPhrases(res.items);
    } catch (err) {
      console.error('Error fetching phrase history:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [search, sourceFilter]);

  const handleDelete = async (id: string) => {
    try {
      await deletePhrase(id);
      setPhrases((prev) => prev.filter((p) => p.id !== id));
    } catch (err) {
      console.error('Failed to delete phrase:', err);
    }
  };

  const handleClearAll = async () => {
    if (!window.confirm('Are you sure you want to delete all saved phrases and history? This cannot be undone.')) {
      return;
    }
    try {
      await clearAllHistory();
      setPhrases([]);
    } catch (err) {
      console.error('Failed to clear history:', err);
    }
  };

  const handleCopy = (phrase: SavedPhrase) => {
    navigator.clipboard.writeText(phrase.text);
    setCopiedId(phrase.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleExport = () => {
    const content = phrases
      .map(
        (p) =>
          `[${new Date(p.createdAt).toLocaleString()}] (${p.source.toUpperCase()}) ${p.text}`
      )
      .join('\n');

    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `signbridge_phrases_export_${new Date().toISOString().slice(0, 10)}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleCreateNew = async () => {
    if (!newPhraseInput.trim()) return;
    try {
      await savePhrase({
        text: newPhraseInput.trim(),
        source: 'manual',
        category: 'User Added'
      });
      setNewPhraseInput('');
      setShowNewModal(false);
      loadData();
    } catch (err) {
      console.error('Failed to create new phrase:', err);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-blue-700 uppercase tracking-wider">
            <span>Persistent Data Storage</span>
            <span aria-hidden="true">·</span>
            <span>SQLite Database</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 mt-1">
            Saved Phrases & Conversation History
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 mt-1 max-w-2xl">
            Only explicit user-approved transcriptions are saved here. No video frames, biometric landmarks, or audio recordings are retained.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => setShowNewModal(true)}
            className="px-3.5 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-medium text-xs flex items-center gap-1.5 transition-colors shadow-2xs"
          >
            <Plus className="w-4 h-4" />
            <span>Add Custom Phrase</span>
          </button>

          <button
            onClick={handleExport}
            disabled={phrases.length === 0}
            className="px-3 py-2 rounded-lg border border-slate-300 hover:bg-slate-50 disabled:opacity-40 text-xs font-medium text-slate-700 flex items-center gap-1.5 transition-colors"
          >
            <Download className="w-3.5 h-3.5 text-slate-500" />
            <span>Export Text</span>
          </button>

          <button
            onClick={handleClearAll}
            disabled={phrases.length === 0}
            className="px-3 py-2 rounded-lg border border-slate-300 hover:bg-red-50 hover:text-red-600 disabled:opacity-40 text-xs font-medium text-slate-600 flex items-center gap-1.5 transition-colors"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Clear All</span>
          </button>
        </div>
      </div>

      {/* Search & Filter Controls */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
        {/* Source Segmented Tabs */}
        <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg">
          <button
            onClick={() => setSourceFilter('all')}
            className={`px-3 py-1.5 text-xs font-medium rounded-md whitespace-nowrap transition-colors ${
              sourceFilter === 'all'
                ? 'bg-white text-slate-900 shadow-2xs font-semibold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            All Sources
          </button>
          <button
            onClick={() => setSourceFilter('sign')}
            className={`px-3 py-1.5 text-xs font-medium rounded-md whitespace-nowrap transition-colors ${
              sourceFilter === 'sign'
                ? 'bg-white text-slate-900 shadow-2xs font-semibold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Sign Language
          </button>
          <button
            onClick={() => setSourceFilter('speech')}
            className={`px-3 py-1.5 text-xs font-medium rounded-md whitespace-nowrap transition-colors ${
              sourceFilter === 'speech'
                ? 'bg-white text-slate-900 shadow-2xs font-semibold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Speech Captions
          </button>
        </div>

        {/* Search */}
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search saved phrases..."
            className="w-full text-xs pl-9 pr-4 py-2 border border-slate-200 rounded-lg focus-visible:ring-2 focus-visible:ring-blue-500 bg-white"
          />
        </div>
      </div>

      {/* Phrases List */}
      {loading ? (
        <div className="py-16 text-center text-xs text-slate-500">
          Loading saved phrases...
        </div>
      ) : phrases.length === 0 ? (
        <div className="py-16 text-center text-xs text-slate-500 border border-dashed border-slate-200 rounded-xl space-y-2">
          <History className="w-8 h-8 text-slate-400 mx-auto" />
          <p className="font-semibold text-slate-700">No saved phrases found</p>
          <p className="text-slate-400 max-w-sm mx-auto">
            Save recognized signs from Live Sign Recognition, spoken captions from Speech-to-Text, or add custom phrases manually.
          </p>
        </div>
      ) : (
        <div className="bg-white border border-slate-200 rounded-xl divide-y divide-slate-100 shadow-2xs overflow-hidden">
          {phrases.map((phrase) => (
            <div
              key={phrase.id}
              className="p-4 sm:p-5 hover:bg-slate-50/70 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-4"
            >
              <div className="space-y-1.5 flex-1">
                <div className="flex items-center gap-2 text-xs text-slate-500">
                  <span className="font-medium capitalize text-slate-700">
                    Source: {phrase.source}
                  </span>
                  <span aria-hidden="true">·</span>
                  <span className="font-mono tabular-nums">
                    {new Date(phrase.createdAt).toLocaleString()}
                  </span>
                  {phrase.confidence && (
                    <>
                      <span aria-hidden="true">·</span>
                      <span className="font-mono tabular-nums text-blue-700 font-semibold">
                        {(phrase.confidence * 100).toFixed(1)}% conf
                      </span>
                    </>
                  )}
                </div>

                <p className="text-sm sm:text-base font-semibold text-slate-900 leading-relaxed">
                  "{phrase.text}"
                </p>

                {phrase.notes && (
                  <p className="text-xs text-slate-500 italic">
                    Notes: {phrase.notes}
                  </p>
                )}
              </div>

              {/* Action buttons */}
              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={() => speakText(phrase.text)}
                  className="p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors"
                  title="Speak aloud"
                >
                  <Volume2 className="w-4 h-4" />
                </button>

                <button
                  onClick={() => handleCopy(phrase)}
                  className="p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors"
                  title="Copy phrase"
                >
                  {copiedId === phrase.id ? (
                    <Check className="w-4 h-4 text-emerald-600" />
                  ) : (
                    <Copy className="w-4 h-4" />
                  )}
                </button>

                <button
                  onClick={() => handleDelete(phrase.id)}
                  className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  title="Delete phrase"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* New Phrase Modal */}
      {showNewModal && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6 space-y-4 border border-slate-200 shadow-lg">
            <h3 className="text-base font-bold text-slate-900">Add Custom Phrase</h3>
            <p className="text-xs text-slate-500">
              Save a frequently used ISL communication sentence for quick reference.
            </p>

            <textarea
              rows={3}
              value={newPhraseInput}
              onChange={(e) => setNewPhraseInput(e.target.value)}
              placeholder="Enter phrase text..."
              className="w-full text-xs p-3 border border-slate-200 rounded-lg focus-visible:ring-2 focus-visible:ring-blue-500 resize-none"
            />

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setShowNewModal(false)}
                className="px-3 py-1.5 text-xs text-slate-600 hover:text-slate-800"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateNew}
                disabled={!newPhraseInput.trim()}
                className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-40 text-white rounded text-xs font-semibold"
              >
                Save to Database
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
