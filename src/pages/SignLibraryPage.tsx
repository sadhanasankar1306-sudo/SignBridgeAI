import React, { useState, useEffect } from 'react';
import {
  Search,
  BookOpen,
  CheckCircle2,
  Filter,
  ExternalLink,
  Info,
  Layers,
  ArrowRight,
  Hand
} from 'lucide-react';
import { fetchSigns } from '../services/api.ts';
import type { ISLSign } from '../types/index.ts';

interface SignLibraryPageProps {
  onNavigate: (page: string) => void;
}

export const SignLibraryPage: React.FC<SignLibraryPageProps> = ({ onNavigate }) => {
  const [signs, setSigns] = useState<ISLSign[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [activeSignModal, setActiveSignModal] = useState<ISLSign | null>(null);

  const categories = ['All', 'Greetings', 'Courtesy', 'Essential', 'Social', 'Health', 'Commands'];

  useEffect(() => {
    fetchSigns(selectedCategory, searchQuery)
      .then((res) => {
        setSigns(res.signs);
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, [selectedCategory, searchQuery]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="border-b border-slate-200 pb-5">
        <div className="flex items-center gap-2 text-xs font-semibold text-blue-700 uppercase tracking-wider">
          <span>Standardized Vocabulary Library</span>
          <span aria-hidden="true">·</span>
          <span>ISLRTC Benchmark Reference</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 mt-1">
          Indian Sign Language (ISL) Signs
        </h1>
        <p className="text-xs sm:text-sm text-slate-600 mt-1 max-w-3xl leading-relaxed">
          Search and examine the verified ISL signs currently supported by the installed MediaPipe landmark geometry model. Each entry includes performing instructions, key anatomical landmark profiles, and authoritative dataset attributions.
        </p>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
        {/* Interactive Segmented Filter Tabs (functional buttons) */}
        <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg overflow-x-auto">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 text-xs font-medium rounded-md whitespace-nowrap transition-colors ${
                selectedCategory === cat
                  ? 'bg-white text-slate-900 shadow-2xs font-semibold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Search Input */}
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search signs, meanings..."
            className="w-full text-xs pl-9 pr-4 py-2 border border-slate-200 rounded-lg focus-visible:ring-2 focus-visible:ring-blue-500 bg-white"
          />
        </div>
      </div>

      {/* Signs Cards Grid */}
      {loading ? (
        <div className="py-16 text-center text-xs text-slate-500">
          Loading signs library...
        </div>
      ) : signs.length === 0 ? (
        <div className="py-16 text-center text-xs text-slate-500 border border-dashed border-slate-200 rounded-xl">
          No signs found matching your search criteria.
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {signs.map((sign) => (
            <div
              key={sign.id}
              onClick={() => setActiveSignModal(sign)}
              className="group cursor-pointer bg-white border border-slate-200 hover:border-blue-400 rounded-xl overflow-hidden shadow-2xs hover:shadow-xs transition-all flex flex-col"
            >
              <div className="relative h-44 bg-slate-100 overflow-hidden">
                <img
                  src={sign.imagePath}
                  alt={`Instructional photo for ISL sign: ${sign.name}`}
                  className="w-full h-full object-cover group-hover:scale-103 transition-transform duration-200"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute top-2.5 right-2.5 px-2 py-0.5 rounded bg-white/90 backdrop-blur-xs text-[10px] font-mono text-slate-700">
                  {sign.twoHanded ? 'Two-Handed' : 'One-Handed'}
                </div>
              </div>

              <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
                      {sign.name}
                    </h3>
                    <span className="text-[11px] text-slate-500 font-mono">
                      {sign.category}
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                    {sign.verifiedMeaning}
                  </p>
                </div>

                <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px]">
                  <span className="text-emerald-700 font-medium flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    Model Supported
                  </span>
                  <span className="text-blue-600 font-medium group-hover:translate-x-0.5 transition-transform flex items-center gap-0.5">
                    Details <ArrowRight className="w-3 h-3" />
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Sign Detail Modal */}
      {activeSignModal && (
        <div
          className="fixed inset-0 z-50 bg-black/40 backdrop-blur-2xs flex items-center justify-center p-4 overflow-y-auto"
          onClick={() => setActiveSignModal(null)}
        >
          <div
            className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6 space-y-5 border border-slate-200 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between border-b border-slate-100 pb-4">
              <div>
                <span className="text-xs font-mono text-blue-600 uppercase tracking-wider">
                  {activeSignModal.category} Sign · {activeSignModal.twoHanded ? 'Two-Handed' : 'One-Handed'}
                </span>
                <h2 className="text-2xl font-bold text-slate-900 mt-0.5">
                  {activeSignModal.name}
                </h2>
              </div>
              <button
                onClick={() => setActiveSignModal(null)}
                className="text-slate-400 hover:text-slate-700 text-lg font-bold p-1"
                aria-label="Close modal"
              >
                ✕
              </button>
            </div>

            <div className="aspect-16/9 rounded-xl overflow-hidden bg-slate-100 border border-slate-200">
              <img
                src={activeSignModal.imagePath}
                alt={`Detailed view of ${activeSignModal.name}`}
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
            </div>

            <div className="space-y-4 text-xs">
              <div>
                <h4 className="font-semibold text-slate-900 mb-1">Verified Meaning:</h4>
                <p className="text-slate-700 leading-relaxed bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                  {activeSignModal.verifiedMeaning}
                </p>
              </div>

              <div>
                <h4 className="font-semibold text-slate-900 mb-1.5">Step-by-Step Performance Instructions:</h4>
                <ol className="list-decimal pl-4 space-y-1.5 text-slate-600 leading-relaxed">
                  {activeSignModal.instructions.map((step, idx) => (
                    <li key={idx}>{step}</li>
                  ))}
                </ol>
              </div>

              <div>
                <h4 className="font-semibold text-slate-900 mb-1">Key Landmark Geometry:</h4>
                <p className="text-slate-600 font-mono text-[11px] bg-slate-50 p-2 rounded border border-slate-100">
                  {activeSignModal.keyLandmarks}
                </p>
              </div>

              <div className="pt-2 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between text-slate-500 gap-2">
                <div>
                  <p className="font-medium text-slate-700">Attribution Source:</p>
                  <p>{activeSignModal.attribution}</p>
                </div>
                <div className="sm:text-right">
                  <p className="font-medium text-slate-700">Training Corpus:</p>
                  <p>{activeSignModal.datasetSource}</p>
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
              <button
                onClick={() => {
                  setActiveSignModal(null);
                  onNavigate('sign-recognition');
                }}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold shadow-2xs"
              >
                Practice in Camera Mode
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
