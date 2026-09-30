/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Play, Pause, RotateCcw, FastForward, AlertTriangle, Zap, Waves, Users } from 'lucide-react';
import { TimeStepId } from '../../types/disaster';
import { TIME_STEPS } from '../../data/syntheticGeoData';

interface TimeSliderProps {
  currentTimeStep: TimeStepId;
  onTimeStepChange: (step: TimeStepId) => void;
  soundEnabled: boolean;
}

const STEP_ORDER: TimeStepId[] = ['T-72', 'T-48', 'T-24', 'T-12', 'T-6', 'T-0'];

export const TimeSlider: React.FC<TimeSliderProps> = ({
  currentTimeStep,
  onTimeStepChange,
  soundEnabled,
}) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(1); // 1x, 2x, 4x

  const currentIndex = STEP_ORDER.indexOf(currentTimeStep);
  const currentData = TIME_STEPS[currentTimeStep];

  // Playback timer
  useEffect(() => {
    if (!isPlaying) return;

    const intervalMs = 2400 / playbackSpeed;
    const timer = setInterval(() => {
      onTimeStepChange(
        STEP_ORDER[(STEP_ORDER.indexOf(currentTimeStep) + 1) % STEP_ORDER.length]
      );
    }, intervalMs);

    return () => clearInterval(timer);
  }, [isPlaying, playbackSpeed, currentTimeStep, onTimeStepChange]);

  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const index = parseInt(e.target.value, 10);
    onTimeStepChange(STEP_ORDER[index]);
  };

  return (
    <div 
      className="bg-slate-950/90 backdrop-blur-md border border-slate-800/90 rounded-xl p-2.5 shadow-2xl font-mono-tactical text-slate-100 max-w-lg w-full"
      style={{ height: '112px', width: '480px', maxWidth: '100%' }}
    >
      {/* Top row: Current Landfall Countdown & Key Gauges */}
      <div className="flex items-center justify-between mb-1">
        <div className="flex items-center gap-1.5">
          <div className="flex items-center gap-1 px-1.5 py-0.5 rounded bg-slate-900 border border-slate-700 text-[10px]">
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
            <span className="text-slate-400">TIMELINE:</span>
            <span className="font-bold text-cyan-300">{currentTimeStep}</span>
          </div>
          <span className="text-[10px] text-slate-400 hidden sm:inline">
            {currentData.hoursToLandfall === 0 ? 'LANDFALL' : `${currentData.hoursToLandfall}h`}
          </span>
        </div>

        {/* Dynamic Storm Impact Badges */}
        <div className="flex items-center gap-1.5 text-[10px]">
          <div className="flex items-center gap-1 px-1.5 py-0.5 rounded bg-blue-950/50 border border-blue-600/40 text-blue-300">
            <Waves className="w-3 h-3 text-blue-400" />
            <span className="text-slate-400">Surge:</span>
            <span className="font-bold">+{currentData.stormSurgeMeters}m</span>
          </div>

          <div className="flex items-center gap-1 px-1.5 py-0.5 rounded bg-amber-950/50 border border-amber-600/40 text-amber-300">
            <Zap className="w-3 h-3 text-amber-400" />
            <span className="text-slate-400">Wind:</span>
            <span className="font-bold">{currentData.windSpeedKmh}km/h</span>
          </div>
        </div>
      </div>

      {/* Main Track & Slider Input */}
      <div className="relative my-1 px-1">
        <input
          type="range"
          min="0"
          max={STEP_ORDER.length - 1}
          step="1"
          value={currentIndex}
          onChange={handleSliderChange}
          className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-400 focus:outline-none"
        />

        {/* Milestone Tick Labels */}
        <div className="flex justify-between text-[9px] text-slate-400 mt-0.5 select-none font-semibold">
          {STEP_ORDER.map((step) => {
            const isSelected = step === currentTimeStep;
            const isTrigger = step === 'T-24';
            return (
              <button
                key={step}
                onClick={() => onTimeStepChange(step)}
                className={`flex flex-col items-center group transition-colors ${
                  isSelected 
                    ? 'text-cyan-400 font-bold scale-105' 
                    : isTrigger 
                    ? 'text-yellow-400' 
                    : 'hover:text-slate-200'
                }`}
              >
                <span className={`w-1 h-1 rounded-full mb-0.5 ${
                  isSelected ? 'bg-cyan-400 ring-2 ring-cyan-400/40' : isTrigger ? 'bg-yellow-400' : 'bg-slate-700'
                }`} />
                <span>{step}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Playback Controls & Status Summary */}
      <div className="flex items-center justify-between pt-1 border-t border-slate-800/80 text-[10px]">
        {/* Play / Pause / Reset / Speed */}
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setIsPlaying(!isPlaying)}
            className="p-1 rounded-md bg-cyan-600 hover:bg-cyan-500 text-slate-950 font-bold transition-all shadow-[0_0_8px_rgba(6,182,212,0.3)]"
            title={isPlaying ? 'Pause' : 'Play'}
          >
            {isPlaying ? <Pause className="w-3 h-3" /> : <Play className="w-3 h-3" />}
          </button>

          <button
            onClick={() => {
              setIsPlaying(false);
              onTimeStepChange('T-72');
            }}
            className="p-1 rounded-md bg-slate-900 hover:bg-slate-850 text-slate-400 hover:text-slate-200 border border-slate-800"
            title="Reset"
          >
            <RotateCcw className="w-3 h-3" />
          </button>

          <div className="flex items-center rounded-md bg-slate-900 border border-slate-800 p-0.5 text-[9px]">
            {[1, 2, 4].map((speed) => (
              <button
                key={speed}
                onClick={() => setPlaybackSpeed(speed)}
                className={`px-1 py-0.2 rounded transition-colors ${
                  playbackSpeed === speed
                    ? 'bg-cyan-500/20 text-cyan-300 font-bold'
                    : 'text-slate-500 hover:text-slate-300'
                }`}
              >
                {speed}x
              </button>
            ))}
          </div>
        </div>

        {/* Affected Population & Evacuation Compliance */}
        <div className="flex items-center gap-2 text-[10px] text-slate-400">
          <div className="flex items-center gap-1">
            <Users className="w-3 h-3 text-slate-500" />
            <span className="font-bold text-slate-200">{currentData.populationAtRisk.toLocaleString()} at risk</span>
          </div>
          <span className="text-cyan-300 font-semibold hidden sm:inline">({currentData.evacuationCompliancePct}% evac)</span>
        </div>
      </div>
    </div>
  );
};
