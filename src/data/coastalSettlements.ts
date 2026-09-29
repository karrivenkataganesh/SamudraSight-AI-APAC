/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type SettlementType = 
  | 'City / Port' 
  | 'Major Coastal Metropolis'
  | 'Coastal Fishing Village' 
  | 'Barrier Island' 
  | 'Estuarine Delta Town' 
  | 'Coastal Energy Terminal'
  | 'Inland Relief Hub' 
  | 'Highland Safe Haven';

export type RiskLevel = 'CATASTROPHIC' | 'CRITICAL' | 'HIGH' | 'MODERATE' | 'LOW_SAFE';

export interface CoastalSettlement {
  id: string;
  name: string;
  localNameTelugu?: string;
  type: SettlementType;
  district: string;
  coordinates: {
    lat: number;
    lng: number;
  };
  elevationMeters: number;
  population: number;
  estimatedHouseholds: number;
  baseRisk: RiskLevel;
  primaryHazard: string;
  evacuationStatus: 'Mandatory Evacuation Enforced' | 'Evacuation in Progress' | 'Shelter in Place' | 'Active Safe Reception Hub';
  distanceToCoastKm: number;
  details: string;
}

export const COASTAL_SETTLEMENTS: CoastalSettlement[] = [
  // --- IMMEDIATE KAKINADA & GODAVARI DELTA CORRIDOR ---
  {
    id: 'kakinada-city',
    name: 'Kakinada',
    localNameTelugu: 'కాకినాడ',
    type: 'City / Port',
    district: 'Kakinada',
    coordinates: { lat: 16.9891, lng: 82.2475 },
    elevationMeters: 2.5,
    population: 443000,
    estimatedHouseholds: 105000,
    baseRisk: 'CRITICAL',
    primaryHazard: 'Deepwater Storm Surge + High-Density Urban Coastal Inundation',
    evacuationStatus: 'Evacuation in Progress',
    distanceToCoastKm: 0.5,
    details: 'District administrative headquarters and major deepwater port. Coastal wards face acute inundation from saltwater surge penetrating Kakinada Bay canals.',
  },
  {
    id: 'uppada-village',
    name: 'Uppada',
    localNameTelugu: 'ఉప్పాడ',
    type: 'Coastal Fishing Village',
    district: 'Kakinada',
    coordinates: { lat: 17.0850, lng: 82.3250 },
    elevationMeters: 1.2,
    population: 14200,
    estimatedHouseholds: 3400,
    baseRisk: 'CATASTROPHIC',
    primaryHazard: 'Severe Beach Geo-Erosion, Coastal Wall Breach & Direct Sea Overtopping',
    evacuationStatus: 'Mandatory Evacuation Enforced',
    distanceToCoastKm: 0.1,
    details: 'Zero-elevation coastal fishing community with high historic sea-erosion vulnerability. Coastal geotextile tube seawall breached by 5m+ breaking swell.',
  },
  {
    id: 'hope-island',
    name: 'Hope Island',
    localNameTelugu: 'హోప్ ఐలాండ్',
    type: 'Barrier Island',
    district: 'Kakinada',
    coordinates: { lat: 16.9650, lng: 82.3350 },
    elevationMeters: 0.8,
    population: 850,
    estimatedHouseholds: 180,
    baseRisk: 'CATASTROPHIC',
    primaryHazard: 'Complete Wave Washover & Extreme Oceanic Isolation',
    evacuationStatus: 'Mandatory Evacuation Enforced',
    distanceToCoastKm: 0.0,
    details: '16km natural sand spit barrier island sheltering Kakinada Bay. 100% of surface area submerged during storm surge exceeding +2.0m. Immediate marine evacuation mandatory.',
  },
  {
    id: 'suryaraopeta-village',
    name: 'Suryaraopeta',
    localNameTelugu: 'సూర్యారావుపేట',
    type: 'Coastal Fishing Village',
    district: 'Kakinada',
    coordinates: { lat: 17.0080, lng: 82.2780 },
    elevationMeters: 1.5,
    population: 11800,
    estimatedHouseholds: 2800,
    baseRisk: 'CATASTROPHIC',
    primaryHazard: 'Coastal Beachfront Inundation & Direct Wave Run-Up',
    evacuationStatus: 'Mandatory Evacuation Enforced',
    distanceToCoastKm: 0.2,
    details: 'Beachfront artisanal fishing village northeast of Kakinada port. Thatch dwellings face immediate wave runup.',
  },
  {
    id: 'vakalapudi-village',
    name: 'Vakalapudi',
    localNameTelugu: 'వాకలపూడి',
    type: 'Coastal Fishing Village',
    district: 'Kakinada',
    coordinates: { lat: 17.0340, lng: 82.2890 },
    elevationMeters: 2.0,
    population: 18500,
    estimatedHouseholds: 4400,
    baseRisk: 'CRITICAL',
    primaryHazard: 'Industrial Port Buffer Inundation & Saltwater Canal Infiltration',
    evacuationStatus: 'Mandatory Evacuation Enforced',
    distanceToCoastKm: 0.8,
    details: 'Adjoins Kakinada Anchorage Port and fertilizer manufacturing complex. Tidal surge threatens industrial chemical storage bunds.',
  },
  {
    id: 'sarpavaram-town',
    name: 'Sarpavaram',
    localNameTelugu: 'సర్పవరం',
    type: 'Inland Relief Hub',
    district: 'Kakinada',
    coordinates: { lat: 17.0120, lng: 82.2340 },
    elevationMeters: 5.8,
    population: 36000,
    estimatedHouseholds: 9100,
    baseRisk: 'MODERATE',
    primaryHazard: 'Localized Storm Drainage Choking & Peripheral High Winds',
    evacuationStatus: 'Shelter in Place',
    distanceToCoastKm: 4.5,
    details: 'Northern suburban growth corridor of Kakinada. Houses historical shrines and elevated schools serving as local emergency reception points.',
  },
  {
    id: 'coringa-village',
    name: 'Coringa',
    localNameTelugu: 'కోరింగ',
    type: 'Estuarine Delta Town',
    district: 'Kakinada',
    coordinates: { lat: 16.8200, lng: 82.2400 },
    elevationMeters: 1.8,
    population: 9800,
    estimatedHouseholds: 2300,
    baseRisk: 'CRITICAL',
    primaryHazard: 'Godavari Tidal Creek Surge & Mangrove Basin Inundation',
    evacuationStatus: 'Mandatory Evacuation Enforced',
    distanceToCoastKm: 1.2,
    details: 'Located at the mouth of Coringa mangrove estuary. Backflow from Gautami Godavari causes rapid submergence of low-lying mudflats and thatch dwellings.',
  },
  {
    id: 'tallarevu-village',
    name: 'Tallarevu',
    localNameTelugu: 'తాళ్లరేవు',
    type: 'Coastal Fishing Village',
    district: 'Kakinada',
    coordinates: { lat: 16.7800, lng: 82.2600 },
    elevationMeters: 2.1,
    population: 22500,
    estimatedHouseholds: 5600,
    baseRisk: 'HIGH',
    primaryHazard: 'Commercial Aquaculture Dike Breaches & Brackish Flood Contamination',
    evacuationStatus: 'Evacuation in Progress',
    distanceToCoastKm: 2.5,
    details: 'Major prawn and brackish aquaculture hub. Tidal floodwaters threaten to wash out 1,400 hectares of shrimp ponds and contaminate groundwater bores.',
  },
  {
    id: 'yanam-town',
    name: 'Yanam',
    localNameTelugu: 'యానాం',
    type: 'Estuarine Delta Town',
    district: 'Puducherry (UT)',
    coordinates: { lat: 16.7330, lng: 82.2170 },
    elevationMeters: 2.4,
    population: 55000,
    estimatedHouseholds: 13500,
    baseRisk: 'CRITICAL',
    primaryHazard: 'Gautami Godavari River Surge Crest Over Riverbank Promenade',
    evacuationStatus: 'Evacuation in Progress',
    distanceToCoastKm: 4.0,
    details: 'Puducherry enclave situated along the Godavari riverbanks. High astronomical tides combined with storm surge trigger major riverbank embankment overtopping.',
  },
  {
    id: 'bhairavapalem-village',
    name: 'Bhairavapalem',
    localNameTelugu: 'భైరవపాలెం',
    type: 'Coastal Fishing Village',
    district: 'Kakinada',
    coordinates: { lat: 16.7150, lng: 82.3150 },
    elevationMeters: 0.9,
    population: 4500,
    estimatedHouseholds: 1100,
    baseRisk: 'CATASTROPHIC',
    primaryHazard: 'Sea Cutoff, Loss of Road Causeway & Total Tidal Inundation',
    evacuationStatus: 'Mandatory Evacuation Enforced',
    distanceToCoastKm: 0.2,
    details: 'Isolated fishing spit at the southernmost mouth of the Godavari delta. Single causeway access flooded at +1.0m surge; accessible solely via Indian Coast Guard hovercraft.',
  },

  // --- KONASEEMA & SOUTHERN DELTA COASTAL SECTOR ---
  {
    id: 'odalarevu-terminal',
    name: 'Odalarevu',
    localNameTelugu: 'ఓడలరేవు',
    type: 'Coastal Energy Terminal',
    district: 'Dr. B.R. Ambedkar Konaseema',
    coordinates: { lat: 16.4890, lng: 81.9960 },
    elevationMeters: 1.8,
    population: 8600,
    estimatedHouseholds: 2100,
    baseRisk: 'CRITICAL',
    primaryHazard: 'Offshore Petroleum Landfall Flooding & Beachfront Surge Breach',
    evacuationStatus: 'Mandatory Evacuation Enforced',
    distanceToCoastKm: 0.4,
    details: 'Major gas processing terminal receiving offshore pipelines. Sea surges threaten critical sub-surface pipeline manifolds and valve stations.',
  },
  {
    id: 'antarvedi-village',
    name: 'Antarvedi',
    localNameTelugu: 'అంతర్వేది',
    type: 'Coastal Fishing Village',
    district: 'Dr. B.R. Ambedkar Konaseema',
    coordinates: { lat: 16.3380, lng: 81.7340 },
    elevationMeters: 1.4,
    population: 16200,
    estimatedHouseholds: 3900,
    baseRisk: 'CATASTROPHIC',
    primaryHazard: 'Vashishta Godavari River Confluence Surge & Direct Ocean Swell',
    evacuationStatus: 'Mandatory Evacuation Enforced',
    distanceToCoastKm: 0.3,
    details: 'Famed confluence point of Vashishta Godavari and Bay of Bengal. Tidal bore crests over temple embankments and sand spits.',
  },
  {
    id: 'mummidivaram-town',
    name: 'Mummidivaram',
    localNameTelugu: 'ముమ్మిడివరం',
    type: 'Estuarine Delta Town',
    district: 'Dr. B.R. Ambedkar Konaseema',
    coordinates: { lat: 16.6500, lng: 82.1150 },
    elevationMeters: 2.8,
    population: 34000,
    estimatedHouseholds: 8500,
    baseRisk: 'HIGH',
    primaryHazard: 'Paddy Dike Breaches & Brackish Flood Stagnation',
    evacuationStatus: 'Evacuation in Progress',
    distanceToCoastKm: 7.0,
    details: 'Intense agricultural and gas wellhead territory in Konaseema. Severe waterlogging blocks rural link roads.',
  },
  {
    id: 'amalapuram-city',
    name: 'Amalapuram',
    localNameTelugu: 'అమలాపురం',
    type: 'Estuarine Delta Town',
    district: 'Dr. B.R. Ambedkar Konaseema',
    coordinates: { lat: 16.5780, lng: 82.0060 },
    elevationMeters: 3.2,
    population: 53000,
    estimatedHouseholds: 13800,
    baseRisk: 'HIGH',
    primaryHazard: 'Konaseema Irrigation Canal Waterlogging & Heavy Monsoon Deluge',
    evacuationStatus: 'Evacuation in Progress',
    distanceToCoastKm: 12.0,
    details: 'Capital of Konaseema riverine delta. Dense network of irrigation canals overflows during sustained rainfall >300mm, cutting off rural interior village roads.',
  },
  {
    id: 'razole-town',
    name: 'Razole',
    localNameTelugu: 'రాజోలు',
    type: 'Estuarine Delta Town',
    district: 'Dr. B.R. Ambedkar Konaseema',
    coordinates: { lat: 16.4740, lng: 81.8340 },
    elevationMeters: 3.0,
    population: 41000,
    estimatedHouseholds: 10200,
    baseRisk: 'HIGH',
    primaryHazard: 'Riverine Island Isolation & Ferry Service Shutdown',
    evacuationStatus: 'Evacuation in Progress',
    distanceToCoastKm: 14.0,
    details: 'River island delta town bounded by Godavari distributaries. Ferry transit suspended when water discharge exceeds 800,000 cusecs.',
  },
  {
    id: 'kothapeta-town',
    name: 'Kothapeta',
    localNameTelugu: 'కొత్తపేట',
    type: 'Inland Relief Hub',
    district: 'Dr. B.R. Ambedkar Konaseema',
    coordinates: { lat: 16.7160, lng: 81.8980 },
    elevationMeters: 6.5,
    population: 32000,
    estimatedHouseholds: 7900,
    baseRisk: 'MODERATE',
    primaryHazard: 'Crop Submergence & Localized High Wind Tree Falls',
    evacuationStatus: 'Shelter in Place',
    distanceToCoastKm: 22.0,
    details: 'Central Konaseema junction town. Staging point for emergency mobile telecom vans and generator fuel tankers.',
  },

  // --- NORTHERN CORRIDOR TOWARDS VISAKHAPATNAM ---
  {
    id: 'gollaprolu-town',
    name: 'Gollaprolu',
    localNameTelugu: 'గొల్లప్రోలు',
    type: 'Inland Relief Hub',
    district: 'Kakinada',
    coordinates: { lat: 17.1520, lng: 82.2880 },
    elevationMeters: 8.2,
    population: 29000,
    estimatedHouseholds: 7200,
    baseRisk: 'MODERATE',
    primaryHazard: 'Peripheral High Wind Damage & NH-16 Culvert Drainage Stress',
    evacuationStatus: 'Active Safe Reception Hub',
    distanceToCoastKm: 7.2,
    details: 'Strategic railway and highway node north of Pithapuram. Outside direct surge line; houses cyclone transit staging camp.',
  },
  {
    id: 'annavaram-temple-town',
    name: 'Annavaram',
    localNameTelugu: 'అన్నవరం',
    type: 'Highland Safe Haven',
    district: 'Kakinada',
    coordinates: { lat: 17.2830, lng: 82.4040 },
    elevationMeters: 68.0,
    population: 21000,
    estimatedHouseholds: 5100,
    baseRisk: 'LOW_SAFE',
    primaryHazard: 'Zero Surge Threat (Elevated Ratnagiri Hill Complex)',
    evacuationStatus: 'Active Safe Reception Hub',
    distanceToCoastKm: 14.0,
    details: 'Ratnagiri hill range rising 68m above MSL. Temple trust choultries provide emergency shelter, dining halls, and water storage for 25,000+ evacuees.',
  },
  {
    id: 'tuni-city',
    name: 'Tuni',
    localNameTelugu: 'తుని',
    type: 'Inland Relief Hub',
    district: 'Kakinada',
    coordinates: { lat: 17.3560, lng: 82.5510 },
    elevationMeters: 16.0,
    population: 62000,
    estimatedHouseholds: 15500,
    baseRisk: 'LOW_SAFE',
    primaryHazard: 'Gale Wind Buffering on Railway Tracks & Power Distribution',
    evacuationStatus: 'Active Safe Reception Hub',
    distanceToCoastKm: 16.5,
    details: 'Border city linking East Godavari with Visakhapatnam district. Primary medical staging facility on elevated terrain.',
  },
  {
    id: 'visakhapatnam-metropolis',
    name: 'Visakhapatnam (Vizag)',
    localNameTelugu: 'విశాఖపట్నం',
    type: 'Major Coastal Metropolis',
    district: 'Visakhapatnam',
    coordinates: { lat: 17.6868, lng: 83.2185 },
    elevationMeters: 4.5,
    population: 2350000,
    estimatedHouseholds: 580000,
    baseRisk: 'MODERATE',
    primaryHazard: 'Port Harbor Tidal Swell, Naval Base Wind Turbulence & Beach Road Overtopping',
    evacuationStatus: 'Shelter in Place',
    distanceToCoastKm: 0.8,
    details: 'Major industrial megacity, Eastern Naval Command headquarters, and India’s premier deepwater natural port. Monitored for peripheral gale bands and outer harbor container stack stability.',
  },

  // --- INLAND SAFE HAVENS & RELIEF HUBS ---
  {
    id: 'samalkot-hub',
    name: 'Samalkot',
    localNameTelugu: 'సామర్లకోట',
    type: 'Inland Relief Hub',
    district: 'Kakinada',
    coordinates: { lat: 17.0500, lng: 82.1670 },
    elevationMeters: 12.0,
    population: 56000,
    estimatedHouseholds: 14000,
    baseRisk: 'LOW_SAFE',
    primaryHazard: 'Minor Urban Waterlogging (Elevated Safe Relief Hub)',
    evacuationStatus: 'Active Safe Reception Hub',
    distanceToCoastKm: 15.0,
    details: 'Major railway junction on Chennai-Howrah main line on elevated firm ground. Primary staging logistics hub for NDRF, relief dry rations, and mobile medical camps.',
  },
  {
    id: 'peddapuram-safe-haven',
    name: 'Peddapuram',
    localNameTelugu: 'పెద్దాపురం',
    type: 'Highland Safe Haven',
    district: 'Kakinada',
    coordinates: { lat: 17.0780, lng: 82.1380 },
    elevationMeters: 35.0,
    population: 49000,
    estimatedHouseholds: 12200,
    baseRisk: 'LOW_SAFE',
    primaryHazard: 'Zero Surge Threat (Elevated Red Earth Plateau)',
    evacuationStatus: 'Active Safe Reception Hub',
    distanceToCoastKm: 21.0,
    details: 'Elevated laterite plateau 35m above sea level with zero storm surge vulnerability. Houses 4 major cyclone sanctuary complexes receiving 18,000+ coastal evacuees.',
  },
  {
    id: 'pithapuram-town',
    name: 'Pithapuram',
    localNameTelugu: 'పిఠాపురం',
    type: 'Inland Relief Hub',
    district: 'Kakinada',
    coordinates: { lat: 17.1167, lng: 82.2667 },
    elevationMeters: 10.0,
    population: 52000,
    estimatedHouseholds: 13000,
    baseRisk: 'MODERATE',
    primaryHazard: 'Peripheral High Wind Damage & Localized Flash Drainage Strain',
    evacuationStatus: 'Active Safe Reception Hub',
    distanceToCoastKm: 8.5,
    details: 'Elevated railway market town north of Kakinada. Serves as secondary medical triage center for Uppada evacuees.',
  },
  {
    id: 'draksharamam-town',
    name: 'Draksharamam',
    localNameTelugu: 'ద్రాక్షారామం',
    type: 'Inland Relief Hub',
    district: 'Dr. B.R. Ambedkar Konaseema',
    coordinates: { lat: 16.7930, lng: 82.0620 },
    elevationMeters: 8.5,
    population: 28000,
    estimatedHouseholds: 7100,
    baseRisk: 'MODERATE',
    primaryHazard: 'Gale Wind Structural Damage & Tree Falls on NH-216 Bypass',
    evacuationStatus: 'Shelter in Place',
    distanceToCoastKm: 18.0,
    details: 'Historic inland municipal center. Outside coastal surge boundary; secondary shelters established in temple choultries and reinforced community halls.',
  },
  {
    id: 'rajahmundry-city',
    name: 'Rajahmundry (Rajamahendravaram)',
    localNameTelugu: 'రాజమహేంద్రవరం',
    type: 'City / Port',
    district: 'East Godavari',
    coordinates: { lat: 17.0005, lng: 81.8040 },
    elevationMeters: 18.0,
    population: 478000,
    estimatedHouseholds: 115000,
    baseRisk: 'LOW_SAFE',
    primaryHazard: 'Godavari River Flood Crest Downstream of Dowleswaram Barrage',
    evacuationStatus: 'Active Safe Reception Hub',
    distanceToCoastKm: 46.0,
    details: 'Major historic inland metropolis and regional medical center on the Godavari River. Safe from marine storm surges; coordinates upstream flood discharge at Dowleswaram Barrage.',
  },
  {
    id: 'machilipatnam-city',
    name: 'Machilipatnam',
    localNameTelugu: 'మచిలీపట్నం',
    type: 'City / Port',
    district: 'Krishna',
    coordinates: { lat: 16.1875, lng: 81.1389 },
    elevationMeters: 2.2,
    population: 170000,
    estimatedHouseholds: 42000,
    baseRisk: 'HIGH',
    primaryHazard: 'Krishna Delta Inundation & Historic Cyclonic Surge Washover',
    evacuationStatus: 'Evacuation in Progress',
    distanceToCoastKm: 1.5,
    details: 'Historic port town in Krishna River delta with high vulnerability to cyclonic storm surges. Manginapudi beach seawall reinforced with sandbags.',
  },
];

/**
 * Dynamically compute risk severity for each settlement based on current storm surge and storm center
 */
export function calculateSettlementRisk(
  settlement: CoastalSettlement,
  stormCenter: { lat: number; lng: number },
  stormSurgeMeters = 3.9,
  windSpeedKmh = 195
): {
  level: RiskLevel;
  badgeLabel: string;
  badgeBg: string;
  badgeBorder: string;
  badgeText: string;
  inundationPotentialMeters: number;
  distanceToEyeKm: number;
  actionGuidance: string;
} {
  // Approximate haversine distance in km
  const dLat = (stormCenter.lat - settlement.coordinates.lat) * 111.2;
  const dLng =
    (stormCenter.lng - settlement.coordinates.lng) *
    111.2 *
    Math.cos((settlement.coordinates.lat * Math.PI) / 180);
  const distanceToEyeKm = Math.round(Math.sqrt(dLat * dLat + dLng * dLng));

  // Inundation potential: storm surge minus ground elevation adjusted for distance to coast
  const surgeAttenuation = Math.max(0, 1 - settlement.distanceToCoastKm / 14);
  const effectiveSurge = stormSurgeMeters * surgeAttenuation;
  const inundationPotentialMeters = Math.max(
    0,
    Math.round((effectiveSurge - settlement.elevationMeters * 0.4) * 10) / 10
  );

  let level: RiskLevel = settlement.baseRisk;

  // Escalate or de-escalate risk based on live storm metrics and eye proximity
  if (settlement.elevationMeters <= 2.0 && (inundationPotentialMeters > 1.2 || distanceToEyeKm < 90)) {
    level = 'CATASTROPHIC';
  } else if (settlement.elevationMeters <= 3.5 && (inundationPotentialMeters > 0.4 || distanceToEyeKm < 140)) {
    level = 'CRITICAL';
  } else if (settlement.elevationMeters <= 7.0 && distanceToEyeKm < 190) {
    level = 'HIGH';
  } else if (settlement.elevationMeters < 16.0 && distanceToEyeKm < 260) {
    level = 'MODERATE';
  } else {
    level = 'LOW_SAFE';
  }

  // Color schemes and guidance
  switch (level) {
    case 'CATASTROPHIC':
      return {
        level,
        badgeLabel: 'CATASTROPHIC SURGE RISK',
        badgeBg: 'bg-red-950/90',
        badgeBorder: 'border-red-500',
        badgeText: 'text-red-300',
        inundationPotentialMeters,
        distanceToEyeKm,
        actionGuidance: 'Immediate mandatory evacuation to highland safe havens (Peddapuram / Samalkot / Annavaram). Ground-level structures face complete inundation.',
      };
    case 'CRITICAL':
      return {
        level,
        badgeLabel: 'CRITICAL FLOOD RISK',
        badgeBg: 'bg-rose-950/90',
        badgeBorder: 'border-rose-500',
        badgeText: 'text-rose-300',
        inundationPotentialMeters,
        distanceToEyeKm,
        actionGuidance: 'Vertical evacuation to concrete multi-story cyclone sanctuaries. Electrical power grid isolated to prevent electrocution hazards.',
      };
    case 'HIGH':
      return {
        level,
        badgeLabel: 'HIGH THREAT ZONE',
        badgeBg: 'bg-amber-950/90',
        badgeBorder: 'border-amber-500',
        badgeText: 'text-amber-300',
        inundationPotentialMeters,
        distanceToEyeKm,
        actionGuidance: 'Secure roof structures against 180+ km/h gusts; clear municipal drainage culverts; stage emergency potable water bladders.',
      };
    case 'MODERATE':
      return {
        level,
        badgeLabel: 'MODERATE RISK ZONE',
        badgeBg: 'bg-yellow-950/80',
        badgeBorder: 'border-yellow-600',
        badgeText: 'text-yellow-300',
        inundationPotentialMeters,
        distanceToEyeKm,
        actionGuidance: 'Remain indoors away from glass facades; disconnect non-essential appliances; monitor civil defense frequency FM 102.8.',
      };
    case 'LOW_SAFE':
    default:
      return {
        level: 'LOW_SAFE',
        badgeLabel: 'SAFE ELEVATED RECEPTION HUB',
        badgeBg: 'bg-emerald-950/90',
        badgeBorder: 'border-emerald-500',
        badgeText: 'text-emerald-300',
        inundationPotentialMeters: 0,
        distanceToEyeKm,
        actionGuidance: 'Active safe reception shelter open 24/7. Hot meals, clean water, medical triage, and emergency communication links operational.',
      };
  }
}
