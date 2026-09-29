/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type TimeStepId = 'T-72' | 'T-48' | 'T-24' | 'T-12' | 'T-6' | 'T-0';

export interface TimeStepData {
  id: TimeStepId;
  hoursToLandfall: number;
  label: string;
  timestampUTC: string;
  stormCategory: string;
  windSpeedKmh: number;
  gustSpeedKmh: number;
  centralPressureHpa: number;
  stormSurgeMeters: number;
  rainfall24hMm: number;
  coastalInundationSqKm: number;
  populationAtRisk: number;
  evacuationCompliancePct: number;
  parametricThresholdBreached: boolean;
  alertLevel: 'ADVISORY' | 'WARNING' | 'CRITICAL' | 'EXTREME' | 'LANDFALL';
}

export type AssetStatus = 'Safe' | 'Warning' | 'Critical' | 'Blocked';
export type AssetType = 'power' | 'hospital' | 'route' | 'shelter' | 'port' | 'water';

export interface CriticalAsset {
  id: string;
  name: string;
  type: AssetType;
  status: AssetStatus;
  location: [number, number]; // [lat, lng]
  elevationMeters: number;
  floodThresholdMeters: number;
  currentInundationMeters: number;
  capacityOrLoad: string;
  backupPowerStatus: '100% Operational' | '75% Capacity' | 'At Risk - Level -1' | 'Solar Microgrid Active' | 'Disabled';
  personnelCount: number;
  description: string;
  mitigationChecklist: { task: string; completed: boolean; urgent: boolean }[];
  contactAgency: string;
  opticalSatelliteUrl: string;
  liveSensorData: {
    label: string;
    value: string;
    status: 'normal' | 'warn' | 'alert';
  }[];
}

export interface EvacuationRoute {
  id: string;
  name: string;
  status: 'Open' | 'Congested' | 'Blocked';
  coordinates: [number, number][];
  inundationLevelMeters: number;
  alternativeRouteName?: string;
  transitCapacityVehiclesPerHour: number;
}

export interface FloodPolygonFeature {
  type: 'Feature';
  properties: {
    timeStep: TimeStepId;
    surgeHeightM: number;
    hazardLevel: 'Low' | 'Moderate' | 'Severe' | 'Extreme';
    inundationDepthM: number;
    color: string;
    fillColor: string;
    fillOpacity: number;
  };
  geometry: {
    type: 'Polygon';
    coordinates: number[][][]; // GeoJSON format: [ [lng, lat], ... ]
  };
}

export interface GeminiMultimodalAssessment {
  vulnerabilityScore: number; // 0 - 100
  threatLevel: 'MODERATE' | 'ELEVATED' | 'HIGH' | 'CRITICAL' | 'CATASTROPHIC';
  naturalLanguageExplanation: string;
  preLandfallActionItems: {
    id: string;
    action: string;
    deadlineHours: number;
    priority: 'IMMEDIATE' | 'HIGH' | 'MEDIUM';
    assignedAgency: string;
    targetAssetId?: string;
  }[];
  projectedCasualtiesAtRisk: number;
  estimatedEconomicLossMillionUsd: number;
  sarAnalysis: {
    sensor: string;
    waterExpansionIndex: string;
    dielectricAnomalyDetected: boolean;
    keyObservation: string;
  };
  modelUsed: string;
  executionLatencyMs: number;
  timestamp: string;
}

export interface EmergencyAdvisory {
  id: string;
  timeStep: TimeStepId;
  languages: {
    en: {
      title: string;
      smsBody: string;
      whatsappCard: string;
      sirenBroadcastScript: string;
    };
    te: {
      title: string;
      smsBody: string;
      whatsappCard: string;
      sirenBroadcastScript: string;
    };
    or: {
      title: string;
      smsBody: string;
      whatsappCard: string;
      sirenBroadcastScript: string;
    };
  };
  issuedAt: string;
  authority: string;
}

export interface ParametricPayoutBatch {
  batchId: string;
  triggerEvent: string;
  windSpeedRecordedKmh: number;
  windThresholdKmh: number;
  buoyStationId: string;
  totalRecipients: number;
  amountPerRecipientInr: number;
  totalLiquidityDisbursedInr: number;
  totalLiquidityDisbursedUsd: number;
  disbursedAt: string;
  status: 'PENDING_ORACLE' | 'TRIGGERED' | 'DISBURSING' | 'COMPLETED';
  wards: {
    wardName: string;
    recipientCount: number;
    amountInr: number;
    pctCompleted: number;
  }[];
  transactionHashes: {
    txHash: string;
    beneficiaryGroup: string;
    recipientCount: number;
    amountInr: number;
    status: 'Settled' | 'Processing';
  }[];
}
