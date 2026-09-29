/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { 
  ShieldAlert, 
  Radio, 
  Volume2, 
  VolumeX, 
  Cpu, 
  ShieldCheck, 
  FileText, 
  Layers, 
  Activity,
  Compass,
  Wind,
  Droplets
} from 'lucide-react';
import { TimeStepData } from '../types/disaster';

interface HeaderProps {
  currentStepData: TimeStepData;
  soundEnabled: boolean;
  onToggleSound: () => void;
  forceSimulation: boolean;
  onToggleForceSimulation: () => void;
  onOpenThreatModel: () => void;
  onOpenSitRep: () => void;
  apiKeyConfigured: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  currentStepData,
  soundEnabled,
  onToggleSound,
  forceSimulation,
  onToggleForceSimulation,
  onOpenThreatModel,
  onOpenSitRep,
  apiKeyConfigured,
}) => {
  const [currentTime, setCurrentTime] = useState<string>('');
  const [istTime, setIstTime] = useState<string>('');

  useEffect(() => {
    const update = () => {
      const now = new Date();
      setCurrentTime(now.toUTCString().slice(17, 25) + ' UTC');
      // Indian Standard Time (UTC+5:30)
      const ist = new Date(now.getTime() + (5.5 * 60 * 60 * 1000));
      setIstTime(ist.toISOString().slice(11, 19) + ' IST');
    };
    update();
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <header className="h-16 bg-slate-950/95 backdrop-blur border-b border-slate-800/80 px-4 flex items-center justify-between z-30 shrink-0 select-none">
      {/* Left: Branding & Core System Identity */}
      <div className="flex items-center gap-3">
        <div className="relative flex items-center justify-center w-10 h-10 rounded-lg bg-gradient-to-br from-cyan-500/20 to-blue-600/30 border border-cyan-500/40 text-cyan-400 shadow-[0_0_15px_rgba(6,182,212,0.25)]">
          <ShieldAlert className="w-6 h-6 animate-pulse text-cyan-400" />
          <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-red-500 ring-2 ring-slate-950 animate-ping" />
          <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-red-500 ring-2 ring-slate-950" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <h1 className="font-display text-lg font-bold tracking-wider text-slate-100 flex items-center gap-1.5">
              SamudraSight<span className="text-cyan-400">-APAC</span>
            </h1>
            <span className="px-1.5 py-0.5 rounded text-[10px] font-mono-tactical font-semibold uppercase tracking-wider bg-red-500/20 text-red-400 border border-red-500/40 animate-pulse">
              LEVEL 4 RED ALERT
            </span>
          </div>
          <p className="text-[11px] text-slate-400 flex items-center gap-2">
            <span>Bay of Bengal Anticipatory Command</span>
            <span className="text-slate-600">•</span>
            <span className="text-cyan-300 font-mono-tactical text-[10px]">GODAVARI-KAKINADA SECTOR</span>
          </p>
        </div>
      </div>

      {/* Center: Live Cyclone Telemetry Ticker */}
      <div className="hidden xl:flex items-center gap-4 px-4 py-1.5 rounded-lg bg-slate-900/90 border border-slate-800 text-xs font-mono-tactical">
        <div className="flex items-center gap-1.5 text-red-400 font-semibold">
          <Radio className="w-3.5 h-3.5 animate-spin text-red-400" />
          <span>CYCLONE VARUNA</span>
        </div>
        <div className="h-3 w-px bg-slate-800" />
        <div className="flex items-center gap-1 text-slate-300">
          <Compass className="w-3.5 h-3.5 text-cyan-400" />
          <span className="text-slate-400">Eye:</span>
          <span>16.98°N, 82.25°E</span>
        </div>
        <div className="h-3 w-px bg-slate-800" />
        <div className="flex items-center gap-1 text-slate-300">
          <Wind className="w-3.5 h-3.5 text-amber-400" />
          <span className="text-slate-400">Wind:</span>
          <span className="font-bold text-amber-300">{currentStepData.windSpeedKmh} km/h</span>
          <span className="text-[10px] text-slate-400">(Gusts {currentStepData.gustSpeedKmh})</span>
        </div>
        <div className="h-3 w-px bg-slate-800" />
        <div className="flex items-center gap-1 text-slate-300">
          <Droplets className="w-3.5 h-3.5 text-blue-400" />
          <span className="text-slate-400">Surge:</span>
          <span className="font-bold text-blue-300">+{currentStepData.stormSurgeMeters}m MSL</span>
        </div>
        <div className="h-3 w-px bg-slate-800" />
        <div className="flex items-center gap-1 text-cyan-300">
          <Activity className="w-3.5 h-3.5 text-cyan-400" />
          <span className="text-slate-400">Status:</span>
          <span className="uppercase font-semibold">{currentStepData.id}</span>
        </div>
      </div>

      {/* Right: Operational Controls & Clocks */}
      <div className="flex items-center gap-2">
        {/* Real-time clocks */}
        <div className="hidden md:flex flex-col items-end text-right px-2 font-mono-tactical text-[11px] text-slate-400">
          <span className="text-slate-200 font-medium">{currentTime}</span>
          <span className="text-[10px] text-cyan-400/80">{istTime}</span>
        </div>

        {/* AI Engine Status & Toggle */}
        <button
          onClick={onToggleForceSimulation}
          title={forceSimulation ? 'Switched to Synthetic Offline Demo Mode' : apiKeyConfigured ? 'Live Gemini 3.7 AI Model Connected' : 'No API Key - Running Resilient Simulation'}
          className={`px-2.5 py-1.5 rounded-md border text-xs font-mono-tactical flex items-center gap-1.5 transition-all ${
            forceSimulation
              ? 'bg-purple-950/40 border-purple-500/40 text-purple-300 hover:bg-purple-900/40'
              : apiKeyConfigured
              ? 'bg-cyan-950/40 border-cyan-500/50 text-cyan-300 hover:bg-cyan-900/40 shadow-[0_0_10px_rgba(6,182,212,0.15)]'
              : 'bg-amber-950/40 border-amber-500/40 text-amber-300 hover:bg-amber-900/40'
          }`}
        >
          <Cpu className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">
            {forceSimulation ? 'Offline Demo AI' : apiKeyConfigured ? 'Gemini 3.7 Flash' : 'Simulated AI'}
          </span>
          <span className={`w-2 h-2 rounded-full ${forceSimulation ? 'bg-purple-400' : apiKeyConfigured ? 'bg-cyan-400 animate-pulse' : 'bg-amber-400'}`} />
        </button>

        {/* Sound toggle */}
        <button
          onClick={onToggleSound}
          title={soundEnabled ? 'Mute Radar Siren Effects' : 'Enable Radar & Alert Audio'}
          className={`p-2 rounded-md border text-xs transition-colors ${
            soundEnabled 
              ? 'bg-slate-800 border-cyan-500/40 text-cyan-400' 
              : 'bg-slate-900 border-slate-800 text-slate-500 hover:text-slate-300'
          }`}
        >
          {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
        </button>

        {/* Threat Model Modal Trigger */}
        <button
          onClick={onOpenThreatModel}
          title="Agentic Threat Modeling & Security Review"
          className="px-2.5 py-1.5 rounded-md bg-slate-900 hover:bg-slate-800 border border-slate-700/80 text-slate-300 hover:text-white text-xs font-mono-tactical flex items-center gap-1.5 transition-colors"
        >
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
          <span className="hidden lg:inline">Threat Model</span>
        </button>

        {/* SitRep / Export Trigger */}
        <button
          onClick={onOpenSitRep}
          title="View & Export Situation Report"
          className="px-2.5 py-1.5 rounded-md bg-cyan-600 hover:bg-cyan-500 text-slate-950 font-semibold text-xs font-mono-tactical flex items-center gap-1.5 transition-colors shadow-[0_0_12px_rgba(6,182,212,0.3)]"
        >
          <FileText className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">SitRep</span>
        </button>
      </div>
    </header>
  );
};
