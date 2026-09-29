/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useState } from 'react';
import confetti from 'canvas-confetti';
import { 
  X, 
  CheckCircle2, 
  AlertTriangle, 
  ShieldCheck, 
  ArrowRight, 
  Coins, 
  Users, 
  Building2, 
  ExternalLink,
  Download,
  Share2,
  RefreshCw,
  Hash
} from 'lucide-react';
import { ParametricPayoutBatch } from '../../types/disaster';
import { INITIAL_PARAMETRIC_PAYOUT } from '../../data/syntheticGeoData';

interface ParametricModalProps {
  isOpen: boolean;
  onClose: () => void;
  windSpeedKmh: number;
}

export const ParametricModal: React.FC<ParametricModalProps> = ({
  isOpen,
  onClose,
  windSpeedKmh,
}) => {
  const [batchData, setBatchData] = useState<ParametricPayoutBatch>(INITIAL_PARAMETRIC_PAYOUT);
  const [isProcessing, setIsProcessing] = useState(false);
  const [downloadSuccess, setDownloadSuccess] = useState(false);

  useEffect(() => {
    if (isOpen) {
      // Fire celebration confetti when modal opens
      try {
        confetti({
          particleCount: 65,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#06b6d4', '#10b981', '#f59e0b', '#3b82f6'],
        });
      } catch (e) {
        // Safe fallback
      }
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSimulateNewDisbursement = () => {
    setIsProcessing(true);
    setTimeout(() => {
      setIsProcessing(false);
      try {
        confetti({
          particleCount: 80,
          spread: 80,
          origin: { y: 0.5 },
          colors: ['#10b981', '#06b6d4', '#f59e0b'],
        });
      } catch (e) {}
    }, 800);
  };

  const handleDownloadAudit = () => {
    setDownloadSuccess(true);
    setTimeout(() => setDownloadSuccess(false), 3000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-3xl rounded-2xl bg-slate-900 border border-slate-700/80 shadow-2xl p-6 text-slate-100 font-mono-tactical my-8 animate-in fade-in zoom-in-95 duration-200">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header Banner */}
        <div className="flex items-start gap-4 mb-6">
          <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 shadow-[0_0_20px_rgba(16,185,129,0.2)]">
            <Coins className="w-8 h-8" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                ORACLE TRIGGER VERIFIED
              </span>
              <span className="text-xs text-slate-400 font-normal">
                Batch: <strong className="text-slate-200">{batchData.batchId}</strong>
              </span>
            </div>
            <h2 className="text-xl font-bold font-display text-white mt-1">
              Bay of Bengal Parametric Disaster Resilience Facility (BODRF)
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Anticipatory pre-landfall cash liquidity disbursed to 12,000 verified vulnerable coastal households.
            </p>
          </div>
        </div>

        {/* Oracle Verification Card */}
        <div className="p-4 rounded-xl bg-slate-950/70 border border-emerald-500/30 mb-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-emerald-500/20 flex items-center justify-center text-emerald-400 shrink-0">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs text-slate-400">Trigger Threshold Met:</div>
              <div className="text-sm font-bold text-slate-100 flex items-center gap-2">
                <span>Offshore Anemometer &gt; 180 km/h</span>
                <span className="text-emerald-400">({windSpeedKmh} km/h recorded)</span>
              </div>
              <div className="text-[10px] text-slate-500 mt-0.5">
                Oracle Source: {batchData.buoyStationId} + IMD Doppler Radar
              </div>
            </div>
          </div>

          <div className="text-right sm:border-l sm:border-slate-800 sm:pl-4">
            <div className="text-xs text-slate-400">Total Pre-Landfall Liquidity</div>
            <div className="text-xl font-bold text-emerald-400">
              ₹4.20 Crore <span className="text-xs text-slate-400 font-normal">(~$504,000 USD)</span>
            </div>
            <div className="text-[10px] text-cyan-400">Zero Paperwork • Direct Benefit Transfer</div>
          </div>
        </div>

        {/* Key Operational Metrics Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
          <div className="p-3 rounded-lg bg-slate-800/60 border border-slate-700/60">
            <div className="text-[10px] text-slate-400 uppercase">Recipients</div>
            <div className="text-lg font-bold text-cyan-300">12,000</div>
            <div className="text-[10px] text-slate-500">Fisherfolk & Dwellers</div>
          </div>

          <div className="p-3 rounded-lg bg-slate-800/60 border border-slate-700/60">
            <div className="text-[10px] text-slate-400 uppercase">Payout / Household</div>
            <div className="text-lg font-bold text-emerald-300">₹3,500</div>
            <div className="text-[10px] text-slate-500">~$42 USD / Household</div>
          </div>

          <div className="p-3 rounded-lg bg-slate-800/60 border border-slate-700/60">
            <div className="text-[10px] text-slate-400 uppercase">Execution Window</div>
            <div className="text-lg font-bold text-amber-300">4.2 min</div>
            <div className="text-[10px] text-slate-500">Disbursed at T-24h</div>
          </div>

          <div className="p-3 rounded-lg bg-slate-800/60 border border-slate-700/60">
            <div className="text-[10px] text-slate-400 uppercase">Settlement Rate</div>
            <div className="text-lg font-bold text-emerald-400">100%</div>
            <div className="text-[10px] text-slate-500">Instant UPI & DBT</div>
          </div>
        </div>

        {/* Coastal Ward Disbursement Distribution */}
        <div className="mb-6">
          <div className="text-xs font-bold text-slate-300 mb-2 uppercase tracking-wider flex items-center justify-between">
            <span>Ward-Level Disbursement Coverage</span>
            <span className="text-[11px] text-emerald-400 font-normal">All 4 Wards Settled</span>
          </div>

          <div className="space-y-2.5">
            {batchData.wards.map((ward) => (
              <div key={ward.wardName} className="p-2.5 rounded-lg bg-slate-950/60 border border-slate-800">
                <div className="flex justify-between items-center text-xs mb-1">
                  <span className="font-semibold text-slate-200">{ward.wardName}</span>
                  <span className="text-emerald-400 font-bold">
                    ₹{(ward.amountInr / 100000).toFixed(2)} Lakh ({ward.recipientCount.toLocaleString()} families)
                  </span>
                </div>
                <div className="w-full h-1.5 rounded-full bg-slate-800 overflow-hidden">
                  <div className="h-full bg-emerald-500 rounded-full transition-all" style={{ width: `${ward.pctCompleted}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Real-time Ledger Batch Hashes */}
        <div className="mb-6">
          <div className="text-xs font-bold text-slate-300 mb-2 uppercase tracking-wider flex items-center gap-1.5">
            <Hash className="w-3.5 h-3.5 text-cyan-400" />
            <span>Cryptographic Proof & Payment Rails Ledger</span>
          </div>

          <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 text-[11px] space-y-2 overflow-x-auto">
            {batchData.transactionHashes.map((tx) => (
              <div key={tx.txHash} className="flex items-center justify-between gap-4 font-mono text-slate-400 hover:text-slate-200">
                <div className="flex items-center gap-2 truncate">
                  <span className="text-emerald-400">✓</span>
                  <span className="text-slate-300 font-semibold">{tx.beneficiaryGroup}:</span>
                  <span className="text-cyan-400 truncate max-w-[200px]">{tx.txHash}</span>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  <span className="text-slate-300 font-bold">₹{(tx.amountInr / 100000).toFixed(2)}L</span>
                  <span className="px-1.5 py-0.5 rounded text-[9px] bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                    {tx.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Purpose / Why Anticipatory Matters Callout */}
        <div className="p-3 rounded-lg bg-cyan-950/30 border border-cyan-500/30 text-xs text-cyan-200 mb-6 flex items-start gap-2.5">
          <AlertTriangle className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
          <div>
            <strong>Anticipatory Impact Rationale:</strong> Traditional disaster relief takes 14-45 days post-cyclone. BODRF provides unconditional pre-landfall cash at T-24h, empowering vulnerable households to fund evacuation autorickshaw fares, secure boat moorings, purchase infant dry milk, and protect personal assets before eye landfall.
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-4 border-t border-slate-800">
          <div className="text-[11px] text-slate-500">
            Backed by Asian Development Bank & Global Shield Against Climate Risks
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              onClick={handleSimulateNewDisbursement}
              disabled={isProcessing}
              className="flex-1 sm:flex-none px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs flex items-center justify-center gap-1.5 transition-colors border border-slate-700"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isProcessing ? 'animate-spin' : ''}`} />
              <span>{isProcessing ? 'Re-verifying...' : 'Re-test Trigger'}</span>
            </button>

            <button
              onClick={handleDownloadAudit}
              className="flex-1 sm:flex-none px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-bold text-xs flex items-center justify-center gap-1.5 transition-colors shadow-[0_0_15px_rgba(16,185,129,0.3)]"
            >
              <Download className="w-3.5 h-3.5" />
              <span>{downloadSuccess ? 'Audit Trail Exported!' : 'Export Audit Report'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
