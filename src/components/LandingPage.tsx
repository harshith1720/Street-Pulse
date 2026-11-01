import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { translations } from '../utils/i18n';
import { 
  Lightbulb, 
  MapPin, 
  ShieldCheck, 
  Wrench, 
  Search, 
  CheckCircle2, 
  Clock, 
  ArrowRight, 
  Camera, 
  ChevronDown, 
  ChevronUp, 
  Flame, 
  QrCode, 
  PhoneCall, 
  Layers, 
  FileSpreadsheet 
} from 'lucide-react';

export const LandingPage: React.FC = () => {
  const { 
    complaints, 
    staff, 
    setActiveTab, 
    setSelectedComplaintId, 
    language 
  } = useApp();

  const [trackSearchId, setTrackSearchId] = useState('');
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  const t = translations[language];

  // Derived real metrics
  const totalComplaints = complaints.length;
  const resolvedCount = complaints.filter(c => c.status === 'resolved').length;
  const pendingCount = complaints.filter(c => c.status !== 'resolved' && c.status !== 'rejected').length;
  const activeTeamsCount = staff.filter(s => s.status === 'active').length;
  const emergencyCount = complaints.filter(c => c.priority === 'emergency' && c.status !== 'resolved').length;

  const handleQuickTrack = (e: React.FormEvent) => {
    e.preventDefault();
    if (trackSearchId.trim()) {
      setSelectedComplaintId(trackSearchId.trim());
      setActiveTab('track');
    }
  };

  const faqs = [
    {
      q: 'Do I need to create an account or log in to report a broken streetlight?',
      a: 'No. Citizens can immediately report a fault anonymously or provide an optional mobile number to receive tracking SMS updates. No app installation or account creation is required.'
    },
    {
      q: 'How does StreetPulse ensure the reported streetlight is actually fixed?',
      a: 'StreetPulse uses a 3-layer verification protocol: first, the technician must cross-match the physical Pole ID on-site; second, the technician’s device GPS must match the registered pole location within a 40-meter threshold; third, after-repair photographs are submitted for municipal authority audit. Finally, the citizen is asked to confirm before final closure.'
    },
    {
      q: 'What is the municipal service-level agreement (SLA) turnaround time?',
      a: 'Emergency hazards (sparking wiring, fallen poles) are dispatched within 2 hours with a 24-hour resolution SLA. Regular outages and flickering luminaires have a 48 to 72-hour turnaround target.'
    },
    {
      q: 'What happens if a citizen reports the streetlight is still not working after repair?',
      a: 'The complaint is instantly reopened, flagged as urgent in the Municipal Control Room, and re-dispatched to a senior supervisor for on-site inspection.'
    }
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      
      {/* Hero Section */}
      <section className="relative overflow-hidden border-b border-slate-800">
        
        {/* Streetlight Night Background with Dark Navy Gradient Scrim */}
        <div className="absolute inset-0 z-0">
          <img
            src="/src/assets/images/hero_streetlight_night_1793539261642.jpg"
            alt="City street illuminated by smart LED streetlights at dusk"
            className="w-full h-full object-cover object-center filter brightness-[0.45] contrast-[1.1]"
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/80 to-slate-950/50" />
          <div className="absolute inset-0 bg-radial-at-c from-transparent via-slate-950/40 to-slate-950" />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-24 lg:pt-28 lg:pb-32">
          <div className="max-w-3xl">
            
            {/* Municipal Trust Badge */}
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-900/80 border border-amber-400/30 text-amber-300 text-xs font-mono uppercase tracking-wider mb-6 backdrop-blur-sm">
              <span className="w-2 h-2 rounded-full bg-amber-400" />
              <span>Smart Infrastructure Management Platform</span>
            </div>

            {/* Main Headline */}
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white text-balance leading-tight">
              {t.heroTitle}
            </h1>

            {/* Subtitle */}
            <p className="mt-5 text-lg sm:text-xl text-slate-300 max-w-2xl leading-relaxed">
              {t.heroSubtitle}
            </p>

            {/* Primary Action Buttons */}
            <div className="mt-8 flex flex-wrap items-center gap-4">
              <button
                onClick={() => setActiveTab('report')}
                className="px-6 py-3.5 text-sm font-bold text-slate-950 bg-amber-400 hover:bg-amber-300 rounded-xl shadow-lg shadow-amber-400/20 transition-all flex items-center gap-2 hover:scale-[1.02] active:scale-[0.98]"
              >
                <Camera className="w-4 h-4" />
                <span>{t.reportFault}</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <button
                onClick={() => setActiveTab('map')}
                className="px-6 py-3.5 text-sm font-semibold text-slate-200 bg-slate-900/80 hover:bg-slate-800 hover:text-white border border-slate-700 rounded-xl backdrop-blur-sm transition-all flex items-center gap-2"
              >
                <MapPin className="w-4 h-4 text-emerald-400" />
                <span>{t.liveMap}</span>
              </button>
            </div>

            {/* Fast Complaint Tracker Input Bar */}
            <div className="mt-10 p-3 bg-slate-900/90 border border-slate-700/80 rounded-2xl shadow-xl max-w-xl backdrop-blur-md">
              <form onSubmit={handleQuickTrack} className="flex flex-col sm:flex-row gap-2">
                <div className="relative flex-1">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                  <input
                    type="text"
                    value={trackSearchId}
                    onChange={(e) => setTrackSearchId(e.target.value)}
                    placeholder={t.searchPlaceholder}
                    className="w-full bg-slate-950/80 text-white placeholder-slate-500 pl-10 pr-4 py-2.5 rounded-xl border border-slate-800 text-sm font-mono focus:outline-none focus:border-amber-400 transition-colors"
                  />
                </div>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-slate-800 hover:bg-slate-700 text-amber-300 font-semibold text-xs rounded-xl transition-colors border border-slate-700 whitespace-nowrap"
                >
                  {t.trackNow}
                </button>
              </form>
              <div className="mt-2 text-[11px] text-slate-400 px-1 flex items-center gap-2">
                <span>Try active sample IDs:</span>
                <button 
                  onClick={() => { setSelectedComplaintId('SP-2026-1042'); setActiveTab('track'); }}
                  className="font-mono text-amber-400 hover:underline"
                >
                  SP-2026-1042
                </button>
                <span>·</span>
                <button 
                  onClick={() => { setSelectedComplaintId('SP-2026-1038'); setActiveTab('track'); }}
                  className="font-mono text-amber-400 hover:underline"
                >
                  SP-2026-1038
                </button>
              </div>
            </div>

          </div>
        </div>

      </section>

      {/* Live Statistics Strip (Pure Database Values with Demonstration Notice) */}
      <section className="bg-slate-900 border-b border-slate-800 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="flex items-center justify-between mb-4 pb-2 border-b border-slate-800/80">
            <div className="flex items-center gap-2 text-xs font-mono text-slate-400 uppercase tracking-wider">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>Real-Time Municipal Operations Feed</span>
            </div>
            <span className="text-[11px] text-amber-400/90 font-mono">
              {t.sampleDataNotice}
            </span>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            
            {/* Total Complaints */}
            <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800">
              <div className="text-xs text-slate-400 font-medium">{t.totalReports}</div>
              <div className="text-3xl font-extrabold text-white font-mono tabular-nums mt-1">
                {totalComplaints}
              </div>
              <div className="text-[11px] text-slate-500 mt-1">BBMP Wards 01, 04, 08, 12</div>
            </div>

            {/* Resolved Complaints */}
            <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800">
              <div className="text-xs text-emerald-400 font-medium">{t.resolvedComplaints}</div>
              <div className="text-3xl font-extrabold text-emerald-300 font-mono tabular-nums mt-1">
                {resolvedCount}
              </div>
              <div className="text-[11px] text-slate-500 mt-1">
                {totalComplaints > 0 ? `${Math.round((resolvedCount / totalComplaints) * 100)}% resolution rate` : '0%'}
              </div>
            </div>

            {/* Pending Complaints */}
            <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800">
              <div className="text-xs text-amber-400 font-medium">{t.pendingComplaints}</div>
              <div className="text-3xl font-extrabold text-amber-300 font-mono tabular-nums mt-1">
                {pendingCount}
              </div>
              <div className="text-[11px] text-slate-500 mt-1">
                {emergencyCount > 0 ? `${emergencyCount} emergency hazards` : 'Active triage'}
              </div>
            </div>

            {/* Active Maintenance Teams */}
            <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800">
              <div className="text-xs text-sky-400 font-medium">{t.activeTeams}</div>
              <div className="text-3xl font-extrabold text-sky-300 font-mono tabular-nums mt-1">
                {activeTeamsCount}
              </div>
              <div className="text-[11px] text-slate-500 mt-1">Linemen & technicians on field</div>
            </div>

          </div>
        </div>
      </section>

      {/* How It Works (4 Steps) */}
      <section className="py-20 bg-slate-950 border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
              {t.howItWorksTitle}
            </h2>
            <p className="mt-3 text-sm text-slate-400">
              A transparent, closed-loop municipal maintenance pipeline from citizen smartphone to verified repair.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 relative">
            
            {/* Step 1 */}
            <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 hover:border-slate-700 transition-all flex flex-col justify-between">
              <div>
                <div className="w-12 h-12 rounded-xl bg-amber-400/10 text-amber-400 border border-amber-400/20 flex items-center justify-center font-bold mb-4">
                  <Camera className="w-6 h-6" />
                </div>
                <h3 className="text-base font-bold text-white">{t.step1Title}</h3>
                <p className="mt-2 text-xs text-slate-400 leading-relaxed">
                  {t.step1Desc}
                </p>
              </div>
              <div className="mt-6 pt-4 border-t border-slate-800/80 text-[11px] font-mono text-amber-400">
                01 · Immediate Intake
              </div>
            </div>

            {/* Step 2 */}
            <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 hover:border-slate-700 transition-all flex flex-col justify-between">
              <div>
                <div className="w-12 h-12 rounded-xl bg-sky-400/10 text-sky-400 border border-sky-400/20 flex items-center justify-center font-bold mb-4">
                  <ShieldCheck className="w-6 h-6" />
                </div>
                <h3 className="text-base font-bold text-white">{t.step2Title}</h3>
                <p className="mt-2 text-xs text-slate-400 leading-relaxed">
                  {t.step2Desc}
                </p>
              </div>
              <div className="mt-6 pt-4 border-t border-slate-800/80 text-[11px] font-mono text-sky-400">
                02 · Triage & Dispatch
              </div>
            </div>

            {/* Step 3 */}
            <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 hover:border-slate-700 transition-all flex flex-col justify-between">
              <div>
                <div className="w-12 h-12 rounded-xl bg-emerald-400/10 text-emerald-400 border border-emerald-400/20 flex items-center justify-center font-bold mb-4">
                  <Wrench className="w-6 h-6" />
                </div>
                <h3 className="text-base font-bold text-white">{t.step3Title}</h3>
                <p className="mt-2 text-xs text-slate-400 leading-relaxed">
                  {t.step3Desc}
                </p>
              </div>
              <div className="mt-6 pt-4 border-t border-slate-800/80 text-[11px] font-mono text-emerald-400">
                03 · Field Execution
              </div>
            </div>

            {/* Step 4 */}
            <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 hover:border-slate-700 transition-all flex flex-col justify-between">
              <div>
                <div className="w-12 h-12 rounded-xl bg-purple-400/10 text-purple-400 border border-purple-400/20 flex items-center justify-center font-bold mb-4">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <h3 className="text-base font-bold text-white">{t.step4Title}</h3>
                <p className="mt-2 text-xs text-slate-400 leading-relaxed">
                  {t.step4Desc}
                </p>
              </div>
              <div className="mt-6 pt-4 border-t border-slate-800/80 text-[11px] font-mono text-purple-400">
                04 · Verification & Close
              </div>
            </div>

          </div>

        </div>
      </section>

      {/* Distinctive Feature: Smart Repair Verification System Spotlight */}
      <section className="py-20 bg-slate-900/60 border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-950/60 border border-purple-700/60 text-purple-300 text-xs font-mono uppercase tracking-wider mb-4">
                <span>Multi-Layer Anti-Fraud Engine</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
                No "Ghost Repairs". Real Municipal Accountability.
              </h2>
              <p className="mt-4 text-sm text-slate-300 leading-relaxed">
                Conventional municipal apps close complaints when a technician clicks "done". StreetPulse enforces a strict multi-layer verification protocol before any ticket can officially be marked as resolved.
              </p>

              <div className="mt-6 space-y-4">
                
                <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800">
                  <div className="flex items-center gap-3">
                    <span className="w-7 h-7 rounded-lg bg-amber-400/10 text-amber-400 border border-amber-400/30 text-xs font-mono flex items-center justify-center font-bold">L1</span>
                    <h4 className="text-sm font-semibold text-white">Physical Pole ID Cross-Verification</h4>
                  </div>
                  <p className="text-xs text-slate-400 mt-1 pl-10">
                    Compares technician’s on-site barcode/pole entry against the registered GIS pole inventory.
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800">
                  <div className="flex items-center gap-3">
                    <span className="w-7 h-7 rounded-lg bg-sky-400/10 text-sky-400 border border-sky-400/30 text-xs font-mono flex items-center justify-center font-bold">L2</span>
                    <h4 className="text-sm font-semibold text-white">40-Meter Geodesic GPS Radius Gate</h4>
                  </div>
                  <p className="text-xs text-slate-400 mt-1 pl-10">
                    Haversine telemetry flags repairs submitted further than 40 meters from the true pole coordinates.
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800">
                  <div className="flex items-center gap-3">
                    <span className="w-7 h-7 rounded-lg bg-emerald-400/10 text-emerald-400 border border-emerald-400/30 text-xs font-mono flex items-center justify-center font-bold">L3</span>
                    <h4 className="text-sm font-semibold text-white">Side-by-Side Photographic Audit & Citizen Confirmation</h4>
                  </div>
                  <p className="text-xs text-slate-400 mt-1 pl-10">
                    Before-and-after photographic evidence is audited by municipal inspectors, followed by citizen feedback.
                  </p>
                </div>

              </div>

              <div className="mt-8 flex items-center gap-4">
                <button
                  onClick={() => setActiveTab('admin')}
                  className="px-5 py-2.5 bg-slate-800 hover:bg-slate-700 text-white rounded-lg text-xs font-semibold border border-slate-700 flex items-center gap-2"
                >
                  <ShieldCheck className="w-4 h-4 text-sky-400" />
                  <span>Inspect Verification Queue</span>
                </button>
              </div>
            </div>

            {/* Visual Evidence Showcase Card */}
            <div className="p-6 rounded-2xl bg-slate-950 border border-slate-800 shadow-2xl">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800 text-xs text-slate-400 font-mono">
                <span>INSPECTION COMPARISON</span>
                <span className="text-emerald-400">POLE ID: SP-POLE-W04-012</span>
              </div>

              <div className="grid grid-cols-2 gap-3 mt-4">
                <div>
                  <div className="text-[11px] font-mono text-rose-400 mb-1.5 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-rose-400" />
                    <span>REPORTED FAULT PHOTO</span>
                  </div>
                  <div className="aspect-[4/3] rounded-lg overflow-hidden bg-slate-900 border border-slate-800">
                    <img 
                      src="/src/assets/images/fault_broken_light_1793539263427.jpg" 
                      alt="Reported unlit street light fault"
                      className="w-full h-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                  </div>
                </div>

                <div>
                  <div className="text-[11px] font-mono text-emerald-400 mb-1.5 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                    <span>AFTER-REPAIR PROOF</span>
                  </div>
                  <div className="aspect-[4/3] rounded-lg overflow-hidden bg-slate-900 border border-slate-800">
                    <img 
                      src="/src/assets/images/repaired_light_proof_1793539262370.jpg" 
                      alt="Verified repaired luminaire shining bright"
                      className="w-full h-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                  </div>
                </div>
              </div>

              <div className="mt-4 p-3 rounded-lg bg-slate-900/80 border border-slate-800 flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span className="text-slate-300">GPS Delta: 2.1m (Threshold: 40m)</span>
                </div>
                <span className="font-mono text-emerald-400 font-semibold">SCORE: 98/100</span>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* Interactive Map Quick Launch Section */}
      <section className="py-16 bg-slate-950 border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="p-8 rounded-3xl bg-gradient-to-br from-slate-900 to-slate-950 border border-slate-800 flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="max-w-xl">
              <div className="text-xs font-mono text-emerald-400 uppercase tracking-wider mb-2">
                OpenStreetMap GIS Integration
              </div>
              <h3 className="text-2xl font-bold text-white tracking-tight">
                Explore the Ward-Wise Live Outage Map
              </h3>
              <p className="mt-2 text-sm text-slate-400 leading-relaxed">
                View real-time streetlight status across your locality. Color-coded markers distinguish pending faults, active repair crews, and recently verified luminaires.
              </p>
              <div className="mt-4 flex items-center gap-4 text-xs font-mono text-slate-300">
                <span className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-rose-500" /> Pending Outage
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-500" /> In Progress
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" /> Verified Resolved
                </span>
              </div>
            </div>

            <button
              onClick={() => setActiveTab('map')}
              className="px-6 py-3.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-sm rounded-xl transition-all shadow-lg shadow-emerald-500/20 whitespace-nowrap flex items-center gap-2 hover:scale-105"
            >
              <MapPin className="w-4 h-4" />
              <span>Launch Fullscreen Map</span>
            </button>
          </div>
        </div>
      </section>

      {/* Frequently Asked Questions */}
      <section className="py-20 bg-slate-900/40 border-b border-slate-800">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold text-white">
              {t.faqTitle}
            </h2>
            <p className="mt-2 text-sm text-slate-400">
              Clear municipal service policies, turnaround times, and reporting protocols.
            </p>
          </div>

          <div className="space-y-3">
            {faqs.map((faq, idx) => {
              const isOpen = openFaq === idx;
              return (
                <div 
                  key={idx}
                  className="rounded-xl bg-slate-900 border border-slate-800 overflow-hidden transition-colors"
                >
                  <button
                    onClick={() => setOpenFaq(isOpen ? null : idx)}
                    className="w-full text-left p-4 sm:p-5 flex items-center justify-between gap-4 font-semibold text-sm sm:text-base text-slate-200 hover:text-white"
                  >
                    <span>{faq.q}</span>
                    {isOpen ? <ChevronUp className="w-5 h-5 text-amber-400 shrink-0" /> : <ChevronDown className="w-5 h-5 text-slate-400 shrink-0" />}
                  </button>
                  {isOpen && (
                    <div className="px-4 pb-5 sm:px-5 text-xs sm:text-sm text-slate-400 leading-relaxed border-t border-slate-800/80 pt-3">
                      {faq.a}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Municipal Footer */}
      <footer className="mt-auto bg-slate-950 border-t border-slate-800 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            
            <div className="md:col-span-2">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-amber-400 text-slate-950 flex items-center justify-center font-bold">
                  <Lightbulb className="w-4 h-4 fill-slate-950" />
                </div>
                <span className="text-lg font-bold text-white">StreetPulse</span>
              </div>
              <p className="text-xs text-slate-400 mt-2 max-w-sm leading-relaxed">
                Brighter Streets. Safer Communities. Smart Municipal Streetlight Fault Detection, Maintenance Monitoring, and Multi-Layer Repair Verification Platform.
              </p>
              <div className="mt-4 text-[11px] text-slate-400 flex items-center gap-2 font-mono">
                <PhoneCall className="w-3.5 h-3.5 text-amber-400" />
                <span>{t.contactSupport}</span>
              </div>
            </div>

            <div>
              <h4 className="text-xs font-mono uppercase tracking-wider text-slate-300">Quick Navigation</h4>
              <ul className="mt-3 space-y-2 text-xs text-slate-400">
                <li>
                  <button onClick={() => setActiveTab('report')} className="hover:text-amber-400 transition-colors">
                    Report Fault
                  </button>
                </li>
                <li>
                  <button onClick={() => setActiveTab('track')} className="hover:text-amber-400 transition-colors">
                    Track Complaint
                  </button>
                </li>
                <li>
                  <button onClick={() => setActiveTab('map')} className="hover:text-amber-400 transition-colors">
                    Live GIS Map
                  </button>
                </li>
                <li>
                  <button onClick={() => setActiveTab('registry')} className="hover:text-amber-400 transition-colors">
                    Pole Registry & QR Codes
                  </button>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="text-xs font-mono uppercase tracking-wider text-slate-300">Portals & Control</h4>
              <ul className="mt-3 space-y-2 text-xs text-slate-400">
                <li>
                  <button onClick={() => setActiveTab('admin')} className="hover:text-sky-400 transition-colors">
                    Authority Admin Dashboard
                  </button>
                </li>
                <li>
                  <button onClick={() => setActiveTab('staff')} className="hover:text-amber-400 transition-colors">
                    Maintenance Crew Portal
                  </button>
                </li>
                <li>
                  <span className="text-[11px] font-mono text-slate-400">Engineering Demo Edition</span>
                </li>
              </ul>
            </div>

          </div>

          <div className="mt-12 pt-6 border-t border-slate-900 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-400 gap-4">
            <div>
              © 2026 Bruhat Bengaluru Mahanagara Palike (BBMP) Infrastructure Division · StreetPulse
            </div>
            <div className="font-mono text-[11px] text-slate-400">
              Supabase PostgreSQL · Leaflet GIS · Recharts
            </div>
          </div>
        </div>
      </footer>

    </div>
  );
};
