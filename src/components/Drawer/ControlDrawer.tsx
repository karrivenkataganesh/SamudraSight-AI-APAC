/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  Cpu, 
  ShieldAlert, 
  Building2, 
  Radio, 
  Coins, 
  CheckCircle2, 
  AlertTriangle, 
  ArrowRight, 
  Sparkles, 
  CheckSquare, 
  Square, 
  Activity, 
  Clock, 
  Flame, 
  Waves, 
  PhoneCall, 
  Layers, 
  ShieldCheck,
  TrendingUp,
  Radar
} from 'lucide-react';
import { CriticalAsset, GeminiMultimodalAssessment, TimeStepData, TimeStepId } from '../../types/disaster';

interface ControlDrawerProps {
  currentStepData: TimeStepData;
  currentTimeStep: TimeStepId;
  selectedAsset: CriticalAsset;
  onSelectAsset: (asset: CriticalAsset) => void;
  allAssets: CriticalAsset[];
  assessment: GeminiMultimodalAssessment | null;
  isLoadingAssessment: boolean;
  onRunAssessment: () => void;
  onOpenParametricModal: () => void;
  onOpenAdvisoryModal: () => void;
  onToggleMitigationTask: (assetId: string, taskIndex: number) => void;
  activeDrawerTab: 'ai' | 'asset' | 'actions';
  setActiveDrawerTab: (tab: 'ai' | 'asset' | 'actions') => void;
}

export const ControlDrawer: React.FC<ControlDrawerProps> = ({
  currentStepData,
  currentTimeStep,
  selectedAsset,
  onSelectAsset,
  allAssets,
  assessment,
  isLoadingAssessment,
  onRunAssessment,
  onOpenParametricModal,
  onOpenAdvisoryModal,
  onToggleMitigationTask,
  activeDrawerTab,
  setActiveDrawerTab,
}) => {
  const [acknowledgedActions, setAcknowledgedActions] = useState<Record<string, boolean>>({});

  const toggleAcknowledgeAction = (actionId: string) => {
    setAcknowledgedActions((prev) => ({ ...prev, [actionId]: !prev[actionId] }));
  };

  return (
    <div className="w-full h-full bg-slate-950/95 border-l border-slate-800/80 flex flex-col font-mono-tactical text-slate-100 overflow-hidden select-none">
      {/* Drawer Tab Switcher */}
      <div className="flex items-center border-b border-slate-800 bg-slate-900/60 p-1.5 shrink-0 gap-1 text-xs">
        <button
          onClick={() => setActiveDrawerTab('ai')}
          className={`flex-1 py-2 px-2 rounded-lg font-bold flex items-center justify-center gap-1.5 transition-all ${
            activeDrawerTab === 'ai'
              ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
          }`}
        >
          <Cpu className="w-3.5 h-3.5 text-cyan-400" />
          <span>AI Risk Engine</span>
        </button>

        <button
          onClick={() => setActiveDrawerTab('asset')}
          className={`flex-1 py-2 px-2 rounded-lg font-bold flex items-center justify-center gap-1.5 transition-all ${
            activeDrawerTab === 'asset'
              ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-sm'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
          }`}
        >
          <Building2 className="w-3.5 h-3.5 text-amber-400" />
          <span>Asset Inspector</span>
        </button>

        <button
          onClick={() => setActiveDrawerTab('actions')}
          className={`flex-1 py-2 px-2 rounded-lg font-bold flex items-center justify-center gap-1.5 transition-all ${
            activeDrawerTab === 'actions'
              ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shadow-sm'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
          }`}
        >
          <Coins className="w-3.5 h-3.5 text-emerald-400" />
          <span>Actions & Payout</span>
        </button>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* TAB 1: GEMINI 3.7 FLASH RISK ANALYSIS FEED */}
        {activeDrawerTab === 'ai' && (
          <div className="space-y-4 animate-in fade-in duration-200">
            {/* Primary Call-to-Action: Run Assessment Button */}
            <div className="p-4 rounded-xl bg-gradient-to-br from-slate-900 via-slate-900 to-cyan-950/40 border border-cyan-500/40 shadow-xl">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-ping" />
                  <span className="text-[11px] font-bold text-cyan-400 uppercase tracking-wider">
                    Gemini 3.7 Flash Multimodal AI
                  </span>
                </div>
                <span className="text-[10px] px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
                  {currentTimeStep} Phase
                </span>
              </div>

              <p className="text-xs text-slate-300 mb-3 leading-relaxed">
                Ingests live Synthetic Aperture Radar (SAR) backscatter, storm surge hydrodynamics, and critical infrastructure sensors for anticipatory triage.
              </p>

              <button
                onClick={onRunAssessment}
                disabled={isLoadingAssessment}
                className="w-full py-2.5 px-4 rounded-lg bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-slate-950 font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-[0_0_20px_rgba(6,182,212,0.35)] disabled:opacity-50"
              >
                <Sparkles className={`w-4 h-4 ${isLoadingAssessment ? 'animate-spin text-white' : ''}`} />
                <span>
                  {isLoadingAssessment ? 'Synthesizing SAR & Sensor Telemetry...' : 'Run Multimodal Risk Assessment'}
                </span>
              </button>
            </div>

            {/* AI Risk Card */}
            {assessment ? (
              <div className="space-y-4">
                {/* Vulnerability Score & Threat Level */}
                <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs text-slate-400 uppercase font-bold">Composite Vulnerability Score</span>
                    <span className={`px-2 py-0.5 rounded text-[11px] font-bold uppercase ${
                      assessment.threatLevel === 'CATASTROPHIC' || assessment.threatLevel === 'CRITICAL'
                        ? 'bg-red-500/20 text-red-300 border border-red-500/40 animate-pulse'
                        : 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                    }`}>
                      {assessment.threatLevel}
                    </span>
                  </div>

                  <div className="flex items-center gap-4">
                    {/* Radial Percentage Gauge */}
                    <div className="relative w-16 h-16 shrink-0 flex items-center justify-center">
                      <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                        <path
                          className="text-slate-800"
                          strokeWidth="3.5"
                          stroke="currentColor"
                          fill="none"
                          d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                        />
                        <path
                          className={assessment.vulnerabilityScore > 80 ? 'text-red-500' : 'text-amber-400'}
                          strokeDasharray={`${assessment.vulnerabilityScore}, 100`}
                          strokeWidth="3.5"
                          strokeLinecap="round"
                          stroke="currentColor"
                          fill="none"
                          d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                        />
                      </svg>
                      <span className="absolute text-sm font-bold text-white">
                        {Math.round(assessment.vulnerabilityScore)}%
                      </span>
                    </div>

                    <div className="text-xs space-y-1">
                      <div className="text-slate-300">
                        <span className="text-slate-500">Pop. at Risk:</span>{' '}
                        <strong className="text-amber-300">{assessment.projectedCasualtiesAtRisk.toLocaleString()}</strong>
                      </div>
                      <div className="text-slate-300">
                        <span className="text-slate-500">Est. Exposure:</span>{' '}
                        <strong className="text-red-400">${assessment.estimatedEconomicLossMillionUsd}M USD</strong>
                      </div>
                      <div className="text-[10px] text-cyan-400">
                        Model: {assessment.modelUsed} ({assessment.executionLatencyMs}ms)
                      </div>
                    </div>
                  </div>
                </div>

                {/* Natural Language Impact Explanation */}
                <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 text-xs leading-relaxed">
                  <div className="flex items-center gap-2 font-bold text-cyan-400 mb-1.5 uppercase text-[11px]">
                    <Activity className="w-3.5 h-3.5" />
                    <span>Tactical Hazard Evaluation</span>
                  </div>
                  <p className="text-slate-300 font-sans">{assessment.naturalLanguageExplanation}</p>
                </div>

                {/* Synthetic Aperture Radar (SAR) Satellite Analysis Card */}
                <div className="p-3.5 rounded-xl bg-slate-900/70 border border-blue-500/30 text-xs">
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-blue-400 font-bold flex items-center gap-1.5 text-[11px] uppercase">
                      <Radar className="w-3.5 h-3.5 text-blue-400 animate-spin" />
                      <span>{assessment.sarAnalysis.sensor}</span>
                    </span>
                    <span className="text-[10px] text-emerald-400 font-semibold">
                      {assessment.sarAnalysis.waterExpansionIndex}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-300 font-sans">
                    {assessment.sarAnalysis.keyObservation}
                  </p>
                </div>

                {/* Pre-Landfall Action Items with Deadlines */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                      Pre-Landfall Directives ({assessment.preLandfallActionItems.length})
                    </span>
                    <span className="text-[10px] text-amber-400 font-semibold">Time-Critical</span>
                  </div>

                  <div className="space-y-2.5">
                    {assessment.preLandfallActionItems.map((item) => {
                      const isAck = acknowledgedActions[item.id];
                      return (
                        <div
                          key={item.id}
                          className={`p-3 rounded-lg border transition-all ${
                            isAck
                              ? 'bg-slate-950/60 border-slate-800 opacity-60'
                              : item.priority === 'IMMEDIATE'
                              ? 'bg-red-950/30 border-red-500/40 shadow-sm'
                              : 'bg-slate-900 border-slate-700/80'
                          }`}
                        >
                          <div className="flex items-start justify-between gap-2 mb-1.5">
                            <div className="flex items-center gap-2">
                              <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold uppercase ${
                                item.priority === 'IMMEDIATE'
                                  ? 'bg-red-500/20 text-red-300 border border-red-500/40'
                                  : 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                              }`}>
                                {item.priority}
                              </span>
                              <span className="text-[11px] text-cyan-300 flex items-center gap-1">
                                <Clock className="w-3 h-3" />
                                <span>Execute within {item.deadlineHours}h</span>
                              </span>
                            </div>

                            <button
                              onClick={() => toggleAcknowledgeAction(item.id)}
                              className={`p-1 rounded text-[10px] flex items-center gap-1 transition-colors ${
                                isAck ? 'text-emerald-400' : 'text-slate-400 hover:text-slate-200'
                              }`}
                              title={isAck ? 'Mark as Pending' : 'Acknowledge Directive'}
                            >
                              {isAck ? <CheckSquare className="w-3.5 h-3.5" /> : <Square className="w-3.5 h-3.5" />}
                              <span className="hidden sm:inline">{isAck ? 'Dispatched' : 'Acknowledge'}</span>
                            </button>
                          </div>

                          <p className="text-xs text-slate-200 leading-snug mb-2 font-sans">{item.action}</p>

                          <div className="flex items-center justify-between text-[10px] text-slate-500 pt-1 border-t border-slate-800/60">
                            <span>Agency: {item.assignedAgency}</span>
                            {item.targetAssetId && (
                              <button
                                onClick={() => {
                                  const target = allAssets.find((a) => a.id === item.targetAssetId);
                                  if (target) {
                                    onSelectAsset(target);
                                    setActiveDrawerTab('asset');
                                  }
                                }}
                                className="text-cyan-400 hover:underline flex items-center gap-1"
                              >
                                <span>Inspect Asset</span>
                                <ArrowRight className="w-3 h-3" />
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            ) : (
              <div className="p-8 text-center rounded-xl bg-slate-900/50 border border-dashed border-slate-800 text-slate-500 text-xs">
                Click "Run Multimodal Risk Assessment" to trigger live Gemini analysis for the current timeline phase.
              </div>
            )}
          </div>
        )}

        {/* TAB 2: ASSET INSPECTION PANEL */}
        {activeDrawerTab === 'asset' && (
          <div className="space-y-4 animate-in fade-in duration-200">
            {/* Asset Quick Selector */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
              {allAssets.map((asset) => {
                const isSelected = selectedAsset.id === asset.id;
                return (
                  <button
                    key={asset.id}
                    onClick={() => onSelectAsset(asset)}
                    className={`px-2.5 py-1 rounded-md whitespace-nowrap transition-colors border ${
                      isSelected
                        ? 'bg-slate-800 border-cyan-500 text-cyan-300 font-bold'
                        : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    {asset.name.split(' (')[0]}
                  </button>
                );
              })}
            </div>

            {/* Selected Asset Header Card */}
            <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
              <div className="flex items-start justify-between gap-2 mb-2">
                <div>
                  <span className="text-[10px] text-slate-500 uppercase font-bold">CRITICAL ASSET TELEMETRY</span>
                  <h3 className="text-sm font-bold text-white leading-tight">{selectedAsset.name}</h3>
                </div>
                <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase shrink-0 ${
                  selectedAsset.status === 'Critical' ? 'bg-red-500/20 text-red-300 border border-red-500/40 animate-pulse' :
                  selectedAsset.status === 'Warning' ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40' :
                  selectedAsset.status === 'Blocked' ? 'bg-red-900/40 text-red-300 border border-red-700/50' :
                  'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                }`}>
                  {selectedAsset.status}
                </span>
              </div>

              {/* Optical Satellite Surveillance Photo */}
              <div className="relative h-36 rounded-lg overflow-hidden border border-slate-800 my-3 group">
                <img
                  src={selectedAsset.opticalSatelliteUrl}
                  alt={selectedAsset.name}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent" />
                <div className="absolute bottom-2 left-2 right-2 flex items-center justify-between text-[10px] text-slate-300 font-mono-tactical">
                  <span className="px-1.5 py-0.5 rounded bg-slate-950/80 backdrop-blur border border-slate-800">
                    Sentinel-2 High-Res Optical Crop
                  </span>
                  <span className="text-cyan-400">Lat: {selectedAsset.location[0].toFixed(3)}°N</span>
                </div>
              </div>

              <p className="text-xs text-slate-300 leading-relaxed font-sans mb-3">
                {selectedAsset.description}
              </p>

              {/* Key Physical Parameters */}
              <div className="grid grid-cols-2 gap-2 text-xs mb-3">
                <div className="p-2 rounded bg-slate-950 border border-slate-800">
                  <span className="text-[10px] text-slate-500 block">Ground Elevation</span>
                  <strong className="text-slate-200">+{selectedAsset.elevationMeters}m MSL</strong>
                </div>
                <div className="p-2 rounded bg-slate-950 border border-slate-800">
                  <span className="text-[10px] text-slate-500 block">Flood Infiltration Depth</span>
                  <strong className={selectedAsset.currentInundationMeters > 1 ? 'text-red-400' : 'text-slate-200'}>
                    {selectedAsset.currentInundationMeters}m
                  </strong>
                </div>
                <div className="p-2 rounded bg-slate-950 border border-slate-800">
                  <span className="text-[10px] text-slate-500 block">Capacity / Load</span>
                  <strong className="text-cyan-300 truncate block">{selectedAsset.capacityOrLoad}</strong>
                </div>
                <div className="p-2 rounded bg-slate-950 border border-slate-800">
                  <span className="text-[10px] text-slate-500 block">Backup Generator</span>
                  <strong className={selectedAsset.backupPowerStatus.includes('Risk') ? 'text-red-400' : 'text-emerald-400'}>
                    {selectedAsset.backupPowerStatus}
                  </strong>
                </div>
              </div>

              {/* Live Sensor Telemetry */}
              <div className="space-y-1.5 mb-3">
                <div className="text-[10px] uppercase font-bold text-slate-400">Live IoT Submersible Sensors</div>
                {selectedAsset.liveSensorData.map((sensor) => (
                  <div key={sensor.label} className="flex justify-between items-center text-xs p-1.5 rounded bg-slate-950/60 border border-slate-800">
                    <span className="text-slate-400">{sensor.label}</span>
                    <span className={`font-bold ${
                      sensor.status === 'alert' ? 'text-red-400' : sensor.status === 'warn' ? 'text-amber-400' : 'text-emerald-400'
                    }`}>
                      {sensor.value}
                    </span>
                  </div>
                ))}
              </div>

              {/* Interactive Mitigation Checklist */}
              <div>
                <div className="text-[10px] uppercase font-bold text-slate-400 mb-2">Emergency Mitigation Protocol</div>
                <div className="space-y-2">
                  {selectedAsset.mitigationChecklist.map((task, idx) => (
                    <button
                      key={task.task}
                      onClick={() => onToggleMitigationTask(selectedAsset.id, idx)}
                      className={`w-full text-left p-2 rounded-lg border text-xs flex items-start gap-2.5 transition-colors ${
                        task.completed
                          ? 'bg-slate-950 border-slate-800 text-slate-500 line-through'
                          : task.urgent
                          ? 'bg-amber-950/30 border-amber-500/40 text-slate-200'
                          : 'bg-slate-950 border-slate-800 text-slate-300 hover:border-slate-700'
                      }`}
                    >
                      <span className="mt-0.5 shrink-0">
                        {task.completed ? <CheckSquare className="w-3.5 h-3.5 text-emerald-400" /> : <Square className="w-3.5 h-3.5 text-slate-400" />}
                      </span>
                      <span className="font-sans leading-snug">{task.task}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Agency Dispatch Contact */}
              <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between text-xs">
                <span className="text-slate-500 text-[10px]">Command: {selectedAsset.contactAgency}</span>
                <button
                  onClick={() => alert(`Radio dispatch initiated to ${selectedAsset.contactAgency}. Telemetry feed shared.`)}
                  className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-cyan-300 border border-slate-700 flex items-center gap-1.5 text-[11px]"
                >
                  <PhoneCall className="w-3 h-3" />
                  <span>Radio Dispatch</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: ADVISORIES & PARAMETRIC INSURANCE */}
        {activeDrawerTab === 'actions' && (
          <div className="space-y-4 animate-in fade-in duration-200">
            {/* Parametric Insurance Section */}
            <div className="p-4 rounded-xl bg-gradient-to-br from-slate-900 to-emerald-950/40 border border-emerald-500/40 shadow-xl">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Coins className="w-4 h-4 text-emerald-400" />
                  <span className="text-xs font-bold text-emerald-300 uppercase tracking-wider">
                    Parametric Disaster Micro-Payout
                  </span>
                </div>
                <span className="px-2 py-0.5 rounded text-[10px] bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                  {currentStepData.windSpeedKmh >= 180 ? 'ORACLE MET' : 'STANDBY'}
                </span>
              </div>

              <p className="text-xs text-slate-300 mb-3 leading-relaxed">
                Smart contract condition: Sustained winds &gt; 180 km/h verified by offshore buoy BOB-04 automatically triggers instant pre-landfall cash liquidity to 12,000 enrolled coastal households.
              </p>

              <div className="p-2.5 rounded-lg bg-slate-950/80 border border-slate-800 text-xs space-y-1 mb-3">
                <div className="flex justify-between">
                  <span className="text-slate-400">Current Velocity:</span>
                  <strong className="text-amber-300">{currentStepData.windSpeedKmh} km/h (Threshold: 180)</strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Total Liquidity:</span>
                  <strong className="text-emerald-400">₹4.20 Crore (~$504,000 USD)</strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Target Beneficiaries:</span>
                  <strong className="text-cyan-300">12,000 Fisherfolk & Shore Families</strong>
                </div>
              </div>

              <button
                onClick={onOpenParametricModal}
                className="w-full py-2.5 px-4 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-[0_0_20px_rgba(16,185,129,0.3)]"
              >
                <Coins className="w-4 h-4" />
                <span>Simulate Parametric Insurance Trigger</span>
              </button>
            </div>

            {/* Municipal Emergency Advisory Generator Section */}
            <div className="p-4 rounded-xl bg-slate-900 border border-cyan-500/30 shadow-xl">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Radio className="w-4 h-4 text-cyan-400" />
                  <span className="text-xs font-bold text-cyan-300 uppercase tracking-wider">
                    Civil Protection Advisories
                  </span>
                </div>
                <span className="text-[10px] text-slate-400">EN / TE / OR</span>
              </div>

              <p className="text-xs text-slate-300 mb-3 leading-relaxed">
                Auto-draft verified multi-lingual emergency bulletins for SMS Cell Broadcast, WhatsApp community channels, and loudspeaker megaphone broadcasts.
              </p>

              <button
                onClick={onOpenAdvisoryModal}
                className="w-full py-2.5 px-4 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-slate-950 font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-[0_0_15px_rgba(6,182,212,0.3)]"
              >
                <Radio className="w-4 h-4" />
                <span>Generate Municipal Advisory</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
