/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  X, 
  Send, 
  Copy, 
  Check, 
  Volume2, 
  MessageSquare, 
  Smartphone, 
  Megaphone, 
  Globe, 
  Radio,
  CheckCircle2
} from 'lucide-react';
import { TimeStepId } from '../../types/disaster';
import { MUNICIPAL_ADVISORIES } from '../../data/syntheticGeoData';

interface AdvisoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  timeStep: TimeStepId;
}

export const AdvisoryModal: React.FC<AdvisoryModalProps> = ({
  isOpen,
  onClose,
  timeStep,
}) => {
  const [activeLang, setActiveLang] = useState<'en' | 'te' | 'or'>('en');
  const [activeFormat, setActiveFormat] = useState<'sms' | 'whatsapp' | 'siren'>('sms');
  const [copied, setCopied] = useState(false);
  const [isBroadcasting, setIsBroadcasting] = useState(false);
  const [broadcastSent, setBroadcastSent] = useState(false);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);

  if (!isOpen) return null;

  const advisory = MUNICIPAL_ADVISORIES[timeStep] || MUNICIPAL_ADVISORIES['T-24'];
  const content = advisory.languages[activeLang];

  const handleCopy = () => {
    let textToCopy = '';
    if (activeFormat === 'sms') textToCopy = content.smsBody;
    else if (activeFormat === 'whatsapp') textToCopy = content.whatsappCard;
    else textToCopy = content.sirenBroadcastScript;

    navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSimulateBroadcast = () => {
    setIsBroadcasting(true);
    setTimeout(() => {
      setIsBroadcasting(false);
      setBroadcastSent(true);
      setTimeout(() => setBroadcastSent(false), 4000);
    }, 1200);
  };

  const handlePlayAudioSimulation = () => {
    if (isPlayingAudio) return;
    setIsPlayingAudio(true);

    try {
      // Use Web Audio API to create authentic emergency attention siren chime
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(440, audioCtx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(880, audioCtx.currentTime + 0.4);
      osc.frequency.exponentialRampToValueAtTime(440, audioCtx.currentTime + 0.8);
      osc.frequency.exponentialRampToValueAtTime(880, audioCtx.currentTime + 1.2);

      gain.gain.setValueAtTime(0.12, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 1.5);

      osc.connect(gain);
      gain.connect(audioCtx.destination);

      osc.start();
      osc.stop(audioCtx.currentTime + 1.5);

      // Web Speech API text-to-speech simulation if supported
      if ('speechSynthesis' in window) {
        setTimeout(() => {
          const utterance = new SpeechSynthesisUtterance(
            activeLang === 'en' 
              ? content.sirenBroadcastScript 
              : 'Emergency cyclone warning. Seek shelter immediately.'
          );
          utterance.rate = 0.95;
          utterance.onend = () => setIsPlayingAudio(false);
          utterance.onerror = () => setIsPlayingAudio(false);
          window.speechSynthesis.speak(utterance);
        }, 1500);
      } else {
        setTimeout(() => setIsPlayingAudio(false), 1600);
      }
    } catch (e) {
      setTimeout(() => setIsPlayingAudio(false), 1000);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-2xl rounded-2xl bg-slate-900 border border-slate-700/80 shadow-2xl p-6 text-slate-100 font-mono-tactical my-8 animate-in fade-in zoom-in-95 duration-200">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="flex items-center gap-3 mb-5">
          <div className="p-2.5 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400">
            <Radio className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 uppercase">
                AUTOMATED DISPATCH ENGINE
              </span>
              <span className="text-xs text-slate-400">Sector: Kakinada Coastal Command</span>
            </div>
            <h2 className="text-lg font-bold font-display text-white mt-0.5">
              Multi-Lingual Municipal Emergency Advisory Generator
            </h2>
          </div>
        </div>

        {/* Language Selection Tabs */}
        <div className="flex items-center gap-2 mb-4 p-1 rounded-xl bg-slate-950 border border-slate-800 text-xs">
          <button
            onClick={() => setActiveLang('en')}
            className={`flex-1 py-1.5 px-3 rounded-lg font-bold transition-all flex items-center justify-center gap-2 ${
              activeLang === 'en'
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Globe className="w-3.5 h-3.5" />
            <span>English (Official / IMD)</span>
          </button>

          <button
            onClick={() => setActiveLang('te')}
            className={`flex-1 py-1.5 px-3 rounded-lg font-bold transition-all flex items-center justify-center gap-2 ${
              activeLang === 'te'
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <span>తెలుగు (Telugu - AP Coast)</span>
          </button>

          <button
            onClick={() => setActiveLang('or')}
            className={`flex-1 py-1.5 px-3 rounded-lg font-bold transition-all flex items-center justify-center gap-2 ${
              activeLang === 'or'
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <span>ଓଡ଼ିଆ (Odia - Odisha Coast)</span>
          </button>
        </div>

        {/* Format Selector Tabs */}
        <div className="flex items-center gap-2 mb-4 text-xs">
          <button
            onClick={() => setActiveFormat('sms')}
            className={`px-3 py-1.5 rounded-lg border flex items-center gap-1.5 transition-colors ${
              activeFormat === 'sms'
                ? 'bg-slate-800 border-cyan-500/50 text-cyan-300'
                : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
            }`}
          >
            <Smartphone className="w-3.5 h-3.5" />
            <span>SMS Cell Broadcast (160 char)</span>
          </button>

          <button
            onClick={() => setActiveFormat('whatsapp')}
            className={`px-3 py-1.5 rounded-lg border flex items-center gap-1.5 transition-colors ${
              activeFormat === 'whatsapp'
                ? 'bg-slate-800 border-emerald-500/50 text-emerald-300'
                : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
            }`}
          >
            <MessageSquare className="w-3.5 h-3.5 text-emerald-400" />
            <span>WhatsApp Community Card</span>
          </button>

          <button
            onClick={() => setActiveFormat('siren')}
            className={`px-3 py-1.5 rounded-lg border flex items-center gap-1.5 transition-colors ${
              activeFormat === 'siren'
                ? 'bg-slate-800 border-red-500/50 text-red-300'
                : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
            }`}
          >
            <Megaphone className="w-3.5 h-3.5 text-red-400" />
            <span>Public Address & Siren Script</span>
          </button>
        </div>

        {/* Advisory Preview Body Card */}
        <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 mb-5 relative min-h-[160px] flex flex-col justify-between">
          <div>
            <div className="text-xs font-bold text-slate-300 mb-2 flex items-center justify-between">
              <span className="text-cyan-400">{content.title}</span>
              <span className="text-[10px] text-slate-500">Issued: {advisory.issuedAt.slice(11, 19)} UTC</span>
            </div>

            {activeFormat === 'sms' && (
              <div className="p-3 rounded-lg bg-slate-900 border border-slate-800 text-slate-200 text-sm leading-relaxed">
                {content.smsBody}
                <div className="mt-2 text-[10px] text-slate-500 flex justify-between">
                  <span>Character count: {content.smsBody.length} / 160</span>
                  <span className="text-emerald-400">1 SMS Segment (Standard GSM)</span>
                </div>
              </div>
            )}

            {activeFormat === 'whatsapp' && (
              <div className="p-3.5 rounded-lg bg-slate-900/90 border border-emerald-500/30 text-slate-200 text-xs leading-relaxed whitespace-pre-line font-sans">
                {content.whatsappCard}
              </div>
            )}

            {activeFormat === 'siren' && (
              <div className="p-3.5 rounded-lg bg-slate-900/90 border border-red-500/30 text-slate-200 text-xs leading-relaxed">
                <div className="text-red-400 font-bold mb-1">[MEGAPHONE / SIREN BROADCAST AUDIO TEXT]</div>
                <p className="italic text-slate-300 font-sans">{content.sirenBroadcastScript}</p>
              </div>
            )}
          </div>

          <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between text-[11px] text-slate-500">
            <span>Auth: {advisory.authority}</span>
            <span>CAP-v1.2 XML Compliant</span>
          </div>
        </div>

        {/* Audio Siren Simulation Alert Banner */}
        <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 flex items-center justify-between mb-5">
          <div className="flex items-center gap-2.5">
            <Volume2 className="w-4 h-4 text-cyan-400" />
            <div className="text-xs">
              <div className="text-slate-200 font-semibold">Audio Emergency Warning Broadcast</div>
              <div className="text-[10px] text-slate-400">Synthesize official siren tones and spoken instructions</div>
            </div>
          </div>

          <button
            onClick={handlePlayAudioSimulation}
            disabled={isPlayingAudio}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all ${
              isPlayingAudio
                ? 'bg-red-500 text-white animate-pulse'
                : 'bg-slate-800 hover:bg-slate-700 text-cyan-300 border border-slate-700'
            }`}
          >
            <Volume2 className="w-3.5 h-3.5" />
            <span>{isPlayingAudio ? 'Broadcasting Siren...' : 'Test Siren Audio'}</span>
          </button>
        </div>

        {/* Broadcast Status Confirmation Toast */}
        {broadcastSent && (
          <div className="mb-4 p-3 rounded-xl bg-emerald-950/40 border border-emerald-500/40 text-emerald-300 text-xs flex items-center gap-2 animate-in fade-in">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>Cell Broadcast Dispatched! 185,000 active mobile handsets received alert in Kakinada district.</span>
          </div>
        )}

        {/* Bottom Actions */}
        <div className="flex items-center justify-between gap-3 pt-2">
          <button
            onClick={handleCopy}
            className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs flex items-center gap-2 border border-slate-700 transition-colors"
          >
            {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
            <span>{copied ? 'Copied to Clipboard!' : 'Copy Broadcast Copy'}</span>
          </button>

          <button
            onClick={handleSimulateBroadcast}
            disabled={isBroadcasting}
            className="px-5 py-2 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-slate-950 font-bold text-xs flex items-center gap-2 transition-all shadow-[0_0_15px_rgba(6,182,212,0.3)]"
          >
            <Send className={`w-4 h-4 ${isBroadcasting ? 'animate-spin' : ''}`} />
            <span>{isBroadcasting ? 'Transmitting to Cell Towers...' : 'Dispatch via Cell Broadcast (CAP)'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
