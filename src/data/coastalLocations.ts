/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface CoastalLocation {
  id: string;
  name: string;
  localName?: string;
  type: 'city' | 'port' | 'town' | 'village' | 'island';
  lat: number;
  lng: number;
  population?: string;
  elevationMeters?: number;
  riskTier: 'Severe Surge Zone' | 'High Impact' | 'Moderate Impact' | 'Monitoring';
  distanceToEyeKm?: number;
}

export const COASTAL_BAY_OF_BENGAL_LOCATIONS: CoastalLocation[] = [
  // Major Coastal Cities & Ports
  {
    id: 'kakinada',
    name: 'Kakinada City & Port',
    localName: 'కాకినాడ',
    type: 'city',
    lat: 16.9891,
    lng: 82.2475,
    population: '443,000',
    elevationMeters: 2.0,
    riskTier: 'Severe Surge Zone',
  },
  {
    id: 'visakhapatnam',
    name: 'Visakhapatnam (Vizag)',
    localName: 'విశాఖపట్నం',
    type: 'city',
    lat: 17.6868,
    lng: 83.2185,
    population: '2,350,000',
    elevationMeters: 5.0,
    riskTier: 'High Impact',
  },
  {
    id: 'machilipatnam',
    name: 'Machilipatnam (Bandar)',
    localName: 'మచిలీపట్నం',
    type: 'city',
    lat: 16.1875,
    lng: 81.1389,
    population: '170,000',
    elevationMeters: 1.5,
    riskTier: 'High Impact',
  },
  {
    id: 'gopalpur',
    name: 'Gopalpur-on-Sea & Port',
    localName: 'ଗୋପାଳପୁର',
    type: 'port',
    lat: 19.2600,
    lng: 84.9050,
    population: '38,000',
    elevationMeters: 4.0,
    riskTier: 'Moderate Impact',
  },
  {
    id: 'puri',
    name: 'Puri Coastal Heritage',
    localName: 'ପୁରୀ',
    type: 'city',
    lat: 19.8135,
    lng: 85.8312,
    population: '200,000',
    elevationMeters: 3.5,
    riskTier: 'Monitoring',
  },
  {
    id: 'paradip',
    name: 'Paradip Major Deep Port',
    localName: 'ପାରାଦୀପ',
    type: 'port',
    lat: 20.2644,
    lng: 86.6710,
    population: '68,000',
    elevationMeters: 3.0,
    riskTier: 'Monitoring',
  },
  {
    id: 'chennai-north',
    name: 'Chennai / Ennore Port Sector',
    localName: 'சென்னை',
    type: 'city',
    lat: 13.0827,
    lng: 80.2707,
    population: '10,900,000',
    elevationMeters: 6.0,
    riskTier: 'Monitoring',
  },

  // Coastal Towns & Delta Hubs (Godavari & Krishna Deltas)
  {
    id: 'yanam',
    name: 'Yanam (Gouthami Godavari)',
    localName: 'యానాం',
    type: 'town',
    lat: 16.7330,
    lng: 82.2170,
    population: '55,000',
    elevationMeters: 1.8,
    riskTier: 'Severe Surge Zone',
  },
  {
    id: 'amalapuram',
    name: 'Amalapuram (Konaseema Delta)',
    localName: 'అమలాపురం',
    type: 'town',
    lat: 16.5787,
    lng: 82.0061,
    population: '140,000',
    elevationMeters: 2.5,
    riskTier: 'Severe Surge Zone',
  },
  {
    id: 'narsapur',
    name: 'Narsapur (Vasista Estuary)',
    localName: 'నర్సాపురం',
    type: 'town',
    lat: 16.4350,
    lng: 81.7020,
    population: '58,000',
    elevationMeters: 1.2,
    riskTier: 'Severe Surge Zone',
  },
  {
    id: 'bhimavaram',
    name: 'Bhimavaram Delta Center',
    localName: 'భీమవరం',
    type: 'town',
    lat: 16.5449,
    lng: 81.5212,
    population: '142,000',
    elevationMeters: 3.0,
    riskTier: 'High Impact',
  },
  {
    id: 'tuni',
    name: 'Tuni Coastal Foothills',
    localName: 'తుని',
    type: 'town',
    lat: 17.3560,
    lng: 82.5510,
    population: '53,000',
    elevationMeters: 14.0,
    riskTier: 'High Impact',
  },
  {
    id: 'bapatla',
    name: 'Bapatla / Suryalanka Beach',
    localName: 'బాపట్ల',
    type: 'town',
    lat: 15.9042,
    lng: 80.4674,
    population: '71,000',
    elevationMeters: 2.0,
    riskTier: 'High Impact',
  },

  // Vulnerable Shoreline Fishing Villages & Sandspits
  {
    id: 'uppada',
    name: 'Uppada Fishery Village',
    localName: 'ఉప్పాడ గ్రామం',
    type: 'village',
    lat: 17.0850,
    lng: 82.3270,
    population: '12,500',
    elevationMeters: 0.8,
    riskTier: 'Severe Surge Zone',
  },
  {
    id: 'coringa',
    name: 'Coringa Mangrove Settlement',
    localName: 'కోరింగ గ్రామం',
    type: 'village',
    lat: 16.8920,
    lng: 82.2420,
    population: '8,400',
    elevationMeters: 0.5,
    riskTier: 'Severe Surge Zone',
  },
  {
    id: 'hope-island',
    name: 'Hope Island Barrier Spit',
    localName: 'హోప్ ఐలాండ్',
    type: 'island',
    lat: 16.9720,
    lng: 82.3380,
    population: '450',
    elevationMeters: 0.6,
    riskTier: 'Severe Surge Zone',
  },
  {
    id: 'vakalapudi',
    name: 'Vakalapudi Coastal Light',
    localName: 'వాకలపూడి',
    type: 'village',
    lat: 17.0180,
    lng: 82.2680,
    population: '6,200',
    elevationMeters: 1.5,
    riskTier: 'Severe Surge Zone',
  },
  {
    id: 'odarevu',
    name: 'Odarevu Fishermen Colony',
    localName: 'ఓడరేవు',
    type: 'village',
    lat: 15.8670,
    lng: 80.4420,
    population: '9,100',
    elevationMeters: 0.9,
    riskTier: 'High Impact',
  },
  {
    id: 'antardedi',
    name: 'Antarvedi Estuary Spit',
    localName: 'అంతర్వేది',
    type: 'village',
    lat: 16.3380,
    lng: 81.7290,
    population: '14,000',
    elevationMeters: 0.7,
    riskTier: 'Severe Surge Zone',
  },
];

// Helper to compute distance to storm eye
export function calculateDistanceKm(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371; // Earth radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c);
}
