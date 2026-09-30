/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface ZoomDetailInfo {
  zoom: number;
  label: string;
  category: 'Synoptic' | 'Sub-Regional' | 'Sector Tactical' | 'Local Ward' | 'High Precision';
  scaleRatio: string;
  resolutionMetersPerPx: string;
  fovKm: string;
  altitudeEquivalent: string;
  recommendedUse: string;
  detectableFeatures: string[];
}

export function getZoomLevelDetails(zoom: number): ZoomDetailInfo {
  const z = Math.round(zoom);

  if (z <= 5) {
    return {
      zoom: z,
      label: 'Global Oceanic Basin',
      category: 'Synoptic',
      scaleRatio: '1:10,000,000',
      resolutionMetersPerPx: '~4.8 km/px',
      fovKm: '~2,500 km',
      altitudeEquivalent: 'Geostationary Satellite (35,786 km)',
      recommendedUse: 'Full Bay of Bengal & Indian Ocean cyclone trajectory surveillance',
      detectableFeatures: ['Sub-continental landmasses', 'Major atmospheric circulation systems', 'Whole-basin cloud shields'],
    };
  }

  if (z <= 7) {
    return {
      zoom: z,
      label: 'Regional Synoptic Track',
      category: 'Sub-Regional',
      scaleRatio: '1:1,000,000',
      resolutionMetersPerPx: '~1.2 km/px',
      fovKm: '~600 km',
      altitudeEquivalent: 'Low-Earth Orbit Polar Satellite (850 km)',
      recommendedUse: 'Cyclone approach tracking, outer gale radii & multi-state forecast paths',
      detectableFeatures: ['Full Andhra Pradesh coastline', 'Major river deltas (Godavari & Krishna)', 'Storm eye & primary spiral rainbands'],
    };
  }

  if (z <= 9) {
    return {
      zoom: z,
      label: 'Sub-Basin Impact Corridor',
      category: 'Sub-Regional',
      scaleRatio: '1:250,000',
      resolutionMetersPerPx: '~300 m/px',
      fovKm: '~180 km',
      altitudeEquivalent: 'High-Altitude Reconnaissance (65,000 ft)',
      recommendedUse: 'Inter-district emergency coordination & regional evacuation corridors',
      detectableFeatures: ['District boundaries (Kakinada / Konaseema)', 'Barrier islands (Hope Island)', 'Major estuaries & bay mouths'],
    };
  }

  if (z <= 12) {
    return {
      zoom: z,
      label: 'Sector Tactical Operations',
      category: 'Sector Tactical',
      scaleRatio: '1:50,000',
      resolutionMetersPerPx: '~75 m/px',
      fovKm: '~45 km',
      altitudeEquivalent: 'Medium-Altitude Aerial Patrol (15,000 ft)',
      recommendedUse: 'Storm surge inundation penetration, flood depth contours & city threat ranking',
      detectableFeatures: ['Municipal city boundaries', 'National Highway NH-16 & coastal bypasses', 'Primary flood defense seawalls', 'Mangrove forest buffer perimeters'],
    };
  }

  if (z <= 14) {
    return {
      zoom: z,
      label: 'Village & Ward Cluster',
      category: 'Local Ward',
      scaleRatio: '1:25,000',
      resolutionMetersPerPx: '~20 m/px',
      fovKm: '~12 km',
      altitudeEquivalent: 'Tactical Drone Reconnaissance (4,000 ft)',
      recommendedUse: 'Civilian community evacuation, shelter triage & canal breach tracking',
      detectableFeatures: ['Coastal fishing villages (Uppada, Suryaraopeta)', 'Salt pans & aquaculture bunds', 'Primary evacuation feeder roads', 'Municipal drainage canal gates'],
    };
  }

  if (z <= 16) {
    return {
      zoom: z,
      label: 'Neighborhood & Grid Sector',
      category: 'Local Ward',
      scaleRatio: '1:10,000',
      resolutionMetersPerPx: '~5 m/px',
      fovKm: '~3.5 km',
      altitudeEquivalent: 'Low-Altitude Airborne Asset (1,200 ft)',
      recommendedUse: 'Urban street-level water logging, electrical substation protection & rescue staging',
      detectableFeatures: ['Individual street grids & intersections', 'Major hospital & substation compounds', 'Deepwater port breakwaters & shipping channels', 'Civic shelters'],
    };
  }

  return {
    zoom: z,
    label: 'High-Precision Asset Detail',
    category: 'High Precision',
    scaleRatio: '1:2,500',
    resolutionMetersPerPx: '~1.2 m/px',
    fovKm: '~800 m',
    altitudeEquivalent: 'Close-Quarters UAS / Rooftop Sensor (300 ft)',
    recommendedUse: 'Infrastructure asset damage assessment, berth overtopping & micro-elevation breach',
    detectableFeatures: ['Building footprints & emergency generator platforms', 'Port gantry cranes & container stacks', 'Seawall armor stone & geotextile tubes', 'Vessel moorings & sluice gates'],
  };
}
