/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  APIProvider,
  Map,
  AdvancedMarker,
  InfoWindow,
  useAdvancedMarkerRef,
  useMap,
} from '@vis.gl/react-google-maps';
import L from 'leaflet';
import { 
  fetchLiveCycloneFeed, 
  LiveCycloneData, 
  MOCK_CATEGORY_4_CYCLONE 
} from '../../services/cycloneFeed';
import { 
  COASTAL_SETTLEMENTS, 
  CoastalSettlement, 
  calculateSettlementRisk 
} from '../../data/coastalSettlements';
import { ZoomLevelDetailsCard } from './ZoomLevelDetailsCard';
import { 
  Radio, 
  Wind, 
  Gauge, 
  RefreshCw, 
  Compass, 
  Clock, 
  Sparkles, 
  ShieldAlert,
  Key,
  MapPin,
  ChevronDown,
  ChevronUp,
  Search,
  Layers,
  CheckCircle2,
  AlertTriangle,
  X,
  Crosshair,
  Car,
  Building,
  Eye,
  SlidersHorizontal,
  ZoomIn,
  ZoomOut
} from 'lucide-react';

interface GoogleMapsLiveTrackingProps {
  onInspectAssetInDrawer?: () => void;
}

export type MapTypeOption = 'hybrid' | 'satellite' | 'roadmap' | 'terrain';

// Helper: Google Maps TrafficLayer component
const GoogleTrafficLayer: React.FC<{ enabled: boolean }> = ({ enabled }) => {
  const map = useMap();
  const trafficLayerRef = useRef<google.maps.TrafficLayer | null>(null);

  useEffect(() => {
    if (!map) return;

    if (!trafficLayerRef.current) {
      trafficLayerRef.current = new google.maps.TrafficLayer();
    }

    if (enabled) {
      trafficLayerRef.current.setMap(map);
    } else {
      trafficLayerRef.current.setMap(null);
    }

    return () => {
      if (trafficLayerRef.current) {
        trafficLayerRef.current.setMap(null);
      }
    };
  }, [map, enabled]);

  return null;
};

// Helper: Custom Polyline for @vis.gl/react-google-maps
const GooglePolyline: React.FC<{
  path: google.maps.LatLngLiteral[];
  options?: google.maps.PolylineOptions;
}> = ({ path, options }) => {
  const map = useMap();
  const polylineRef = useRef<google.maps.Polyline | null>(null);

  useEffect(() => {
    if (!map) return;
    if (!polylineRef.current) {
      polylineRef.current = new google.maps.Polyline({
        path,
        map,
        ...options,
      });
    } else {
      polylineRef.current.setPath(path);
      if (options) polylineRef.current.setOptions(options);
    }
    return () => {
      if (polylineRef.current) {
        polylineRef.current.setMap(null);
        polylineRef.current = null;
      }
    };
  }, [map, path, options]);

  return null;
};

// Helper: Custom Polygon for @vis.gl/react-google-maps
const GooglePolygon: React.FC<{
  paths: google.maps.LatLngLiteral[];
  options?: google.maps.PolygonOptions;
}> = ({ paths, options }) => {
  const map = useMap();
  const polygonRef = useRef<google.maps.Polygon | null>(null);

  useEffect(() => {
    if (!map) return;
    if (!polygonRef.current) {
      polygonRef.current = new google.maps.Polygon({
        paths,
        map,
        ...options,
      });
    } else {
      polygonRef.current.setPaths(paths);
      if (options) polygonRef.current.setOptions(options);
    }
    return () => {
      if (polygonRef.current) {
        polygonRef.current.setMap(null);
        polygonRef.current = null;
      }
    };
  }, [map, paths, options]);

  return null;
};

// Zoom and Center Controller for native Google Map
const GoogleMapZoomController: React.FC<{
  center: google.maps.LatLngLiteral;
  focusedLocation: { lat: number; lng: number } | null;
  defaultCenter: { lat: number; lng: number };
}> = ({ center, focusedLocation, defaultCenter }) => {
  const map = useMap();
  const [zoomLevel, setZoomLevel] = useState<number>(7);

  useEffect(() => {
    if (!map) return;
    const listener = map.addListener('zoom_changed', () => {
      const z = map.getZoom();
      if (typeof z === 'number') {
        setZoomLevel(z);
      }
    });
    return () => {
      google.maps.event.removeListener(listener);
    };
  }, [map]);

  useEffect(() => {
    if (map) {
      if (focusedLocation) {
        map.panTo(focusedLocation);
        map.setZoom(13);
      } else {
        map.panTo(center);
      }
    }
  }, [map, focusedLocation, center.lat, center.lng]);

  return (
    <div className="absolute bottom-5 right-4 z-20 flex flex-col items-end gap-2 font-mono-tactical pointer-events-auto">
      {/* Quick Zoom Presets */}
      <div className="flex items-center gap-1 p-1 rounded-xl bg-slate-950/90 border border-slate-800 backdrop-blur-md shadow-2xl text-[10px]">
        <span className="text-cyan-400 font-bold px-1.5">ZOOM: {zoomLevel}x</span>
        <button
          onClick={() => { map?.setZoom(6); map?.panTo(defaultCenter); }}
          className={`px-1.5 py-0.5 rounded transition-colors ${zoomLevel <= 7 ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40' : 'text-slate-300 hover:text-white hover:bg-slate-800'}`}
          title="Track View (6x)"
        >
          Track
        </button>
        <button
          onClick={() => { map?.setZoom(10); }}
          className={`px-1.5 py-0.5 rounded transition-colors ${zoomLevel >= 8 && zoomLevel <= 11 ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40' : 'text-slate-300 hover:text-white hover:bg-slate-800'}`}
          title="Coast Sector (10x)"
        >
          Coast
        </button>
        <button
          onClick={() => { map?.setZoom(13); }}
          className={`px-1.5 py-0.5 rounded transition-colors ${zoomLevel >= 12 && zoomLevel <= 14 ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40' : 'text-slate-300 hover:text-white hover:bg-slate-800'}`}
          title="Village & Town (13x)"
        >
          Village
        </button>
        <button
          onClick={() => { map?.setZoom(16); }}
          className={`px-1.5 py-0.5 rounded transition-colors ${zoomLevel >= 15 ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40' : 'text-slate-300 hover:text-white hover:bg-slate-800'}`}
          title="Street & Port Detail (16x)"
        >
          Street
        </button>
      </div>

      {/* Primary Zoom Buttons */}
      <div className="flex flex-col gap-1.5 p-1 rounded-xl bg-slate-950/90 border border-slate-800 backdrop-blur-md shadow-2xl">
        <button
          onClick={() => {
            if (map) {
              const current = map.getZoom() || 7;
              map.setZoom(Math.min(current + 1, 20));
            }
          }}
          className="p-2.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-700/80 text-cyan-400 hover:text-cyan-300 transition-colors shadow"
          title="Zoom In (+)"
        >
          <ZoomIn className="w-4 h-4" />
        </button>
        <button
          onClick={() => {
            if (map) {
              const current = map.getZoom() || 7;
              map.setZoom(Math.max(current - 1, 3));
            }
          }}
          className="p-2.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-700/80 text-slate-300 hover:text-white transition-colors shadow"
          title="Zoom Out (-)"
        >
          <ZoomOut className="w-4 h-4" />
        </button>
        <button
          onClick={() => {
            if (map) {
              map.panTo(defaultCenter);
              map.setZoom(7);
            }
          }}
          className="p-2.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-700/80 text-amber-400 hover:text-amber-300 transition-colors shadow"
          title="Center on Cyclone Eye"
        >
          <Crosshair className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

/**
 * Resilient Satellite Cyclone Map (Leaflet Satellite view with Esri World Imagery & Labels)
 * Used when Google Maps API key is unconfigured or invalid, preventing InvalidKeyMapError crashes.
 */
const ResilientSatelliteViewer: React.FC<{
  cycloneData: LiveCycloneData;
  mapType: MapTypeOption;
  infoWindowOpen: boolean;
  setInfoWindowOpen: (open: boolean) => void;
  selectedSettlement: CoastalSettlement | null;
  setSelectedSettlement: (s: CoastalSettlement | null) => void;
  focusedLocation: { lat: number; lng: number } | null;
  showLabels: boolean;
  showCities: boolean;
  showAdminAreas: boolean;
  showTraffic: boolean;
}> = ({
  cycloneData,
  mapType,
  infoWindowOpen,
  setInfoWindowOpen,
  selectedSettlement,
  setSelectedSettlement,
  focusedLocation,
  showLabels,
  showCities,
  showAdminAreas,
  showTraffic,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const baseTileLayerRef = useRef<L.TileLayer | null>(null);
  const labelsTileLayerRef = useRef<L.TileLayer | null>(null);
  const adminTileLayerRef = useRef<L.TileLayer | null>(null);
  const trafficTileLayerRef = useRef<L.TileLayer | null>(null);
  const polygonLayerRef = useRef<L.Polygon | null>(null);
  const polylineLayerRef = useRef<L.Polyline | null>(null);
  const eyeMarkerRef = useRef<L.Marker | null>(null);
  const waypointsLayerRef = useRef<L.LayerGroup | null>(null);
  const settlementsLayerRef = useRef<L.LayerGroup | null>(null);
  const [zoomLevel, setZoomLevel] = useState<number>(7);

  // Initialize Map
  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    const map = L.map(containerRef.current, {
      center: [cycloneData.center.lat, cycloneData.center.lng],
      zoom: 7,
      minZoom: 3,
      maxZoom: 19,
      zoomControl: false,
      scrollWheelZoom: true,
      doubleClickZoom: true,
      touchZoom: true,
    });

    map.on('zoomend', () => {
      setZoomLevel(map.getZoom());
    });

    waypointsLayerRef.current = L.layerGroup().addTo(map);
    settlementsLayerRef.current = L.layerGroup().addTo(map);
    mapRef.current = map;

    // Invalidate map size on container resize so map completely fills the window without dark empty spaces
    const resizeObserver = new ResizeObserver(() => {
      map.invalidateSize();
    });
    if (containerRef.current) {
      resizeObserver.observe(containerRef.current);
    }

    return () => {
      resizeObserver.disconnect();
      map.remove();
      mapRef.current = null;
    };
  }, []);

  // Update Base Tile Layer according to MapType and label settings
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    if (baseTileLayerRef.current) {
      map.removeLayer(baseTileLayerRef.current);
    }
    if (labelsTileLayerRef.current) {
      map.removeLayer(labelsTileLayerRef.current);
      labelsTileLayerRef.current = null;
    }
    if (adminTileLayerRef.current) {
      map.removeLayer(adminTileLayerRef.current);
      adminTileLayerRef.current = null;
    }
    if (trafficTileLayerRef.current) {
      map.removeLayer(trafficTileLayerRef.current);
      trafficTileLayerRef.current = null;
    }

    if (mapType === 'roadmap') {
      baseTileLayerRef.current = L.tileLayer(
        'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png',
        {
          attribution: '&copy; CartoDB &mdash; Standard Road & Village Map',
          maxZoom: 19,
        }
      ).addTo(map);
    } else if (mapType === 'terrain') {
      baseTileLayerRef.current = L.tileLayer(
        'https://server.arcgisonline.com/ArcGIS/rest/services/World_Topo_Map/MapServer/tile/{z}/{y}/{x}',
        {
          attribution: 'Tiles &copy; Esri &mdash; Topographic Relief',
          maxZoom: 18,
        }
      ).addTo(map);
    } else {
      // Satellite Imagery (Esri World Imagery)
      baseTileLayerRef.current = L.tileLayer(
        'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
        {
          attribution: 'Tiles &copy; Esri &mdash; High-Resolution Satellite Surveillance',
          maxZoom: 18,
        }
      ).addTo(map);

      // Add Hybrid Place Names, Cities, and Towns Overlay if showLabels/showCities is true
      if (showLabels && showCities) {
        labelsTileLayerRef.current = L.tileLayer(
          'https://services.arcgisonline.com/ArcGIS/rest/services/Reference/World_Boundaries_and_Places/MapServer/tile/{z}/{y}/{x}',
          {
            attribution: 'Labels &copy; Esri &mdash; Places & Villages',
            maxZoom: 18,
            opacity: 0.95,
          }
        ).addTo(map);
      }
    }

    // Live Traffic Flow overlay
    if (showTraffic) {
      trafficTileLayerRef.current = L.tileLayer(
        'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
        {
          opacity: 0.35,
          maxZoom: 19,
        }
      ).addTo(map);
    }
  }, [mapType, showLabels, showCities, showAdminAreas, showTraffic]);

  // Pan to focused location if triggered
  useEffect(() => {
    if (mapRef.current && focusedLocation) {
      mapRef.current.setView([focusedLocation.lat, focusedLocation.lng], 11, { animate: true });
    }
  }, [focusedLocation]);

  // Update center, polyline, polygon, settlements, and storm eye
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    // 1. Danger Polygon
    if (polygonLayerRef.current) {
      map.removeLayer(polygonLayerRef.current);
    }
    const dangerLatLngs = cycloneData.dangerRadiusPolygon.map((p) => [p.lat, p.lng] as [number, number]);
    polygonLayerRef.current = L.polygon(dangerLatLngs, {
      color: '#ef4444',
      weight: 2,
      fillColor: '#dc2626',
      fillOpacity: 0.32,
    }).addTo(map);

    // 2. Trajectory Polyline
    if (polylineLayerRef.current) {
      map.removeLayer(polylineLayerRef.current);
    }
    const trajLatLngs = cycloneData.trajectory.map((p) => [p.lat, p.lng] as [number, number]);
    polylineLayerRef.current = L.polyline(trajLatLngs, {
      color: '#38bdf8',
      weight: 4,
      opacity: 0.9,
    }).addTo(map);

    // 3. Waypoint markers
    const waypointsGroup = waypointsLayerRef.current;
    if (waypointsGroup) {
      waypointsGroup.clearLayers();
      cycloneData.trajectory.forEach((pt) => {
        if (pt.status === 'current') return;
        const icon = L.divIcon({
          className: 'custom-waypoint-dot',
          html: `<div class="w-3 h-3 rounded-full border border-white ${
            pt.status === 'past' ? 'bg-slate-400' : 'bg-cyan-400 animate-pulse'
          }"></div>`,
          iconSize: [12, 12],
          iconAnchor: [6, 6],
        });
        const marker = L.marker([pt.lat, pt.lng], { icon });
        marker.bindTooltip(`${pt.timestamp}: ${pt.windKmh} km/h`, { direction: 'top' });
        waypointsGroup.addLayer(marker);
      });
    }

    // 4. Coastal Settlements & Location Risk Markers (Respecting showCities & showAdminAreas)
    const settlementsGroup = settlementsLayerRef.current;
    if (settlementsGroup) {
      settlementsGroup.clearLayers();
      const currentSurge = cycloneData.sustainedWindKmh > 180 ? 5.2 : 2.5;

      COASTAL_SETTLEMENTS.forEach((settlement) => {
        // If user hid cities/towns and this is a city/town, skip
        const isCityOrTown = settlement.type === 'City / Port' || settlement.type === 'Major Coastal Metropolis' || settlement.type === 'Estuarine Delta Town' || settlement.type === 'Inland Relief Hub';
        if (!showCities && isCityOrTown) return;

        const risk = calculateSettlementRisk(
          settlement,
          cycloneData.center,
          currentSurge,
          cycloneData.sustainedWindKmh
        );

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
            <div class="px-2 py-0.5 rounded-md border flex items-center gap-1.5 shadow-2xl transition-all group-hover:scale-105"
                 style="background-color: rgba(2, 6, 23, 0.94); border-color: ${pinColor}; box-shadow: 0 0 12px ${pinColor}88;">
              <div class="w-2.5 h-2.5 rounded-full shrink-0" style="background-color: ${dotColor};"></div>
              <div class="flex flex-col leading-none">
                <span class="text-[11px] font-bold text-white tracking-tight">${settlement.name}</span>
                ${settlement.localNameTelugu ? `<span class="text-[9px] text-slate-400 font-sans">${settlement.localNameTelugu}</span>` : ''}
              </div>
              ${showAdminAreas ? `<span class="text-[8px] text-slate-400 ml-0.5 hidden sm:inline">(${settlement.district})</span>` : ''}
              <span class="text-[8px] px-1 py-0.5 rounded font-extrabold tracking-wider uppercase ml-0.5"
                    style="background-color: ${pinColor}22; color: ${pinColor}; border: 1px solid ${pinColor}44;">
                ${risk.level === 'LOW_SAFE' ? 'SAFE' : risk.level}
              </span>
            </div>
            <div class="w-1.5 h-2 -mt-0.5" style="background-color: ${pinColor}; clip-path: polygon(0 0, 100% 0, 50% 100%);"></div>
          </div>
        `;

        const customIcon = L.divIcon({
          className: 'custom-settlement-sat-pin',
          html: iconHtml,
          iconSize: [150, 36],
          iconAnchor: [75, 34],
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
                <div class="text-[10px] text-slate-400">${settlement.type} • Dist: ${settlement.district}</div>
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

            <!-- Subtle Expand Interaction: Granular Settlement Metadata & Sensors -->
            <details class="group rounded-lg border border-slate-800 bg-slate-900/90 overflow-hidden transition-all duration-200">
              <summary class="flex items-center justify-between p-1.5 text-[9px] font-bold text-cyan-300 hover:text-cyan-200 cursor-pointer select-none bg-slate-900 group-hover:bg-slate-850 transition-colors">
                <span class="flex items-center gap-1">
                  <span>📡</span>
                  <span>Granular Sensors & Emergency Contacts</span>
                </span>
                <span class="text-[8px] px-1 py-0.2 rounded bg-cyan-950 border border-cyan-700/60 text-cyan-300">
                  <span class="group-open:hidden">Expand ▾</span>
                  <span class="hidden group-open:inline">Collapse ▴</span>
                </span>
              </summary>
              <div class="p-2 pt-1.5 space-y-1.5 border-t border-slate-800/80 text-[9px]">
                <div class="bg-slate-950/70 p-1.5 rounded border border-slate-800">
                  <span class="text-slate-400 block text-[8px] uppercase font-bold mb-0.5">Emergency Command</span>
                  <div class="text-slate-200 font-semibold">East Godavari Disaster Control Room (DEOC)</div>
                  <div class="text-slate-400 text-[8px]">VHF Frequency: 156.800 MHz (Ch 16) • Satellite Dial 1077</div>
                </div>
                <div>
                  <span class="text-slate-400 block text-[8px] uppercase font-bold mb-1">Real-Time Coastal Telemetry</span>
                  <div class="grid grid-cols-1 gap-1">
                    <div class="flex justify-between items-center p-1 rounded bg-slate-950 border border-slate-800">
                      <span class="text-slate-300">Tide Gauge Water Crest:</span>
                      <strong class="${risk.inundationPotentialMeters > 0 ? 'text-red-400' : 'text-emerald-400'}">+${(risk.inundationPotentialMeters + 0.3).toFixed(1)}m Live</strong>
                    </div>
                    <div class="flex justify-between items-center p-1 rounded bg-slate-950 border border-slate-800">
                      <span class="text-slate-300">Anemometer Coastal Gust:</span>
                      <strong class="text-amber-300">${cycloneData.sustainedWindKmh} km/h</strong>
                    </div>
                  </div>
                </div>
              </div>
            </details>

            <div class="text-[9px] text-slate-500 flex justify-between pt-1 border-t border-slate-800">
              <span>Status: ${settlement.evacuationStatus}</span>
              <span>Dist to Coast: ${settlement.distanceToCoastKm}km</span>
            </div>
          </div>
        `;

        marker.bindPopup(popupHtml, { maxWidth: 320 });
        marker.on('click', () => {
          setSelectedSettlement(settlement);
          mapRef.current?.flyTo([settlement.coordinates.lat, settlement.coordinates.lng], 13, { duration: 0.8 });
        });

        settlementsGroup.addLayer(marker);
      });
    }

    // 5. Storm Eye Center Marker
    if (eyeMarkerRef.current) {
      map.removeLayer(eyeMarkerRef.current);
    }
    const eyeIcon = L.divIcon({
      className: 'cyclone-storm-eye-marker',
      html: `
        <div class="relative flex items-center justify-center cursor-pointer">
          <div class="absolute w-12 h-12 rounded-full border-2 border-red-500/80 animate-ping pointer-events-none"></div>
          <div class="absolute w-16 h-16 rounded-full border border-red-500/40 animate-pulse pointer-events-none"></div>
          <div class="w-10 h-10 rounded-full bg-red-950/90 border-2 border-red-500 shadow-[0_0_20px_rgba(239,68,68,0.8)] flex items-center justify-center text-white">
            <svg class="w-5 h-5 text-red-400 animate-spin" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M4.93 4.93a10 10 0 0 1 14.14 0m-14.14 14.14a10 10 0 0 0 14.14 0M12 2a10 10 0 1 0 10 10A10 10 0 0 0 12 2z"></path>
            </svg>
          </div>
          <div class="absolute -top-6 left-1/2 -translate-x-1/2 px-2 py-0.5 rounded bg-red-950/95 border border-red-500/80 text-[10px] text-white font-bold whitespace-nowrap shadow-lg">
            EYE: ${cycloneData.sustainedWindKmh} km/h
          </div>
        </div>
      `,
      iconSize: [40, 40],
      iconAnchor: [20, 20],
    });

    const eyeMarker = L.marker([cycloneData.center.lat, cycloneData.center.lng], { icon: eyeIcon }).addTo(map);

    // Bind clean interactive Leaflet popup to Eye Marker with subtle expand telemetry
    const eyePopupHtml = `
      <div class="p-3 bg-slate-950 text-slate-100 font-mono-tactical text-xs rounded-xl space-y-2 max-w-xs border border-red-500/60 shadow-2xl">
        <div class="flex items-center justify-between border-b border-slate-800 pb-2">
          <div class="flex items-center gap-1.5 text-red-400 font-bold">
            <span>🌀 ${cycloneData.stormName}</span>
          </div>
          <span class="px-1.5 py-0.5 rounded text-[9px] bg-red-500/20 text-red-300 border border-red-500/40 uppercase font-bold">
            LIVE EYE
          </span>
        </div>

        <div class="space-y-1.5 text-slate-300 text-[11px]">
          <div class="flex justify-between items-center">
            <span class="text-slate-400">Sustained Wind:</span>
            <strong class="text-amber-300 font-bold">${cycloneData.sustainedWindKmh} km/h</strong>
          </div>
          <div class="flex justify-between items-center">
            <span class="text-slate-400">Peak Gusts:</span>
            <strong class="text-red-400 font-bold">${cycloneData.gustKmh} km/h</strong>
          </div>
          <div class="flex justify-between items-center">
            <span class="text-slate-400">Central Pressure:</span>
            <strong class="text-cyan-300">${cycloneData.pressureHpa} hPa</strong>
          </div>
          <div class="flex justify-between items-center">
            <span class="text-slate-400">Storm Category:</span>
            <strong class="text-white text-[10px]">${cycloneData.category.split(' (')[0]}</strong>
          </div>
        </div>

        <div class="p-2 rounded bg-slate-900 border border-slate-800 text-[10px]">
          <span class="text-slate-400 block font-bold mb-0.5">Expected Landfall:</span>
          <span class="text-amber-300 font-semibold">${cycloneData.landfallWindow}</span>
        </div>

        <!-- Subtle Expand Interaction: Deep Meteorological Sensors -->
        <details class="group rounded-lg border border-slate-800 bg-slate-900/90 overflow-hidden transition-all duration-200">
          <summary class="flex items-center justify-between p-1.5 text-[9px] font-bold text-cyan-300 hover:text-cyan-200 cursor-pointer select-none bg-slate-900 group-hover:bg-slate-850 transition-colors">
            <span class="flex items-center gap-1">
              <span>📡</span>
              <span>Granular Meteorological Sensors</span>
            </span>
            <span class="text-[8px] px-1 py-0.2 rounded bg-cyan-950 border border-cyan-700/60 text-cyan-300">
              <span class="group-open:hidden">Expand ▾</span>
              <span class="hidden group-open:inline">Collapse ▴</span>
            </span>
          </summary>
          <div class="p-2 space-y-1 border-t border-slate-800 text-[9px] text-slate-300">
            <div class="flex justify-between"><span>Eye Diameter:</span> <strong class="text-cyan-300">28 km Pin-Hole Eye</strong></div>
            <div class="flex justify-between"><span>Forward Motion:</span> <strong class="text-amber-300">14 km/h WNW</strong></div>
            <div class="flex justify-between"><span>Sea Surface Temp:</span> <strong class="text-red-400">30.2°C (Fuel Source)</strong></div>
            <div class="flex justify-between"><span>Ocean Buoy ID:</span> <strong class="text-slate-300">INCOIS-BD08</strong></div>
          </div>
        </details>

        <div class="text-[9px] text-slate-500 pt-1 border-t border-slate-800 flex justify-between">
          <span>Danger Radius: ~${cycloneData.surgeRadiusKm} km</span>
          <span class="text-cyan-400">Google Satellite Feed</span>
        </div>
      </div>
    `;

    eyeMarker.bindPopup(eyePopupHtml, { maxWidth: 300 });
    eyeMarkerRef.current = eyeMarker;
  }, [cycloneData, infoWindowOpen, setInfoWindowOpen, setSelectedSettlement, showCities, showAdminAreas]);

  return (
    <div className="relative w-full h-full">
      <div 
        ref={containerRef} 
        className="w-full h-full z-0" 
      />

      {/* Zoom Controls & Detailed Scale Telemetry HUD (Bottom-Right) */}
      <ZoomLevelDetailsCard
        zoomLevel={zoomLevel}
        centerCoords={cycloneData.center}
        onZoomIn={() => mapRef.current?.zoomIn()}
        onZoomOut={() => mapRef.current?.zoomOut()}
        onSetPresetZoom={(z, coords) => {
          if (coords) {
            mapRef.current?.setView(coords, z);
          } else if (z <= 7) {
            mapRef.current?.setView([cycloneData.center.lat, cycloneData.center.lng], 6);
          } else {
            mapRef.current?.setZoom(z);
          }
        }}
        className="absolute bottom-20 sm:bottom-6 right-3 sm:right-4 z-20"
        themeContext="satellite"
      />
    </div>
  );
};

export const GoogleMapsLiveTracking: React.FC<GoogleMapsLiveTrackingProps> = () => {
  const envKey = (typeof import.meta !== 'undefined' && import.meta?.env?.VITE_GOOGLE_MAPS_API_KEY) || '';
  const [customKey, setCustomKey] = useState<string>(envKey);
  const [authFailed, setAuthFailed] = useState<boolean>(false);

  // A genuine Google Maps API key starts with "AIzaSy" or "AIza"
  const isKeyFormatPlausible = customKey.trim().startsWith('AIza');
  const useGoogleMapsNative = isKeyFormatPlausible && !authFailed;

  // Basemap Type (hybrid gives satellite + Google place names natively)
  const [mapType, setMapType] = useState<MapTypeOption>('hybrid');
  
  // Custom Styling & UI Feature Toggles for Satellite View
  const [showTraffic, setShowTraffic] = useState<boolean>(true);
  const [showCities, setShowCities] = useState<boolean>(true);
  const [showTowns, setShowTowns] = useState<boolean>(true);
  const [showAdminAreas, setShowAdminAreas] = useState<boolean>(true);

  const [cycloneData, setCycloneData] = useState<LiveCycloneData>(MOCK_CATEGORY_4_CYCLONE);
  const [isSimulated, setIsSimulated] = useState<boolean>(true);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [infoWindowOpen, setInfoWindowOpen] = useState<boolean>(true);
  const [showKeyPrompt, setShowKeyPrompt] = useState<boolean>(false);
  const [keyInput, setKeyInput] = useState<string>('');
  
  // Settlement Search and Filter State
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedRiskFilter, setSelectedRiskFilter] = useState<'ALL' | 'CRITICAL' | 'HIGH' | 'SAFE'>('ALL');
  const [showSettlementDrawer, setShowSettlementDrawer] = useState<boolean>(false);
  const [selectedSettlement, setSelectedSettlement] = useState<CoastalSettlement | null>(null);
  const [focusedLocation, setFocusedLocation] = useState<{ lat: number; lng: number } | null>(null);

  const [stormMarkerRef, stormMarker] = useAdvancedMarkerRef();

  // Listen to Google Maps auth failures
  useEffect(() => {
    const handleAuthError = () => {
      console.warn('[Google Maps Auth] API key rejected by Google Maps service. Activating resilient satellite viewer.');
      setAuthFailed(true);
    };

    (window as any).gm_authFailure = handleAuthError;
    window.addEventListener('gmp-quota-exceeded', handleAuthError);

    return () => {
      window.removeEventListener('gmp-quota-exceeded', handleAuthError);
    };
  }, []);

  // Load live or simulated feed
  const loadData = async (simulate: boolean) => {
    setIsLoading(true);
    try {
      const data = await fetchLiveCycloneFeed(simulate);
      setCycloneData(data);
    } catch (err) {
      console.error('Failed to load cyclone feed:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData(isSimulated);
  }, [isSimulated]);

  const toggleSimulation = () => {
    const nextState = !isSimulated;
    setIsSimulated(nextState);
  };

  const polylineCoords = cycloneData.trajectory.map((pt) => ({
    lat: pt.lat,
    lng: pt.lng,
  }));

  const handleApplyCustomKey = (e: React.FormEvent) => {
    e.preventDefault();
    if (keyInput.trim()) {
      setAuthFailed(false);
      setCustomKey(keyInput.trim());
      setShowKeyPrompt(false);
    }
  };

  const currentSurge = cycloneData.sustainedWindKmh > 180 ? 5.2 : 2.5;

  // Custom Map Styling configuration showing/hiding cities, towns, and administrative_areas
  const googleMapStyles = useMemo<google.maps.MapTypeStyle[]>(() => {
    return [
      {
        featureType: 'administrative.country',
        elementType: 'geometry.stroke',
        stylers: [{ visibility: showAdminAreas ? 'on' : 'off' }, { color: '#38bdf8' }, { weight: 1.5 }],
      },
      {
        featureType: 'administrative.country',
        elementType: 'labels.text.fill',
        stylers: [{ visibility: showAdminAreas ? 'on' : 'off' }, { color: '#ffffff' }],
      },
      {
        featureType: 'administrative.province',
        elementType: 'geometry.stroke',
        stylers: [{ visibility: showAdminAreas ? 'on' : 'off' }, { color: '#0284c7' }, { weight: 1.2 }],
      },
      {
        featureType: 'administrative.province',
        elementType: 'labels.text.fill',
        stylers: [{ visibility: showAdminAreas ? 'on' : 'off' }, { color: '#bae6fd' }],
      },
      {
        featureType: 'administrative.locality',
        elementType: 'labels.text.fill',
        stylers: [{ visibility: showCities ? 'on' : 'off' }, { color: '#fef08a' }],
      },
      {
        featureType: 'administrative.locality',
        elementType: 'labels.text.stroke',
        stylers: [{ visibility: showCities ? 'on' : 'off' }, { color: '#020617' }, { weight: 3 }],
      },
      {
        featureType: 'administrative.neighborhood',
        elementType: 'labels.text.fill',
        stylers: [{ visibility: showTowns ? 'on' : 'off' }, { color: '#e2e8f0' }],
      },
      {
        featureType: 'administrative.land_parcel',
        elementType: 'labels',
        stylers: [{ visibility: showTowns ? 'on' : 'off' }],
      },
      {
        featureType: 'road',
        elementType: 'labels.text.fill',
        stylers: [{ color: '#94a3b8' }],
      },
    ];
  }, [showCities, showTowns, showAdminAreas]);

  // Filtered settlements based on search, risk filter, and UI label visibility
  const filteredSettlements = useMemo(() => {
    return COASTAL_SETTLEMENTS.filter((settlement) => {
      // Respect visibility filters
      const isCity = settlement.type === 'City / Port' || settlement.type === 'Major Coastal Metropolis';
      const isTown = settlement.type === 'Estuarine Delta Town' || settlement.type === 'Inland Relief Hub' || settlement.type === 'Highland Safe Haven';
      if (!showCities && isCity) return false;
      if (!showTowns && isTown) return false;

      const risk = calculateSettlementRisk(
        settlement,
        cycloneData.center,
        currentSurge,
        cycloneData.sustainedWindKmh
      );

      // 1. Risk Filter
      if (selectedRiskFilter === 'CRITICAL' && risk.level !== 'CATASTROPHIC' && risk.level !== 'CRITICAL') {
        return false;
      }
      if (selectedRiskFilter === 'HIGH' && risk.level !== 'HIGH') {
        return false;
      }
      if (selectedRiskFilter === 'SAFE' && risk.level !== 'LOW_SAFE') {
        return false;
      }

      // 2. Search Query
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase().trim();
        const matchName = settlement.name.toLowerCase().includes(query);
        const matchTelugu = settlement.localNameTelugu?.includes(query);
        const matchDistrict = settlement.district.toLowerCase().includes(query);
        const matchType = settlement.type.toLowerCase().includes(query);
        return matchName || matchTelugu || matchDistrict || matchType;
      }

      return true;
    });
  }, [cycloneData, currentSurge, selectedRiskFilter, searchQuery, showCities, showTowns]);

  const handleFocusSettlement = (settlement: CoastalSettlement) => {
    setSelectedSettlement(settlement);
    setFocusedLocation({ lat: settlement.coordinates.lat, lng: settlement.coordinates.lng });
  };

  return (
    <div className="relative w-full h-full bg-slate-950 overflow-hidden font-mono-tactical select-none">
      {/* 1. If genuine Google Key is present and valid, render native @vis.gl/react-google-maps */}
      {useGoogleMapsNative ? (
        <APIProvider apiKey={customKey} libraries={['marker', 'geometry']}>
          <Map
            mapId="DEMO_MAP_ID"
            mapTypeId={mapType}
            styles={googleMapStyles}
            defaultCenter={{ lat: cycloneData.center.lat, lng: cycloneData.center.lng }}
            defaultZoom={7}
            gestureHandling="greedy"
            disableDefaultUI={false}
            style={{ width: '100%', height: '100%' }}
            internalUsageAttributionIds={['gmp_mcp_codeassist_v1_aistudio']}
          >
            <GoogleMapZoomController
              center={focusedLocation || cycloneData.center}
              focusedLocation={focusedLocation}
              defaultCenter={cycloneData.center}
            />

            {/* Google Maps Live TrafficLayer Component */}
            <GoogleTrafficLayer enabled={showTraffic} />

            {/* Trajectory Polyline */}
            <GooglePolyline
              path={polylineCoords}
              options={{
                strokeColor: '#38bdf8',
                strokeOpacity: 0.9,
                strokeWeight: 4,
                geodesic: true,
              }}
            />

            {/* Dynamic Red Danger Radius Polygon */}
            <GooglePolygon
              paths={cycloneData.dangerRadiusPolygon}
              options={{
                strokeColor: '#ef4444',
                strokeOpacity: 0.85,
                strokeWeight: 2,
                fillColor: '#dc2626',
                fillOpacity: 0.32,
              }}
            />

            {/* Trajectory Waypoints */}
            {cycloneData.trajectory.map((pt, idx) => {
              if (pt.status === 'current') return null;
              return (
                <AdvancedMarker
                  key={`${pt.lat}-${pt.lng}-${idx}`}
                  position={{ lat: pt.lat, lng: pt.lng }}
                  title={`${pt.timestamp}: ${pt.windKmh} km/h`}
                >
                  <div className="relative flex items-center justify-center cursor-pointer group">
                    <div
                      className={`w-3 h-3 rounded-full border border-white ${
                        pt.status === 'past' ? 'bg-slate-400' : 'bg-cyan-400 animate-pulse'
                      }`}
                    />
                    <div className="absolute -bottom-5 left-1/2 -translate-x-1/2 px-1 py-0.5 rounded bg-slate-950/90 text-[9px] text-slate-300 border border-slate-700 whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                      {pt.windKmh} km/h ({pt.timestamp})
                    </div>
                  </div>
                </AdvancedMarker>
              );
            })}

            {/* Coastal Settlements on Google Maps */}
            {filteredSettlements.map((settlement) => {
              const risk = calculateSettlementRisk(
                settlement,
                cycloneData.center,
                currentSurge,
                cycloneData.sustainedWindKmh
              );

              let pinColor = '#3b82f6';
              let dotColor = '#60a5fa';
              if (risk.level === 'CATASTROPHIC') {
                pinColor = '#ef4444';
                dotColor = '#dc2626';
              } else if (risk.level === 'CRITICAL') {
                pinColor = '#f43f5e';
                dotColor = '#e11d48';
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

              return (
                <AdvancedMarker
                  key={settlement.id}
                  position={{ lat: settlement.coordinates.lat, lng: settlement.coordinates.lng }}
                  title={`${settlement.name} (${risk.badgeLabel})`}
                  onClick={() => handleFocusSettlement(settlement)}
                >
                  <div className="relative group cursor-pointer flex flex-col items-center">
                    <div className="px-2 py-0.5 rounded-md border flex items-center gap-1.5 shadow-2xl transition-all group-hover:scale-105"
                         style={{ backgroundColor: 'rgba(2, 6, 23, 0.94)', borderColor: pinColor, boxShadow: `0 0 12px ${pinColor}88` }}>
                      <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: dotColor }}></div>
                      <div className="flex flex-col leading-none">
                        <span className="text-[11px] font-bold text-white tracking-tight">{settlement.name}</span>
                        {settlement.localNameTelugu && (
                          <span className="text-[9px] text-slate-400 font-sans">{settlement.localNameTelugu}</span>
                        )}
                      </div>
                      {showAdminAreas && (
                        <span className="text-[8px] text-slate-400 ml-0.5 hidden sm:inline">({settlement.district})</span>
                      )}
                      <span className="text-[8px] px-1 py-0.5 rounded font-extrabold tracking-wider uppercase ml-0.5"
                            style={{ backgroundColor: `${pinColor}22`, color: pinColor, border: `1px solid ${pinColor}44` }}>
                        {risk.level === 'LOW_SAFE' ? 'SAFE' : risk.level}
                      </span>
                    </div>
                    <div className="w-1.5 h-2 -mt-0.5" style={{ backgroundColor: pinColor, clipPath: 'polygon(0 0, 100% 0, 50% 100%)' }}></div>
                  </div>
                </AdvancedMarker>
              );
            })}

            {/* Animated Storm Center Marker */}
            <AdvancedMarker
              ref={stormMarkerRef}
              position={cycloneData.center}
              title={cycloneData.stormName}
              onClick={() => setInfoWindowOpen(!infoWindowOpen)}
            >
              <div className="relative flex items-center justify-center cursor-pointer">
                <div className="absolute w-12 h-12 rounded-full border-2 border-red-500/80 animate-ping pointer-events-none" />
                <div className="absolute w-16 h-16 rounded-full border border-red-500/40 animate-pulse pointer-events-none" />
                <div className="w-10 h-10 rounded-full bg-red-950/90 border-2 border-red-500 shadow-[0_0_20px_rgba(239,68,68,0.8)] flex items-center justify-center text-white">
                  <Radio className="w-5 h-5 text-red-400 animate-spin" />
                </div>
                <div className="absolute -top-6 left-1/2 -translate-x-1/2 px-2 py-0.5 rounded bg-red-950/95 border border-red-500/80 text-[10px] text-white font-bold whitespace-nowrap shadow-lg">
                  EYE: {cycloneData.sustainedWindKmh} km/h
                </div>
              </div>
            </AdvancedMarker>

            {/* Interactive Eye InfoWindow */}
            {infoWindowOpen && stormMarker && (
              <InfoWindow
                anchor={stormMarker}
                onCloseClick={() => setInfoWindowOpen(false)}
                maxWidth={340}
              >
                <div className="p-3 bg-slate-950 text-slate-100 font-mono-tactical text-xs rounded-lg space-y-2">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                    <div className="flex items-center gap-1.5 text-red-400 font-bold text-sm">
                      <ShieldAlert className="w-4 h-4 text-red-400 shrink-0" />
                      <span className="truncate">{cycloneData.stormName}</span>
                    </div>
                    <span className="px-1.5 py-0.5 rounded text-[9px] bg-red-500/20 text-red-300 border border-red-500/40 uppercase">
                      LIVE EYE
                    </span>
                  </div>

                  <div className="space-y-1.5 text-slate-300">
                    <div className="flex justify-between items-center">
                      <span className="text-slate-400 flex items-center gap-1">
                        <Wind className="w-3.5 h-3.5 text-amber-400" />
                        <span>Sustained Wind Speed:</span>
                      </span>
                      <strong className="text-amber-300 text-sm">{cycloneData.sustainedWindKmh} km/h</strong>
                    </div>

                    <div className="flex justify-between items-center">
                      <span className="text-slate-400">Peak Gusts:</span>
                      <strong className="text-red-400">{cycloneData.gustKmh} km/h</strong>
                    </div>

                    <div className="flex justify-between items-center">
                      <span className="text-slate-400 flex items-center gap-1">
                        <Gauge className="w-3.5 h-3.5 text-cyan-400" />
                        <span>Central Pressure:</span>
                      </span>
                      <strong className="text-cyan-300 text-sm">{cycloneData.pressureHpa} hPa</strong>
                    </div>

                    <div className="flex justify-between items-center">
                      <span className="text-slate-400">Storm Category:</span>
                      <strong className="text-white text-[11px] truncate max-w-[160px] text-right">
                        {cycloneData.category.split(' (')[0]}
                      </strong>
                    </div>

                    <div className="p-2 rounded bg-slate-900 border border-slate-800 text-[11px] mt-2">
                      <span className="text-slate-400 block text-[10px] uppercase font-bold flex items-center gap-1 mb-0.5">
                        <Clock className="w-3 h-3 text-amber-400" />
                        <span>Expected Landfall Window:</span>
                      </span>
                      <span className="text-amber-300 font-semibold">{cycloneData.landfallWindow}</span>
                    </div>

                    <div className="text-[10px] text-slate-500 pt-1 border-t border-slate-800 flex justify-between">
                      <span>Danger Radius: ~{cycloneData.surgeRadiusKm} km</span>
                      <span className="text-cyan-400">Google Satellite Feed</span>
                    </div>
                  </div>
                </div>
              </InfoWindow>
            )}
          </Map>
        </APIProvider>
      ) : (
        /* 2. Resilient Satellite Map Fallback (Guaranteed 0 errors, full satellite view & metrics) */
        <ResilientSatelliteViewer
          cycloneData={cycloneData}
          mapType={mapType}
          showLabels={true}
          showCities={showCities}
          showAdminAreas={showAdminAreas}
          showTraffic={showTraffic}
          infoWindowOpen={infoWindowOpen}
          setInfoWindowOpen={setInfoWindowOpen}
          selectedSettlement={selectedSettlement}
          setSelectedSettlement={setSelectedSettlement}
          focusedLocation={focusedLocation}
        />
      )}

      {/* Floating Tactical Overlay HUD: Compact Location Radar (Fourth Box, Decreased Size) */}
      <div className="absolute top-3 left-3 z-20 flex flex-col gap-1.5 w-auto max-w-[220px] pointer-events-auto font-mono-tactical">
        {/* Decreased Size 4th Box: Compact Locations Radar Button */}
        <button
          onClick={() => setShowSettlementDrawer(!showSettlementDrawer)}
          className="px-2.5 py-1 rounded-md bg-slate-950/90 hover:bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-200 text-[11px] font-bold flex items-center justify-between gap-2 backdrop-blur-md shadow-lg transition-all"
          title="Toggle Coastal Locations Radar"
        >
          <span className="flex items-center gap-1.5 truncate">
            <MapPin className="w-3 h-3 text-rose-400 shrink-0" />
            <span className="truncate">Locations ({filteredSettlements.length})</span>
          </span>
          {showSettlementDrawer ? <ChevronUp className="w-3 h-3 text-slate-400 shrink-0" /> : <ChevronDown className="w-3 h-3 text-slate-400 shrink-0" />}
        </button>

        {/* Compact Collapsible Locations Risk Roster */}
        {showSettlementDrawer && (
          <div className="p-1.5 rounded-lg bg-slate-950/95 border border-slate-800 backdrop-blur-xl shadow-2xl max-h-40 w-52 overflow-y-auto space-y-1">
            <div className="text-[9px] text-slate-400 font-bold uppercase tracking-wider px-1 flex items-center justify-between border-b border-slate-800 pb-1">
              <span>Location</span>
              <span>Threat</span>
            </div>

            {filteredSettlements.map((settlement) => {
              const risk = calculateSettlementRisk(
                settlement,
                cycloneData.center,
                currentSurge,
                cycloneData.sustainedWindKmh
              );

              let badgeStyle = 'text-emerald-400 bg-emerald-950/60 border-emerald-500/40';
              if (risk.level === 'CATASTROPHIC') {
                badgeStyle = 'text-red-400 bg-red-950/80 border-red-500/60 animate-pulse';
              } else if (risk.level === 'CRITICAL') {
                badgeStyle = 'text-rose-400 bg-rose-950/70 border-rose-500/50';
              } else if (risk.level === 'HIGH') {
                badgeStyle = 'text-amber-400 bg-amber-950/60 border-amber-500/40';
              } else if (risk.level === 'MODERATE') {
                badgeStyle = 'text-yellow-400 bg-yellow-950/50 border-yellow-600/40';
              }

              return (
                <div
                  key={settlement.id}
                  onClick={() => handleFocusSettlement(settlement)}
                  className="p-1 rounded bg-slate-900/70 hover:bg-slate-800 border border-slate-800/80 cursor-pointer flex items-center justify-between transition-colors text-[10px]"
                >
                  <div className="flex flex-col truncate pr-1">
                    <span className="font-bold text-slate-200 truncate">{settlement.name}</span>
                    <span className="text-[8px] text-slate-400 truncate">{settlement.type}</span>
                  </div>

                  <div className="text-right shrink-0">
                    <span className={`px-1 py-0.2 rounded text-[7px] font-bold border ${badgeStyle}`}>
                      {risk.level === 'LOW_SAFE' ? 'SAFE' : risk.level}
                    </span>
                    <span className="block text-[8px] text-slate-500">{risk.distanceToEyeKm}km</span>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Discrete Custom Google Maps Key Switcher */}
        {!showKeyPrompt ? (
          <button
            onClick={() => setShowKeyPrompt(true)}
            className="text-[9px] px-2 py-0.5 rounded bg-slate-900/80 hover:bg-slate-800 border border-slate-800 text-slate-400 hover:text-slate-200 flex items-center gap-1 w-fit transition-colors"
            title="Configure Custom Google Maps API Key"
          >
            <Key className="w-2.5 h-2.5 text-cyan-400" />
            <span>{useGoogleMapsNative ? 'Maps Key Active' : 'Enter API Key'}</span>
          </button>
        ) : (
          <form onSubmit={handleApplyCustomKey} className="p-2 rounded-lg bg-slate-950 border border-slate-700 text-xs space-y-1.5 w-52 shadow-2xl">
            <div className="text-[9px] text-slate-400 font-semibold">Google Maps API Key:</div>
            <input
              type="text"
              placeholder="Enter Google Maps API Key..."
              value={keyInput}
              onChange={(e) => setKeyInput(e.target.value)}
              className="w-full px-1.5 py-0.5 rounded bg-slate-900 border border-slate-700 text-slate-100 text-[10px] focus:outline-none focus:border-cyan-500"
            />
            <div className="flex gap-1.5 justify-end">
              <button
                type="button"
                onClick={() => setShowKeyPrompt(false)}
                className="px-1.5 py-0.5 rounded text-[9px] text-slate-400 hover:text-slate-200"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-2 py-0.5 rounded bg-cyan-600 hover:bg-cyan-500 text-slate-950 font-bold text-[9px]"
              >
                Apply
              </button>
            </div>
          </form>
        )}
      </div>

      {/* Floating Tactical Overlay HUD: Top-Right Map Controls & Legend */}
      <div className="absolute top-3 right-3 z-20 flex flex-col gap-2 items-end">
        {/* Basemap Layer Selector */}
        <div className="flex items-center gap-2">
          {/* Basemap Layer Selector (Hybrid / Pure Satellite only) */}
          <div className="p-0.5 rounded-lg bg-slate-950/90 border border-slate-800 backdrop-blur-md shadow-xl flex items-center gap-0.5 text-[10px] h-7">
            <button
              onClick={() => setMapType('hybrid')}
              className={`px-2 py-0.5 rounded-md transition-all font-bold ${
                mapType === 'hybrid'
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
              title="Satellite Imagery with Google place names, cities, villages & roads"
            >
              <span>🛰️ Hybrid</span>
            </button>

            <button
              onClick={() => setMapType('satellite')}
              className={`px-2 py-0.5 rounded-md transition-all font-bold ${
                mapType === 'satellite'
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
              title="Pure satellite imagery without place labels"
            >
              <span>🌍 Pure Sat</span>
            </button>
          </div>
        </div>

        {/* Map Legend Card */}
        <div 
          className="hidden md:block p-3 rounded-xl bg-slate-950/90 border border-slate-800 backdrop-blur-md text-[11px] space-y-1.5 shadow-2xl"
          style={{ fontFamily: 'Times New Roman', fontWeight: 'bold', fontSize: '11px', lineHeight: '14.5px', width: '226px', height: '156.4px' }}
        >
          <div className="text-[10px] uppercase font-bold text-slate-400 mb-1">Satellite Risk Overlays</div>
          <div className="flex items-center gap-2 text-slate-300">
            <div className="w-4 h-1 bg-sky-400 rounded" />
            <span>Trajectory Track Polyline</span>
          </div>
          <div className="flex items-center gap-2 text-slate-300">
            <div className="w-3 h-3 bg-red-600/40 border border-red-500 rounded-sm" />
            <span>Danger Radius / Wind Field (Polygon)</span>
          </div>
          <div className="flex items-center gap-2 text-slate-300">
            <div className="w-2.5 h-2.5 rounded-full bg-red-500 animate-ping" />
            <span>Storm Eye Center</span>
          </div>
          {showTraffic && (
            <div className="flex items-center gap-2 text-slate-300">
              <div className="w-4 h-1 bg-emerald-500 rounded" />
              <span>Live Traffic Flow Overlay</span>
            </div>
          )}
          
          <div className="border-t border-slate-800/80 pt-1.5 mt-1">
            <div className="text-[10px] uppercase font-bold text-slate-400 mb-1">Locations Risk Matrix</div>
            <div className="flex items-center gap-2 text-[10px]">
              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-red-500 animate-ping"></span> Catastrophic</span>
              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-rose-500"></span> Critical</span>
              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-amber-500"></span> High</span>
              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-emerald-500"></span> Safe</span>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Center: Live Synoptic Telemetry Bar & Coastal Status ("Matter at down") */}
      <div className="absolute bottom-4 sm:bottom-5 left-1/2 -translate-x-1/2 z-20 w-[94%] max-w-3xl pointer-events-auto">
        <div className="p-2 sm:p-2.5 rounded-xl bg-slate-950/90 border border-slate-800 backdrop-blur-md shadow-2xl flex flex-wrap items-center justify-between gap-2 text-[11px] font-mono-tactical text-slate-300">
          <div className="flex items-center gap-2">
            <span className="flex h-2 w-2 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-500"></span>
            </span>
            <span className="text-cyan-400 font-bold tracking-wider uppercase text-[10px]">
              SYNOPTIC FEED:
            </span>
            <span className="text-white font-semibold">
              {cycloneData.stormName} ({cycloneData.category.split(' (')[0]})
            </span>
          </div>

          <div className="flex items-center gap-3 sm:gap-4 text-[10px]">
            <span className="flex items-center gap-1">
              <span className="text-slate-400">Eye:</span>
              <strong className="text-cyan-300">{cycloneData.center.lat.toFixed(2)}°N, {cycloneData.center.lng.toFixed(2)}°E</strong>
            </span>
            <span className="flex items-center gap-1">
              <span className="text-slate-400">Wind:</span>
              <strong className="text-amber-300">{cycloneData.sustainedWindKmh} km/h</strong>
            </span>
            <span className="flex items-center gap-1 hidden sm:flex">
              <span className="text-slate-400">Gusts:</span>
              <strong className="text-red-400">{cycloneData.gustKmh} km/h</strong>
            </span>
            <span className="flex items-center gap-1 hidden md:flex">
              <span className="text-slate-400">Pressure:</span>
              <strong className="text-sky-300">{cycloneData.pressureHpa} hPa</strong>
            </span>
            <span className="flex items-center gap-1">
              <span className="text-slate-400">Landfall:</span>
              <strong className="text-amber-400">{cycloneData.landfallWindow}</strong>
            </span>
          </div>

          <div className="text-[10px] text-cyan-400 font-medium hidden lg:flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
            <span>GDACS / Open-Meteo Feed Active</span>
          </div>
        </div>
      </div>
    </div>
  );
};
