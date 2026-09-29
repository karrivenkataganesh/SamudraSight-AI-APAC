/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  X, 
  Shield, 
  Lock, 
  Server, 
  KeyRound, 
  Database, 
  CheckCircle2, 
  AlertTriangle,
  FileCheck,
  Terminal,
  ExternalLink
} from 'lucide-react';

interface ThreatModelModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ThreatModelModal: React.FC<ThreatModelModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [activeTab, setActiveTab] = useState<'threats' | 'owasp' | 'walkthroughs'>('threats');

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-4xl rounded-2xl bg-slate-900 border border-slate-700/80 shadow-2xl p-6 text-slate-100 font-mono-tactical my-8 animate-in fade-in zoom-in-95 duration-200">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Title */}
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2.5 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400">
            <Shield className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-cyan-500/20 text-cyan-300 border border-cyan-500/40">
                PRODUCTION DIRECTIVE 1 & 2
              </span>
              <span className="text-xs text-slate-400">Enterprise Security Standard</span>
            </div>
            <h2 className="text-lg font-bold font-display text-white mt-0.5">
              Agentic Threat Model & Verification Matrix
            </h2>
          </div>
        </div>

        {/* Sub-Tabs */}
        <div className="flex items-center gap-2 mb-5 p-1 rounded-xl bg-slate-950 border border-slate-800 text-xs">
          <button
            onClick={() => setActiveTab('threats')}
            className={`flex-1 py-1.5 px-3 rounded-lg font-bold transition-all flex items-center justify-center gap-2 ${
              activeTab === 'threats'
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Shield className="w-3.5 h-3.5" />
            <span>The 5 Threat Zones</span>
          </button>

          <button
            onClick={() => setActiveTab('owasp')}
            className={`flex-1 py-1.5 px-3 rounded-lg font-bold transition-all flex items-center justify-center gap-2 ${
              activeTab === 'owasp'
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Lock className="w-3.5 h-3.5" />
            <span>OWASP Standards & Hygiene</span>
          </button>

          <button
            onClick={() => setActiveTab('walkthroughs')}
            className={`flex-1 py-1.5 px-3 rounded-lg font-bold transition-all flex items-center justify-center gap-2 ${
              activeTab === 'walkthroughs'
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <FileCheck className="w-3.5 h-3.5" />
            <span>Functional Stability Walkthroughs</span>
          </button>
        </div>

        {/* Tab 1: The 5 Threat Zones Summary Table */}
        {activeTab === 'threats' && (
          <div className="space-y-4 text-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse border border-slate-800 rounded-lg">
                <thead>
                  <tr className="bg-slate-950 text-slate-300 border-b border-slate-800 font-bold uppercase text-[10px]">
                    <th className="p-3 border-r border-slate-800 w-1/5">Threat Zone</th>
                    <th className="p-3 border-r border-slate-800 w-2/5">Identified Risk Scenario</th>
                    <th className="p-3 w-2/5">Architectural Countermeasure Implemented</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/80 text-slate-300">
                  <tr className="hover:bg-slate-800/30">
                    <td className="p-3 border-r border-slate-800 font-bold text-cyan-400 flex items-center gap-1.5">
                      <span>1. Input Surfaces</span>
                    </td>
                    <td className="p-3 border-r border-slate-800">
                      Untrusted user telemetry overrides, prompt injections in municipal advisory triggers, malformed JSON coordinates.
                    </td>
                    <td className="p-3 text-emerald-400">
                      Strict Zod-like runtime schema sanitization, bounded numerical validation, null-safe payload ingestion prior to model execution.
                    </td>
                  </tr>

                  <tr className="hover:bg-slate-800/30">
                    <td className="p-3 border-r border-slate-800 font-bold text-amber-400 flex items-center gap-1.5">
                      <span>2. Planning & Reasoning</span>
                    </td>
                    <td className="p-3 border-r border-slate-800">
                      System instruction bypass attempting to fabricate false advisory sirens or sabotage evacuation routing priorities.
                    </td>
                    <td className="p-3 text-emerald-400">
                      Server-side immutable system instruction boundary, hardcoded emergency schema output enforcement via Gemini Type.OBJECT.
                    </td>
                  </tr>

                  <tr className="hover:bg-slate-800/30">
                    <td className="p-3 border-r border-slate-800 font-bold text-red-400 flex items-center gap-1.5">
                      <span>3. Tool Execution</span>
                    </td>
                    <td className="p-3 border-r border-slate-800">
                      Privilege escalation, dynamic command execution, SSRF via unauthorized external map tile or weather feeds.
                    </td>
                    <td className="p-3 text-emerald-400">
                      Zero dynamic code evaluation; pre-compiled synthetic GeoJSON datasets; sandboxed domain allowlist for basemaps.
                    </td>
                  </tr>

                  <tr className="hover:bg-slate-800/30">
                    <td className="p-3 border-r border-slate-800 font-bold text-purple-400 flex items-center gap-1.5">
                      <span>4. Memory & State</span>
                    </td>
                    <td className="p-3 border-r border-slate-800">
                      Session hijacking, cross-agency state leakage, unverified modification of emergency checklist or trigger status.
                    </td>
                    <td className="p-3 text-emerald-400">
                      Strict client-side isolation, owner-bound state verification pattern, zero unverified state mutations.
                    </td>
                  </tr>

                  <tr className="hover:bg-slate-800/30">
                    <td className="p-3 border-r border-slate-800 font-bold text-blue-400 flex items-center gap-1.5">
                      <span>5. Inter-System Comm</span>
                    </td>
                    <td className="p-3 border-r border-slate-800">
                      Exposing <code className="text-red-300">GEMINI_API_KEY</code> to the browser client or leaking tokens in network traffic.
                    </td>
                    <td className="p-3 text-emerald-400">
                      Zero client key exposure; all AI calls routed through secure Express backend proxy (<code className="text-cyan-300">/api/gemini/*</code>) with Secret Manager binding.
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Tab 2: OWASP Standards & Zero-Hardcoding Hygiene */}
        {activeTab === 'owasp' && (
          <div className="space-y-4 text-xs">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800">
                <div className="flex items-center gap-2 text-cyan-400 font-bold mb-2">
                  <Lock className="w-4 h-4" />
                  <span>OWASP Top 10 for LLMs Defenses</span>
                </div>
                <ul className="space-y-2 text-slate-300">
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                    <span><strong>LLM01: Prompt Injection</strong> — Rigid JSON response schema prevents prompt jailbreaking.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                    <span><strong>LLM02: Sensitive Info Disclosure</strong> — API keys strictly isolated on server runtime.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                    <span><strong>LLM05: Model Denial of Service</strong> — Automated 4-tier model fallback ladder (3.6-flash → 3.1-flash-lite → flash-latest → 3.7-flash).</span>
                  </li>
                </ul>
              </div>

              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800">
                <div className="flex items-center gap-2 text-emerald-400 font-bold mb-2">
                  <KeyRound className="w-4 h-4" />
                  <span>Secret Manager & Zero-Hardcoding</span>
                </div>
                <p className="text-slate-400 mb-2">
                  Production deployment retrieves <code className="text-amber-300">GEMINI_API_KEY</code> exclusively via Google Cloud Secret Manager runtime injection.
                </p>
                <div className="p-2.5 rounded bg-slate-900 border border-slate-800 font-mono text-[10px] text-slate-300">
                  gcloud secrets add-iam-policy-binding GEMINI_API_KEY \<br />
                  &nbsp;&nbsp;--role="roles/secretmanager.secretAccessor"
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab 3: Functional Stability Walkthroughs */}
        {activeTab === 'walkthroughs' && (
          <div className="space-y-3 text-xs">
            <div className="p-3 rounded-lg bg-slate-950 border border-slate-800">
              <strong className="text-cyan-400 block mb-1">Test Case TC-01: Interactive Timeline Scrubbing</strong>
              <p className="text-slate-300">
                1. Scrub timeline slider from T-72 to T-0.<br />
                2. Verify coastal flood polygon dynamically expands inland across Kakinada harbor and delta.<br />
                3. Verify wind gauge reaches 220 km/h and surge reaches +6.2m at T-0.<br />
                4. Press play to verify automated 1x/2x/4x milestone progression.
              </p>
            </div>

            <div className="p-3 rounded-lg bg-slate-950 border border-slate-800">
              <strong className="text-amber-400 block mb-1">Test Case TC-02: Critical Asset Inspection Panel</strong>
              <p className="text-slate-300">
                1. Click on "General Hospital (Critical)" pin on the map.<br />
                2. Verify right-hand drawer auto-focuses onto the Asset Inspection panel.<br />
                3. Inspect live inflow sensor (420 L/min) and Level -1 generator flood threat.<br />
                4. Toggle interactive mitigation checklist tasks; verify task status persists.
              </p>
            </div>

            <div className="p-3 rounded-lg bg-slate-950 border border-slate-800">
              <strong className="text-purple-400 block mb-1">Test Case TC-03: Gemini Multimodal Risk Assessment Engine</strong>
              <p className="text-slate-300">
                1. Click "Run Multimodal Risk Assessment" button.<br />
                2. Server executes model fallback ladder (3.6-flash → 3.1-flash-lite → flash-latest → 3.7-flash).<br />
                3. If offline or no key, synthetic emergency engine provides instant structured evaluation.<br />
                4. Confirm Vulnerability Score (88-96%), Natural Language Explanation, and pre-landfall action countdowns render.
              </p>
            </div>

            <div className="p-3 rounded-lg bg-slate-950 border border-slate-800">
              <strong className="text-emerald-400 block mb-1">Test Case TC-04: Parametric Micro-Payout Liquidity Trigger</strong>
              <p className="text-slate-300">
                1. Slide to T-24 or click "Simulate Parametric Insurance Trigger".<br />
                2. Modal opens with verified Oracle wind condition (&gt;180 km/h threshold).<br />
                3. Confirm ₹4.20 Crore instant pre-landfall liquidity disbursed to 12,000 households across 4 wards.<br />
                4. Verify cryptographic payment batch transaction hashes stream in real time.
              </p>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="mt-6 pt-4 border-t border-slate-800 flex items-center justify-between text-[11px] text-slate-500">
          <span>Aegis-APAC Security Architecture Specification</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
