export type FaultCategory = 
  | 'light_not_working'
  | 'flickering'
  | 'damaged_pole'
  | 'broken_wiring'
  | 'dim_illumination'
  | 'other';

export type ComplaintStatus =
  | 'submitted'
  | 'under_review'
  | 'assigned'
  | 'in_progress'
  | 'repair_completed'
  | 'awaiting_verification'
  | 'resolved'
  | 'rejected'
  | 'reopened';

export type PriorityLevel = 'low' | 'medium' | 'high' | 'emergency';

export type PoleCondition = 'excellent' | 'good' | 'fair' | 'damaged' | 'unserviceable';

export interface StatusHistoryItem {
  status: ComplaintStatus;
  timestamp: string;
  updatedBy: string;
  notes?: string;
}

export interface RepairDetails {
  completedAt: string;
  staffId: string;
  staffName: string;
  enteredPoleId: string;
  repairLat: number;
  repairLng: number;
  beforePhotoUrl?: string;
  afterPhotoUrl: string;
  notes: string;
  sparePartsUsed?: string[];
  verificationStatus: 'pending' | 'approved' | 'rejected' | 'additional_evidence_requested';
  verificationNotes?: string;
  verifiedAt?: string;
  verifiedBy?: string;
}

export interface CitizenFeedback {
  submittedAt: string;
  status: 'fixed_successfully' | 'still_not_working' | 'partially_fixed';
  comments?: string;
  rating?: number;
}

export interface Complaint {
  id: string; // e.g. SP-2026-1042
  poleId: string;
  faultCategory: FaultCategory;
  streetName: string;
  area: string;
  ward: string;
  lat: number;
  lng: number;
  description: string;
  photoUrl: string;
  citizenName?: string;
  citizenPhone?: string;
  citizenEmail?: string;
  status: ComplaintStatus;
  priority: PriorityLevel;
  assignedStaffId?: string;
  assignedStaffName?: string;
  createdAt: string;
  updatedAt: string;
  slaDeadlineHours: number; // e.g. 24, 48, 72
  timeline: StatusHistoryItem[];
  repairDetails?: RepairDetails;
  citizenFeedback?: CitizenFeedback;
}

export interface StreetlightPole {
  id: string; // e.g. SP-POLE-W04-012
  streetName: string;
  area: string;
  ward: string;
  lat: number;
  lng: number;
  installationDate: string;
  condition: PoleCondition;
  lastMaintenanceDate: string;
  wattage: number;
  fixtureType: string;
}

export interface StaffMember {
  id: string;
  name: string;
  role: 'technician' | 'senior_electrician' | 'lineman' | 'supervisor';
  phone: string;
  email: string;
  wardAssigned: string;
  activeJobsCount: number;
  completedJobsCount: number;
  status: 'active' | 'on_leave' | 'inactive';
}

export interface AppNotification {
  id: string;
  title: string;
  message: string;
  timestamp: string;
  type: 'info' | 'warning' | 'success' | 'urgent';
  complaintId?: string;
  read: boolean;
}

export interface VerificationCheckResult {
  poleMatch: boolean;
  poleMismatchReason?: string;
  gpsDistanceMeters: number;
  gpsPassed: boolean;
  gpsMismatchReason?: string;
  photoProvided: boolean;
  overallScore: number; // 0 - 100
  recommendedAction: 'approve' | 'manual_review' | 'reject';
  flags: string[];
}
