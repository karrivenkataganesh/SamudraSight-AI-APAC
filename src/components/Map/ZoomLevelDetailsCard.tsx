/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { getZoomLevelDetails } from '../../utils/zoomDetails';
import { ZoomIn, ZoomOut, Search, Compass, Info, ChevronUp, ChevronDown, Eye } from 'lucide-react';

interface ZoomLevelDetailsCardProps {
  zoomLevel: number;
  centerCoords?: { lat: number; lng: number };
  onZoomIn: () => void;
  onZoomOut?: () => void;
  onSetPresetZoom: (zoom: number, coords?: [number, number]) => void;
  className?: string;
  themeContext?: 'satellite' | 'tactical';
}

export const ZoomLevelDetailsCard: React.FC<ZoomLevelDetailsCardProps> = ({
  zoomLevel,
  centerCoords,
  onZoomIn,
  onZoomOut,
  onSetPresetZoom,
  className = '',
  themeContext = 'tactical',
}) => {
  const [showDetailedModal, setShowDetailedModal] = useState<boolean>(false);
  const details = getZoomLevelDetails(zoomLevel);

  return (
    <div className={`font-mono-tactical pointer-events-auto flex flex-col items-end gap-1.5 select-none ${className}`}>
      {/* Expanded Detailed Zoom Telemetry Card */}
      {showDetailedModal && (
        <div className="w-72 sm:w-80 p-3 rounded-xl bg-slate-950/95 border border-cyan-500/50 backdrop-blur-xl shadow-2xl text-[11px] text-slate-200 space-y-2 animate-in fade-in slide-in-from-bottom-2 duration-150">
          <div className="flex items-center justify-between border-b border-slate-800 pb-1.5">
            <div className="flex items-center gap-1.5 font-bold text-cyan-300">
              <Eye className="w-3.5 h-3.5 text-cyan-400" />
              <span>OPTICAL ZOOM TELEMETRY</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="px-1.5 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-700/60 text-[9px] font-black">
                LEVEL {details.zoom}x
              </span>
              <button
                onClick={() => setShowDetailedModal(false)}
                className="p-1 rounded text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                title="Close Details Window"
              >
                <ChevronDown className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Quick Metrics Grid */}
          <div className="grid grid-cols-2 gap-1.5 bg-slate-900/90 p-2 rounded-lg border border-slate-800 text-[10px]">
            <div>
              <span className="text-slate-500 block text-[9px] uppercase font-bold">Cartographic Scale</span>
              <strong className="text-white text-xs">{details.scaleRatio}</strong>
            </div>
            <div>
              <span className="text-slate-500 block text-[9px] uppercase font-bold">Pixel Resolution</span>
              <strong className="text-amber-300 text-xs">{details.resolutionMetersPerPx}</strong>
            </div>
            <div>
              <span className="text-slate-500 block text-[9px] uppercase font-bold">Field of View (FOV)</span>
              <strong className="text-cyan-300">{details.fovKm}</strong>
            </div>
            <div>
              <span className="text-slate-500 block text-[9px] uppercase font-bold">Category</span>
              <strong className="text-white truncate block">{details.category}</strong>
            </div>
          </div>

          {/* Equivalent Altitude & Surveillance Use */}
          <div className="space-y-1 text-[10px]">
            <div className="flex justify-between items-center text-slate-400">
              <span>Sensor Altitude:</span>
              <span className="text-slate-200 font-semibold">{details.altitudeEquivalent}</span>
            </div>
            {centerCoords && (
              <div className="flex justify-between items-center text-slate-400">
                <span>View Center:</span>
                <span className="text-cyan-300 font-bold">{centerCoords.lat.toFixed(4)}°N, {centerCoords.lng.toFixed(4)}°E</span>
              </div>
            )}
            <div className="p-1.5 rounded bg-slate-900 border border-slate-800/80 text-[10px] text-slate-300">
              <span className="text-slate-400 font-bold block mb-0.5">Operational Profile:</span>
              {details.recommendedUse}
            </div>
          </div>

          {/* Quick Zoom Presets in Modal */}
          <div className="border-t border-slate-800/80 pt-1.5">
            <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider block mb-1">
              Jump To Zoom Level:
            </span>
            <div className="grid grid-cols-4 gap-1 text-[10px]">
              <button
                onClick={() => onSetPresetZoom(7)}
                className={`py-1 rounded text-center transition-colors ${zoomLevel <= 8 ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 font-bold' : 'bg-slate-900 text-slate-300 hover:text-white border border-slate-800'}`}
              >
                Region
              </button>
              <button
                onClick={() => onSetPresetZoom(11, [16.9850, 82.2500])}
                className={`py-1 rounded text-center transition-colors ${zoomLevel >= 9 && zoomLevel <= 12 ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 font-bold' : 'bg-slate-900 text-slate-300 hover:text-white border border-slate-800'}`}
              >
                Sector
              </button>
              <button
                onClick={() => onSetPresetZoom(14)}
                className={`py-1 rounded text-center transition-colors ${zoomLevel >= 13 && zoomLevel <= 15 ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 font-bold' : 'bg-slate-900 text-slate-300 hover:text-white border border-slate-800'}`}
              >
                Village
              </button>
              <button
                onClick={() => onSetPresetZoom(17)}
                className={`py-1 rounded text-center transition-colors ${zoomLevel >= 16 ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 font-bold' : 'bg-slate-900 text-slate-300 hover:text-white border border-slate-800'}`}
              >
                Street
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Small Window Box named "Open to See details" */}
      <div className="flex items-center gap-1.5 p-1 rounded-xl bg-slate-950/90 border border-slate-800 backdrop-blur-md shadow-2xl text-[10px]">
        {/* Button named "Open to See details" */}
        <button
          onClick={() => setShowDetailedModal(!showDetailedModal)}
          className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg transition-all font-bold cursor-pointer ${
            showDetailedModal
              ? 'bg-cyan-500/25 text-cyan-200 border border-cyan-400 shadow-sm'
              : 'bg-slate-900 hover:bg-slate-850 text-slate-200 border border-slate-700 hover:border-cyan-500/50 hover:text-white'
          }`}
          title="Open to See details (Optical Zoom & Scale Telemetry)"
        >
          <Search className="w-3.5 h-3.5 text-cyan-400" />
          <span className="text-cyan-300">Open to See details</span>
          <span className="text-[9px] px-1.5 py-0.2 rounded bg-cyan-950 text-cyan-400 border border-cyan-800/60 font-black ml-0.5">
            {details.zoom}x
          </span>
          {showDetailedModal ? (
            <ChevronDown className="w-3 h-3 text-cyan-300 ml-0.5" />
          ) : (
            <ChevronUp className="w-3 h-3 text-slate-400 group-hover:text-white ml-0.5" />
          )}
        </button>

        {/* Quick Zoom In (+) */}
        <button
          onClick={onZoomIn}
          className="p-1 rounded-md bg-slate-900 hover:bg-slate-850 border border-slate-700/80 text-cyan-400 hover:text-cyan-300 transition-colors shadow"
          title="Zoom In (+)"
        >
          <ZoomIn className="w-3.5 h-3.5" />
        </button>

        {/* Quick Zoom Out (-) */}
        {onZoomOut && (
          <button
            onClick={onZoomOut}
            className="p-1 rounded-md bg-slate-900 hover:bg-slate-850 border border-slate-700/80 text-cyan-400 hover:text-cyan-300 transition-colors shadow"
            title="Zoom Out (-)"
          >
            <ZoomOut className="w-3.5 h-3.5" />
          </button>
        )}
      </div>
    </div>
  );
};
