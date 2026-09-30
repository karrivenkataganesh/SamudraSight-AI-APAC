/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { TimeStepId } from '../../types/disaster';
import { TIME_STEPS } from '../../data/syntheticGeoData';
import { 
  Waves, 
  ShieldAlert, 
  Hospital, 
  Zap, 
  Shield, 
  Droplets, 
  Anchor, 
  Navigation, 
  Radio, 
  ChevronDown, 
  ChevronUp, 
  Info,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  HelpCircle
} from 'lucide-react';

interface TacticalSectorLegendProps {
  currentTimeStep: TimeStepId;
  className?: string;
}

export const TacticalSectorLegend: React.FC<TacticalSectorLegendProps> = ({
  currentTimeStep,
  className = '',
}) => {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<'surge' | 'assets' | 'routes'>('surge');

  const stepData = TIME_STEPS[currentTimeStep];

  // Dynamic surge scale definition matching FLOOD_POLYGONS
  const surgeLevels = [
    {
      level: 'Low Surge',
      range: '< 2.0m MSL',
      stage: 'Advisory (T-72)',
      color: '#06b6d4',
      bgClass: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/50',
      description: 'Minor wave wash along outer barrier spits and mangrove fringes. Lowland drainage remains functional.',
      isActive: stepData.stormSurgeMeters < 2.0,
    },
    {
      level: 'Moderate Surge',
      range: '2.0m - 3.5m MSL',
      stage: 'Warning (T-48)',
      color: '#0284c7',
      bgClass: 'bg-sky-500/20 text-sky-300 border-sky-500/50',
      description: 'Canal overtopping, aquaculture bund breach, and inundation of inter-tidal fishing docks.',
      isActive: stepData.stormSurgeMeters >= 2.0 && stepData.stormSurgeMeters < 3.5,
    },
    {
      level: 'Severe Inundation',
      range: '3.5m - 4.5m MSL',
      stage: 'Trigger Point (T-24)',
      color: '#d97706',
      bgClass: 'bg-amber-500/20 text-amber-300 border-amber-500/50',
      description: 'Parametric threshold triggered. Sea water enters coastal highways, ground-level power stations at risk.',
      isActive: stepData.stormSurgeMeters >= 3.5 && stepData.stormSurgeMeters < 4.5,
    },
    {
      level: 'Extreme Surge',
      range: '4.5m - 5.5m MSL',
      stage: 'Pre-Landfall (T-12)',
      color: '#ea580c',
      bgClass: 'bg-orange-500/20 text-orange-300 border-orange-500/50',
      description: 'Hospital basement generator threats, major arterial cut-offs, rapid coastal sediment scouring.',
      isActive: stepData.stormSurgeMeters >= 4.5 && stepData.stormSurgeMeters < 5.5,
    },
    {
      level: 'Catastrophic Crest',
      range: '> 5.5m MSL',
      stage: 'Zero Hour (T-6 / T-0)',
      color: '#dc2626',
      bgClass: 'bg-red-500/20 text-red-300 border-red-500/50',
      description: 'Total spit wash-over. Water depth exceeds 4m inland across Kakinada port and low-lying settlements.',
      isActive: stepData.stormSurgeMeters >= 5.5,
    },
  ];

  // Infrastructure status icon definitions
  const statusItems = [
    {
      status: 'Critical',
      color: '#ef4444',
      badgeClass: 'bg-red-950/80 text-red-300 border-red-500/70',
      icon: XCircle,
      halo: 'border-red-500 bg-red-500/20 shadow-[0_0_10px_rgba(239,68,68,0.7)] animate-pulse',
      explanation: 'Flood threshold imminent or breached; critical power/life-support failure risk (e.g. General Hospital ICU).',
    },
    {
      status: 'Warning',
      color: '#f59e0b',
      badgeClass: 'bg-amber-950/80 text-amber-300 border-amber-500/70',
      icon: AlertTriangle,
      halo: 'border-amber-500 bg-amber-500/20 shadow-[0_0_10px_rgba(245,158,11,0.5)]',
      explanation: 'Water level within 0.5m of defense barriers; active mobile pumps & flood bladders deployed (e.g. 132kV Substation).',
    },
    {
      status: 'Blocked',
      color: '#dc2626',
      badgeClass: 'bg-red-900/90 text-red-200 border-red-600/80',
      icon: XCircle,
      halo: 'border-red-700 bg-red-900/40 shadow-[0_0_10px_rgba(220,38,38,0.6)]',
      explanation: 'Route impassable due to standing surge water > 1m or electrical hazard; traffic diverted to high corridors.',
    },
    {
      status: 'Safe',
      color: '#10b981',
      badgeClass: 'bg-emerald-950/80 text-emerald-300 border-emerald-500/70',
      icon: CheckCircle2,
      halo: 'border-emerald-500 bg-emerald-500/20 shadow-[0_0_10px_rgba(16,185,129,0.5)]',
      explanation: 'Constructed on elevated terrain (>6m MSL) with independent solar microgrid or sealed tanks (e.g. Cyclone Sanctuary).',
    },
  ];

  // Infrastructure facility type icons
  const facilityTypes = [
    { type: 'hospital', label: 'Hospital / Trauma Center', icon: Hospital, desc: 'Medical care & ICU backup' },
    { type: 'power', label: '132kV Power Substation', icon: Zap, desc: 'Grid & municipal pump power' },
    { type: 'shelter', label: 'Cyclone Shelter Sanctuary', icon: Shield, desc: 'Elevated multi-story refuge' },
    { type: 'water', label: 'Water Purification Plant', icon: Droplets, desc: 'Potable municipal storage' },
    { type: 'port', label: 'Deepwater Marine Port', icon: Anchor, desc: 'Maritime berths & gantry cranes' },
    { type: 'route', label: 'Coastal Evacuation Route', icon: Navigation, desc: 'Arterial transit & convoy link' },
  ];

  return (
    <aside 
      aria-label="Tactical Sector Legend"
      className={`absolute top-4 right-4 z-20 font-mono-tactical pointer-events-auto transition-all duration-300 ${className}`}
    >
      {/* Small Box Option with Clean Toggle Button */}
      {!isOpen ? (
        <div className="flex items-center gap-1.5 p-1 rounded-xl bg-slate-950/95 border border-slate-800 shadow-2xl backdrop-blur-md">
          <button
            onClick={() => setIsOpen(true)}
            className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg bg-slate-900/90 hover:bg-slate-850 hover:border-cyan-500/50 border border-slate-700/80 text-slate-200 text-xs shadow-lg transition-all group cursor-pointer"
            title="Open Tactical Sector Legend full window"
          >
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
              <Waves className="w-3.5 h-3.5 text-cyan-400 group-hover:rotate-12 transition-transform" />
              <span className="font-bold text-[11px] tracking-tight text-cyan-300">Tactical Legend</span>
            </div>
            <span className="text-[10px] px-1.5 py-0.5 rounded bg-cyan-500/10 text-cyan-300 border border-cyan-500/30">
              +{stepData.stormSurgeMeters}m
            </span>
            <ChevronDown className="w-3.5 h-3.5 text-cyan-400 group-hover:translate-y-0.5 transition-transform" />
          </button>
        </div>
      ) : (
        /* Expanded Floating Tactical Legend Card */
        <div className="w-80 sm:w-96 rounded-xl bg-slate-950/95 border border-slate-800 shadow-[0_10px_35px_rgba(0,0,0,0.8)] backdrop-blur-xl text-xs text-slate-100 overflow-hidden animate-in fade-in zoom-in-95">
          {/* Header - Styled per CSS 2 */}
          <div 
            className="px-3.5 py-2.5 bg-slate-900/90 border-b border-slate-800/90 flex items-center justify-between"
            style={{ height: '45.2083px', width: '373.222px' }}
          >
            <div className="flex items-center gap-2">
              <div className="p-1 rounded bg-cyan-500/10 text-cyan-400 border border-cyan-500/30">
                <Waves className="w-3.5 h-3.5" />
              </div>
              <div>
                <div className="font-bold text-xs text-white flex items-center gap-1.5">
                  <span>Tactical Sector Legend</span>
                  <span className="text-[9px] px-1.5 py-0.2 rounded font-mono font-semibold bg-cyan-500/20 text-cyan-300 border border-cyan-500/40">
                    {currentTimeStep}
                  </span>
                </div>
                <div className="text-[10px] text-slate-400">
                  Surge Crest: <strong className="text-amber-300">+{stepData.stormSurgeMeters}m MSL</strong> ({stepData.coastalInundationSqKm} km²)
                </div>
              </div>
            </div>

            <button
              onClick={() => setIsOpen(false)}
              className="p-1 rounded text-slate-400 hover:text-white hover:bg-slate-800 transition-colors flex items-center gap-1 text-[10px]"
              title="Close to small box"
            >
              <span>Close</span>
              <ChevronUp className="w-4 h-4" />
            </button>
          </div>

          {/* Navigation Tabs */}
          <div className="flex border-b border-slate-800/80 bg-slate-950 text-[11px]">
            <button
              onClick={() => setActiveTab('surge')}
              className={`flex-1 py-1.5 px-2 font-bold flex items-center justify-center gap-1.5 transition-colors border-b-2 ${
                activeTab === 'surge'
                  ? 'border-cyan-400 text-cyan-300 bg-cyan-500/10'
                  : 'border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-900'
              }`}
            >
              <Waves className="w-3 h-3" />
              <span>Surge Levels</span>
            </button>

            <button
              onClick={() => setActiveTab('assets')}
              className={`flex-1 py-1.5 px-2 font-bold flex items-center justify-center gap-1.5 transition-colors border-b-2 ${
                activeTab === 'assets'
                  ? 'border-cyan-400 text-cyan-300 bg-cyan-500/10'
                  : 'border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-900'
              }`}
            >
              <ShieldAlert className="w-3 h-3" />
              <span>Infrastructure</span>
            </button>

            <button
              onClick={() => setActiveTab('routes')}
              className={`flex-1 py-1.5 px-2 font-bold flex items-center justify-center gap-1.5 transition-colors border-b-2 ${
                activeTab === 'routes'
                  ? 'border-cyan-400 text-cyan-300 bg-cyan-500/10'
                  : 'border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-900'
              }`}
            >
              <Navigation className="w-3 h-3" />
              <span>Routes & Radar</span>
            </button>
          </div>

          {/* Tab 1: Color-Coded Surge Levels - Styled per CSS 1 */}
          {activeTab === 'surge' && (
            <div 
              className="p-3 space-y-2 max-h-72 overflow-y-auto"
              style={{ height: '258px', width: '367.222px' }}
            >
              <div className="text-[10px] text-slate-400 uppercase font-bold flex items-center justify-between">
                <span>Inundation Depth Scale</span>
                <span className="text-cyan-400 font-normal">Active Polygon: {stepData.stormCategory.split(' (')[0]}</span>
              </div>

              {/* Surge Color Gradient Legend */}
              <div className="space-y-1.5">
                {surgeLevels.map((lvl, index) => (
                  <div
                    key={index}
                    className={`p-2 rounded-lg border transition-all ${
                      lvl.isActive
                        ? `${lvl.bgClass} shadow-md ring-1 ring-cyan-400/40`
                        : 'bg-slate-900/60 border-slate-800/80 text-slate-300 opacity-80 hover:opacity-100'
                    }`}
                  >
                    <div className="flex items-center justify-between font-bold mb-1">
                      <div className="flex items-center gap-2">
                        <span
                          className="w-3 h-3 rounded shadow-sm shrink-0 border border-white/20"
                          style={{ backgroundColor: lvl.color }}
                        />
                        <span className="text-xs text-white">{lvl.level}</span>
                        {lvl.isActive && (
                          <span className="text-[9px] px-1.5 py-0.2 rounded bg-cyan-500/30 text-cyan-200 border border-cyan-400/50 uppercase font-extrabold animate-pulse">
                            Current Stage
                          </span>
                        )}
                      </div>
                      <span className="text-[10px] font-mono font-bold text-amber-300">{lvl.range}</span>
                    </div>

                    <p className="text-[10px] leading-relaxed text-slate-400">
                      {lvl.description}
                    </p>
                  </div>
                ))}
              </div>

              {/* Inundation Summary Note */}
              <div className="p-2 rounded bg-slate-900/90 border border-slate-800 text-[10px] text-slate-400 flex items-start gap-1.5">
                <Info className="w-3.5 h-3.5 text-cyan-400 shrink-0 mt-0.5" />
                <span>
                  Dynamic surge polygons on the sector map adapt with the timeline slider ({currentTimeStep}: <strong>+{stepData.stormSurgeMeters}m</strong> surge height, <strong>{stepData.coastalInundationSqKm} km²</strong> inundation).
                </span>
              </div>
            </div>
          )}

          {/* Tab 2: Infrastructure Status Icons & Types */}
          {activeTab === 'assets' && (
            <div className="p-3 space-y-3 max-h-72 overflow-y-auto">
              {/* Status Pin Anatomy */}
              <div>
                <div className="text-[10px] text-slate-400 uppercase font-bold mb-1.5">
                  Tactical Pin Status Classification
                </div>
                <div className="space-y-1.5">
                  {statusItems.map((item, idx) => (
                    <div
                      key={idx}
                      className="p-1.5 rounded-lg bg-slate-900/60 border border-slate-800/80 flex items-start gap-2 text-[11px]"
                    >
                      {/* Visual Circular Tactical Pin Preview */}
                      <div className="relative shrink-0 mt-0.5">
                        <div
                          className={`w-6 h-6 rounded-full flex items-center justify-center border-2 ${item.halo}`}
                          style={{ borderColor: item.color, backgroundColor: `${item.color}22` }}
                        >
                          <div className="w-2 h-2 rounded-full" style={{ backgroundColor: item.color }} />
                        </div>
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-0.5">
                          <span className="font-bold text-white text-xs">{item.status}</span>
                          <span
                            className="text-[9px] px-1.5 py-0.2 rounded font-bold border uppercase"
                            style={{
                              backgroundColor: `${item.color}20`,
                              color: item.color,
                              borderColor: `${item.color}40`,
                            }}
                          >
                            {item.status}
                          </span>
                        </div>
                        <p className="text-[10px] text-slate-400 leading-snug">{item.explanation}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Asset Facility Types */}
              <div className="border-t border-slate-800/80 pt-2">
                <div className="text-[10px] text-slate-400 uppercase font-bold mb-1.5">
                  Monitored Infrastructure Types
                </div>
                <div className="grid grid-cols-2 gap-1.5">
                  {facilityTypes.map((fac, idx) => {
                    const IconComp = fac.icon;
                    return (
                      <div
                        key={idx}
                        className="p-1.5 rounded bg-slate-900/70 border border-slate-800 flex items-center gap-1.5"
                      >
                        <div className="p-1 rounded bg-slate-800 text-cyan-400 shrink-0">
                          <IconComp className="w-3 h-3" />
                        </div>
                        <div className="min-w-0">
                          <div className="font-bold text-white text-[10px] truncate">{fac.label}</div>
                          <div className="text-[8px] text-slate-400 truncate">{fac.desc}</div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* Tab 3: Evacuation Routes & Radar Sweeps */}
          {activeTab === 'routes' && (
            <div className="p-3 space-y-2.5 max-h-72 overflow-y-auto">
              {/* Route Line Styles */}
              <div>
                <div className="text-[10px] text-slate-400 uppercase font-bold mb-1.5">
                  Evacuation Corridors & Road Conditions
                </div>
                <div className="space-y-1.5">
                  <div className="p-2 rounded-lg bg-slate-900/60 border border-slate-800 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-1 rounded bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.8)]" />
                      <span className="font-bold text-slate-200 text-xs">Open Corridor</span>
                    </div>
                    <span className="text-[9px] px-1.5 py-0.5 rounded bg-emerald-950/80 text-emerald-300 border border-emerald-500/50">
                      0.0m Inundation (Passable)
                    </span>
                  </div>

                  <div className="p-2 rounded-lg bg-slate-900/60 border border-slate-800 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-1 rounded bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.8)]" />
                      <span className="font-bold text-slate-200 text-xs">Congested Arterial</span>
                    </div>
                    <span className="text-[9px] px-1.5 py-0.5 rounded bg-amber-950/80 text-amber-300 border border-amber-500/50">
                      &lt; 1.0m Inundation (Slow)
                    </span>
                  </div>

                  <div className="p-2 rounded-lg bg-slate-900/60 border border-slate-800 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-1 border-t-2 border-dashed border-red-500 shadow-[0_0_8px_rgba(239,68,68,0.8)]" />
                      <span className="font-bold text-slate-200 text-xs">Blocked / Cut Off</span>
                    </div>
                    <span className="text-[9px] px-1.5 py-0.5 rounded bg-red-950/80 text-red-300 border border-red-500/50">
                      &gt; 1.0m Water / High Risk
                    </span>
                  </div>
                </div>
              </div>

              {/* Doppler Radar Sweeps & Eye */}
              <div className="border-t border-slate-800/80 pt-2">
                <div className="text-[10px] text-slate-400 uppercase font-bold mb-1.5">
                  Doppler Radar & Wind Isobars
                </div>
                <div className="space-y-1 text-[10px] text-slate-300">
                  <div className="flex items-center justify-between p-1.5 rounded bg-slate-900/50 border border-slate-800">
                    <span className="flex items-center gap-1.5">
                      <Radio className="w-3.5 h-3.5 text-red-400 animate-spin" />
                      <span>Storm Eye Core</span>
                    </span>
                    <strong className="text-red-400">{stepData.windSpeedKmh} km/h (Gusts {stepData.gustSpeedKmh})</strong>
                  </div>
                  <div className="flex items-center justify-between p-1.5 rounded bg-slate-900/50 border border-slate-800">
                    <span className="flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 rounded-full border border-dashed border-amber-400" />
                      <span>15km / 30km Isobars</span>
                    </span>
                    <span className="text-amber-300">Violent Wave Action</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Footer Bar */}
          <div className="px-3 py-1.5 bg-slate-900/80 border-t border-slate-800 text-[10px] text-slate-400 flex items-center justify-between">
            <span className="flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
              <span>SamudraSight-APAC Tactical Sector Feed</span>
            </span>
            <span className="text-cyan-400 font-mono font-semibold">Bay of Bengal Command</span>
          </div>
        </div>
      )}
    </aside>
  );
};
