import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Complaint } from '../types';
import { formatFaultCategory, formatStatusLabel, getPriorityBadgeColor } from '../utils/verification';
import { 
  Wrench, 
  MapPin, 
  Camera, 
  Upload, 
  CheckCircle2, 
  Clock, 
  AlertTriangle, 
  Crosshair, 
  ArrowRight, 
  ShieldCheck, 
  FileText,
  User,
  Send
} from 'lucide-react';

export const StaffPortal: React.FC = () => {
  const { 
    complaints, 
    staff, 
    activeStaffId, 
    setActiveStaffId, 
    submitRepairWork, 
    updateComplaintStatus,
    setSelectedComplaintId,
    setActiveTab 
  } = useApp();

  const currentTechnician = staff.find(s => s.id === activeStaffId) || staff[0];

  // Selected job for active repair workflow
  const [activeJob, setActiveJob] = useState<Complaint | null>(null);

  // Repair execution form state
  const [enteredPoleId, setEnteredPoleId] = useState('');
  const [repairLat, setRepairLat] = useState<number>(12.971891);
  const [repairLng, setRepairLng] = useState<number>(77.641151);
  const [afterPhotoUrl, setAfterPhotoUrl] = useState<string>('/src/assets/images/repaired_light_proof_1793539262370.jpg');
  const [afterPhotoPreview, setAfterPhotoPreview] = useState<string>('/src/assets/images/repaired_light_proof_1793539262370.jpg');
  const [repairNotes, setRepairNotes] = useState('');
  const [sparePartsText, setSparePartsText] = useState('LED Driver 90W, Surge Protection Arrester');
  const [isCapturingGps, setIsCapturingGps] = useState(false);
  const [isSubmittingRepair, setIsSubmittingRepair] = useState(false);

  // Filter complaints assigned to this technician
  const myAssignedJobs = complaints.filter(
    c => c.assignedStaffId === currentTechnician.id
  );

  const activeWorkInProgress = myAssignedJobs.filter(c => c.status === 'in_progress');
  const newAssignments = myAssignedJobs.filter(c => c.status === 'assigned');
  const awaitingVerification = myAssignedJobs.filter(c => c.status === 'awaiting_verification');
  const completedJobs = myAssignedJobs.filter(c => c.status === 'resolved');

  const handleStartRepair = (job: Complaint) => {
    updateComplaintStatus(
      job.id, 
      'in_progress', 
      currentTechnician.name, 
      `Technician ${currentTechnician.name} arrived at site and commenced diagnostic inspection.`
    );
    setActiveJob(job);
    setEnteredPoleId(job.poleId || '');
    setRepairLat(job.lat);
    setRepairLng(job.lng);
  };

  const handleCaptureFieldGps = () => {
    if (!navigator.geolocation) {
      alert('Geolocation not supported');
      return;
    }
    setIsCapturingGps(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setRepairLat(Number(pos.coords.latitude.toFixed(6)));
        setRepairLng(Number(pos.coords.longitude.toFixed(6)));
        setIsCapturingGps(false);
      },
      () => {
        setIsCapturingGps(false);
        // Fallback realistic location
        setRepairLat(Number((activeJob?.lat || 12.971890) + 0.000004));
        setRepairLng(Number((activeJob?.lng || 77.641150) + 0.000004));
      },
      { enableHighAccuracy: true, timeout: 8000 }
    );
  };

  const handleAfterPhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        setAfterPhotoUrl(result);
        setAfterPhotoPreview(result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmitRepair = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeJob) return;

    if (!enteredPoleId.trim()) {
      alert('Physical Pole ID entry is mandatory for layer-1 cross verification.');
      return;
    }
    if (!afterPhotoUrl) {
      alert('After-repair photograph is mandatory.');
      return;
    }
    if (!repairNotes.trim()) {
      alert('Please summarize repair notes and replaced electrical components.');
      return;
    }

    setIsSubmittingRepair(true);

    const parts = sparePartsText.split(',').map(p => p.trim()).filter(Boolean);

    setTimeout(() => {
      submitRepairWork(activeJob.id, {
        staffId: currentTechnician.id,
        staffName: currentTechnician.name,
        enteredPoleId: enteredPoleId.trim().toUpperCase(),
        repairLat,
        repairLng,
        afterPhotoUrl,
        notes: repairNotes.trim(),
        sparePartsUsed: parts
      });

      setIsSubmittingRepair(false);
      setActiveJob(null);
      setRepairNotes('');
      alert(`Repair evidence for ${activeJob.id} dispatched to Municipal Verification Queue!`);
    }, 600);
  };

  return (
    <div className="max-w-7xl mx-auto my-6 px-4 sm:px-6 lg:px-8 space-y-6">
      
      {/* Top Banner with Technician Identity Switcher */}
      <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 shadow-2xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="text-xs font-mono text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
            <Wrench className="w-4 h-4" />
            <span>Field Maintenance Crew Terminal · Mobile Dispatch</span>
          </div>
          <h2 className="text-2xl font-extrabold text-white mt-1">
            Active Job Assignments
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Log physical repairs, submit geotagged photographic proof, and send work for municipal verification.
          </p>
        </div>

        {/* Technician Profile Card */}
        <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-400/10 text-amber-400 border border-amber-400/20 flex items-center justify-center font-bold">
            <User className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs font-bold text-white">{currentTechnician.name}</div>
            <div className="text-[11px] text-amber-300 capitalize">{currentTechnician.role.replace('_', ' ')} · {currentTechnician.wardAssigned}</div>
          </div>
          <select
            value={activeStaffId}
            onChange={(e) => {
              setActiveStaffId(e.target.value);
              setActiveJob(null);
            }}
            className="ml-3 bg-slate-900 text-xs text-slate-200 border border-slate-700 rounded-lg px-2.5 py-1.5"
          >
            {staff.map(s => (
              <option key={s.id} value={s.id}>
                {s.name} ({s.wardAssigned})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* KPI Stats Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800">
          <div className="text-[11px] font-mono text-slate-400">NEW ASSIGNED</div>
          <div className="text-2xl font-bold font-mono text-white mt-1">{newAssignments.length}</div>
        </div>
        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800">
          <div className="text-[11px] font-mono text-amber-400">IN PROGRESS</div>
          <div className="text-2xl font-bold font-mono text-amber-300 mt-1">{activeWorkInProgress.length}</div>
        </div>
        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800">
          <div className="text-[11px] font-mono text-purple-400">AWAITING AUDIT</div>
          <div className="text-2xl font-bold font-mono text-purple-300 mt-1">{awaitingVerification.length}</div>
        </div>
        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800">
          <div className="text-[11px] font-mono text-emerald-400">VERIFIED CLOSED</div>
          <div className="text-2xl font-bold font-mono text-emerald-300 mt-1">{completedJobs.length}</div>
        </div>
      </div>

      {/* Active Repair Workflow Modal / Panel */}
      {activeJob && (
        <div className="p-6 sm:p-8 rounded-3xl bg-slate-900 border-2 border-amber-400 shadow-2xl space-y-6 animate-in slide-in-from-top-2 duration-150">
          
          <div className="flex items-center justify-between pb-4 border-b border-slate-800">
            <div>
              <div className="text-xs font-mono text-amber-400 font-bold uppercase">
                ON-SITE REPAIR EXECUTION WORKFLOW
              </div>
              <h3 className="text-xl font-bold text-white mt-0.5">
                Executing Job: {activeJob.id}
              </h3>
              <div className="text-xs text-slate-400">
                {activeJob.streetName}, {activeJob.ward}
              </div>
            </div>

            <button
              onClick={() => setActiveJob(null)}
              className="text-xs text-slate-400 hover:text-white px-3 py-1.5 rounded-lg bg-slate-800"
            >
              Cancel & Exit
            </button>
          </div>

          <form onSubmit={handleSubmitRepair} className="space-y-6">
            
            {/* Step 1 & 2: Pole Identification and GPS Telemetry */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              
              {/* Physical Pole ID Entry */}
              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
                <label className="block text-xs font-mono uppercase text-slate-300">
                  Step 1: Enter Pole ID Found on Physical Sticker <span className="text-rose-400">*</span>
                </label>
                <input
                  type="text"
                  value={enteredPoleId}
                  onChange={(e) => setEnteredPoleId(e.target.value.toUpperCase())}
                  placeholder="e.g. SP-POLE-W04-012"
                  className="w-full bg-slate-900 text-white font-mono text-sm px-3 py-2 rounded-xl border border-slate-700 focus:outline-none focus:border-amber-400 uppercase"
                  required
                />
                <div className="text-[11px] text-slate-400">
                  Expected pole: <span className="font-mono text-amber-300 font-bold">{activeJob.poleId || 'Untagged'}</span>. Must match for automatic approval.
                </div>
              </div>

              {/* GPS Geodesic Verification */}
              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-mono uppercase text-slate-300">
                    Step 2: On-Site GPS Fix
                  </label>
                  <button
                    type="button"
                    onClick={handleCaptureFieldGps}
                    className="text-[11px] font-mono text-amber-400 hover:underline flex items-center gap-1"
                  >
                    <Crosshair className="w-3.5 h-3.5" />
                    <span>{isCapturingGps ? 'Locking GPS...' : 'Refresh GPS'}</span>
                  </button>
                </div>

                <div className="font-mono text-xs text-emerald-400 py-2">
                  {repairLat.toFixed(6)}° N, {repairLng.toFixed(6)}° E
                </div>
                <div className="text-[11px] text-slate-400">
                  Geodesic proximity cross-checked against 40-meter municipal radius gate.
                </div>
              </div>

            </div>

            {/* Step 3: Upload After-Repair Photograph */}
            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
              <label className="block text-xs font-mono uppercase text-slate-300">
                Step 3: Upload After-Repair Photograph (Mandatory) <span className="text-rose-400">*</span>
              </label>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-center">
                <div className="aspect-[4/3] rounded-xl overflow-hidden bg-slate-900 border border-slate-800">
                  <img
                    src={afterPhotoPreview}
                    alt="After repair proof"
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                </div>

                <div className="sm:col-span-2 space-y-2">
                  <div className="flex items-center gap-2">
                    <label className="cursor-pointer px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-medium border border-slate-700 flex items-center gap-2">
                      <Camera className="w-4 h-4 text-emerald-400" />
                      <span>Take / Upload Photo</span>
                      <input
                        type="file"
                        accept="image/*"
                        capture="environment"
                        onChange={handleAfterPhotoUpload}
                        className="hidden"
                      />
                    </label>

                    <button
                      type="button"
                      onClick={() => {
                        setAfterPhotoUrl('/src/assets/images/repaired_light_proof_1793539262370.jpg');
                        setAfterPhotoPreview('/src/assets/images/repaired_light_proof_1793539262370.jpg');
                      }}
                      className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-mono border border-slate-700"
                    >
                      Use Demo Repaired Photo
                    </button>
                  </div>
                  <div className="text-[11px] text-slate-400">
                    Ensure the luminaire is illuminated and pole structure is clearly visible.
                  </div>
                </div>
              </div>
            </div>

            {/* Step 4: Repair Notes & Parts Replaced */}
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-mono uppercase text-slate-300 mb-1">
                  Step 4: Repair Notes & Work Performed <span className="text-rose-400">*</span>
                </label>
                <textarea
                  rows={2}
                  value={repairNotes}
                  onChange={(e) => setRepairNotes(e.target.value)}
                  placeholder="e.g. Replaced faulty 90W driver and re-crimped loose neutral wire. Tested luminaire lux output."
                  className="w-full bg-slate-950 text-white placeholder-slate-600 p-3 rounded-xl border border-slate-800 text-xs focus:outline-none focus:border-amber-400"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-mono uppercase text-slate-300 mb-1">
                  Spare Parts Used (Comma-separated)
                </label>
                <input
                  type="text"
                  value={sparePartsText}
                  onChange={(e) => setSparePartsText(e.target.value)}
                  placeholder="e.g. 90W Driver, 10kV Surge Arrester, MCB 16A"
                  className="w-full bg-slate-950 text-white placeholder-slate-600 px-3 py-2 rounded-xl border border-slate-800 text-xs focus:outline-none focus:border-amber-400"
                />
              </div>
            </div>

            {/* Submit Action */}
            <div className="pt-2 flex items-center justify-between border-t border-slate-800">
              <span className="text-[11px] text-slate-500 font-mono">
                * Field technicians cannot directly close tickets; must be verified by authority.
              </span>

              <button
                type="submit"
                disabled={isSubmittingRepair}
                className="px-6 py-3 bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-xs rounded-xl shadow-lg transition-all flex items-center gap-2 hover:scale-[1.02]"
              >
                <Send className="w-4 h-4" />
                <span>{isSubmittingRepair ? 'Transmitting Evidence...' : 'Submit for Verification'}</span>
              </button>
            </div>

          </form>

        </div>
      )}

      {/* Assigned Complaints List */}
      <div className="space-y-3">
        <h3 className="text-sm font-bold font-mono text-white uppercase tracking-wider">
          Job Queue for {currentTechnician.name} ({myAssignedJobs.length} Assigned)
        </h3>

        {myAssignedJobs.length === 0 ? (
          <div className="p-12 rounded-3xl bg-slate-900 border border-slate-800 text-center text-slate-500">
            <CheckCircle2 className="w-10 h-10 mx-auto mb-2 text-emerald-400" />
            <h4 className="text-sm font-bold text-white">No Assigned Tasks</h4>
            <p className="text-xs text-slate-400 mt-1">You currently have no complaints assigned to your ward roster.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {myAssignedJobs.map((job) => {
              const isInProgress = job.status === 'in_progress';
              const isAssigned = job.status === 'assigned';
              const isAwaiting = job.status === 'awaiting_verification';

              return (
                <div 
                  key={job.id} 
                  className={`p-5 rounded-2xl bg-slate-900 border transition-all flex flex-col justify-between ${isInProgress ? 'border-amber-400/80 shadow-lg shadow-amber-400/5' : 'border-slate-800'}`}
                >
                  <div>
                    <div className="flex items-center justify-between gap-2 pb-3 border-b border-slate-800">
                      <div className="flex items-center gap-2">
                        <span className="text-base font-bold font-mono text-white">{job.id}</span>
                        <span className={`text-[10px] font-mono px-2 py-0.5 rounded uppercase ${getPriorityBadgeColor(job.priority)}`}>
                          {job.priority}
                        </span>
                      </div>
                      <span className="text-xs font-semibold text-amber-300">
                        {formatStatusLabel(job.status)}
                      </span>
                    </div>

                    <div className="grid grid-cols-3 gap-3 my-3">
                      <div className="aspect-[4/3] rounded-lg overflow-hidden bg-slate-950 border border-slate-800">
                        <img 
                          src={job.photoUrl} 
                          alt="Fault report" 
                          className="w-full h-full object-cover"
                          referrerPolicy="no-referrer"
                        />
                      </div>

                      <div className="col-span-2 text-xs space-y-1">
                        <div className="font-bold text-white">
                          {formatFaultCategory(job.faultCategory)}
                        </div>
                        <div className="text-slate-400 line-clamp-1">{job.streetName}</div>
                        <div className="text-slate-500 font-mono text-[11px]">Pole: {job.poleId || 'Untagged'}</div>
                        <div className="text-slate-500 font-mono text-[11px] truncate">
                          GPS: {job.lat.toFixed(4)}°, {job.lng.toFixed(4)}°
                        </div>
                      </div>
                    </div>

                    <p className="text-xs text-slate-400 italic bg-slate-950 p-2.5 rounded-lg border border-slate-800 line-clamp-2">
                      "{job.description}"
                    </p>
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between">
                    <button
                      onClick={() => {
                        setSelectedComplaintId(job.id);
                        setActiveTab('track');
                      }}
                      className="text-xs text-slate-400 hover:text-white"
                    >
                      View Details
                    </button>

                    {isAssigned && (
                      <button
                        onClick={() => handleStartRepair(job)}
                        className="px-4 py-2 bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-xs rounded-xl shadow-md transition-all flex items-center gap-1.5"
                      >
                        <Wrench className="w-3.5 h-3.5" />
                        <span>Accept & Start Repair</span>
                      </button>
                    )}

                    {isInProgress && (
                      <button
                        onClick={() => {
                          setActiveJob(job);
                          setEnteredPoleId(job.poleId || '');
                        }}
                        className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs rounded-xl shadow-md transition-all flex items-center gap-1.5"
                      >
                        <Camera className="w-3.5 h-3.5" />
                        <span>Complete & Submit Proof</span>
                      </button>
                    )}

                    {isAwaiting && (
                      <span className="text-xs font-mono text-purple-400">
                        Pending Authority Inspection
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

    </div>
  );
};
