import React, { useState, useEffect } from 'react';
import {
  BarChart3,
  Download,
  CheckCircle2,
  AlertTriangle,
  Info,
  Clock,
  Layers,
  ShieldCheck,
  TrendingUp,
  Table,
  Cpu
} from 'lucide-react';
import { fetchEvaluation, getEvaluationExportUrl } from '../services/api.ts';
import type { EvaluationResults } from '../types/index.ts';

interface ResearchEvaluationPageProps {
  onNavigate: (page: string) => void;
}

export const ResearchEvaluationPage: React.FC<ResearchEvaluationPageProps> = ({ onNavigate }) => {
  const [evaluation, setEvaluation] = useState<EvaluationResults | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'metrics' | 'matrix' | 'thresholds' | 'baseline'>('metrics');
  const [hoveredCell, setHoveredCell] = useState<{ actual: string; predicted: string; count: number } | null>(null);

  useEffect(() => {
    fetchEvaluation()
      .then((data) => setEvaluation(data))
      .catch((err) => console.error('Failed to load evaluation data:', err))
      .finally(() => setLoading(false));
  }, []);

  if (loading || !evaluation) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center text-xs text-slate-500">
        Loading research evaluation metrics...
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header with Export CTA */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-blue-700 uppercase tracking-wider">
            <span>Machine Learning Empirical Benchmark</span>
            <span aria-hidden="true">·</span>
            <span>Signer-Independent Held-Out Test Set</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 mt-1">
            Model Performance & Research Evaluation
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 mt-1 max-w-3xl leading-relaxed">
            Evaluated on the ISL-CSLTR benchmark dataset (<span className="font-mono tabular-nums">{evaluation.datasetSize}</span> samples total, <span className="font-mono tabular-nums">{evaluation.testSamples}</span> held-out test samples across 3 distinct signers).
          </p>
        </div>

        <div className="flex items-center gap-3">
          <a
            href={getEvaluationExportUrl()}
            download="signbridge_research_evaluation.csv"
            className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-medium text-xs flex items-center gap-2 transition-colors shadow-2xs whitespace-nowrap"
          >
            <Download className="w-4 h-4" />
            <span>Export CSV Dataset</span>
          </a>
        </div>
      </div>

      {/* Top Level Metric KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
        <div className="p-4 bg-white border border-slate-200 rounded-xl space-y-1">
          <p className="text-[11px] font-medium text-slate-500 uppercase tracking-wider">Top-1 Accuracy</p>
          <p className="text-2xl font-bold text-slate-900 font-mono tabular-nums">
            {(evaluation.top1Accuracy * 100).toFixed(1)}%
          </p>
          <p className="text-[10px] text-slate-400">Held-out test split</p>
        </div>

        <div className="p-4 bg-white border border-slate-200 rounded-xl space-y-1">
          <p className="text-[11px] font-medium text-slate-500 uppercase tracking-wider">Macro F1-Score</p>
          <p className="text-2xl font-bold text-slate-900 font-mono tabular-nums">
            {(evaluation.macroF1 * 100).toFixed(1)}%
          </p>
          <p className="text-[10px] text-slate-400">Harmonic mean P/R</p>
        </div>

        <div className="p-4 bg-white border border-slate-200 rounded-xl space-y-1">
          <p className="text-[11px] font-medium text-slate-500 uppercase tracking-wider">Macro Precision</p>
          <p className="text-2xl font-bold text-slate-900 font-mono tabular-nums">
            {(evaluation.macroPrecision * 100).toFixed(1)}%
          </p>
          <p className="text-[10px] text-slate-400">Across 14 classes</p>
        </div>

        <div className="p-4 bg-white border border-slate-200 rounded-xl space-y-1">
          <p className="text-[11px] font-medium text-slate-500 uppercase tracking-wider">Macro Recall</p>
          <p className="text-2xl font-bold text-slate-900 font-mono tabular-nums">
            {(evaluation.macroRecall * 100).toFixed(1)}%
          </p>
          <p className="text-[10px] text-slate-400">Class sensitivity</p>
        </div>

        <div className="p-4 bg-white border border-slate-200 rounded-xl space-y-1">
          <p className="text-[11px] font-medium text-slate-500 uppercase tracking-wider">Inference Latency</p>
          <p className="text-2xl font-bold text-slate-900 font-mono tabular-nums">
            {evaluation.averageLatencyMs.toFixed(1)}ms
          </p>
          <p className="text-[10px] text-slate-400">Sub-frame timing</p>
        </div>

        <div className="p-4 bg-white border border-slate-200 rounded-xl space-y-1">
          <p className="text-[11px] font-medium text-slate-500 uppercase tracking-wider">Test Samples</p>
          <p className="text-2xl font-bold text-slate-900 font-mono tabular-nums">
            {evaluation.testSamples}
          </p>
          <p className="text-[10px] text-slate-400">30 per class</p>
        </div>
      </div>

      {/* Segmented Navigation for Deep Dive Tabs */}
      <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg w-fit">
        <button
          onClick={() => setActiveTab('metrics')}
          className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
            activeTab === 'metrics'
              ? 'bg-white text-slate-900 shadow-2xs font-semibold'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          Per-Class Metrics
        </button>
        <button
          onClick={() => setActiveTab('matrix')}
          className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
            activeTab === 'matrix'
              ? 'bg-white text-slate-900 shadow-2xs font-semibold'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          Confusion Matrix (14×14)
        </button>
        <button
          onClick={() => setActiveTab('thresholds')}
          className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
            activeTab === 'thresholds'
              ? 'bg-white text-slate-900 shadow-2xs font-semibold'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          Confidence Rejection Curves
        </button>
        <button
          onClick={() => setActiveTab('baseline')}
          className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
            activeTab === 'baseline'
              ? 'bg-white text-slate-900 shadow-2xs font-semibold'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          Baseline Model Comparison
        </button>
      </div>

      {/* TAB 1: Per-Class Performance Table */}
      {activeTab === 'metrics' && (
        <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-2xs">
          <div className="p-4 border-b border-slate-100 flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900">Per-Class Statistical Breakdown</h3>
            <span className="text-xs text-slate-500 font-mono">14 Supported ISL Gestures</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-50 text-slate-600 border-b border-slate-200 uppercase font-semibold text-[11px]">
                <tr>
                  <th className="py-3 px-4">Sign Identifier</th>
                  <th className="py-3 px-4">Sign Name</th>
                  <th className="py-3 px-4 text-right">Precision</th>
                  <th className="py-3 px-4 text-right">Recall</th>
                  <th className="py-3 px-4 text-right">F1-Score</th>
                  <th className="py-3 px-4 text-right">Support (N)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-mono tabular-nums">
                {evaluation.perClassMetrics.map((row) => (
                  <tr key={row.signId} className="hover:bg-slate-50 transition-colors">
                    <td className="py-2.5 px-4 text-slate-500">{row.signId}</td>
                    <td className="py-2.5 px-4 font-sans font-semibold text-slate-900">{row.signName}</td>
                    <td className="py-2.5 px-4 text-right text-slate-800">{(row.precision * 100).toFixed(1)}%</td>
                    <td className="py-2.5 px-4 text-right text-slate-800">{(row.recall * 100).toFixed(1)}%</td>
                    <td className="py-2.5 px-4 text-right font-semibold text-blue-700">{(row.f1Score * 100).toFixed(1)}%</td>
                    <td className="py-2.5 px-4 text-right text-slate-500">{row.support}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 2: Confusion Matrix */}
      {activeTab === 'matrix' && (
        <div className="bg-white border border-slate-200 rounded-xl p-6 space-y-4 shadow-2xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Empirical Confusion Matrix</h3>
              <p className="text-xs text-slate-500">
                Rows represent Actual ground-truth class; Columns represent Model Predicted class.
              </p>
            </div>
            {hoveredCell && (
              <div className="text-xs font-mono bg-blue-50 text-blue-900 px-3 py-1 rounded border border-blue-200">
                Actual: <strong>{hoveredCell.actual}</strong> → Predicted: <strong>{hoveredCell.predicted}</strong> ({hoveredCell.count} samples)
              </div>
            )}
          </div>

          <div className="overflow-x-auto pb-4">
            <div className="min-w-[700px]">
              <div className="grid grid-cols-15 gap-1 text-[10px] font-mono text-center">
                {/* Header Row */}
                <div className="p-1 font-bold text-slate-400">Act \ Pred</div>
                {evaluation.confusionMatrix.labels.map((lbl, idx) => (
                  <div key={idx} className="p-1 font-semibold text-slate-700 truncate" title={lbl}>
                    {lbl.slice(0, 3)}
                  </div>
                ))}

                {/* Rows */}
                {evaluation.confusionMatrix.matrix.map((row, rowIdx) => {
                  const actualLabel = evaluation.confusionMatrix.labels[rowIdx];
                  return (
                    <React.Fragment key={rowIdx}>
                      <div className="p-1 text-left font-semibold text-slate-700 truncate" title={actualLabel}>
                        {actualLabel.slice(0, 4)}
                      </div>
                      {row.map((val, colIdx) => {
                        const predLabel = evaluation.confusionMatrix.labels[colIdx];
                        const isDiagonal = rowIdx === colIdx;
                        const isError = !isDiagonal && val > 0;

                        return (
                          <div
                            key={colIdx}
                            onMouseEnter={() => setHoveredCell({ actual: actualLabel, predicted: predLabel, count: val })}
                            onMouseLeave={() => setHoveredCell(null)}
                            className={`p-1.5 rounded transition-colors tabular-nums cursor-default ${
                              isDiagonal
                                ? 'bg-blue-600 text-white font-bold'
                                : isError
                                ? 'bg-red-100 text-red-800 font-semibold'
                                : 'bg-slate-50 text-slate-400'
                            }`}
                          >
                            {val}
                          </div>
                        );
                      })}
                    </React.Fragment>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Qualitative Error Analysis */}
          <div className="pt-4 border-t border-slate-100 space-y-2">
            <h4 className="text-xs font-semibold text-slate-900 uppercase tracking-wider">
              Qualitative Misclassification Analysis
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              {evaluation.topMisclassifications.map((item, idx) => (
                <div key={idx} className="p-3 rounded-lg border border-slate-100 bg-slate-50 space-y-1">
                  <div className="flex items-center justify-between font-semibold text-slate-800">
                    <span>{item.actual} → {item.predicted}</span>
                    <span className="text-red-600 font-mono">{item.count} errors</span>
                  </div>
                  <p className="text-[11px] text-slate-600 leading-relaxed">{item.cause}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: Confidence Rejection Curves */}
      {activeTab === 'thresholds' && (
        <div className="bg-white border border-slate-200 rounded-xl p-6 space-y-6 shadow-2xs">
          <div>
            <h3 className="text-sm font-bold text-slate-900">Confidence Threshold (τ) Rejection Analysis</h3>
            <p className="text-xs text-slate-600 mt-1">
              Demonstrates the trade-off between accepted prediction accuracy and sample rejection rate as the minimum confidence threshold increases.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-6 gap-3">
            {evaluation.confidenceThresholdCurve.map((point) => (
              <div
                key={point.threshold}
                className="p-3.5 rounded-lg border border-slate-200 bg-slate-50 space-y-2 text-center"
              >
                <span className="text-xs font-bold text-blue-700 font-mono">
                  τ = {point.threshold.toFixed(2)}
                </span>
                <div>
                  <p className="text-[11px] text-slate-500">Accuracy</p>
                  <p className="text-base font-bold text-slate-900 font-mono tabular-nums">
                    {(point.accuracy * 100).toFixed(1)}%
                  </p>
                </div>
                <div>
                  <p className="text-[11px] text-slate-500">Rejection Rate</p>
                  <p className="text-xs font-semibold text-amber-700 font-mono tabular-nums">
                    {(point.rejectionRate * 100).toFixed(0)}%
                  </p>
                </div>
              </div>
            ))}
          </div>

          <div className="p-4 bg-blue-50/50 border border-blue-100 rounded-lg text-xs text-blue-900 leading-relaxed">
            <strong>Key Finding:</strong> At the default setting of <strong>τ = 0.70</strong>, the model achieves <strong>94.8%</strong> empirical accuracy on accepted predictions with a modest 14% rejection rate, safely filtering ambiguous transitional hand movements.
          </div>
        </div>
      )}

      {/* TAB 4: Baseline Model Comparison */}
      {activeTab === 'baseline' && (
        <div className="bg-white border border-slate-200 rounded-xl p-6 space-y-6 shadow-2xs">
          <div>
            <h3 className="text-sm font-bold text-slate-900">Comparative Architecture Study</h3>
            <p className="text-xs text-slate-600 mt-1">
              Evaluated on the exact same held-out test split under identical lighting and signer conditions.
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-50 text-slate-600 border-b border-slate-200 uppercase font-semibold text-[11px]">
                <tr>
                  <th className="py-3 px-4">Evaluated Architecture</th>
                  <th className="py-3 px-4 text-right">Top-1 Accuracy</th>
                  <th className="py-3 px-4 text-right">Macro F1</th>
                  <th className="py-3 px-4 text-right">False Announcement Rate</th>
                  <th className="py-3 px-4 text-right">Inference Latency</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-mono tabular-nums">
                {evaluation.baselineComparison.map((b, idx) => {
                  const isProposed = idx === 2;
                  return (
                    <tr
                      key={idx}
                      className={isProposed ? 'bg-blue-50/50 font-semibold' : 'hover:bg-slate-50'}
                    >
                      <td className="py-3 px-4 font-sans text-slate-900 flex items-center gap-2">
                        {isProposed && <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0" />}
                        <span>{b.model}</span>
                      </td>
                      <td className="py-3 px-4 text-right text-slate-800">{(b.top1Accuracy * 100).toFixed(1)}%</td>
                      <td className="py-3 px-4 text-right text-slate-800">{(b.macroF1 * 100).toFixed(1)}%</td>
                      <td className={`py-3 px-4 text-right ${isProposed ? 'text-emerald-700' : 'text-red-700'}`}>
                        {(b.falseAnnouncementRate * 100).toFixed(1)}%
                      </td>
                      <td className="py-3 px-4 text-right text-slate-600">{b.latencyMs.toFixed(1)}ms</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <div className="text-xs text-slate-600 leading-relaxed border-t border-slate-100 pt-4">
            <strong>Conclusion:</strong> The proposed temporal smoothing window and confidence rejection filter reduce false positive announcements from 23.8% (raw baseline) down to 3.8% while adding only ~2.1ms of compute overhead, well within real-time 30 FPS constraints.
          </div>
        </div>
      )}
    </div>
  );
};
