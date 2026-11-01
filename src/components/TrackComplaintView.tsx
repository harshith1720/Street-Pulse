import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { 
  formatFaultCategory, 
  formatStatusLabel, 
  getPriorityBadgeColor, 
  isComplaintOverdue,
  getHoursRemaining 
} from '../utils/verification';
import { 
  Search, 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  MapPin, 
  Wrench, 
  ShieldCheck, 
  Calendar, 
  ThumbsUp, 
  ThumbsDown, 
  RefreshCw, 
  Send, 
  Star, 
  Eye, 
  FileCheck2,
  Sparkles
} from 'lucide-react';

export const TrackComplaintView: React.FC = () => {
  const { 
    complaints, 
    selectedComplaintId, 
    setSelectedComplaintId, 
    submitCitizenFeedback,
    setActiveTab 
  } = useApp();

  const [searchQuery, setSearchQuery] = useState(selectedComplaintId || '');
  const [feedbackStatus, setFeedbackStatus] = useState<'fixed_successfully' | 'still_not_working' | 'partially_fixed'>('fixed_successfully');
  const [feedbackComments, setFeedbackComments] = useState('');
  const [feedbackRating, setFeedbackRating] = useState(5);
  const [feedbackSubmitted, setFeedbackSubmitted] = useState(false);

  // Active complaint to track
  const currentComplaint = complaints.find(
    c => c.id.toLowerCase() === (selectedComplaintId || searchQuery).trim().toLowerCase()
  );

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      setSelectedComplaintId(searchQuery.trim());
    }
  };

  const handleSendFeedback = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentComplaint) return;
    submitCitizenFeedback(currentComplaint.id, feedbackStatus, feedbackComments, feedbackRating);
    setFeedbackSubmitted(true);
  };

  // Stepper milestones
  const milestones: { key: string; label: string }[] = [
    { key: 'submitted', label: 'Reported' },
    { key: 'under_review', label: 'Reviewed' },
    { key: 'assigned', label: 'Dispatched' },
    { key: 'in_progress', label: 'Repairing' },
    { key: 'awaiting_verification', label: 'Inspecting' },
    { key: 'resolved', label: 'Resolved' }
  ];

  const getMilestoneIndex = (status: string) => {
    if (status === 'submitted') return 0;
    if (status === 'under_review') return 1;
    if (status === 'assigned') return 2;
    if (status === 'in_progress') return 3;
    if (status === 'repair_completed' || status === 'awaiting_verification') return 4;
    if (status === 'resolved') return 5;
    if (status === 'reopened') return 3; // Reopened brings back to field
    return 0;
  };

  const currentIndex = currentComplaint ? getMilestoneIndex(currentComplaint.status) : -1;
  const isOverdue = currentComplaint ? isComplaintOverdue(currentComplaint) : false;

  return (
    <div className="max-w-4xl mx-auto my-8 px-4 sm:px-6">
      
      {/* Search Header */}
      <div className="p-6 sm:p-8 rounded-3xl bg-slate-900 border border-slate-800 shadow-2xl mb-8">
        <div className="text-xs font-mono text-amber-400 uppercase tracking-wider mb-2 flex items-center gap-2">
          <Search className="w-4 h-4" />
          <span>Real-Time Public Grievance Tracker</span>
        </div>
        
        <h2 className="text-2xl sm:text-3xl font-extrabold text-white">
          Track Your Streetlight Complaint
        </h2>
        
        <p className="text-xs sm:text-sm text-slate-400 mt-1">
          Enter your unique complaint reference number (e.g. SP-2026-1042) to inspect real-time progress, dispatch status, and after-repair verification photos.
        </p>

        <form onSubmit={handleSearch} className="mt-6 flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-3.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Enter Complaint ID (e.g. SP-2026-1042)..."
              className="w-full bg-slate-950 text-white placeholder-slate-600 pl-10 pr-4 py-3 rounded-xl border border-slate-800 text-sm font-mono focus:outline-none focus:border-amber-400 uppercase"
            />
          </div>
          <button
            type="submit"
            className="px-6 py-3 bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-sm rounded-xl transition-all shadow-md whitespace-nowrap"
          >
            Track Status
          </button>
        </form>

        {/* Quick select from recent tickets */}
        <div className="mt-4 pt-4 border-t border-slate-800 flex flex-wrap items-center gap-2 text-xs text-slate-400">
          <span className="font-mono text-[11px] text-slate-500">Quick track demo records:</span>
          {complaints.map((c) => (
            <button
              key={c.id}
              onClick={() => {
                setSearchQuery(c.id);
                setSelectedComplaintId(c.id);
                setFeedbackSubmitted(false);
              }}
              className={`px-2.5 py-1 rounded-lg text-xs font-mono border transition-colors ${currentComplaint?.id === c.id ? 'bg-amber-400 text-slate-950 border-amber-400 font-bold' : 'bg-slate-950 hover:bg-slate-800 text-slate-300 border-slate-800'}`}
            >
              {c.id} ({c.status})
            </button>
          ))}
        </div>
      </div>

      {/* Complaint Found View */}
      {currentComplaint ? (
        <div className="space-y-6 animate-in fade-in duration-200">
          
          {/* Main Status & SLA Banner */}
          <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-800">
              <div>
                <div className="flex items-center gap-2.5 flex-wrap">
                  <span className="text-xl sm:text-2xl font-extrabold text-white font-mono">
                    {currentComplaint.id}
                  </span>
                  
                  {/* Status Badge */}
                  <span className={`px-2.5 py-1 rounded-lg text-xs font-semibold ${currentComplaint.status === 'resolved' ? 'bg-emerald-500/10 text-emerald-300 border border-emerald-500/30' : currentComplaint.status === 'awaiting_verification' ? 'bg-purple-500/10 text-purple-300 border border-purple-500/30' : currentComplaint.status === 'reopened' ? 'bg-rose-500/10 text-rose-300 border border-rose-500/30' : 'bg-amber-500/10 text-amber-300 border border-amber-500/30'}`}>
                    {formatStatusLabel(currentComplaint.status)}
                  </span>

                  {/* Priority Badge */}
                  <span className={`px-2 py-0.5 rounded text-[11px] font-mono uppercase ${getPriorityBadgeColor(currentComplaint.priority)}`}>
                    {currentComplaint.priority} Priority
                  </span>
                </div>

                <div className="text-xs text-slate-400 mt-1 flex items-center gap-3">
                  <span>Logged: {new Date(currentComplaint.createdAt).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                  <span>·</span>
                  <span>Ward: {currentComplaint.ward}</span>
                  <span>·</span>
                  <span className="font-mono">Pole: {currentComplaint.poleId || 'Untagged'}</span>
                </div>
              </div>

              {/* SLA Target Card */}
              <div className="p-3 rounded-2xl bg-slate-950 border border-slate-800 text-right sm:min-w-[160px]">
                <div className="text-[10px] font-mono text-slate-500 uppercase">Municipal SLA</div>
                <div className="text-base font-bold font-mono text-white mt-0.5">
                  {currentComplaint.slaDeadlineHours} Hours
                </div>
                <div className="text-[11px] font-mono mt-0.5">
                  {currentComplaint.status === 'resolved' ? (
                    <span className="text-emerald-400 font-semibold">Resolved within SLA</span>
                  ) : isOverdue ? (
                    <span className="text-rose-400 font-semibold">Overdue SLA deadline</span>
                  ) : (
                    <span className="text-amber-400 font-semibold">~{Math.max(0, getHoursRemaining(currentComplaint))}h remaining</span>
                  )}
                </div>
              </div>
            </div>

            {/* Visual Milestones Stepper */}
            <div className="pt-6">
              <div className="text-xs font-mono uppercase tracking-wider text-slate-400 mb-4">
                Operational Progress Stepper
              </div>

              <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                {milestones.map((m, idx) => {
                  const isDone = idx < currentIndex || currentComplaint.status === 'resolved';
                  const isCurrent = idx === currentIndex && currentComplaint.status !== 'resolved';

                  return (
                    <div 
                      key={m.key} 
                      className={`p-3 rounded-xl border text-center transition-all ${isDone ? 'bg-emerald-950/40 border-emerald-800 text-emerald-300' : isCurrent ? 'bg-amber-400/10 border-amber-400 text-white ring-1 ring-amber-400/40' : 'bg-slate-950 border-slate-800 text-slate-600'}`}
                    >
                      <div className="w-5 h-5 mx-auto mb-1.5 rounded-full flex items-center justify-center text-[10px] font-mono font-bold">
                        {isDone ? '✓' : idx + 1}
                      </div>
                      <div className="text-[11px] font-semibold truncate">{m.label}</div>
                    </div>
                  );
                })}
              </div>
            </div>

          </div>

          {/* Details & Photographs Section */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Fault & Location Information */}
            <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl space-y-4">
              <h3 className="text-sm font-bold font-mono text-white uppercase tracking-wider">
                Fault Specifications
              </h3>

              <div className="space-y-3 text-xs">
                <div className="flex justify-between py-1.5 border-b border-slate-800">
                  <span className="text-slate-400">Fault Category</span>
                  <span className="font-semibold text-white">{formatFaultCategory(currentComplaint.faultCategory)}</span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-slate-800">
                  <span className="text-slate-400">Street Name</span>
                  <span className="font-semibold text-white text-right max-w-[200px]">{currentComplaint.streetName}</span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-slate-800">
                  <span className="text-slate-400">Area / Ward</span>
                  <span className="font-semibold text-white">{currentComplaint.area} · {currentComplaint.ward}</span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-slate-800">
                  <span className="text-slate-400">GPS Coordinates</span>
                  <span className="font-mono text-amber-400">{currentComplaint.lat.toFixed(5)}° N, {currentComplaint.lng.toFixed(5)}° E</span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-slate-800">
                  <span className="text-slate-400">Assigned Technician</span>
                  <span className="font-semibold text-sky-400">
                    {currentComplaint.assignedStaffName || 'Queued for Dispatch'}
                  </span>
                </div>
              </div>

              <div className="pt-2">
                <div className="text-xs text-slate-400 mb-1">Citizen Description:</div>
                <p className="text-xs text-slate-200 bg-slate-950 p-3 rounded-xl border border-slate-800 leading-relaxed italic">
                  "{currentComplaint.description}"
                </p>
              </div>
            </div>

            {/* Photographic Evidence Card */}
            <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl">
              <h3 className="text-sm font-bold font-mono text-white uppercase tracking-wider mb-4">
                Photographic Audit Evidence
              </h3>

              {currentComplaint.repairDetails?.afterPhotoUrl ? (
                // Side-by-side Before and After Evidence
                <div className="space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <div className="text-[10px] font-mono text-rose-400 mb-1">BEFORE (REPORTED)</div>
                      <div className="aspect-[4/3] rounded-xl overflow-hidden bg-slate-950 border border-slate-800">
                        <img 
                          src={currentComplaint.photoUrl} 
                          alt="Reported broken streetlight" 
                          className="w-full h-full object-cover"
                          referrerPolicy="no-referrer"
                        />
                      </div>
                    </div>

                    <div>
                      <div className="text-[10px] font-mono text-emerald-400 mb-1">AFTER (REPAIRED)</div>
                      <div className="aspect-[4/3] rounded-xl overflow-hidden bg-slate-950 border border-slate-800">
                        <img 
                          src={currentComplaint.repairDetails.afterPhotoUrl} 
                          alt="After repair proof" 
                          className="w-full h-full object-cover"
                          referrerPolicy="no-referrer"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs">
                    <div className="font-semibold text-emerald-400 flex items-center gap-1.5">
                      <FileCheck2 className="w-4 h-4" />
                      <span>Technician Repair Notes:</span>
                    </div>
                    <p className="text-slate-300 mt-1 text-[11px] leading-relaxed">
                      {currentComplaint.repairDetails.notes}
                    </p>
                    {currentComplaint.repairDetails.sparePartsUsed && currentComplaint.repairDetails.sparePartsUsed.length > 0 && (
                      <div className="mt-2 text-[10px] font-mono text-slate-400">
                        Replaced: {currentComplaint.repairDetails.sparePartsUsed.join(', ')}
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                // Only Reported Photo Available So Far
                <div>
                  <div className="text-[10px] font-mono text-slate-400 mb-2">INITIAL REPORT PHOTOGRAPH</div>
                  <div className="aspect-[16/10] rounded-xl overflow-hidden bg-slate-950 border border-slate-800 relative">
                    <img 
                      src={currentComplaint.photoUrl} 
                      alt="Reported streetlight" 
                      className="w-full h-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                    <div className="absolute bottom-2 right-2 px-2 py-1 bg-slate-950/80 backdrop-blur-sm rounded text-[10px] font-mono text-slate-300">
                      Geotagged
                    </div>
                  </div>
                  <p className="text-xs text-slate-400 mt-3 text-center italic">
                    After-repair verification photograph will be published here once field maintenance concludes.
                  </p>
                </div>
              )}
            </div>

          </div>

          {/* Audit Timeline */}
          <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl">
            <h3 className="text-sm font-bold font-mono text-white uppercase tracking-wider mb-4 flex items-center gap-2">
              <Clock className="w-4 h-4 text-amber-400" />
              <span>Municipal Audit Log & Status History</span>
            </h3>

            <div className="space-y-4 pl-2 border-l-2 border-slate-800 ml-2">
              {currentComplaint.timeline.map((item, idx) => (
                <div key={idx} className="relative pl-6">
                  <span className="absolute -left-[1.35rem] top-1 w-3 h-3 rounded-full bg-amber-400 border-2 border-slate-900" />
                  <div className="flex items-center gap-2 text-xs">
                    <span className="font-bold text-white uppercase">{formatStatusLabel(item.status)}</span>
                    <span className="text-slate-500 font-mono text-[11px]">
                      {new Date(item.timestamp).toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                    </span>
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-400 font-mono">
                      {item.updatedBy}
                    </span>
                  </div>
                  {item.notes && (
                    <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                      {item.notes}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Citizen Feedback Loop (Rule from Prompt: allows citizen confirmation; if still not working, reopens ticket!) */}
          {(currentComplaint.status === 'resolved' || currentComplaint.status === 'awaiting_verification' || currentComplaint.status === 'repair_completed') && (
            <div className="p-6 sm:p-8 rounded-3xl bg-slate-900 border border-slate-800 shadow-2xl">
              <div className="flex items-center gap-2 text-xs font-mono text-amber-400 uppercase tracking-wider mb-1">
                <CheckCircle2 className="w-4 h-4" />
                <span>Citizen Verification & Confirmation Loop</span>
              </div>
              <h3 className="text-lg font-bold text-white">
                Does the streetlight work at night now?
              </h3>
              <p className="text-xs text-slate-400 mt-1">
                Help your community verify the repair. If you report the light is still not working, StreetPulse will immediately reopen this complaint for emergency supervisor reinspection.
              </p>

              {feedbackSubmitted || currentComplaint.citizenFeedback ? (
                <div className="mt-4 p-4 rounded-2xl bg-slate-950 border border-slate-800 text-xs">
                  <div className="font-semibold text-emerald-400 flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Citizen Feedback Recorded</span>
                  </div>
                  <p className="text-slate-300 mt-1">
                    Status: <span className="font-mono text-amber-300 font-bold">{currentComplaint.citizenFeedback?.status || feedbackStatus}</span>
                  </p>
                  {currentComplaint.citizenFeedback?.comments && (
                    <p className="text-slate-400 mt-1 italic">
                      "{currentComplaint.citizenFeedback.comments}"
                    </p>
                  )}
                </div>
              ) : (
                <form onSubmit={handleSendFeedback} className="mt-4 space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <button
                      type="button"
                      onClick={() => setFeedbackStatus('fixed_successfully')}
                      className={`p-3 rounded-xl border text-left transition-all ${feedbackStatus === 'fixed_successfully' ? 'bg-emerald-950/60 border-emerald-500 text-emerald-200 ring-1 ring-emerald-500' : 'bg-slate-950 border-slate-800 text-slate-300'}`}
                    >
                      <ThumbsUp className="w-4 h-4 text-emerald-400 mb-1" />
                      <div className="text-xs font-bold">Fixed Successfully</div>
                      <div className="text-[10px] text-slate-400">Streetlight is bright & steady</div>
                    </button>

                    <button
                      type="button"
                      onClick={() => setFeedbackStatus('still_not_working')}
                      className={`p-3 rounded-xl border text-left transition-all ${feedbackStatus === 'still_not_working' ? 'bg-rose-950/60 border-rose-500 text-rose-200 ring-1 ring-rose-500' : 'bg-slate-950 border-slate-800 text-slate-300'}`}
                    >
                      <ThumbsDown className="w-4 h-4 text-rose-400 mb-1" />
                      <div className="text-xs font-bold">Still Not Working</div>
                      <div className="text-[10px] text-rose-300/80">Reopen complaint immediately</div>
                    </button>

                    <button
                      type="button"
                      onClick={() => setFeedbackStatus('partially_fixed')}
                      className={`p-3 rounded-xl border text-left transition-all ${feedbackStatus === 'partially_fixed' ? 'bg-amber-950/60 border-amber-500 text-amber-200 ring-1 ring-amber-500' : 'bg-slate-950 border-slate-800 text-slate-300'}`}
                    >
                      <RefreshCw className="w-4 h-4 text-amber-400 mb-1" />
                      <div className="text-xs font-bold">Partially Fixed</div>
                      <div className="text-[10px] text-slate-400">Flickers or dim light</div>
                    </button>
                  </div>

                  <div>
                    <label className="block text-[11px] text-slate-400 mb-1">Your Comments (Optional)</label>
                    <input
                      type="text"
                      value={feedbackComments}
                      onChange={(e) => setFeedbackComments(e.target.value)}
                      placeholder="e.g. Verified yesterday night, road is safely illuminated now."
                      className="w-full bg-slate-950 text-white placeholder-slate-600 px-3 py-2 rounded-xl border border-slate-800 text-xs focus:outline-none focus:border-amber-400"
                    />
                  </div>

                  <button
                    type="submit"
                    className="px-6 py-2.5 bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-xs rounded-xl transition-all shadow-md flex items-center gap-2"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>Submit Citizen Confirmation</span>
                  </button>
                </form>
              )}
            </div>
          )}

        </div>
      ) : (
        <div className="p-12 rounded-3xl bg-slate-900 border border-slate-800 text-center">
          <AlertCircle className="w-10 h-10 text-slate-500 mx-auto mb-3" />
          <h3 className="text-base font-bold text-white">No Complaint Found</h3>
          <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
            Please check the reference ID or select one of the demonstration records above.
          </p>
        </div>
      )}

    </div>
  );
};
