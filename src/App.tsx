/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useCallback } from 'react';
import { TimeStepId, CriticalAsset, GeminiMultimodalAssessment } from './types/disaster';
import { TIME_STEPS, CRITICAL_ASSETS } from './data/syntheticGeoData';
import { Header } from './components/Header';
import { CycloneMap } from './components/Map/CycloneMap';
import { GoogleMapsLiveTracking } from './components/Map/GoogleMapsLiveTracking';
import { ControlDrawer } from './components/Drawer/ControlDrawer';
import { ParametricModal } from './components/Modals/ParametricModal';
import { AdvisoryModal } from './components/Modals/AdvisoryModal';
import { ThreatModelModal } from './components/Modals/ThreatModelModal';
import { SitRepModal } from './components/Modals/SitRepModal';
import { checkServerHealth, runMultimodalRiskAssessment } from './services/geminiClient';
import { Maximize2, Minimize2 } from 'lucide-react';

export default function App() {
  const [currentTimeStep, setCurrentTimeStep] = useState<TimeStepId>('T-24');
  const [allAssets, setAllAssets] = useState<CriticalAsset[]>(CRITICAL_ASSETS);
  const [selectedAsset, setSelectedAsset] = useState<CriticalAsset>(CRITICAL_ASSETS[1]); // General Hospital default
  const [activeDrawerTab, setActiveDrawerTab] = useState<'ai' | 'asset' | 'actions'>('ai');
  const [mapViewMode, setMapViewMode] = useState<'google-satellite' | 'sector-tactical'>('google-satellite');
  const [quotaExceeded, setQuotaExceeded] = useState(false);
  const [isMapFullscreen, setIsMapFullscreen] = useState<boolean>(false);
  
  // AI Assessment State
  const [assessment, setAssessment] = useState<GeminiMultimodalAssessment | null>(null);
  const [isLoadingAssessment, setIsLoadingAssessment] = useState<boolean>(false);
  const [forceSimulation, setForceSimulation] = useState<boolean>(false);
  const [apiKeyConfigured, setApiKeyConfigured] = useState<boolean>(false);
  
  // Audio & Modals
  const [soundEnabled, setSoundEnabled] = useState<boolean>(false);
  const [isParametricOpen, setIsParametricOpen] = useState<boolean>(false);
  const [isAdvisoryOpen, setIsAdvisoryOpen] = useState<boolean>(false);
  const [isThreatModelOpen, setIsThreatModelOpen] = useState<boolean>(false);
  const [isSitRepOpen, setIsSitRepOpen] = useState<boolean>(false);

  // Check health on load and listen for Google Maps quota events
  useEffect(() => {
    checkServerHealth().then((res) => {
      setApiKeyConfigured(res.apiKeyConfigured);
    });

    const handleQuota = () => setQuotaExceeded(true);
    window.addEventListener('gmp-quota-exceeded', handleQuota);
    return () => window.removeEventListener('gmp-quota-exceeded', handleQuota);
  }, []);

  // Initial and on-demand AI assessment generator
  const triggerAssessment = useCallback(async (step = currentTimeStep, force = forceSimulation) => {
    setIsLoadingAssessment(true);
    try {
      const result = await runMultimodalRiskAssessment(step, force);
      setAssessment(result);
    } catch (err) {
      console.error('Assessment execution failed:', err);
    } finally {
      setIsLoadingAssessment(false);
    }
  }, [currentTimeStep, forceSimulation]);

  // Load initial assessment on mount
  useEffect(() => {
    triggerAssessment('T-24', forceSimulation);
  }, []);

  // Handle timeline step scrub
  const handleTimeStepChange = (newStep: TimeStepId) => {
    setCurrentTimeStep(newStep);

    // Audio cue if sound is enabled
    if (soundEnabled) {
      try {
        const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(580, audioCtx.currentTime);
        gain.gain.setValueAtTime(0.04, audioCtx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.15);
        osc.connect(gain);
        gain.connect(audioCtx.destination);
        osc.start();
        osc.stop(audioCtx.currentTime + 0.15);
      } catch (e) {}
    }

    // Auto-update assessment for the selected timeline slice
    triggerAssessment(newStep, forceSimulation);
  };

  // Asset selection from map
  const handleSelectAsset = (asset: CriticalAsset) => {
    setSelectedAsset(asset);
    setActiveDrawerTab('asset');
  };

  // Toggle checklist tasks
  const handleToggleMitigationTask = (assetId: string, taskIndex: number) => {
    setAllAssets((prev) =>
      prev.map((a) => {
        if (a.id !== assetId) return a;
        const updatedList = [...a.mitigationChecklist];
        updatedList[taskIndex] = {
          ...updatedList[taskIndex],
          completed: !updatedList[taskIndex].completed,
        };
        const updatedAsset = { ...a, mitigationChecklist: updatedList };
        if (selectedAsset.id === assetId) {
          setSelectedAsset(updatedAsset);
        }
        return updatedAsset;
      })
    );
  };

  const currentStepData = TIME_STEPS[currentTimeStep];

  return (
    <div className="flex flex-col h-screen w-screen bg-slate-950 text-slate-100 overflow-hidden font-mono-tactical">
      {/* Top Bar Navigation & Telemetry */}
      <Header
        currentStepData={currentStepData}
        soundEnabled={soundEnabled}
        onToggleSound={() => setSoundEnabled(!soundEnabled)}
        forceSimulation={forceSimulation}
        onToggleForceSimulation={() => setForceSimulation(!forceSimulation)}
        onOpenThreatModel={() => setIsThreatModelOpen(true)}
        onOpenSitRep={() => setIsSitRepOpen(true)}
        apiKeyConfigured={apiKeyConfigured}
      />

      {/* Quota Exceeded Notification Banner */}
      {quotaExceeded && (
        <div className="bg-amber-950/90 border-b border-amber-500/50 text-amber-200 px-4 py-2 text-xs text-center sticky top-0 z-50 backdrop-blur">
          Google Maps Platform quota reached. Please verify your API key restrictions or billing account.
        </div>
      )}

      {/* Main Split View: Left Expanded Interactive Map, Right Dynamic Control Drawer */}
      <main className="flex-1 flex flex-col lg:flex-row overflow-hidden relative">
        {/* Fullscreen/Expanded Interactive Map with View Switcher */}
        <section className={`relative overflow-hidden flex flex-col transition-all duration-300 ${
          isMapFullscreen 
            ? 'w-full h-full' 
            : 'w-full lg:w-[80%] h-[75%] lg:h-full border-b lg:border-b-0 lg:border-r border-slate-800'
        }`}>
          {/* Map View Mode Segmented Switcher Header */}
          <div className="h-10 bg-slate-950/90 border-b border-slate-800 px-3 flex items-center justify-between shrink-0 z-30 font-mono-tactical text-xs">
            <div className="flex items-center gap-1.5 p-0.5 rounded-lg bg-slate-900 border border-slate-800">
              <button
                onClick={() => setMapViewMode('google-satellite')}
                className={`px-3 py-1 rounded-md transition-all flex items-center gap-1.5 font-bold ${
                  mapViewMode === 'google-satellite'
                    ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <span>🛰️</span>
                <span style={{ height: '20px', fontFamily: 'Times New Roman', width: '255.85px' }}>Google Maps Satellite (Live Tracking)</span>
              </button>

              <button
                onClick={() => setMapViewMode('sector-tactical')}
                className={`px-3 py-1 rounded-md transition-all flex items-center gap-1.5 font-bold ${
                  mapViewMode === 'sector-tactical'
                    ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <span>🌊</span>
                <span style={{ height: '20px', fontFamily: 'Times New Roman' }}>Tactical Sector Map (Surge & Inundation)</span>
              </button>
            </div>

            <div className="flex items-center gap-2">
              <div className="text-[11px] text-slate-400 hidden sm:flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
                <span style={{ height: '20px', fontFamily: 'Times New Roman' }}>{mapViewMode === 'google-satellite' ? 'GDACS & Open-Meteo Synoptic Feed' : 'Kakinada-Godavari Sector'}</span>
              </div>

              {/* Maximize / Restore Window Size Toggle */}
              <button
                onClick={() => setIsMapFullscreen(!isMapFullscreen)}
                style={{ height: '20px', fontFamily: 'Times New Roman' }}
                className={`px-2.5 py-1 rounded-md transition-all flex items-center gap-1.5 text-xs font-bold border ${
                  isMapFullscreen
                    ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/50 shadow-sm'
                    : 'bg-slate-900/90 text-slate-300 border-slate-700 hover:border-slate-600 hover:text-white'
                }`}
                title={isMapFullscreen ? 'Restore Split View (80/20)' : 'Maximize Map Window (Full Width)'}
              >
                {isMapFullscreen ? <Minimize2 className="w-3.5 h-3.5 text-cyan-400" /> : <Maximize2 className="w-3.5 h-3.5 text-cyan-400" />}
                <span className="hidden sm:inline">{isMapFullscreen ? 'Restore View' : 'Maximize Map'}</span>
              </button>
            </div>
          </div>

          {/* Active Map View Render */}
          <div className="flex-1 relative overflow-hidden">
            {mapViewMode === 'google-satellite' ? (
              <GoogleMapsLiveTracking
                onInspectAssetInDrawer={() => setActiveDrawerTab('asset')}
              />
            ) : (
              <CycloneMap
                currentTimeStep={currentTimeStep}
                onTimeStepChange={handleTimeStepChange}
                selectedAsset={selectedAsset}
                onSelectAsset={handleSelectAsset}
                soundEnabled={soundEnabled}
              />
            )}
          </div>
        </section>

        {/* Dynamic Control Drawer & Gemini 3.7 Flash Analysis Feed */}
        {!isMapFullscreen && (
          <aside className="w-full lg:w-[20%] h-[25%] lg:h-full relative overflow-hidden">
            <ControlDrawer
              currentStepData={currentStepData}
              currentTimeStep={currentTimeStep}
              selectedAsset={selectedAsset}
              onSelectAsset={handleSelectAsset}
              allAssets={allAssets}
              assessment={assessment}
              isLoadingAssessment={isLoadingAssessment}
              onRunAssessment={() => triggerAssessment(currentTimeStep, forceSimulation)}
              onOpenParametricModal={() => setIsParametricOpen(true)}
              onOpenAdvisoryModal={() => setIsAdvisoryOpen(true)}
              onToggleMitigationTask={handleToggleMitigationTask}
              activeDrawerTab={activeDrawerTab}
              setActiveDrawerTab={setActiveDrawerTab}
            />
          </aside>
        )}
      </main>

      {/* Popups & Action Modals */}
      <ParametricModal
        isOpen={isParametricOpen}
        onClose={() => setIsParametricOpen(false)}
        windSpeedKmh={currentStepData.windSpeedKmh}
      />

      <AdvisoryModal
        isOpen={isAdvisoryOpen}
        onClose={() => setIsAdvisoryOpen(false)}
        timeStep={currentTimeStep}
      />

      <ThreatModelModal
        isOpen={isThreatModelOpen}
        onClose={() => setIsThreatModelOpen(false)}
      />

      <SitRepModal
        isOpen={isSitRepOpen}
        onClose={() => setIsSitRepOpen(false)}
        stepData={currentStepData}
        assets={allAssets}
        assessment={assessment}
      />
    </div>
  );
}
