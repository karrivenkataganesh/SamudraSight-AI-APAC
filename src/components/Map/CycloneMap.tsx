/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import { CriticalAsset, EvacuationRoute, TimeStepId } from '../../types/disaster';
import { CRITICAL_ASSETS, EVACUATION_ROUTES, FLOOD_POLYGONS, TIME_STEPS } from '../../data/syntheticGeoData';
import { COASTAL_SETTLEMENTS, CoastalSettlement, calculateSettlementRisk } from '../../data/coastalSettlements';
import { TimeSlider } from './TimeSlider';
import { TacticalSectorLegend } from './TacticalSectorLegend';
import { Layers, Crosshair, ZoomIn, ZoomOut, AlertTriangle, Shield, Zap, Hospital, Ban, Compass, Radio, MapPin, Building2, Anchor } from 'lucide-react';

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
  const floodLayerRef = useRef<L.Polygon | null>(null);
  const markersGroupRef = useRef<L.LayerGroup | null>(null);
  const settlementsGroupRef = useRef<L.LayerGroup | null>(null);
  const routesGroupRef = useRef<L.LayerGroup | null>(null);
  const radarGroupRef = useRef<L.LayerGroup | null>(null);

  // Layer toggles
  const [showFlood, setShowFlood] = useState(true);
  const [showSettlements, setShowSettlements] = useState(true);
  const [showAssets, setShowAssets] = useState(true);
  const [showRoutes, setShowRoutes] = useState(true);
  const [showRadar, setShowRadar] = useState(true);
  const [showLayersMenu, setShowLayersMenu] = useState(false);
  const [selectedSettlement, setSelectedSettlement] = useState<CoastalSettlement | null>(null);
  const [settlementRiskFilter, setSettlementRiskFilter] = useState<'ALL' | 'CRITICAL' | 'SAFE'>('ALL');
  const [zoomLevel, setZoomLevel] = useState<number>(11);

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

    // Dark Matter high-contrast tactical base map tiles
    L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
      attribution: '&copy; <a href="https://carto.com/">CARTO</a> | SamudraSight-APAC Radar',
      subdomains: 'abcd',
      maxZoom: 19,
    }).addTo(map);

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
      weight: 2.5,
      dashArray: '6, 6',
      fillColor: polygonFeature.properties.fillColor,
      fillOpacity: polygonFeature.properties.fillOpacity,
    }).addTo(map);

    polygon.bindPopup(`
      <div class="p-3 font-mono-tactical text-xs text-slate-100 bg-slate-900 rounded-lg">
        <div class="flex items-center gap-2 font-bold text-sm text-cyan-400 mb-1">
          <span>🌊 Storm Surge Inundation Zone</span>
        </div>
        <div class="space-y-1 text-slate-300">
          <div><span class="text-slate-500">Timeline:</span> <strong class="text-white">${currentTimeStep}</strong></div>
          <div><span class="text-slate-500">Surge Crest:</span> <strong class="text-amber-400">+${stepData.stormSurgeMeters}m MSL</strong></div>
          <div><span class="text-slate-500">Inundated Area:</span> <strong class="text-cyan-300">${stepData.coastalInundationSqKm} km²</strong></div>
          <div><span class="text-slate-500">Risk Severity:</span> <strong class="text-red-400 uppercase">${polygonFeature.properties.hazardLevel}</strong></div>
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

      const isSelected = selectedSettlement?.id === settlement.id;

      // Color coding
      let pinColor = '#3b82f6';
      let dotColor = '#60a5fa';
      let pingHtml = '';

      if (risk.level === 'CATASTROPHIC') {
        pinColor = '#ef4444';
        dotColor = '#dc2626';
        pingHtml = '<div class="absolute -top-1 -right-1 w-2.5 h-2.5 bg-red-500 rounded-full animate-ping"></div>';
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

      const iconHtml = `
        <div class="relative group cursor-pointer flex flex-col items-center">
          ${pingHtml}
          <!-- Location Name Tag with Risk Dot -->
          <div class="px-2 py-0.5 rounded-md border flex items-center gap-1.5 shadow-xl transition-all group-hover:scale-105"
               style="background-color: rgba(2, 6, 23, 0.94); border-color: ${pinColor}; box-shadow: 0 0 10px ${pinColor}55;">
            <div class="w-2.5 h-2.5 rounded-full shrink-0" style="background-color: ${dotColor};"></div>
            <div class="flex flex-col leading-none">
              <span class="text-[11px] font-bold text-white tracking-tight">${settlement.name}</span>
              ${settlement.localNameTelugu ? `<span class="text-[9px] text-slate-400 font-sans">${settlement.localNameTelugu}</span>` : ''}
            </div>
            <span class="text-[8px] px-1 py-0.5 rounded font-extrabold tracking-wider uppercase ml-0.5"
                  style="background-color: ${pinColor}22; color: ${pinColor}; border: 1px solid ${pinColor}44;">
              ${risk.level === 'LOW_SAFE' ? 'SAFE' : risk.level}
            </span>
          </div>

          <!-- Little Anchor Pointer -->
          <div class="w-1.5 h-2 -mt-0.5" style="background-color: ${pinColor}; clip-path: polygon(0 0, 100% 0, 50% 100%);"></div>
        </div>
      `;

      const customIcon = L.divIcon({
        className: 'custom-settlement-label-pin',
        html: iconHtml,
        iconSize: [140, 36],
        iconAnchor: [70, 34],
      });

      const marker = L.marker([settlement.coordinates.lat, settlement.coordinates.lng], { icon: customIcon });

      const popupHtml = `
        <div class="p-3.5 font-mono-tactical text-xs text-slate-100 bg-slate-950 rounded-xl border border-slate-800 shadow-2xl max-w-xs space-y-2">
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

          <div class="grid grid-cols-2 gap-2 text-[11px] bg-slate-900/80 p-2 rounded-lg border border-slate-800">
            <div>
              <span class="text-slate-500 block text-[9px]">Elevation</span>
              <strong class="text-slate-200">${settlement.elevationMeters}m MSL</strong>
            </div>
            <div>
              <span class="text-slate-500 block text-[9px]">Surge Inundation</span>
              <strong class="${risk.inundationPotentialMeters > 0 ? 'text-red-400' : 'text-emerald-400'}">
                ${risk.inundationPotentialMeters > 0 ? `+${risk.inundationPotentialMeters}m Threat` : 'Zero Threat'}
              </strong>
            </div>
            <div>
              <span class="text-slate-500 block text-[9px]">Population</span>
              <strong class="text-slate-200">${settlement.population.toLocaleString()}</strong>
            </div>
            <div>
              <span class="text-slate-500 block text-[9px]">Distance to Eye</span>
              <strong class="text-amber-300">${risk.distanceToEyeKm} km</strong>
            </div>
          </div>

          <div class="text-[11px] text-slate-300 leading-relaxed border-t border-slate-800 pt-1.5">
            <span class="text-[10px] text-slate-400 font-bold block mb-0.5">Primary Hazard:</span>
            ${settlement.primaryHazard}
          </div>

          <div class="p-2 rounded bg-slate-900 border text-[10px] leading-snug" style="border-color: ${pinColor}44;">
            <span class="font-bold text-slate-300 block mb-0.5">Action Directive:</span>
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
        <div className="relative">
          <button
            onClick={() => setShowLayersMenu(!showLayersMenu)}
            className="flex items-center gap-2 px-3 py-2 rounded-lg bg-slate-950/90 hover:bg-slate-900 text-slate-200 border border-slate-800 text-xs backdrop-blur-md shadow-xl transition-colors"
          >
            <Layers className="w-4 h-4 text-cyan-400" />
            <span>Map Layers</span>
          </button>

          {showLayersMenu && (
            <div className="absolute top-11 left-0 w-60 rounded-xl bg-slate-950/95 border border-slate-800 p-3 shadow-2xl backdrop-blur-md text-xs space-y-2.5 z-30">
              <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Tactical Overlays</div>
              
              <label className="flex items-center justify-between text-slate-300 cursor-pointer hover:text-white">
                <span className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded bg-blue-500"></span>
                  <span>Storm Surge Flood Mask</span>
                </span>
                <input
                  type="checkbox"
                  checked={showFlood}
                  onChange={(e) => setShowFlood(e.target.checked)}
                  className="rounded border-slate-700 text-cyan-500 focus:ring-0 bg-slate-900"
                />
              </label>

              <label className="flex items-center justify-between text-slate-300 cursor-pointer hover:text-white">
                <span className="flex items-center gap-2">
                  <MapPin className="w-3 h-3 text-red-400" />
                  <span>Cities & Coastal Villages</span>
                </span>
                <input
                  type="checkbox"
                  checked={showSettlements}
                  onChange={(e) => setShowSettlements(e.target.checked)}
                  className="rounded border-slate-700 text-cyan-500 focus:ring-0 bg-slate-900"
                />
              </label>

              <label className="flex items-center justify-between text-slate-300 cursor-pointer hover:text-white">
                <span className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded bg-amber-500"></span>
                  <span>Critical Infrastructure</span>
                </span>
                <input
                  type="checkbox"
                  checked={showAssets}
                  onChange={(e) => setShowAssets(e.target.checked)}
                  className="rounded border-slate-700 text-cyan-500 focus:ring-0 bg-slate-900"
                />
              </label>

              <label className="flex items-center justify-between text-slate-300 cursor-pointer hover:text-white">
                <span className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded bg-red-500"></span>
                  <span>Evacuation Corridors</span>
                </span>
                <input
                  type="checkbox"
                  checked={showRoutes}
                  onChange={(e) => setShowRoutes(e.target.checked)}
                  className="rounded border-slate-700 text-cyan-500 focus:ring-0 bg-slate-900"
                />
              </label>

              <label className="flex items-center justify-between text-slate-300 cursor-pointer hover:text-white">
                <span className="flex items-center gap-2">
                  <Radio className="w-3 h-3 text-cyan-400 animate-spin" />
                  <span>Doppler Radar & Eye</span>
                </span>
                <input
                  type="checkbox"
                  checked={showRadar}
                  onChange={(e) => setShowRadar(e.target.checked)}
                  className="rounded border-slate-700 text-cyan-500 focus:ring-0 bg-slate-900"
                />
              </label>
            </div>
          )}
        </div>

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

      {/* Zoom Controls HUD (Bottom-Right) */}
      <div className="absolute bottom-24 sm:bottom-6 right-3 sm:right-4 z-20 flex flex-col items-end gap-2 font-mono-tactical pointer-events-auto">
        {/* Quick Zoom Presets */}
        <div className="flex items-center gap-1 p-1 rounded-xl bg-slate-950/90 border border-slate-800 backdrop-blur-md shadow-2xl text-[10px]">
          <span className="text-cyan-400 font-bold px-1.5">ZOOM: {zoomLevel}x</span>
          <button
            onClick={() => mapInstanceRef.current?.setZoom(7)}
            className={`px-1.5 py-0.5 rounded transition-colors ${zoomLevel <= 8 ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40' : 'text-slate-300 hover:text-white hover:bg-slate-800'}`}
            title="Regional View (7x)"
          >
            Region
          </button>
          <button
            onClick={() => mapInstanceRef.current?.setView([16.9850, 82.2500], 11)}
            className={`px-1.5 py-0.5 rounded transition-colors ${zoomLevel >= 9 && zoomLevel <= 12 ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40' : 'text-slate-300 hover:text-white hover:bg-slate-800'}`}
            title="Kakinada Sector (11x)"
          >
            Sector
          </button>
          <button
            onClick={() => mapInstanceRef.current?.setZoom(14)}
            className={`px-1.5 py-0.5 rounded transition-colors ${zoomLevel >= 13 && zoomLevel <= 15 ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40' : 'text-slate-300 hover:text-white hover:bg-slate-800'}`}
            title="Village & Ward Level (14x)"
          >
            Village
          </button>
          <button
            onClick={() => mapInstanceRef.current?.setZoom(17)}
            className={`px-1.5 py-0.5 rounded transition-colors ${zoomLevel >= 16 ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40' : 'text-slate-300 hover:text-white hover:bg-slate-800'}`}
            title="Street & Asset Detail (17x)"
          >
            Street
          </button>
        </div>

        {/* Primary Zoom Buttons (Sixth and Seventh options removed) */}
        <div className="flex flex-col gap-1.5 p-1 rounded-xl bg-slate-950/90 border border-slate-800 backdrop-blur-md shadow-2xl">
          <button
            onClick={() => mapInstanceRef.current?.zoomIn()}
            className="p-2.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-700/80 text-cyan-400 hover:text-cyan-300 transition-colors shadow-lg"
            title="Zoom In (+)"
          >
            <ZoomIn className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
