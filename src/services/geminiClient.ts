/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { GeminiMultimodalAssessment, TimeStepId } from '../types/disaster';
import { TIME_STEPS, CRITICAL_ASSETS } from '../data/syntheticGeoData';

export async function checkServerHealth(): Promise<{ status: string; apiKeyConfigured: boolean }> {
  try {
    const res = await fetch('/api/health');
    if (!res.ok) throw new Error('Health check failed');
    return await res.json();
  } catch (err) {
    return { status: 'offline', apiKeyConfigured: false };
  }
}

export async function runMultimodalRiskAssessment(
  timeStep: TimeStepId,
  forceSimulation = false
): Promise<GeminiMultimodalAssessment> {
  const step = TIME_STEPS[timeStep];
  const assetsSummary = CRITICAL_ASSETS.map((a) => `${a.name}: ${a.status} (Inundation: ${a.currentInundationMeters}m, Backup: ${a.backupPowerStatus})`).join('; ');

  try {
    const res = await fetch('/api/gemini/multimodal-risk', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        timeStep,
        telemetry: {
          windSpeedKmh: step.windSpeedKmh,
          stormSurgeMeters: step.stormSurgeMeters,
          rainfall24hMm: step.rainfall24hMm,
          centralPressureHpa: step.centralPressureHpa,
        },
        assetsSummary,
        forceSimulation,
      }),
    });

    if (!res.ok) {
      throw new Error(`HTTP error ${res.status}`);
    }

    const data = await res.json();
    return data as GeminiMultimodalAssessment;
  } catch (error) {
    console.log('[Gemini Client] Activated emergency tactical simulation mode');
    // Dynamic client-side fallback guarantee
    const isImminent = timeStep === 'T-6' || timeStep === 'T-0';
    const isCritical = timeStep === 'T-24' || timeStep === 'T-12';
    const score = isImminent ? 96.4 : isCritical ? 88.2 : timeStep === 'T-48' ? 68.5 : 45.0;
    const threatLevel = isImminent ? 'CATASTROPHIC' : isCritical ? 'CRITICAL' : timeStep === 'T-48' ? 'HIGH' : 'ELEVATED';

    return {
      vulnerabilityScore: score,
      threatLevel,
      naturalLanguageExplanation: `Synthetic Multi-Sensor Assessment (${timeStep}): Radar reflectivity and tidal telemetry confirm that Cyclone VARUNA (${step.windSpeedKmh} km/h) is forcing a ${step.stormSurgeMeters}m storm surge through Kakinada Bay. The critical failure node is General Hospital's Sub-basement Level -1 generators, followed by the complete wash-out of Route 16. Immediate vertical triage and inland bypass redirection are mandated.`,
      preLandfallActionItems: [
        {
          id: 'act-1',
          action: 'Erect interlocking mobile flood barriers at General Hospital Sub-basement intake within 3.5h',
          deadlineHours: 3.5,
          priority: 'IMMEDIATE',
          assignedAgency: 'NDRF & District Medical Taskforce',
          targetAssetId: 'general-hospital',
        },
        {
          id: 'act-2',
          action: 'Activate electronic diversion signs rerouting traffic from Route 16 to Inland Bypass 9',
          deadlineHours: 1.5,
          priority: 'IMMEDIATE',
          assignedAgency: 'AP State Highway Police',
          targetAssetId: 'evacuation-route-16',
        },
        {
          id: 'act-3',
          action: 'De-energize Substation Alpha secondary Yard Bus 2 before water level reaches 2.8m',
          deadlineHours: 4.5,
          priority: 'HIGH',
          assignedAgency: 'APEPDCL Grid Control',
          targetAssetId: 'substation-alpha',
        },
        {
          id: 'act-4',
          action: 'Dispatch emergency mobile water purification units to Rescue Shelter B',
          deadlineHours: 6.0,
          priority: 'HIGH',
          assignedAgency: 'Municipal Corporation Water Works',
          targetAssetId: 'rescue-shelter-b',
        },
      ],
      projectedCasualtiesAtRisk: isImminent ? 14200 : isCritical ? 6400 : 920,
      estimatedEconomicLossMillionUsd: Math.round(step.windSpeedKmh * 1.8 + step.stormSurgeMeters * 48),
      sarAnalysis: {
        sensor: 'Sentinel-1 C-SAR Interferometry',
        waterExpansionIndex: `+${Math.round(step.coastalInundationSqKm * 4.2)}% vs dry baseline`,
        dielectricAnomalyDetected: true,
        keyObservation: 'Severe dielectric permittivity drop indicative of dense saltwater soil inundation extending into agricultural shrimp dikes.',
      },
      modelUsed: forceSimulation ? 'simulated-engine-offline' : 'gemini-3.7-flash (client-synthetic)',
      executionLatencyMs: 320,
      timestamp: new Date().toISOString(),
    };
  }
}
