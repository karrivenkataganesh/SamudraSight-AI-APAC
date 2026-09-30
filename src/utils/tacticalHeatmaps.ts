/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import L from 'leaflet';
import { TimeStepId } from '../types/disaster';
import { TIME_STEPS } from '../data/syntheticGeoData';
import { COASTAL_SETTLEMENTS, CoastalSettlement } from '../data/coastalSettlements';

/**
 * Generates the Flood Depth Risk Heatmap Layer
 * Multi-tiered gradient depth polygons indicating water column elevation above ground MSL
 */
export function createFloodDepthHeatmap(currentTimeStep: TimeStepId): L.LayerGroup {
  const group = L.layerGroup();
  const stepData = TIME_STEPS[currentTimeStep];
  const surge = stepData.stormSurgeMeters;

  // Tier 4: Extreme Depth Basin (> 4.5m)
  const tier4Coords: [number, number][] = [
    [16.9200, 82.3300],
    [16.9550, 82.3480],
    [16.9950, 82.3520],
    [17.0300, 82.3380],
    [17.0750, 82.3250], // Uppada breaching coastline
    [17.0600, 82.3000],
    [17.0100, 82.2850],
    [16.9600, 82.2800],
    [16.9300, 82.3000],
  ];

  // Tier 3: Critical Surge Wash (2.5m - 4.5m)
  const tier3Coords: [number, number][] = [
    [16.8900, 82.3100],
    [16.9400, 82.3600],
    [17.0100, 82.3680],
    [17.0650, 82.3550],
    [17.1100, 82.3380],
    [17.0800, 82.2800],
    [17.0300, 82.2600],
    [16.9750, 82.2500],
    [16.9200, 82.2700],
  ];

  // Tier 2: Estuarine & Canal Backflow (1.0m - 2.5m)
  const tier2Coords: [number, number][] = [
    [16.8600, 82.2800],
    [16.9100, 82.3700],
    [17.0200, 82.3850],
    [17.0900, 82.3700],
    [17.1350, 82.3400],
    [17.1000, 82.2500],
    [17.0450, 82.2300],
    [16.9600, 82.2200],
    [16.8900, 82.2400],
  ];

  // Tier 1: Shallow Fringe / Runoff Buffer (0.2m - 1.0m)
  const tier1Coords: [number, number][] = [
    [16.8300, 82.2500],
    [16.8900, 82.3900],
    [17.0300, 82.4100],
    [17.1100, 82.3900],
    [17.1600, 82.3450],
    [17.1200, 82.2200],
    [17.0500, 82.1900],
    [16.9500, 82.1800],
    [16.8700, 82.2100],
  ];

  // Only render deep tiers if surge crest warrants them
  if (surge >= 4.0) {
    const p4 = L.polygon(tier4Coords, {
      color: '#dc2626',
      weight: 2,
      dashArray: '4, 4',
      fillColor: '#dc2626',
      fillOpacity: 0.55,
    });
    p4.bindTooltip(`🌊 Tier 4: Extreme Depth > 4.5m MSL (Peak: +${surge}m)`, { sticky: true });
    p4.bindPopup(`
      <div class="p-2.5 bg-slate-950 text-slate-100 font-mono-tactical text-xs rounded-xl border border-red-500 shadow-2xl space-y-1">
        <strong class="text-red-400 block border-b border-slate-800 pb-1">🌊 FLOOD DEPTH TIER 4: EXTREME SURGE (> 4.5m)</strong>
        <div class="text-[11px] text-slate-300">Live Surge Crest: <strong class="text-white">+${surge}m MSL</strong></div>
        <div class="text-[10px] text-amber-300">Structural Failure Imminent; 100% ground-floor total submergence.</div>
      </div>
    `);
    group.addLayer(p4);
  }

  if (surge >= 2.5) {
    const p3 = L.polygon(tier3Coords, {
      color: '#ea580c',
      weight: 1.8,
      dashArray: '6, 4',
      fillColor: '#ea580c',
      fillOpacity: 0.42,
    });
    p3.bindTooltip('🌊 Tier 3: Critical Surge Wash (2.5m - 4.5m MSL)', { sticky: true });
    group.addLayer(p3);
  }

  if (surge >= 1.2) {
    const p2 = L.polygon(tier2Coords, {
      color: '#f59e0b',
      weight: 1.5,
      dashArray: '8, 4',
      fillColor: '#f59e0b',
      fillOpacity: 0.30,
    });
    p2.bindTooltip('🌊 Tier 2: Estuarine & Canal Backflow (1.0m - 2.5m MSL)', { sticky: true });
    group.addLayer(p2);
  }

  const p1 = L.polygon(tier1Coords, {
    color: '#06b6d4',
    weight: 1.2,
    fillColor: '#06b6d4',
    fillOpacity: 0.20,
  });
  p1.bindTooltip('🌊 Tier 1: Shallow Fringe / Runoff Buffer (0.2m - 1.0m MSL)', { sticky: true });
  group.addLayer(p1);

  return group;
}

/**
 * Generates the Wind Velocity Zones Risk Heatmap Layer
 * Radial isovel rings & gust envelopes expanding from the active storm center
 */
export function createWindVelocityHeatmap(currentTimeStep: TimeStepId): L.LayerGroup {
  const group = L.layerGroup();
  const stepData = TIME_STEPS[currentTimeStep];
  const maxWind = stepData.windSpeedKmh;

  // Approximate storm center based on timeline step
  const stormCenter: [number, number] = currentTimeStep === 'T-0' 
    ? [16.9800, 82.3500] 
    : currentTimeStep.startsWith('T-') 
    ? [16.7500 + (parseInt(currentTimeStep.replace('T-', '')) * 0.015), 82.5500 + (parseInt(currentTimeStep.replace('T-', '')) * 0.025)]
    : [17.1000, 82.1500];

  // Zone 4: Core Violent Gusts (> 200 km/h)
  const z4 = L.circle(stormCenter, {
    radius: 35000, // 35 km
    color: '#e11d48',
    weight: 2,
    dashArray: '4, 4',
    fillColor: '#be123c',
    fillOpacity: 0.38,
  });
  z4.bindTooltip(`💨 Eyewall Core: Extreme Winds > 200 km/h (Peak: ${maxWind} km/h)`, { sticky: true });
  z4.bindPopup(`
    <div class="p-2.5 bg-slate-950 text-slate-100 font-mono-tactical text-xs rounded-xl border border-rose-500 shadow-2xl space-y-1">
      <strong class="text-rose-400 block border-b border-slate-800 pb-1">💨 CORE VIOLENT WIND ZONE (> 200 km/h)</strong>
      <div class="text-[11px] text-slate-300">Peak Recorded Gusts: <strong class="text-white">${maxWind + 25} km/h</strong></div>
      <div class="text-[10px] text-amber-300">Extreme structural tearing, complete power grid collapse, airborne debris.</div>
    </div>
  `);
  group.addLayer(z4);

  // Zone 3: Hurricane Force Winds (150 - 200 km/h)
  const z3 = L.circle(stormCenter, {
    radius: 75000, // 75 km
    color: '#f97316',
    weight: 1.8,
    dashArray: '6, 6',
    fillColor: '#ea580c',
    fillOpacity: 0.28,
  });
  z3.bindTooltip('💨 Hurricane Force Radius: 150 - 200 km/h', { sticky: true });
  group.addLayer(z3);

  // Zone 2: Destructive Storm Force Winds (100 - 150 km/h)
  const z2 = L.circle(stormCenter, {
    radius: 135000, // 135 km
    color: '#f59e0b',
    weight: 1.5,
    dashArray: '8, 6',
    fillColor: '#d97706',
    fillOpacity: 0.18,
  });
  z2.bindTooltip('💨 Destructive Storm Force: 100 - 150 km/h', { sticky: true });
  group.addLayer(z2);

  // Zone 1: Gale Force Outskirts (65 - 100 km/h)
  const z1 = L.circle(stormCenter, {
    radius: 220000, // 220 km
    color: '#06b6d4',
    weight: 1.2,
    dashArray: '10, 8',
    fillColor: '#0891b2',
    fillOpacity: 0.10,
  });
  z1.bindTooltip('💨 Gale Force Perimeter: 65 - 100 km/h', { sticky: true });
  group.addLayer(z1);

  return group;
}

/**
 * Generates the Population Density Risk Heatmap Layer
 * Radial concentration envelopes around coastal settlements weighted by civilian population
 */
export function createPopulationDensityHeatmap(): L.LayerGroup {
  const group = L.layerGroup();

  COASTAL_SETTLEMENTS.forEach((settlement) => {
    const pop = settlement.population;
    const coords: [number, number] = [settlement.coordinates.lat, settlement.coordinates.lng];

    // Determine radius & color scale according to civilian concentration
    let radius = 2200;
    let color = '#3b82f6';
    let fillColor = '#2563eb';
    let opacity = 0.35;
    let densityCategory = 'Moderate Density';

    if (pop >= 200000) {
      radius = 6500;
      color = '#e11d48';
      fillColor = '#be123c';
      opacity = 0.55;
      densityCategory = 'High-Density Metropolis Core (> 4,500/km²)';
    } else if (pop >= 50000) {
      radius = 4800;
      color = '#f97316';
      fillColor = '#ea580c';
      opacity = 0.45;
      densityCategory = 'Dense Urban / Reception Hub (1,500 - 4,500/km²)';
    } else if (pop >= 10000) {
      radius = 3200;
      color = '#f59e0b';
      fillColor = '#d97706';
      opacity = 0.40;
      densityCategory = 'Coastal Town / Fishing Corridor (600 - 1,500/km²)';
    } else {
      radius = 1800;
      color = '#10b981';
      fillColor = '#059669';
      opacity = 0.30;
      densityCategory = 'Rural Coastal Hamlet (< 600/km²)';
    }

    const circle = L.circle(coords, {
      radius,
      color,
      weight: 1.5,
      fillColor,
      fillOpacity: opacity,
    });

    circle.bindTooltip(`👥 ${settlement.name}: ${pop.toLocaleString()} residents (${densityCategory})`, { sticky: true });
    circle.bindPopup(`
      <div class="p-2.5 bg-slate-950 text-slate-100 font-mono-tactical text-xs rounded-xl border border-slate-700 shadow-2xl space-y-1.5">
        <div class="flex items-center justify-between border-b border-slate-800 pb-1">
          <strong class="text-white flex items-center gap-1">📍 ${settlement.name}</strong>
          <span class="text-[9px] px-1.5 py-0.5 rounded font-bold" style="background-color: ${color}22; color: ${color}; border: 1px solid ${color}66;">
            ${(pop / 1000).toFixed(0)}k POPULATION
          </span>
        </div>
        <div class="grid grid-cols-2 gap-1 text-[10px] bg-slate-900 p-1.5 rounded border border-slate-800">
          <div><span class="text-slate-400">Total Residents:</span> <strong class="text-white">${pop.toLocaleString()}</strong></div>
          <div><span class="text-slate-400">Households:</span> <strong class="text-slate-200">${settlement.estimatedHouseholds.toLocaleString()}</strong></div>
          <div><span class="text-slate-400">Density Band:</span> <strong class="text-amber-300 block truncate">${densityCategory.split(' (')[0]}</strong></div>
          <div><span class="text-slate-400">Base Risk:</span> <strong class="text-rose-400">${settlement.baseRisk}</strong></div>
        </div>
      </div>
    `);

    group.addLayer(circle);
  });

  return group;
}
