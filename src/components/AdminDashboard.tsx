import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { 
  Complaint, 
  ComplaintStatus, 
  PriorityLevel, 
  StaffMember, 
  StreetlightPole 
} from '../types';
import { 
  formatFaultCategory, 
  formatStatusLabel, 
  getPriorityBadgeColor, 
  isComplaintOverdue,
  performMultiLayerVerification 
} from '../utils/verification';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  ResponsiveContainer, 
  PieChart, 
  Pie, 
  Cell, 
  AreaChart, 
  Area 
} from 'recharts';
import { 
  ShieldCheck, 
  Users, 
  AlertTriangle, 
  CheckCircle2, 
  Clock, 
  Layers, 
  Download, 
  Search, 
  Filter, 
  Plus, 
  Wrench, 
  QrCode, 
  ArrowUpDown, 
  Eye, 
  AlertCircle, 
  Check, 
  X, 
  ExternalLink,
  MapPin
} from 'lucide-react';

export const AdminDashboard: React.FC = () => {
  const { 
    complaints, 
    staff, 
    poles, 
    assignStaff, 
    updatePriority, 
    updateComplaintStatus, 
    verifyRepair, 
    addPole, 
    exportComplaintsCsv,
    setSelectedComplaintId,
    setActiveTab 
  } = useApp();

  const [activeAdminSubTab, setActiveAdminSubTab] = useState<'complaints' | 'analytics' | 'verification' | 'staff' | 'poles'>('complaints');
  
  // Table search & filters
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [wardFilter, setWardFilter] = useState('all');

  // Modals
  const [selectedVerificationComplaint, setSelectedVerificationComplaint] = useState<Complaint | null>(null);
  const [verifierNotes, setVerifierNotes] = useState('');
  const [selectedPoleForQr, setSelectedPoleForQr] = useState<StreetlightPole | null>(null);
  const [showAddPoleModal, setShowAddPoleModal] = useState(false);
  const [newPoleForm, setNewPoleForm] = useState({
    id: `SP-POLE-W04-0${Math.floor(20 + Math.random() * 80)}`,
    streetName: '',
    area: 'Indiranagar',
    ward: 'Ward 04',
    lat: 12.971890,
    lng: 77.641150,
    wattage: 90,
    fixtureType: 'Philips Smart City LED 90W',
    condition: 'good' as const
  });

  // Derived Overview Counts
  const totalReports = complaints.length;
  const pendingCount = complaints.filter(c => c.status === 'submitted' || c.status === 'under_review').length;
  const inProgressCount = complaints.filter(c => c.status === 'assigned' || c.status === 'in_progress').length;
  const awaitingVerificationCount = complaints.filter(c => c.status === 'awaiting_verification' || c.status === 'repair_completed').length;
  const resolvedCount = complaints.filter(c => c.status === 'resolved').length;
  const overdueCount = complaints.filter(c => isComplaintOverdue(c)).length;
  const activeStaffCount = staff.filter(s => s.status === 'active').length;

  // Analytics Data
  const complaintsByWard = [
    { name: 'Ward 01 (CBD)', count: complaints.filter(c => c.ward === 'Ward 01').length },
    { name: 'Ward 04 (Indiranagar)', count: complaints.filter(c => c.ward === 'Ward 04').length },
    { name: 'Ward 08 (Malleshwaram)', count: complaints.filter(c => c.ward === 'Ward 08').length },
    { name: 'Ward 12 (Koramangala)', count: complaints.filter(c => c.ward === 'Ward 12').length }
  ];

  const categoryDistribution = [
    { name: 'Not Working', value: complaints.filter(c => c.faultCategory === 'light_not_working').length, color: '#f59e0b' },
    { name: 'Flickering', value: complaints.filter(c => c.faultCategory === 'flickering').length, color: '#38bdf8' },
    { name: 'Broken Wiring', value: complaints.filter(c => c.faultCategory === 'broken_wiring').length, color: '#f43f5e' },
    { name: 'Damaged Pole', value: complaints.filter(c => c.faultCategory === 'damaged_pole').length, color: '#a855f7' },
    { name: 'Dim Light', value: complaints.filter(c => c.faultCategory === 'dim_illumination').length, color: '#34d399' }
  ].filter(item => item.value > 0);

  const resolutionTrendData = [
    { month: 'Jul', reported: 24, resolved: 22 },
    { month: 'Aug', reported: 31, resolved: 29 },
    { month: 'Sep', reported: 38, resolved: 36 },
    { month: 'Oct', reported: 45, resolved: 41 },
    { month: 'Nov (Current)', reported: totalReports, resolved: resolvedCount }
  ];

  // Filter complaints table
  const filteredComplaints = complaints.filter(c => {
    if (statusFilter !== 'all' && c.status !== statusFilter) return false;
    if (priorityFilter !== 'all' && c.priority !== priorityFilter) return false;
    if (wardFilter !== 'all' && c.ward !== wardFilter) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const match = c.id.toLowerCase().includes(q) ||
                    c.streetName.toLowerCase().includes(q) ||
                    c.area.toLowerCase().includes(q) ||
                    (c.assignedStaffName && c.assignedStaffName.toLowerCase().includes(q)) ||
                    (c.poleId && c.poleId.toLowerCase().includes(q));
      if (!match) return false;
    }
    return true;
  });

  const handleAddPoleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPoleForm.streetName.trim()) {
      alert('Street name is required.');
      return;
    }
    addPole({
      id: newPoleForm.id,
      streetName: newPoleForm.streetName.trim(),
      area: newPoleForm.area,
      ward: newPoleForm.ward,
      lat: Number(newPoleForm.lat),
      lng: Number(newPoleForm.lng),
      installationDate: new Date().toISOString().split('T')[0],
      condition: newPoleForm.condition,
      lastMaintenanceDate: new Date().toISOString(),
      wattage: Number(newPoleForm.wattage),
      fixtureType: newPoleForm.fixtureType
    });
    setShowAddPoleModal(false);
  };

  return (
    <div className="max-w-7xl mx-auto my-6 px-4 sm:px-6 lg:px-8 space-y-6">
      
      {/* Admin Title & Quick Actions */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <div className="text-xs font-mono text-sky-400 uppercase tracking-wider flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4" />
            <span>Municipal Control Room Console · Bruhat Bengaluru Mahanagara Palike</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white mt-1">
            Authority Operations Dashboard
          </h2>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={exportComplaintsCsv}
            className="px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-slate-200 text-xs font-medium rounded-xl border border-slate-700 transition-colors flex items-center gap-1.5 shadow-sm"
          >
            <Download className="w-3.5 h-3.5 text-amber-400" />
            <span>Export CSV Report</span>
          </button>

          <button
            onClick={() => setActiveAdminSubTab('verification')}
            className="px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold rounded-xl transition-all shadow-md flex items-center gap-1.5"
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>Verification Queue ({awaitingVerificationCount})</span>
          </button>
        </div>
      </div>

      {/* KPI Overview Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        
        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800">
          <div className="text-[11px] font-mono text-slate-400 uppercase">Total Reports</div>
          <div className="text-2xl font-bold font-mono text-white mt-1 tabular-nums">{totalReports}</div>
          <div className="text-[10px] text-slate-500 mt-1">Across 4 wards</div>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800">
          <div className="text-[11px] font-mono text-amber-400 uppercase">Pending Review</div>
          <div className="text-2xl font-bold font-mono text-amber-300 mt-1 tabular-nums">{pendingCount}</div>
          <div className="text-[10px] text-slate-500 mt-1">Awaiting dispatch</div>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800">
          <div className="text-[11px] font-mono text-sky-400 uppercase">In Progress</div>
          <div className="text-2xl font-bold font-mono text-sky-300 mt-1 tabular-nums">{inProgressCount}</div>
          <div className="text-[10px] text-slate-500 mt-1">With field crews</div>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800">
          <div className="text-[11px] font-mono text-purple-400 uppercase">Needs Verification</div>
          <div className="text-2xl font-bold font-mono text-purple-300 mt-1 tabular-nums">{awaitingVerificationCount}</div>
          <div className="text-[10px] text-purple-400/80 mt-1">Audit required</div>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800">
          <div className="text-[11px] font-mono text-emerald-400 uppercase">Resolved</div>
          <div className="text-2xl font-bold font-mono text-emerald-300 mt-1 tabular-nums">{resolvedCount}</div>
          <div className="text-[10px] text-emerald-400/80 mt-1">
            {totalReports > 0 ? `${Math.round((resolvedCount / totalReports) * 100)}% verified` : '0%'}
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800">
          <div className="text-[11px] font-mono text-rose-400 uppercase">Overdue SLA</div>
          <div className="text-2xl font-bold font-mono text-rose-300 mt-1 tabular-nums">{overdueCount}</div>
          <div className="text-[10px] text-rose-400/80 mt-1">Critical escalation</div>
        </div>

      </div>

      {/* Admin Subtabs Navigation */}
      <div className="flex items-center gap-1 p-1 bg-slate-900 border border-slate-800 rounded-xl overflow-x-auto text-xs font-medium">
        <button
          onClick={() => setActiveAdminSubTab('complaints')}
          className={`px-4 py-2 rounded-lg transition-colors whitespace-nowrap ${activeAdminSubTab === 'complaints' ? 'bg-slate-800 text-white font-bold shadow-sm' : 'text-slate-400 hover:text-white'}`}
        >
          Complaint Management ({complaints.length})
        </button>

        <button
          onClick={() => setActiveAdminSubTab('verification')}
          className={`px-4 py-2 rounded-lg transition-colors whitespace-nowrap flex items-center gap-1.5 ${activeAdminSubTab === 'verification' ? 'bg-purple-900/60 text-purple-200 border border-purple-700 font-bold shadow-sm' : 'text-slate-400 hover:text-white'}`}
        >
          <CheckCircle2 className="w-3.5 h-3.5 text-purple-400" />
          <span>Smart Verification Queue ({awaitingVerificationCount})</span>
        </button>

        <button
          onClick={() => setActiveAdminSubTab('analytics')}
          className={`px-4 py-2 rounded-lg transition-colors whitespace-nowrap ${activeAdminSubTab === 'analytics' ? 'bg-slate-800 text-white font-bold shadow-sm' : 'text-slate-400 hover:text-white'}`}
        >
          Analytics & Performance
        </button>

        <button
          onClick={() => setActiveAdminSubTab('staff')}
          className={`px-4 py-2 rounded-lg transition-colors whitespace-nowrap ${activeAdminSubTab === 'staff' ? 'bg-slate-800 text-white font-bold shadow-sm' : 'text-slate-400 hover:text-white'}`}
        >
          Field Staff ({staff.length})
        </button>

        <button
          onClick={() => setActiveAdminSubTab('poles')}
          className={`px-4 py-2 rounded-lg transition-colors whitespace-nowrap ${activeAdminSubTab === 'poles' ? 'bg-slate-800 text-white font-bold shadow-sm' : 'text-slate-400 hover:text-white'}`}
        >
          Streetlight Pole Registry ({poles.length})
        </button>
      </div>

      {/* Subtab 1: Complaint Management Table */}
      {activeAdminSubTab === 'complaints' && (
        <div className="space-y-4">
          
          {/* Table Filters */}
          <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="flex-1 min-w-[220px]">
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-2.5" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Filter by complaint ID, street, pole or crew..."
                  className="w-full bg-slate-950 text-white placeholder-slate-600 pl-8 pr-3 py-2 rounded-xl border border-slate-800 focus:outline-none focus:border-amber-400"
                />
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="bg-slate-950 text-slate-200 px-3 py-2 rounded-xl border border-slate-800 focus:outline-none"
              >
                <option value="all">All Statuses</option>
                <option value="submitted">Submitted</option>
                <option value="under_review">Under Review</option>
                <option value="assigned">Assigned</option>
                <option value="in_progress">In Progress</option>
                <option value="awaiting_verification">Awaiting Verification</option>
                <option value="resolved">Resolved</option>
                <option value="reopened">Reopened</option>
              </select>

              <select
                value={priorityFilter}
                onChange={(e) => setPriorityFilter(e.target.value)}
                className="bg-slate-950 text-slate-200 px-3 py-2 rounded-xl border border-slate-800 focus:outline-none"
              >
                <option value="all">All Priorities</option>
                <option value="emergency">Emergency</option>
                <option value="high">High</option>
                <option value="medium">Medium</option>
                <option value="low">Low</option>
              </select>

              <select
                value={wardFilter}
                onChange={(e) => setWardFilter(e.target.value)}
                className="bg-slate-950 text-slate-200 px-3 py-2 rounded-xl border border-slate-800 focus:outline-none"
              >
                <option value="all">All Wards</option>
                <option value="Ward 01">Ward 01 (CBD)</option>
                <option value="Ward 04">Ward 04 (Indiranagar)</option>
                <option value="Ward 08">Ward 08 (Malleshwaram)</option>
                <option value="Ward 12">Ward 12 (Koramangala)</option>
              </select>
            </div>
          </div>

          {/* Table Container */}
          <div className="rounded-2xl bg-slate-900 border border-slate-800 shadow-2xl overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-950 text-slate-400 font-mono text-[11px] uppercase border-b border-slate-800">
                <tr>
                  <th className="py-3.5 px-4">Complaint ID</th>
                  <th className="py-3.5 px-4">Fault & Area</th>
                  <th className="py-3.5 px-4">Pole ID</th>
                  <th className="py-3.5 px-4">Reported</th>
                  <th className="py-3.5 px-4">Priority</th>
                  <th className="py-3.5 px-4">Assigned Crew</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {filteredComplaints.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="py-12 text-center text-slate-500">
                      No complaints matched the criteria.
                    </td>
                  </tr>
                ) : (
                  filteredComplaints.map((c) => {
                    const isOverdueItem = isComplaintOverdue(c);

                    return (
                      <tr key={c.id} className="hover:bg-slate-800/60 transition-colors">
                        <td className="py-3.5 px-4 font-mono font-bold text-white">
                          <button
                            onClick={() => {
                              setSelectedComplaintId(c.id);
                              setActiveTab('track');
                            }}
                            className="hover:text-amber-400 hover:underline text-left"
                          >
                            {c.id}
                          </button>
                        </td>

                        <td className="py-3.5 px-4">
                          <div className="font-semibold text-slate-200">
                            {formatFaultCategory(c.faultCategory)}
                          </div>
                          <div className="text-[11px] text-slate-400 truncate max-w-[180px]">
                            {c.streetName}, {c.area}
                          </div>
                        </td>

                        <td className="py-3.5 px-4 font-mono text-slate-300">
                          {c.poleId || <span className="text-slate-600">Untagged</span>}
                        </td>

                        <td className="py-3.5 px-4 text-slate-400 font-mono text-[11px]">
                          {new Date(c.createdAt).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                        </td>

                        <td className="py-3.5 px-4">
                          <select
                            value={c.priority}
                            onChange={(e) => updatePriority(c.id, e.target.value as PriorityLevel)}
                            className={`text-[10px] font-mono px-2 py-0.5 rounded border focus:outline-none ${getPriorityBadgeColor(c.priority)}`}
                          >
                            <option value="low">LOW</option>
                            <option value="medium">MEDIUM</option>
                            <option value="high">HIGH</option>
                            <option value="emergency">EMERGENCY</option>
                          </select>
                          {isOverdueItem && (
                            <div className="text-[9px] font-mono text-rose-400 mt-0.5">SLA BREACHED</div>
                          )}
                        </td>

                        <td className="py-3.5 px-4">
                          <select
                            value={c.assignedStaffId || ''}
                            onChange={(e) => assignStaff(c.id, e.target.value)}
                            className="bg-slate-950 text-slate-300 text-[11px] px-2 py-1 rounded border border-slate-700 focus:outline-none"
                          >
                            <option value="">Unassigned (Queue)</option>
                            {staff.map(s => (
                              <option key={s.id} value={s.id}>
                                {s.name} ({s.wardAssigned})
                              </option>
                            ))}
                          </select>
                        </td>

                        <td className="py-3.5 px-4">
                          <select
                            value={c.status}
                            onChange={(e) => updateComplaintStatus(c.id, e.target.value as ComplaintStatus, 'Authority Admin', 'Manual status update via Admin Console')}
                            className="bg-slate-950 text-slate-200 text-[11px] px-2 py-1 rounded border border-slate-700 focus:outline-none font-medium"
                          >
                            <option value="submitted">Submitted</option>
                            <option value="under_review">Under Review</option>
                            <option value="assigned">Assigned</option>
                            <option value="in_progress">In Progress</option>
                            <option value="awaiting_verification">Awaiting Verification</option>
                            <option value="resolved">Resolved</option>
                            <option value="rejected">Rejected</option>
                            <option value="reopened">Reopened</option>
                          </select>
                        </td>

                        <td className="py-3.5 px-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            {c.status === 'awaiting_verification' && (
                              <button
                                onClick={() => {
                                  setSelectedVerificationComplaint(c);
                                  setActiveAdminSubTab('verification');
                                }}
                                className="px-2 py-1 bg-purple-600 hover:bg-purple-500 text-white rounded text-[11px] font-semibold"
                                title="Inspect repair evidence"
                              >
                                Verify
                              </button>
                            )}

                            <button
                              onClick={() => {
                                setSelectedComplaintId(c.id);
                                setActiveTab('track');
                              }}
                              className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded transition-colors"
                              title="View Full Ticket"
                            >
                              <ExternalLink className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

        </div>
      )}

      {/* Subtab 2: Smart Repair Verification System (Differentiating Feature) */}
      {activeAdminSubTab === 'verification' && (
        <div className="space-y-6">
          
          <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl">
            <div className="flex items-center gap-2 text-xs font-mono text-purple-400 uppercase tracking-wider mb-1">
              <CheckCircle2 className="w-4 h-4" />
              <span>Multi-Layer Verification Protocol Engine</span>
            </div>
            <h3 className="text-xl font-bold text-white">
              Inspection Queue & Repair Evidence Audit
            </h3>
            <p className="text-xs text-slate-400 mt-1 max-w-2xl">
              Linemen and electricians submit on-site photographs, entered pole tags, and GPS coordinates. Municipal administrators audit this multi-layer proof before marking complaints as officially resolved.
            </p>
          </div>

          {/* Pending verification cards */}
          <div className="space-y-4">
            {complaints.filter(c => c.status === 'awaiting_verification' || c.status === 'repair_completed').length === 0 ? (
              <div className="p-12 rounded-3xl bg-slate-900 border border-slate-800 text-center text-slate-500">
                <CheckCircle2 className="w-10 h-10 mx-auto mb-2 text-emerald-400" />
                <h4 className="text-sm font-bold text-white">All Clear</h4>
                <p className="text-xs text-slate-400 mt-1">No pending repairs awaiting inspection right now.</p>
              </div>
            ) : (
              complaints.filter(c => c.status === 'awaiting_verification' || c.status === 'repair_completed').map((c) => {
                const registeredPole = poles.find(p => p.id === c.poleId);
                const verificationCheck = performMultiLayerVerification(c, registeredPole, c.repairDetails, 40);

                return (
                  <div key={c.id} className="p-6 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl space-y-5">
                    
                    {/* Header info */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-800">
                      <div>
                        <div className="flex items-center gap-3">
                          <span className="text-lg font-bold font-mono text-white">{c.id}</span>
                          <span className="text-xs px-2.5 py-0.5 rounded-full bg-purple-950 text-purple-300 border border-purple-800 font-mono">
                            Awaiting Municipal Sign-Off
                          </span>
                        </div>
                        <div className="text-xs text-slate-400 mt-1">
                          {c.streetName}, {c.ward} · Repaired by <b>{c.repairDetails?.staffName || c.assignedStaffName}</b>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <div className="text-right">
                          <div className="text-[10px] font-mono text-slate-500">INTEGRITY SCORE</div>
                          <div className={`text-xl font-bold font-mono ${verificationCheck.overallScore >= 80 ? 'text-emerald-400' : 'text-amber-400'}`}>
                            {verificationCheck.overallScore}/100
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* 3 Verification Layers Evaluation */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                      
                      {/* Layer 1: Pole Match */}
                      <div className={`p-3.5 rounded-xl border text-xs ${verificationCheck.poleMatch ? 'bg-emerald-950/40 border-emerald-800 text-emerald-200' : 'bg-rose-950/60 border-rose-800 text-rose-200'}`}>
                        <div className="font-mono text-[10px] uppercase font-bold">Layer 1: Pole ID Match</div>
                        <div className="text-xs font-semibold mt-1">
                          {verificationCheck.poleMatch ? '✓ Verified Matching Pole' : '⚠ Mismatched Pole ID'}
                        </div>
                        <div className="text-[11px] text-slate-400 mt-1 font-mono">
                          Reported: {c.poleId || 'N/A'}<br/>
                          Staff Tagged: {c.repairDetails?.enteredPoleId || 'N/A'}
                        </div>
                      </div>

                      {/* Layer 2: GPS Telemetry Delta */}
                      <div className={`p-3.5 rounded-xl border text-xs ${verificationCheck.gpsPassed ? 'bg-emerald-950/40 border-emerald-800 text-emerald-200' : 'bg-amber-950/60 border-amber-800 text-amber-200'}`}>
                        <div className="font-mono text-[10px] uppercase font-bold">Layer 2: GPS Proximity</div>
                        <div className="text-xs font-semibold mt-1">
                          {verificationCheck.gpsPassed ? `✓ Within ${verificationCheck.gpsDistanceMeters}m (Pass)` : `⚠ ${verificationCheck.gpsDistanceMeters}m Away (> 40m)`}
                        </div>
                        <div className="text-[11px] text-slate-400 mt-1 font-mono">
                          Threshold: 40 meters
                        </div>
                      </div>

                      {/* Layer 3: Photographic Evidence */}
                      <div className={`p-3.5 rounded-xl border text-xs ${verificationCheck.photoProvided ? 'bg-emerald-950/40 border-emerald-800 text-emerald-200' : 'bg-rose-950/60 border-rose-800 text-rose-200'}`}>
                        <div className="font-mono text-[10px] uppercase font-bold">Layer 3: Photo Proof</div>
                        <div className="text-xs font-semibold mt-1">
                          {verificationCheck.photoProvided ? '✓ After-Repair Photo Present' : '✕ Missing After Photo'}
                        </div>
                        <div className="text-[11px] text-slate-400 mt-1">
                          Side-by-side audited
                        </div>
                      </div>

                    </div>

                    {/* Side-by-side Visual Inspection */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <div className="text-xs font-mono text-rose-400 mb-1.5 font-bold">BEFORE (ORIGINAL COMPLAINT)</div>
                        <div className="aspect-[4/3] rounded-xl overflow-hidden bg-slate-950 border border-slate-800">
                          <img
                            src={c.photoUrl}
                            alt="Before repair"
                            className="w-full h-full object-cover"
                            referrerPolicy="no-referrer"
                          />
                        </div>
                      </div>

                      <div>
                        <div className="text-xs font-mono text-emerald-400 mb-1.5 font-bold">AFTER (SUBMITTED BY TECHNICIAN)</div>
                        <div className="aspect-[4/3] rounded-xl overflow-hidden bg-slate-950 border border-slate-800">
                          <img
                            src={c.repairDetails?.afterPhotoUrl || ''}
                            alt="After repair proof"
                            className="w-full h-full object-cover"
                            referrerPolicy="no-referrer"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Technician Notes */}
                    <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 text-xs">
                      <div className="font-semibold text-slate-300">Technician Maintenance Notes:</div>
                      <p className="text-slate-400 mt-0.5 leading-relaxed italic">
                        "{c.repairDetails?.notes}"
                      </p>
                      {c.repairDetails?.sparePartsUsed && (
                        <div className="text-[11px] text-amber-300/80 mt-1 font-mono">
                          Replaced parts: {c.repairDetails.sparePartsUsed.join(', ')}
                        </div>
                      )}
                    </div>

                    {/* Admin Verification Decision Actions */}
                    <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 border-t border-slate-800">
                      <input
                        type="text"
                        placeholder="Add inspector verification notes (e.g. Luminaire confirmed functional; lux level verified)..."
                        value={verifierNotes}
                        onChange={(e) => setVerifierNotes(e.target.value)}
                        className="flex-1 bg-slate-950 text-white placeholder-slate-600 px-3 py-2 rounded-xl border border-slate-800 text-xs focus:outline-none focus:border-amber-400"
                      />

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => {
                            verifyRepair(c.id, 'rejected', 'Municipal Inspector K. Reddy', verifierNotes || 'Evidence rejected by inspector');
                            setVerifierNotes('');
                          }}
                          className="px-4 py-2 bg-rose-950 hover:bg-rose-900 text-rose-300 border border-rose-800 text-xs font-semibold rounded-xl transition-colors"
                        >
                          Reject Repair
                        </button>

                        <button
                          onClick={() => {
                            verifyRepair(c.id, 'additional_evidence_requested', 'Municipal Inspector K. Reddy', verifierNotes || 'Please upload a clearer daytime photo of luminaire');
                            setVerifierNotes('');
                          }}
                          className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-semibold rounded-xl transition-colors"
                        >
                          Request Evidence
                        </button>

                        <button
                          onClick={() => {
                            verifyRepair(c.id, 'approved', 'Municipal Inspector K. Reddy', verifierNotes || 'Repair approved and validated');
                            setVerifierNotes('');
                          }}
                          className="px-5 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs rounded-xl transition-all shadow-md flex items-center gap-1.5"
                        >
                          <Check className="w-3.5 h-3.5" />
                          <span>Approve & Resolve</span>
                        </button>
                      </div>
                    </div>

                  </div>
                );
              })
            )}
          </div>

        </div>
      )}

      {/* Subtab 3: Analytics & Recharts Data Visualization */}
      {activeAdminSubTab === 'analytics' && (
        <div className="space-y-6">
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            
            {/* Resolution Trend Chart */}
            <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl">
              <h3 className="text-sm font-bold font-mono text-white uppercase tracking-wider mb-1">
                Complaints Intake vs. Resolutions
              </h3>
              <p className="text-xs text-slate-400 mb-6">Historical municipal resolution efficiency</p>

              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={resolutionTrendData}>
                    <defs>
                      <linearGradient id="colorReported" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.4}/>
                        <stop offset="95%" stopColor="#f59e0b" stopOpacity={0}/>
                      </linearGradient>
                      <linearGradient id="colorResolved" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.4}/>
                        <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <XAxis dataKey="month" stroke="#64748b" fontSize={11} />
                    <YAxis stroke="#64748b" fontSize={11} />
                    <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '0.75rem', fontSize: '12px' }} />
                    <Area type="monotone" dataKey="reported" stroke="#f59e0b" fillOpacity={1} fill="url(#colorReported)" name="Reported" />
                    <Area type="monotone" dataKey="resolved" stroke="#10b981" fillOpacity={1} fill="url(#colorResolved)" name="Resolved" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Category Distribution Pie Chart */}
            <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl">
              <h3 className="text-sm font-bold font-mono text-white uppercase tracking-wider mb-1">
                Fault Category Breakdown
              </h3>
              <p className="text-xs text-slate-400 mb-6">Proportion of reported defect types</p>

              <div className="h-64 flex items-center justify-center">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={categoryDistribution}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      innerRadius={45}
                      paddingAngle={3}
                    >
                      {categoryDistribution.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '0.75rem', fontSize: '12px' }} />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              <div className="flex flex-wrap justify-center gap-4 mt-2 text-xs">
                {categoryDistribution.map((c, idx) => (
                  <div key={idx} className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: c.color }} />
                    <span className="text-slate-300">{c.name} ({c.value})</span>
                  </div>
                ))}
              </div>
            </div>

          </div>

          {/* Ward-wise Complaints Bar Chart */}
          <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl">
            <h3 className="text-sm font-bold font-mono text-white uppercase tracking-wider mb-1">
              Complaints by Municipal Ward
            </h3>
            <p className="text-xs text-slate-400 mb-6">Geographic concentration of current complaints</p>

            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={complaintsByWard}>
                  <XAxis dataKey="name" stroke="#64748b" fontSize={11} />
                  <YAxis stroke="#64748b" fontSize={11} />
                  <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '0.75rem', fontSize: '12px' }} />
                  <Bar dataKey="count" fill="#38bdf8" radius={[6, 6, 0, 0]} name="Complaints Count" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

        </div>
      )}

      {/* Subtab 4: Staff Management */}
      {activeAdminSubTab === 'staff' && (
        <div className="space-y-4">
          
          <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl flex items-center justify-between">
            <div>
              <h3 className="text-lg font-bold text-white">Maintenance Field Crews</h3>
              <p className="text-xs text-slate-400 mt-0.5">Assigned technicians, electricians, and supervisors</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {staff.map((s) => (
              <div key={s.id} className="p-5 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono text-slate-500">{s.id}</span>
                  <span className={`text-[10px] font-mono px-2 py-0.5 rounded ${s.status === 'active' ? 'bg-emerald-950 text-emerald-300 border border-emerald-800' : 'bg-slate-800 text-slate-400'}`}>
                    {s.status.toUpperCase()}
                  </span>
                </div>

                <div>
                  <h4 className="text-sm font-bold text-white">{s.name}</h4>
                  <div className="text-xs text-amber-400 capitalize font-medium">{s.role.replace('_', ' ')}</div>
                  <div className="text-xs text-slate-400 mt-1">{s.wardAssigned}</div>
                </div>

                <div className="pt-2 border-t border-slate-800 grid grid-cols-2 gap-2 text-center text-xs">
                  <div className="p-2 rounded-lg bg-slate-950 border border-slate-800">
                    <div className="text-[10px] font-mono text-slate-500">ACTIVE</div>
                    <div className="font-bold text-amber-300 font-mono mt-0.5">{s.activeJobsCount}</div>
                  </div>
                  <div className="p-2 rounded-lg bg-slate-950 border border-slate-800">
                    <div className="text-[10px] font-mono text-slate-500">COMPLETED</div>
                    <div className="font-bold text-emerald-300 font-mono mt-0.5">{s.completedJobsCount}</div>
                  </div>
                </div>

                <div className="text-[11px] text-slate-400 font-mono pt-1">
                  📞 {s.phone}
                </div>
              </div>
            ))}
          </div>

        </div>
      )}

      {/* Subtab 5: Streetlight Pole Registry & Printable QR Codes */}
      {activeAdminSubTab === 'poles' && (
        <div className="space-y-4">
          
          <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <div className="text-xs font-mono text-amber-400 uppercase tracking-wider mb-1">
                Municipal Asset Registry
              </div>
              <h3 className="text-lg font-bold text-white">Registered Streetlight Poles</h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Official GIS inventory of poles. Generate QR code labels for on-field citizen scanning.
              </p>
            </div>

            <button
              onClick={() => setShowAddPoleModal(true)}
              className="px-4 py-2 bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-xs rounded-xl transition-all shadow-md flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" />
              <span>Register New Pole</span>
            </button>
          </div>

          <div className="rounded-2xl bg-slate-900 border border-slate-800 shadow-xl overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-950 text-slate-400 font-mono text-[11px] uppercase border-b border-slate-800">
                <tr>
                  <th className="py-3.5 px-4">Pole ID</th>
                  <th className="py-3.5 px-4">Street & Area</th>
                  <th className="py-3.5 px-4">Ward</th>
                  <th className="py-3.5 px-4">Wattage & Fixture</th>
                  <th className="py-3.5 px-4">Condition</th>
                  <th className="py-3.5 px-4">Last Maint.</th>
                  <th className="py-3.5 px-4 text-right">QR Citizen Tag</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {poles.map((p) => (
                  <tr key={p.id} className="hover:bg-slate-800/60 transition-colors">
                    <td className="py-3 px-4 font-mono font-bold text-white">
                      {p.id}
                    </td>
                    <td className="py-3 px-4">
                      <div className="font-semibold text-slate-200">{p.streetName}</div>
                      <div className="text-[11px] text-slate-400">{p.area}</div>
                    </td>
                    <td className="py-3 px-4 font-mono text-slate-300">{p.ward}</td>
                    <td className="py-3 px-4 text-slate-300">
                      <div>{p.wattage}W LED</div>
                      <div className="text-[10px] text-slate-500 font-mono">{p.fixtureType}</div>
                    </td>
                    <td className="py-3 px-4">
                      <span className={`text-[10px] font-mono px-2 py-0.5 rounded capitalize ${p.condition === 'excellent' || p.condition === 'good' ? 'bg-emerald-950 text-emerald-300' : 'bg-amber-950 text-amber-300'}`}>
                        {p.condition}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-slate-400 font-mono text-[11px]">
                      {p.lastMaintenanceDate.split('T')[0]}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={() => setSelectedPoleForQr(p)}
                        className="px-3 py-1 bg-slate-800 hover:bg-slate-700 text-amber-300 border border-slate-700 rounded-lg text-xs font-mono inline-flex items-center gap-1.5 transition-colors"
                      >
                        <QrCode className="w-3.5 h-3.5" />
                        <span>View QR Code</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

        </div>
      )}

      {/* QR Code Modal for Individual Pole (Links to reporting form with prefilled pole ID) */}
      {selectedPoleForQr && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="w-full max-w-sm bg-slate-900 border border-slate-700 rounded-3xl p-6 shadow-2xl text-center space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <span className="text-xs font-mono text-amber-400 font-bold">STREETLIGHT QR BADGE</span>
              <button 
                onClick={() => setSelectedPoleForQr(null)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="bg-white p-4 rounded-2xl inline-block shadow-inner">
              {/* High-contrast QR code placeholder representation */}
              <div className="w-44 h-44 bg-slate-950 text-white flex flex-col items-center justify-center p-3 rounded-lg border-4 border-slate-900 relative">
                <QrCode className="w-32 h-32 text-amber-400" />
                <span className="text-[9px] font-mono text-slate-300 mt-1">SCAN TO REPORT FAULT</span>
              </div>
            </div>

            <div>
              <div className="text-base font-extrabold font-mono text-white">{selectedPoleForQr.id}</div>
              <div className="text-xs text-slate-400 mt-0.5">{selectedPoleForQr.streetName}</div>
              <div className="text-[11px] font-mono text-slate-500 mt-1">
                {selectedPoleForQr.lat.toFixed(5)}° N, {selectedPoleForQr.lng.toFixed(5)}° E
              </div>
            </div>

            <div className="pt-2 flex items-center justify-center gap-2">
              <button
                onClick={() => {
                  setSelectedPoleForQr(null);
                  setActiveTab('report');
                }}
                className="w-full py-2.5 bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-xs rounded-xl shadow-md transition-all"
              >
                Simulate Scan (Report with This Pole)
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add New Pole Modal */}
      {showAddPoleModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="w-full max-w-md bg-slate-900 border border-slate-700 rounded-3xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <span className="text-sm font-bold text-white">Register New Streetlight Pole</span>
              <button onClick={() => setShowAddPoleModal(false)} className="text-slate-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAddPoleSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-400 mb-1">Pole ID</label>
                <input
                  type="text"
                  value={newPoleForm.id}
                  onChange={(e) => setNewPoleForm({ ...newPoleForm, id: e.target.value })}
                  className="w-full bg-slate-950 text-white px-3 py-2 rounded-xl border border-slate-800 font-mono"
                  required
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Street Name & Junction</label>
                <input
                  type="text"
                  value={newPoleForm.streetName}
                  onChange={(e) => setNewPoleForm({ ...newPoleForm, streetName: e.target.value })}
                  placeholder="e.g. Double Road, Near Shanti Nagar Bus Stand"
                  className="w-full bg-slate-950 text-white px-3 py-2 rounded-xl border border-slate-800"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-slate-400 mb-1">Ward</label>
                  <select
                    value={newPoleForm.ward}
                    onChange={(e) => setNewPoleForm({ ...newPoleForm, ward: e.target.value })}
                    className="w-full bg-slate-950 text-white px-3 py-2 rounded-xl border border-slate-800"
                  >
                    <option value="Ward 01">Ward 01 (CBD)</option>
                    <option value="Ward 04">Ward 04 (Indiranagar)</option>
                    <option value="Ward 08">Ward 08 (Malleshwaram)</option>
                    <option value="Ward 12">Ward 12 (Koramangala)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">Area</label>
                  <input
                    type="text"
                    value={newPoleForm.area}
                    onChange={(e) => setNewPoleForm({ ...newPoleForm, area: e.target.value })}
                    className="w-full bg-slate-950 text-white px-3 py-2 rounded-xl border border-slate-800"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-slate-400 mb-1">Latitude</label>
                  <input
                    type="number"
                    step="any"
                    value={newPoleForm.lat}
                    onChange={(e) => setNewPoleForm({ ...newPoleForm, lat: Number(e.target.value) })}
                    className="w-full bg-slate-950 text-white px-3 py-2 rounded-xl border border-slate-800 font-mono"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">Longitude</label>
                  <input
                    type="number"
                    step="any"
                    value={newPoleForm.lng}
                    onChange={(e) => setNewPoleForm({ ...newPoleForm, lng: Number(e.target.value) })}
                    className="w-full bg-slate-950 text-white px-3 py-2 rounded-xl border border-slate-800 font-mono"
                  />
                </div>
              </div>

              <div className="pt-3 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddPoleModal(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold rounded-xl"
                >
                  Save Pole
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
