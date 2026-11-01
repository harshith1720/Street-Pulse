import { calculateHaversineDistance } from './geo';
import { 
  Complaint, 
  StreetlightPole, 
  RepairDetails, 
  VerificationCheckResult, 
  FaultCategory, 
  ComplaintStatus, 
  PriorityLevel 
} from '../types';

export const DEFAULT_GPS_THRESHOLD_METERS = 40; // flag if repair GPS is > 40m from pole

/**
 * Multi-layer smart verification evaluator:
 * Layer 1: Pole ID cross-matching
 * Layer 2: GPS distance threshold verification
 * Layer 3: Photographic evidence analysis
 */
export function performMultiLayerVerification(
  complaint: Complaint,
  registeredPole?: StreetlightPole,
  repairDetails?: RepairDetails,
  thresholdMeters: number = DEFAULT_GPS_THRESHOLD_METERS
): VerificationCheckResult {
  const flags: string[] = [];
  let score = 100;

  if (!repairDetails) {
    return {
      poleMatch: false,
      gpsDistanceMeters: 0,
      gpsPassed: false,
      photoProvided: false,
      overallScore: 0,
      recommendedAction: 'reject',
      flags: ['No repair details submitted yet']
    };
  }

  // Layer 1: Pole ID Verification
  const enteredPole = repairDetails.enteredPoleId?.trim().toUpperCase();
  const complaintPole = complaint.poleId?.trim().toUpperCase();
  const registeredPoleId = registeredPole?.id?.trim().toUpperCase();

  let poleMatch = true;
  let poleMismatchReason: string | undefined;

  if (!enteredPole) {
    poleMatch = false;
    poleMismatchReason = 'Maintenance staff did not supply a physical pole ID';
    flags.push(poleMismatchReason);
    score -= 35;
  } else if (complaintPole && enteredPole !== complaintPole) {
    poleMatch = false;
    poleMismatchReason = `Entered pole ID (${enteredPole}) does not match complaint pole (${complaintPole})`;
    flags.push(poleMismatchReason);
    score -= 30;
  } else if (registeredPoleId && enteredPole !== registeredPoleId) {
    poleMatch = false;
    poleMismatchReason = `Entered pole ID (${enteredPole}) not found in official ward registry`;
    flags.push(poleMismatchReason);
    score -= 25;
  }

  // Layer 2: GPS Distance Verification
  const refLat = registeredPole?.lat ?? complaint.lat;
  const refLng = registeredPole?.lng ?? complaint.lng;

  const distance = calculateHaversineDistance(
    refLat,
    refLng,
    repairDetails.repairLat,
    repairDetails.repairLng
  );

  const gpsPassed = distance <= thresholdMeters;
  let gpsMismatchReason: string | undefined;

  if (!gpsPassed) {
    gpsMismatchReason = `Repair location is ${distance}m away from registered pole (exceeds ${thresholdMeters}m threshold)`;
    flags.push(gpsMismatchReason);
    score -= Math.min(40, Math.round(distance / 2));
  }

  // Layer 3: Photographic Evidence Check
  const photoProvided = Boolean(repairDetails.afterPhotoUrl && repairDetails.afterPhotoUrl.trim().length > 0);
  if (!photoProvided) {
    flags.push('Missing mandatory after-repair photograph');
    score -= 50;
  }

  // Final score clamping and recommendation
  const overallScore = Math.max(0, Math.min(100, score));
  let recommendedAction: 'approve' | 'manual_review' | 'reject' = 'approve';

  if (overallScore < 50 || !photoProvided) {
    recommendedAction = 'reject';
  } else if (overallScore < 85 || flags.length > 0) {
    recommendedAction = 'manual_review';
  }

  return {
    poleMatch,
    poleMismatchReason,
    gpsDistanceMeters: distance,
    gpsPassed,
    gpsMismatchReason,
    photoProvided,
    overallScore,
    recommendedAction,
    flags
  };
}

/**
 * Checks if a new report is a potential duplicate of existing reports
 */
export function detectDuplicates(
  newLat: number,
  newLng: number,
  poleId: string | undefined,
  existingComplaints: Complaint[],
  radiusMeters: number = 50,
  hoursWindow: number = 72
): { isDuplicate: boolean; matches: Complaint[]; reason?: string } {
  const cutoffTime = new Date(Date.now() - hoursWindow * 60 * 60 * 1000).toISOString();
  const activeExisting = existingComplaints.filter(
    (c) => c.status !== 'resolved' && c.status !== 'rejected' && c.createdAt >= cutoffTime
  );

  const matches: Complaint[] = [];

  for (const item of activeExisting) {
    const isSamePole = poleId && item.poleId && item.poleId.trim().toLowerCase() === poleId.trim().toLowerCase();
    const distance = calculateHaversineDistance(newLat, newLng, item.lat, item.lng);
    const isNearby = distance <= radiusMeters;

    if (isSamePole || isNearby) {
      matches.push(item);
    }
  }

  if (matches.length > 0) {
    const exactPole = matches.find(m => poleId && m.poleId && m.poleId.toLowerCase() === poleId.toLowerCase());
    return {
      isDuplicate: true,
      matches,
      reason: exactPole 
        ? `A complaint (${exactPole.id}) was already reported for pole ${exactPole.poleId} recently.`
        : `An active complaint exists within ${radiusMeters}m of this location.`
    };
  }

  return { isDuplicate: false, matches: [] };
}

/**
 * Checks if a complaint has breached its SLA maintenance deadline
 */
export function isComplaintOverdue(complaint: Complaint): boolean {
  if (complaint.status === 'resolved' || complaint.status === 'rejected') {
    return false;
  }
  const created = new Date(complaint.createdAt).getTime();
  const deadline = created + (complaint.slaDeadlineHours || 48) * 60 * 60 * 1000;
  return Date.now() > deadline;
}

export function getHoursRemaining(complaint: Complaint): number {
  const created = new Date(complaint.createdAt).getTime();
  const deadline = created + (complaint.slaDeadlineHours || 48) * 60 * 60 * 1000;
  const diffMs = deadline - Date.now();
  return Math.round(diffMs / (60 * 60 * 1000));
}

export function formatFaultCategory(category: FaultCategory): string {
  switch (category) {
    case 'light_not_working':
      return 'Light Not Working';
    case 'flickering':
      return 'Flickering Luminaire';
    case 'damaged_pole':
      return 'Damaged / Tilted Pole';
    case 'broken_wiring':
      return 'Exposed / Broken Wiring';
    case 'dim_illumination':
      return 'Dim Illumination';
    case 'other':
      return 'General Electrical Fault';
  }
}

export function formatStatusLabel(status: ComplaintStatus): string {
  switch (status) {
    case 'submitted':
      return 'Submitted';
    case 'under_review':
      return 'Under Review';
    case 'assigned':
      return 'Staff Assigned';
    case 'in_progress':
      return 'In Progress';
    case 'repair_completed':
      return 'Repair Completed';
    case 'awaiting_verification':
      return 'Awaiting Verification';
    case 'resolved':
      return 'Resolved';
    case 'rejected':
      return 'Rejected';
    case 'reopened':
      return 'Reopened';
  }
}

export function getPriorityBadgeColor(priority: PriorityLevel): string {
  switch (priority) {
    case 'emergency':
      return 'text-rose-400 bg-rose-950/70 border border-rose-800';
    case 'high':
      return 'text-amber-300 bg-amber-950/70 border border-amber-800';
    case 'medium':
      return 'text-sky-300 bg-sky-950/70 border border-sky-800';
    case 'low':
      return 'text-slate-300 bg-slate-900 border border-slate-700';
  }
}
