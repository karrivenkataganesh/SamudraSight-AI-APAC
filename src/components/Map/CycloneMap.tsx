/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useMemo, useRef, useState } from 'react';
import L from 'leaflet';
import { CriticalAsset, EvacuationRoute, TimeStepId } from '../../types/disaster';
import { CRITICAL_ASSETS, EVACUATION_ROUTES, FLOOD_POLYGONS, TIME_STEPS } from '../../data/syntheticGeoData';
import { COASTAL_SETTLEMENTS, CoastalSettlement, calculateSettlementRisk } from '../../data/coastalSettlements';
import { TimeSlider } from './TimeSlider';
import { TacticalSectorLegend } from './TacticalSectorLegend';
import { ZoomLevelDetailsCard } from './ZoomLevelDetailsCard';
import { createFloodDepthHeatmap, createWindVelocityHeatmap, createPopulationDensityHeatmap } from '../../utils/tacticalHeatmaps';
import { Layers, Crosshair, ZoomIn, ZoomOut, AlertTriangle, Shield, Zap, Hospital, Ban, Compass, Radio, MapPin, Building2, Anchor, Users, ChevronDown, ChevronUp, Wind, Waves, Grid, Flame } from 'lucide-react';

interface CycloneMapProps {
  currentTimeStep: TimeStepId;
  onTimeStepChange: (step: TimeStepId) => void;
  selectedAsset: CriticalAsset | null;
  onSelectAsset: (asset: CriticalAsset) => void;
  soundEnabled: boolean;
}

export const CycloneMap: React.FC<CycloneMapProps> = ({
  currentTimeStep,
  onTimeStepChange,
  selectedAsset,
  onSelectAsset,
  soundEnabled,
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const baseTileLayerRef = useRef<L.TileLayer | null>(null);
  const labelsTileLayerRef = useRef<L.TileLayer | null>(null);
  const floodLayerRef = useRef<L.Polygon | null>(null);
  const markersGroupRef = useRef<L.LayerGroup | null>(null);
  const settlementsGroupRef = useRef<L.LayerGroup | null>(null);
  const routesGroupRef = useRef<L.LayerGroup | null>(null);
  const radarGroupRef = useRef<L.LayerGroup | null>(null);
  
  // Tactical Risk Heatmaps Layer Refs
  const floodDepthHeatmapRef = useRef<L.LayerGroup | null>(null);
  const windVelocityHeatmapRef = useRef<L.LayerGroup | null>(null);
  const populationDensityHeatmapRef = useRef<L.LayerGroup | null>(null);

  // Basemap style: default to high-resolution satellite imagery (like Google Maps Satellite Live Tracking)
  const [baseMapStyle, setBaseMapStyle] = useState<'hybrid' | 'satellite' | 'dark'>('hybrid');

  // Layer toggles: focused only on city names & locations for people evaluation and the danger zone
  const [showFlood, setShowFlood] = useState(true);
  const [showSettlements, setShowSettlements] = useState(true);
  const [showAssets, setShowAssets] = useState(false);
  const [showRoutes, setShowRoutes] = useState(false);
  const [showRadar, setShowRadar] = useState(false);
  const [showLayersMenu, setShowLayersMenu] = useState(false);
  const [showEvaluationRoster, setShowEvaluationRoster] = useState(false);
  const [selectedSettlement, setSelectedSettlement] = useState<CoastalSettlement | null>(null);
  const [settlementRiskFilter, setSettlementRiskFilter] = useState<'ALL' | 'CRITICAL' | 'SAFE'>('ALL');
  
  // Granular Risk Heatmaps Toggles
  const [showFloodDepthHeatmap, setShowFloodDepthHeatmap] = useState<boolean>(false);
  const [showWindVelocityHeatmap, setShowWindVelocityHeatmap] = useState<boolean>(false);
  const [showPopulationDensityHeatmap, setShowPopulationDensityHeatmap] = useState<boolean>(false);
  const [showTacticalGrid, setShowTacticalGrid] = useState<boolean>(false);

  // Zoom and Camera Telemetry State
  const [zoomLevel, setZoomLevel] = useState<number>(11);
  const [mapCenterCoords, setMapCenterCoords] = useState<{ lat: number; lng: number }>({ lat: 16.9850, lng: 82.2500 });

  // Calculate people risk evaluation for all cities/locations at current timeline step to determine which city is at MOST risk
  const evaluatedSettlements = useMemo(() => {
    const stepData = TIME_STEPS[currentTimeStep];
    const stormCenter = { lat: 16.9800, lng: 82.3800 };
    return COASTAL_SETTLEMENTS.map((settlement) => {
      const risk = calculateSettlementRisk(settlement, stormCenter, stepData.stormSurgeMeters, stepData.windSpeedKmh);
      let score = 0;
      if (risk.level === 'CATASTROPHIC') score += 1000;
      else if (risk.level === 'CRITICAL') score += 500;
      else if (risk.level === 'HIGH') score += 250;
      else if (risk.level === 'MODERATE') score += 100;
      else score += 10;
      score += Math.max(0, (risk.inundationPotentialMeters || 0) * 100);
      score += Math.max(0, 300 - (risk.distanceToEyeKm || 300));

      return {
        settlement,
        risk,
        score,
      };
    }).sort((a, b) => b.score - a.score);
  }, [currentTimeStep]);

  const mostAtRiskCity = evaluatedSettlements[0];

  // Initialize Map
  useEffect(() => {
    if (!mapContainerRef.current || mapInstanceRef.current) return;

    // Center on coastal Kakinada / Godavari Delta, Bay of Bengal
    const map = L.map(mapContainerRef.current, {
      center: [16.9850, 82.2500],
      zoom: 11,
      zoomControl: false,
      attributionControl: true,
      minZoom: 4,
      maxZoom: 19,
      scrollWheelZoom: true,
      doubleClickZoom: true,
      touchZoom: true,
    });

    map.on('zoomend', () => {
      setZoomLevel(map.getZoom());
    });

    map.on('moveend', () => {
      const c = map.getCenter();
      setMapCenterCoords({ lat: c.lat, lng: c.lng });
    });

    // High-Resolution Satellite Base Layer (Like Google Maps Satellite Live Tracking)
    baseTileLayerRef.current = L.tileLayer(
      'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
      {
        attribution: 'Tiles &copy; Esri &mdash; High-Resolution Satellite Surveillance',
        maxZoom: 19,
      }
    ).addTo(map);

    // Hybrid Place Names, Cities, Roads & Infrastructure Overlay
    labelsTileLayerRef.current = L.tileLayer(
      'https://services.arcgisonline.com/ArcGIS/rest/services/Reference/World_Boundaries_and_Places/MapServer/tile/{z}/{y}/{x}',
      {
        attribution: 'Labels &copy; Esri &mdash; Places & Infrastructure',
        maxZoom: 19,
        opacity: 0.95,
      }
    ).addTo(map);

    // Create layer groups
    settlementsGroupRef.current = L.layerGroup().addTo(map);
    markersGroupRef.current = L.layerGroup().addTo(map);
    routesGroupRef.current = L.layerGroup().addTo(map);
    radarGroupRef.current = L.layerGroup().addTo(map);

    mapInstanceRef.current = map;

    // Observe container size changes (e.g. Maximize Map full window toggle)
    const resizeObserver = new ResizeObserver(() => {
      map.invalidateSize();
    });
    if (mapContainerRef.current) {
      resizeObserver.observe(mapContainerRef.current);
    }

    return () => {
      resizeObserver.disconnect();
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  // Dynamic Basemap Switcher (Satellite Hybrid, Pure Satellite, or Dark Matter)
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    if (baseTileLayerRef.current) {
      map.removeLayer(baseTileLayerRef.current);
      baseTileLayerRef.current = null;
    }
    if (labelsTileLayerRef.current) {
      map.removeLayer(labelsTileLayerRef.current);
      labelsTileLayerRef.current = null;
    }

    if (baseMapStyle === 'dark') {
      baseTileLayerRef.current = L.tileLayer(
        'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png',
        {
          attribution: '&copy; CARTO | Dark Tactical Base',
          subdomains: 'abcd',
          maxZoom: 19,
        }
      ).addTo(map);
    } else {
      // High-resolution Satellite Imagery (matches Google Maps Satellite Live Tracking)
      baseTileLayerRef.current = L.tileLayer(
        'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
        {
          attribution: 'Tiles &copy; Esri &mdash; High-Resolution Satellite Surveillance',
          maxZoom: 19,
        }
      ).addTo(map);

      if (baseMapStyle === 'hybrid') {
        labelsTileLayerRef.current = L.tileLayer(
          'https://services.arcgisonline.com/ArcGIS/rest/services/Reference/World_Boundaries_and_Places/MapServer/tile/{z}/{y}/{x}',
          {
            attribution: 'Labels &copy; Esri &mdash; Places & Infrastructure',
            maxZoom: 19,
            opacity: 0.95,
          }
        ).addTo(map);
      }
    }
  }, [baseMapStyle]);

  // Update Flood Depth Risk Heatmap
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    if (floodDepthHeatmapRef.current) {
      map.removeLayer(floodDepthHeatmapRef.current);
      floodDepthHeatmapRef.current = null;
    }

    if (showFloodDepthHeatmap) {
      const layer = createFloodDepthHeatmap(currentTimeStep);
      layer.addTo(map);
      floodDepthHeatmapRef.current = layer;
    }
  }, [showFloodDepthHeatmap, currentTimeStep]);

  // Update Wind Velocity Zones Risk Heatmap
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    if (windVelocityHeatmapRef.current) {
      map.removeLayer(windVelocityHeatmapRef.current);
      windVelocityHeatmapRef.current = null;
    }

    if (showWindVelocityHeatmap) {
      const layer = createWindVelocityHeatmap(currentTimeStep);
      layer.addTo(map);
      windVelocityHeatmapRef.current = layer;
    }
  }, [showWindVelocityHeatmap, currentTimeStep]);

  // Update Population Density Risk Heatmap
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    if (populationDensityHeatmapRef.current) {
      map.removeLayer(populationDensityHeatmapRef.current);
      populationDensityHeatmapRef.current = null;
    }

    if (showPopulationDensityHeatmap) {
      const layer = createPopulationDensityHeatmap();
      layer.addTo(map);
      populationDensityHeatmapRef.current = layer;
    }
  }, [showPopulationDensityHeatmap]);

  // Update Dynamic Flood Polygon on TimeStep Change
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    if (floodLayerRef.current) {
      map.removeLayer(floodLayerRef.current);
      floodLayerRef.current = null;
    }

    if (!showFlood) return;

    const polygonFeature = FLOOD_POLYGONS[currentTimeStep];
    const stepData = TIME_STEPS[currentTimeStep];

    // GeoJSON is [lng, lat], Leaflet wants [lat, lng]
    const latLngs = polygonFeature.geometry.coordinates[0].map(([lng, lat]) => [lat, lng] as [number, number]);

    const polygon = L.polygon(latLngs, {
      color: polygonFeature.properties.color,
      weight: 3,
      dashArray: '8, 8',
      fillColor: polygonFeature.properties.fillColor,
      fillOpacity: Math.min(0.65, polygonFeature.properties.fillOpacity + 0.12),
    }).addTo(map);

    polygon.bindPopup(`
      <div class="p-3.5 font-mono-tactical text-xs text-slate-100 bg-slate-950 rounded-xl border border-red-500 shadow-2xl space-y-2">
        <div class="flex items-center justify-between border-b border-slate-800 pb-2">
          <div class="flex items-center gap-1.5 font-bold text-sm text-red-400">
            <span>🌊 DANGER ZONE: SURGE INUNDATION</span>
          </div>
          <span class="px-2 py-0.5 rounded text-[9px] font-bold bg-red-950 text-red-300 border border-red-500 uppercase">
            ${polygonFeature.properties.hazardLevel} THREAT
          </span>
        </div>
        <div class="grid grid-cols-2 gap-2 text-[11px] bg-slate-900/90 p-2 rounded-lg border border-slate-800">
          <div><span class="text-slate-500 block text-[9px]">Timeline Step</span> <strong class="text-white">${currentTimeStep}</strong></div>
          <div><span class="text-slate-500 block text-[9px]">Surge Inundation Crest</span> <strong class="text-amber-400 font-bold">+${stepData.stormSurgeMeters}m MSL</strong></div>
          <div><span class="text-slate-500 block text-[9px]">Inundated Land Area</span> <strong class="text-cyan-300">${stepData.coastalInundationSqKm} km²</strong></div>
          <div><span class="text-slate-500 block text-[9px]">Sustained Wind Speed</span> <strong class="text-red-400">${stepData.windSpeedKmh} km/h</strong></div>
        </div>
        <div class="text-[10px] text-slate-400 pt-1 border-t border-slate-800 flex justify-between">
          <span>Active Coastal Hazard Model</span>
          <span class="text-cyan-400">Godavari-Kakinada Sector</span>
        </div>
      </div>
    `);

    floodLayerRef.current = polygon;
  }, [currentTimeStep, showFlood]);

  // Update Coastal Settlements & Location Risk Markers
  useEffect(() => {
    const group = settlementsGroupRef.current;
    if (!group) return;

    group.clearLayers();
    if (!showSettlements) return;

    const stepData = TIME_STEPS[currentTimeStep];
    const stormCenter = { lat: 16.9800, lng: 82.3800 }; // Bay of Bengal storm approach point

    // Filter settlements according to risk filter
    const filteredSettlements = COASTAL_SETTLEMENTS.filter((settlement) => {
      const risk = calculateSettlementRisk(settlement, stormCenter, stepData.stormSurgeMeters, stepData.windSpeedKmh);
      if (settlementRiskFilter === 'CRITICAL') {
        return risk.level === 'CATASTROPHIC' || risk.level === 'CRITICAL';
      }
      if (settlementRiskFilter === 'SAFE') {
        return risk.level === 'LOW_SAFE';
      }
      return true;
    });

    filteredSettlements.forEach((settlement) => {
      const risk = calculateSettlementRisk(
        settlement,
        stormCenter,
        stepData.stormSurgeMeters,
        stepData.windSpeedKmh
      );

      const isMostAtRisk = settlement.id === mostAtRiskCity?.settlement.id;
      const isSelected = selectedSettlement?.id === settlement.id;

      // Color coding
      let pinColor = '#3b82f6';
      let dotColor = '#60a5fa';
      let pingHtml = '';

      if (isMostAtRisk || risk.level === 'CATASTROPHIC') {
        pinColor = '#ef4444';
        dotColor = '#dc2626';
        pingHtml = '<div class="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full animate-ping"></div><div class="absolute -top-2 -right-2 w-5 h-5 bg-red-500/40 rounded-full animate-pulse"></div>';
      } else if (risk.level === 'CRITICAL') {
        pinColor = '#f43f5e';
        dotColor = '#e11d48';
        pingHtml = '<div class="absolute -top-1 -right-1 w-2.5 h-2.5 bg-rose-500 rounded-full animate-ping"></div>';
      } else if (risk.level === 'HIGH') {
        pinColor = '#f59e0b';
        dotColor = '#d97706';
      } else if (risk.level === 'MODERATE') {
        pinColor = '#eab308';
        dotColor = '#ca8a04';
      } else {
        pinColor = '#10b981';
        dotColor = '#059669';
      }

      const formattedPop = settlement.population >= 1000
        ? `${(settlement.population / 1000).toFixed(0)}k`
        : settlement.population.toString();

      const mostRiskBadge = isMostAtRisk
        ? `<div class="absolute -top-3.5 left-1/2 -translate-x-1/2 px-1.5 py-0.2 rounded bg-red-600 border border-white text-[8px] font-black text-white whitespace-nowrap shadow-xl animate-bounce z-20 flex items-center gap-0.5">
             <span>🚨</span>
             <span>MOST RISK</span>
           </div>`
        : '';

      const iconHtml = `
        <div class="relative group cursor-pointer flex flex-col items-center">
          ${mostRiskBadge}
          ${pingHtml}
          <!-- Location Name Tag with Population and Risk -->
          <div class="px-2 py-0.5 rounded-md border flex items-center gap-1.5 shadow-2xl transition-all group-hover:scale-105"
               style="background-color: rgba(2, 6, 23, 0.94); border-color: ${pinColor}; box-shadow: 0 0 12px ${pinColor}66;">
            <div class="w-2.5 h-2.5 rounded-full shrink-0" style="background-color: ${dotColor};"></div>
            <div class="flex flex-col leading-none">
              <span class="text-[11px] font-bold text-white tracking-tight">${settlement.name}</span>
              <span class="text-[8px] text-slate-400 font-mono-tactical">👥 ${formattedPop} pop</span>
            </div>
            <span class="text-[8px] px-1 py-0.5 rounded font-extrabold tracking-wider uppercase ml-0.5"
                  style="background-color: ${pinColor}22; color: ${pinColor}; border: 1px solid ${pinColor}44;">
              ${isMostAtRisk ? 'MOST RISK' : risk.level === 'LOW_SAFE' ? 'SAFE' : risk.level}
            </span>
          </div>

          <!-- Little Anchor Pointer -->
          <div class="w-1.5 h-2 -mt-0.5" style="background-color: ${pinColor}; clip-path: polygon(0 0, 100% 0, 50% 100%);"></div>
        </div>
      `;

      const customIcon = L.divIcon({
        className: 'custom-settlement-label-pin',
        html: iconHtml,
        iconSize: [145, 38],
        iconAnchor: [72, 36],
      });

      const marker = L.marker([settlement.coordinates.lat, settlement.coordinates.lng], { icon: customIcon });

      const popupHtml = `
        <div class="p-3.5 font-mono-tactical text-xs text-slate-100 bg-slate-950 rounded-xl border border-slate-800 shadow-2xl max-w-xs space-y-2">
          ${isMostAtRisk ? `
            <div class="px-2 py-1 rounded bg-red-950/90 border border-red-500 text-red-200 text-[10px] font-black flex items-center justify-between">
              <span>🚨 #1 MOST AT-RISK LOCATION IN DANGER ZONE</span>
              <span class="text-white">${currentTimeStep}</span>
            </div>
          ` : ''}
          <div class="flex items-center justify-between border-b border-slate-800 pb-2">
            <div>
              <div class="font-bold text-sm text-white flex items-center gap-1.5">
                <span>📍 ${settlement.name}</span>
                ${settlement.localNameTelugu ? `<span class="text-xs text-slate-400 font-sans">(${settlement.localNameTelugu})</span>` : ''}
              </div>
              <div class="text-[10px] text-slate-400">${settlement.type}</div>
            </div>
            <span class="px-2 py-0.5 rounded text-[9px] font-bold border" 
                  style="background-color: ${pinColor}22; color: ${pinColor}; border-color: ${pinColor};">
              ${risk.badgeLabel}
            </span>
          </div>

          <div class="p-2 rounded bg-slate-900/90 border border-slate-800 space-y-1 text-[11px]">
            <div class="text-[9px] uppercase font-bold text-slate-400 flex items-center gap-1">
              <span>👥</span> People Evaluation
            </div>
            <div class="grid grid-cols-2 gap-1 text-[10px]">
              <div><span class="text-slate-500">Population:</span> <strong class="text-white">${settlement.population.toLocaleString()}</strong></div>
              <div><span class="text-slate-500">Households:</span> <strong class="text-slate-200">${settlement.estimatedHouseholds.toLocaleString()}</strong></div>
              <div><span class="text-slate-500">Evac Status:</span> <strong class="text-amber-300 truncate block">${settlement.evacuationStatus}</strong></div>
              <div><span class="text-slate-500">Surge Crest:</span> <strong class="${risk.inundationPotentialMeters > 0 ? 'text-red-400 font-bold' : 'text-emerald-400'}">${risk.inundationPotentialMeters > 0 ? `+${risk.inundationPotentialMeters}m Breach` : 'Zero Threat'}</strong></div>
            </div>
          </div>

          <div class="grid grid-cols-2 gap-2 text-[11px] bg-slate-900/80 p-2 rounded-lg border border-slate-800">
            <div>
              <span class="text-slate-500 block text-[9px]">Ground Elevation</span>
              <strong class="text-slate-200">${settlement.elevationMeters}m MSL</strong>
            </div>
            <div>
              <span class="text-slate-500 block text-[9px]">Distance to Storm Eye</span>
              <strong class="text-amber-300">${risk.distanceToEyeKm} km</strong>
            </div>
          </div>

          <div class="text-[11px] text-slate-300 leading-relaxed border-t border-slate-800 pt-1.5">
            <span class="text-[10px] text-slate-400 font-bold block mb-0.5">Primary Hazard:</span>
            ${settlement.primaryHazard}
          </div>

          <div class="p-2 rounded bg-slate-900 border text-[10px] leading-snug" style="border-color: ${pinColor}44;">
            <span class="font-bold text-slate-300 block mb-0.5">Civil Protection Action Directive:</span>
            <span class="${risk.level === 'LOW_SAFE' ? 'text-emerald-300' : 'text-amber-300'}">${risk.actionGuidance}</span>
          </div>

          <div class="text-[9px] text-slate-500 flex justify-between pt-1">
            <span>Status: ${settlement.evacuationStatus}</span>
            <span>Dist to Coast: ${settlement.distanceToCoastKm}km</span>
          </div>
        </div>
      `;

      marker.bindPopup(popupHtml, { maxWidth: 320 });
      marker.on('click', () => {
        setSelectedSettlement(settlement);
        mapInstanceRef.current?.flyTo([settlement.coordinates.lat, settlement.coordinates.lng], 13, { duration: 0.8 });
      });

      group.addLayer(marker);
    });
  }, [showSettlements, currentTimeStep, settlementRiskFilter, selectedSettlement]);

  // Update Critical Infrastructure Markers
  useEffect(() => {
    const group = markersGroupRef.current;
    if (!group) return;

    group.clearLayers();
    if (!showAssets) return;

    CRITICAL_ASSETS.forEach((asset) => {
      // Choose icon and color scheme based on status and type
      const isSelected = selectedAsset?.id === asset.id;
      let badgeColor = '#06b6d4'; // default cyan
      let pulseClass = '';

      if (asset.status === 'Critical') {
        badgeColor = '#ef4444'; // red
        pulseClass = 'pulse-red-glow';
      } else if (asset.status === 'Warning') {
        badgeColor = '#f59e0b'; // amber
      } else if (asset.status === 'Blocked') {
        badgeColor = '#dc2626'; // dark red
        pulseClass = 'pulse-red-glow';
      } else if (asset.status === 'Safe') {
        badgeColor = '#10b981'; // emerald
      }

      // Custom HTML Marker with glowing halo
      const iconHtml = `
        <div class="relative group cursor-pointer flex items-center justify-center">
          <div class="w-8 h-8 rounded-full flex items-center justify-center ${pulseClass}" 
               style="background-color: ${badgeColor}22; border: 2px solid ${badgeColor}; box-shadow: 0 0 12px ${badgeColor}88;">
            <div class="w-3 h-3 rounded-full" style="background-color: ${badgeColor};"></div>
          </div>
          ${isSelected ? `<div class="absolute -top-1 -right-1 w-3 h-3 bg-white rounded-full ring-2 ring-cyan-500 animate-ping"></div>` : ''}
          <div class="absolute -bottom-6 left-1/2 -translate-x-1/2 px-1.5 py-0.5 rounded bg-slate-950/90 border border-slate-700 text-[10px] font-mono-tactical text-slate-200 whitespace-nowrap pointer-events-none shadow-lg">
            ${asset.name.split(' (')[0]}
          </div>
        </div>
      `;

      const customIcon = L.divIcon({
        className: 'custom-tactical-pin',
        html: iconHtml,
        iconSize: [32, 32],
        iconAnchor: [16, 16],
      });

      const marker = L.marker(asset.location, { icon: customIcon });

      const assetPopupHtml = `
        <div class="p-3.5 font-mono-tactical text-xs text-slate-100 bg-slate-950 rounded-xl border border-slate-800 shadow-2xl max-w-sm space-y-2.5">
          <!-- Asset Header -->
          <div class="flex items-center justify-between border-b border-slate-800 pb-2">
            <div>
              <div class="font-bold text-sm text-white flex items-center gap-1.5">
                <span>${asset.type === 'hospital' ? '🏥' : asset.type === 'power' ? '⚡' : asset.type === 'shelter' ? '🛡️' : asset.type === 'water' ? '💧' : asset.type === 'port' ? '⚓' : '🛣️'}</span>
                <span>${asset.name}</span>
              </div>
              <div class="text-[10px] text-slate-400 capitalize">Type: ${asset.type} • Elevation: ${asset.elevationMeters}m MSL</div>
            </div>
            <span class="px-2 py-0.5 rounded text-[9px] font-bold border" 
                  style="background-color: ${badgeColor}22; color: ${badgeColor}; border-color: ${badgeColor};">
              ${asset.status}
            </span>
          </div>

          <!-- Key Metrics Grid -->
          <div class="grid grid-cols-2 gap-1.5 text-[11px] bg-slate-900/80 p-2 rounded-lg border border-slate-800">
            <div>
              <span class="text-slate-500 block text-[9px]">Flood Threshold</span>
              <strong class="text-slate-200">${asset.floodThresholdMeters}m MSL</strong>
            </div>
            <div>
              <span class="text-slate-500 block text-[9px]">Current Inundation</span>
              <strong class="${asset.currentInundationMeters > 0 ? 'text-red-400 font-bold' : 'text-emerald-400'}">
                ${asset.currentInundationMeters > 0 ? `+${asset.currentInundationMeters}m Threat` : 'Safe (0.0m)'}
              </strong>
            </div>
            <div>
              <span class="text-slate-500 block text-[9px]">Capacity / Load</span>
              <strong class="text-slate-300 text-[10px] truncate block">${asset.capacityOrLoad}</strong>
            </div>
            <div>
              <span class="text-slate-500 block text-[9px]">Backup Power</span>
              <strong class="${asset.backupPowerStatus.includes('At Risk') ? 'text-red-400' : 'text-cyan-300'} text-[10px] truncate block">${asset.backupPowerStatus}</strong>
            </div>
          </div>

          <p class="text-[11px] text-slate-300 leading-relaxed">
            ${asset.description}
          </p>

          <!-- Subtle Expand Interaction: Granular Telemetry & Sensors -->
          <details class="group rounded-lg border border-slate-800 bg-slate-900/90 overflow-hidden transition-all duration-200">
            <summary class="flex items-center justify-between p-2 text-[10px] font-bold text-cyan-300 hover:text-cyan-200 cursor-pointer select-none bg-slate-900 group-hover:bg-slate-850 transition-colors">
              <span class="flex items-center gap-1.5">
                <span>📡</span>
                <span>Granular Sensors & Contact Telemetry</span>
              </span>
              <span class="text-[9px] px-1.5 py-0.5 rounded bg-cyan-950/80 border border-cyan-700/60 text-cyan-300 flex items-center gap-1">
                <span class="group-open:hidden">Expand ▾</span>
                <span class="hidden group-open:inline">Collapse ▴</span>
              </span>
            </summary>

            <div class="p-2.5 pt-2 space-y-2 border-t border-slate-800/80 text-[10px]">
              <!-- Contact Information -->
              <div class="bg-slate-950/70 p-2 rounded border border-slate-800">
                <span class="text-slate-400 block text-[9px] uppercase font-bold mb-0.5 flex items-center gap-1">
                  <span>📞</span> Emergency Contact Agency
                </span>
                <div class="font-semibold text-slate-200">${asset.contactAgency}</div>
                <div class="text-slate-400 text-[9px] mt-0.5">Personnel On-Site: <strong class="text-cyan-300">${asset.personnelCount} specialists</strong></div>
              </div>

              <!-- Real-Time Sensor Status -->
              <div>
                <span class="text-slate-400 block text-[9px] uppercase font-bold mb-1 flex items-center gap-1">
                  <span>⚡</span> Real-Time Sensor Feeds
                </span>
                <div class="grid grid-cols-1 gap-1">
                  ${asset.liveSensorData.map(sensor => {
                    const statusColor = sensor.status === 'alert' ? 'text-red-400 bg-red-950/60 border-red-500/50' : sensor.status === 'warn' ? 'text-amber-400 bg-amber-950/60 border-amber-500/50' : 'text-emerald-400 bg-emerald-950/60 border-emerald-500/50';
                    const dotColor = sensor.status === 'alert' ? 'bg-red-500' : sensor.status === 'warn' ? 'bg-amber-500' : 'bg-emerald-500';
                    return `
                      <div class="flex items-center justify-between p-1.5 rounded bg-slate-950 border border-slate-800">
                        <span class="text-slate-300 flex items-center gap-1.5">
                          <span class="w-1.5 h-1.5 rounded-full ${dotColor}"></span>
                          <span>${sensor.label}</span>
                        </span>
                        <span class="px-1.5 py-0.2 rounded text-[9px] font-bold border ${statusColor}">
                          ${sensor.value}
                        </span>
                      </div>
                    `;
                  }).join('')}
                </div>
              </div>

              <!-- Urgent Mitigation Task Counter -->
              <div class="text-[9px] text-slate-400 flex items-center justify-between pt-1 border-t border-slate-800">
                <span>Mitigation Tasks: ${asset.mitigationChecklist.filter(t => t.completed).length}/${asset.mitigationChecklist.length} Complete</span>
                <span class="text-amber-300">${asset.mitigationChecklist.filter(t => !t.completed && t.urgent).length} Urgent</span>
              </div>
            </div>
          </details>
        </div>
      `;

      marker.bindPopup(assetPopupHtml, { maxWidth: 350 });

      marker.on('click', () => {
        onSelectAsset(asset);
      });

      group.addLayer(marker);
    });
  }, [showAssets, selectedAsset, onSelectAsset]);

  // Update Evacuation Routes Polylines
  useEffect(() => {
    const group = routesGroupRef.current;
    if (!group) return;

    group.clearLayers();
    if (!showRoutes) return;

    EVACUATION_ROUTES.forEach((route) => {
      const isBlocked = route.status === 'Blocked';
      const isCongested = route.status === 'Congested';
      const color = isBlocked ? '#ef4444' : isCongested ? '#f59e0b' : '#10b981';

      const polyline = L.polyline(route.coordinates, {
        color,
        weight: isBlocked ? 5 : 4,
        dashArray: isBlocked ? '8, 8' : undefined,
        opacity: 0.85,
      });

      polyline.bindPopup(`
        <div class="p-2.5 font-mono-tactical text-xs text-slate-100 bg-slate-900 rounded">
          <div class="font-bold text-sm ${isBlocked ? 'text-red-400' : 'text-emerald-400'} mb-1">
            ${isBlocked ? '🚫' : '🛣️'} ${route.name}
          </div>
          <div class="text-slate-300">
            <div>Status: <strong class="${isBlocked ? 'text-red-400' : 'text-emerald-400'}">${route.status}</strong></div>
            <div>Inundation: <strong>${route.inundationLevelMeters}m</strong></div>
            ${route.alternativeRouteName ? `<div class="mt-1 text-cyan-300 text-[10px]">Alternate: ${route.alternativeRouteName}</div>` : ''}
          </div>
        </div>
      `);

      group.addLayer(polyline);
    });
  }, [showRoutes]);

  // Update Radar Rings & Isobars
  useEffect(() => {
    const group = radarGroupRef.current;
    if (!group) return;

    group.clearLayers();
    if (!showRadar) return;

    // Cyclone eye approximate offshore coordinates
    const eyeCenter: [number, number] = [16.9800, 82.3800];

    // Concentric radar circles indicating wind velocity rings
    const radii = [15000, 30000, 50000]; // 15km, 30km, 50km
    radii.forEach((radius, idx) => {
      const circle = L.circle(eyeCenter, {
        radius,
        color: idx === 0 ? '#ef4444' : idx === 1 ? '#f59e0b' : '#06b6d4',
        weight: 1.2,
        fill: false,
        dashArray: '4, 8',
        opacity: 0.45,
      });
      group.addLayer(circle);
    });

    // Eye Center Marker
    const eyeIcon = L.divIcon({
      className: 'cyclone-eye-pin',
      html: `
        <div class="w-8 h-8 rounded-full border-2 border-red-500/80 bg-red-950/40 flex items-center justify-center animate-spin">
          <div class="w-2 h-2 rounded-full bg-red-400"></div>
        </div>
      `,
      iconSize: [32, 32],
      iconAnchor: [16, 16],
    });

    const eyeMarker = L.marker(eyeCenter, { icon: eyeIcon });
    eyeMarker.bindPopup(`
      <div class="p-2 font-mono-tactical text-xs bg-slate-900 text-slate-100">
        <strong class="text-red-400">CYCLONE VARUNA - EYE CENTER</strong>
        <div class="text-slate-400 text-[11px] mt-1">Sustained: 195 km/h | 944 hPa</div>
      </div>
    `);
    group.addLayer(eyeMarker);
  }, [showRadar]);

  return (
    <div className="relative w-full h-full bg-slate-950 overflow-hidden select-none">
      {/* Map Element */}
      <div ref={mapContainerRef} className="w-full h-full z-0" />

      {/* Holographic Tactical Coordinate Grid (.tactical-grid) */}
      <div 
        className={`pointer-events-none absolute inset-0 z-10 tactical-grid transition-opacity duration-300 ${
          showTacticalGrid ? 'opacity-50' : 'opacity-0'
        }`} 
      />

      {/* Futuristic Radar Sweep Overlay */}
      {showRadar && (
        <div className="pointer-events-none absolute inset-0 z-10 overflow-hidden opacity-35">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] rounded-full border border-cyan-500/20">
            <div className="w-full h-full rounded-full radar-sweep bg-gradient-to-tr from-cyan-500/15 via-transparent to-transparent" />
          </div>
        </div>
      )}

      {/* Map Control HUD: Top-Left Layer Switcher & Settlement Risk Filter */}
      <div className="absolute top-4 left-4 z-20 font-mono-tactical flex items-center gap-2 flex-wrap max-w-xl">
        {/* Settlement Risk Filter Chips */}
        {showSettlements && (
          <div className="flex items-center gap-1 bg-slate-950/90 border border-slate-800 p-1 rounded-lg backdrop-blur-md text-[11px]">
            <span className="text-slate-500 px-1 text-[10px] uppercase font-bold flex items-center gap-1">
              <MapPin className="w-3 h-3 text-cyan-400" />
              <span>Locations:</span>
            </span>

            <button
              onClick={() => setSettlementRiskFilter('ALL')}
              className={`px-2 py-1 rounded transition-colors font-bold ${
                settlementRiskFilter === 'ALL'
                  ? 'bg-slate-800 text-cyan-300 border border-slate-700'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              All ({COASTAL_SETTLEMENTS.length})
            </button>

            <button
              onClick={() => setSettlementRiskFilter('CRITICAL')}
              className={`px-2 py-1 rounded transition-colors font-bold flex items-center gap-1 ${
                settlementRiskFilter === 'CRITICAL'
                  ? 'bg-red-950/80 text-red-300 border border-red-600/60'
                  : 'text-red-400 hover:text-red-300'
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-red-500 animate-ping"></span>
              <span>High Threat ({COASTAL_SETTLEMENTS.filter(s => s.baseRisk === 'CATASTROPHIC' || s.baseRisk === 'CRITICAL').length})</span>
            </button>

            <button
              onClick={() => setSettlementRiskFilter('SAFE')}
              className={`px-2 py-1 rounded transition-colors font-bold flex items-center gap-1 ${
                settlementRiskFilter === 'SAFE'
                  ? 'bg-emerald-950/80 text-emerald-300 border border-emerald-600/60'
                  : 'text-emerald-400 hover:text-emerald-300'
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
              <span>Safe Hubs ({COASTAL_SETTLEMENTS.filter(s => s.baseRisk === 'LOW_SAFE').length})</span>
            </button>
          </div>
        )}

        {/* Risk Heatmaps Filter Toggles Bar */}
        <div className="flex items-center gap-1 p-1 rounded-lg bg-slate-950/90 border border-slate-800 backdrop-blur-md text-[11px]">
          <span className="text-slate-500 px-1 text-[10px] uppercase font-bold flex items-center gap-1">
            <span>🔥</span>
            <span className="hidden sm:inline">Heatmaps:</span>
          </span>

          <button
            type="button"
            onClick={() => setShowFloodDepthHeatmap(!showFloodDepthHeatmap)}
            className={`px-2 py-1 rounded transition-all font-bold flex items-center gap-1 text-[10px] ${
              showFloodDepthHeatmap
                ? 'bg-red-500/25 text-red-200 border border-red-500/60 shadow-[0_0_10px_rgba(239,68,68,0.3)]'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900 border border-transparent'
            }`}
            title="Toggle Granular Flood Depth Contours (> 4.5m, 2.5m-4.5m, 1.0m-2.5m, < 1.0m)"
          >
            <span>🌊</span>
            <span>Flood Depth</span>
            {showFloodDepthHeatmap && <span className="w-1.5 h-1.5 rounded-full bg-red-400 animate-ping"></span>}
          </button>

          <button
            type="button"
            onClick={() => setShowWindVelocityHeatmap(!showWindVelocityHeatmap)}
            className={`px-2 py-1 rounded transition-all font-bold flex items-center gap-1 text-[10px] ${
              showWindVelocityHeatmap
                ? 'bg-amber-500/25 text-amber-200 border border-amber-500/60 shadow-[0_0_10px_rgba(245,158,11,0.3)]'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900 border border-transparent'
            }`}
            title="Toggle Wind Velocity Zones (Gale, Storm, Hurricane, Core > 200 km/h)"
          >
            <span>💨</span>
            <span>Wind Zones</span>
            {showWindVelocityHeatmap && <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-ping"></span>}
          </button>

          <button
            type="button"
            onClick={() => setShowPopulationDensityHeatmap(!showPopulationDensityHeatmap)}
            className={`px-2 py-1 rounded transition-all font-bold flex items-center gap-1 text-[10px] ${
              showPopulationDensityHeatmap
                ? 'bg-purple-500/25 text-purple-200 border border-purple-500/60 shadow-[0_0_10px_rgba(168,85,247,0.3)]'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900 border border-transparent'
            }`}
            title="Toggle Civilian Population Density & Concentration Heatmap"
          >
            <span>👥</span>
            <span>Pop Density</span>
            {showPopulationDensityHeatmap && <span className="w-1.5 h-1.5 rounded-full bg-purple-400 animate-ping"></span>}
          </button>

          <button
            type="button"
            onClick={() => setShowTacticalGrid(!showTacticalGrid)}
            className={`px-2 py-1 rounded transition-all font-bold flex items-center gap-1 text-[10px] ${
              showTacticalGrid
                ? 'bg-cyan-500/25 text-cyan-200 border border-cyan-500/60 shadow-[0_0_10px_rgba(6,182,212,0.3)]'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900 border border-transparent'
            }`}
            title="Toggle Holographic Coordinate Grid (.tactical-grid)"
          >
            <span>📐</span>
            <span className="hidden sm:inline">Grid</span>
          </button>
        </div>
      </div>

      {/* Floating Tactical Sector Legend: Surge Levels & Infrastructure Status */}
      <TacticalSectorLegend currentTimeStep={currentTimeStep} />

      {/* Bottom Center: Floating Interactive Time-Slider */}
      <div className="absolute bottom-5 left-1/2 -translate-x-1/2 z-20 w-[94%] max-w-2xl px-2">
        <TimeSlider
          currentTimeStep={currentTimeStep}
          onTimeStepChange={onTimeStepChange}
          soundEnabled={soundEnabled}
        />
      </div>

      {/* Zoom Controls & Detailed Scale Telemetry HUD (Bottom-Right) */}
      <ZoomLevelDetailsCard
        zoomLevel={zoomLevel}
        centerCoords={mapCenterCoords}
        onZoomIn={() => mapInstanceRef.current?.zoomIn()}
        onZoomOut={() => mapInstanceRef.current?.zoomOut()}
        onSetPresetZoom={(z, coords) => {
          if (coords) {
            mapInstanceRef.current?.setView(coords, z);
          } else {
            mapInstanceRef.current?.setZoom(z);
          }
        }}
        className="absolute bottom-24 sm:bottom-6 right-3 sm:right-4 z-20"
        themeContext="tactical"
      />

      {/* Active Risk Heatmaps Floating Legend Bar */}
      {(showFloodDepthHeatmap || showWindVelocityHeatmap || showPopulationDensityHeatmap) && (
        <div className="absolute bottom-24 sm:bottom-6 left-3 sm:left-4 z-20 font-mono-tactical pointer-events-auto max-w-xs sm:max-w-sm">
          <div className="p-2.5 rounded-xl bg-slate-950/95 border border-slate-800 backdrop-blur-xl shadow-2xl text-[10px] space-y-1.5">
            <div className="flex items-center justify-between border-b border-slate-800 pb-1 font-bold text-slate-300">
              <span className="flex items-center gap-1.5">
                <span>🔥</span>
                <span>Active Heatmap Gradients</span>
              </span>
              <span className="text-[9px] text-cyan-400 font-semibold">Granular Analysis</span>
            </div>

            {showFloodDepthHeatmap && (
              <div className="space-y-0.5">
                <span className="text-[9px] text-red-400 font-bold uppercase flex items-center justify-between">
                  <span>🌊 Flood Depth Scale:</span>
                  <span className="text-white">+{TIME_STEPS[currentTimeStep].stormSurgeMeters}m Peak</span>
                </span>
                <div className="flex items-center gap-1 text-[8px] font-bold">
                  <span className="px-1.5 py-0.5 rounded bg-red-600/80 text-white">&gt; 4.5m</span>
                  <span className="px-1.5 py-0.5 rounded bg-orange-600/80 text-white">2.5m-4.5m</span>
                  <span className="px-1.5 py-0.5 rounded bg-amber-500/80 text-black">1.0m-2.5m</span>
                  <span className="px-1.5 py-0.5 rounded bg-cyan-500/80 text-black">&lt; 1.0m</span>
                </div>
              </div>
            )}

            {showWindVelocityHeatmap && (
              <div className="space-y-0.5">
                <span className="text-[9px] text-amber-400 font-bold uppercase flex items-center justify-between">
                  <span>💨 Wind Velocity Zones:</span>
                  <span className="text-white">{TIME_STEPS[currentTimeStep].windSpeedKmh} km/h</span>
                </span>
                <div className="flex items-center gap-1 text-[8px] font-bold">
                  <span className="px-1.5 py-0.5 rounded bg-rose-600/80 text-white">&gt; 200 km/h</span>
                  <span className="px-1.5 py-0.5 rounded bg-orange-500/80 text-white">150-200</span>
                  <span className="px-1.5 py-0.5 rounded bg-amber-500/80 text-black">100-150</span>
                  <span className="px-1.5 py-0.5 rounded bg-cyan-500/80 text-black">65-100</span>
                </div>
              </div>
            )}

            {showPopulationDensityHeatmap && (
              <div className="space-y-0.5">
                <span className="text-[9px] text-purple-400 font-bold uppercase">
                  <span>👥 Population Density:</span>
                </span>
                <div className="flex items-center gap-1 text-[8px] font-bold">
                  <span className="px-1.5 py-0.5 rounded bg-rose-700/80 text-white">&gt; 4.5k/km²</span>
                  <span className="px-1.5 py-0.5 rounded bg-orange-600/80 text-white">1.5k-4.5k</span>
                  <span className="px-1.5 py-0.5 rounded bg-amber-500/80 text-black">600-1.5k</span>
                  <span className="px-1.5 py-0.5 rounded bg-emerald-600/80 text-white">&lt; 600</span>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
