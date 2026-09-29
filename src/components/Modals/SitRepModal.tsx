/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { X, Printer, Download, ShieldAlert, FileText, CheckCircle2 } from 'lucide-react';
import { TimeStepData, CriticalAsset, GeminiMultimodalAssessment } from '../../types/disaster';

interface SitRepModalProps {
  isOpen: boolean;
  onClose: () => void;
  stepData: TimeStepData;
  assets: CriticalAsset[];
  assessment: GeminiMultimodalAssessment | null;
}

export const SitRepModal: React.FC<SitRepModalProps> = ({
  isOpen,
  onClose,
  stepData,
  assets,
  assessment,
}) => {
  if (!isOpen) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-3xl rounded-2xl bg-slate-900 border border-slate-700/80 shadow-2xl p-6 text-slate-100 font-mono-tactical my-8 animate-in fade-in zoom-in-95 duration-200">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-4 mb-5">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400">
              <FileText className="w-6 h-6" />
            </div>
            <div>
              <div className="text-[10px] text-cyan-400 uppercase tracking-wider font-bold">
                OFFICIAL SITUATION REPORT (SITREP)
              </div>
              <h2 className="text-lg font-bold font-display text-white">
                Cyclone VARUNA Operational Briefing — {stepData.id}
              </h2>
            </div>
          </div>

          <button
            onClick={handlePrint}
            className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-xs text-slate-200"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Print / PDF</span>
          </button>
        </div>

        {/* Executive Summary Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-5 text-xs">
          <div className="p-3 rounded-lg bg-slate-950 border border-slate-800">
            <div className="text-slate-400 text-[10px]">Storm Phase</div>
            <div className="text-base font-bold text-red-400">{stepData.stormCategory.split(' (')[0]}</div>
          </div>
          <div className="p-3 rounded-lg bg-slate-950 border border-slate-800">
            <div className="text-slate-400 text-[10px]">Peak Wind</div>
            <div className="text-base font-bold text-amber-300">{stepData.windSpeedKmh} km/h</div>
          </div>
          <div className="p-3 rounded-lg bg-slate-950 border border-slate-800">
            <div className="text-slate-400 text-[10px]">Surge Elevation</div>
            <div className="text-base font-bold text-blue-300">+{stepData.stormSurgeMeters}m MSL</div>
          </div>
          <div className="p-3 rounded-lg bg-slate-950 border border-slate-800">
            <div className="text-slate-400 text-[10px]">Evacuated</div>
            <div className="text-base font-bold text-emerald-400">{stepData.evacuationCompliancePct}%</div>
          </div>
        </div>

        {/* AI Multimodal Assessment Synthesis */}
        {assessment && (
          <div className="mb-5 p-4 rounded-xl bg-slate-950 border border-cyan-500/30 text-xs">
            <div className="flex items-center justify-between mb-2">
              <span className="font-bold text-cyan-300 uppercase tracking-wider">
                Gemini 3.7 Flash Tactical Impact Assessment
              </span>
              <span className="px-2 py-0.5 rounded text-[10px] bg-red-500/20 text-red-300 border border-red-500/40">
                Score: {assessment.vulnerabilityScore}% ({assessment.threatLevel})
              </span>
            </div>
            <p className="text-slate-300 leading-relaxed font-sans mb-3">
              {assessment.naturalLanguageExplanation}
            </p>
            <div className="text-[11px] font-bold text-slate-400 uppercase mb-1">Pre-Landfall Directives:</div>
            <ul className="space-y-1.5 text-[11px] text-slate-300">
              {assessment.preLandfallActionItems.map((item) => (
                <li key={item.id} className="flex items-start gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400 shrink-0 mt-0.5" />
                  <span><strong>[Within {item.deadlineHours}h]:</strong> {item.action} <em>({item.assignedAgency})</em></span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Critical Asset Status Summary */}
        <div className="mb-5 text-xs">
          <div className="text-slate-400 font-bold uppercase mb-2">Critical Infrastructure Status</div>
          <div className="space-y-1.5">
            {assets.map((asset) => (
              <div key={asset.id} className="p-2.5 rounded-lg bg-slate-950 border border-slate-800 flex items-center justify-between">
                <div>
                  <span className="font-semibold text-slate-200">{asset.name}</span>
                  <div className="text-[10px] text-slate-500">{asset.description}</div>
                </div>
                <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase shrink-0 ${
                  asset.status === 'Critical' ? 'bg-red-500/20 text-red-300 border border-red-500/40' :
                  asset.status === 'Warning' ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40' :
                  asset.status === 'Blocked' ? 'bg-red-900/40 text-red-300 border border-red-700/50' :
                  'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                }`}>
                  {asset.status}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="pt-4 border-t border-slate-800 flex items-center justify-between text-[11px] text-slate-500">
          <span>Official Distribution: NDMA, APSDMA, Coast Guard District 6</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
