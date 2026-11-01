import test from 'node:test';
import assert from 'node:assert/strict';
import { calculateHaversineDistance } from './geo';
import { 
  performMultiLayerVerification, 
  detectDuplicates, 
  isComplaintOverdue 
} from './verification';
import { Complaint, StreetlightPole, RepairDetails } from '../types';

test('calculateHaversineDistance computes accurate ground distances', () => {
  // Test two points known to be ~111 meters apart on a meridian
  const p1Lat = 12.9716;
  const p1Lng = 77.5946;
  const p2Lat = 12.9726; // +0.001 deg lat ~111m
  const p2Lng = 77.5946;

  const distance = calculateHaversineDistance(p1Lat, p1Lng, p2Lat, p2Lng);
  assert.ok(distance >= 105 && distance <= 115, `Distance was ${distance}, expected ~111m`);

  // Same coordinates should be 0m
  assert.equal(calculateHaversineDistance(p1Lat, p1Lng, p1Lat, p1Lng), 0);
});

test('performMultiLayerVerification flags pole ID mismatch', () => {
  const complaint: Complaint = {
    id: 'SP-2026-1001',
    poleId: 'SP-POLE-W04-012',
    faultCategory: 'light_not_working',
    streetName: '100ft Road',
    area: 'Indiranagar',
    ward: 'Ward 04',
    lat: 12.9716,
    lng: 77.5946,
    description: 'Blackout',
    photoUrl: '/sample.jpg',
    status: 'awaiting_verification',
    priority: 'high',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    slaDeadlineHours: 48,
    timeline: []
  };

  const pole: StreetlightPole = {
    id: 'SP-POLE-W04-012',
    streetName: '100ft Road',
    area: 'Indiranagar',
    ward: 'Ward 04',
    lat: 12.9716,
    lng: 77.5946,
    installationDate: '2023-01-15',
    condition: 'fair',
    lastMaintenanceDate: '2026-05-10',
    wattage: 90,
    fixtureType: 'LED Cobra'
  };

  const wrongRepair: RepairDetails = {
    completedAt: new Date().toISOString(),
    staffId: 'STAFF-01',
    staffName: 'Rajesh Kumar',
    enteredPoleId: 'SP-POLE-W04-999', // Mismatched pole ID!
    repairLat: 12.9716,
    repairLng: 77.5946,
    afterPhotoUrl: '/after.jpg',
    notes: 'Replaced LED luminaire',
    verificationStatus: 'pending'
  };

  const result = performMultiLayerVerification(complaint, pole, wrongRepair, 40);
  assert.equal(result.poleMatch, false);
  assert.ok(result.flags.some(f => f.includes('does not match')));
  assert.equal(result.recommendedAction, 'manual_review');
});

test('performMultiLayerVerification passes when pole and GPS match within threshold', () => {
  const complaint: Complaint = {
    id: 'SP-2026-1002',
    poleId: 'SP-POLE-W04-012',
    faultCategory: 'light_not_working',
    streetName: '100ft Road',
    area: 'Indiranagar',
    ward: 'Ward 04',
    lat: 12.971600,
    lng: 77.594600,
    description: 'Light dead',
    photoUrl: '/sample.jpg',
    status: 'awaiting_verification',
    priority: 'high',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    slaDeadlineHours: 48,
    timeline: []
  };

  const pole: StreetlightPole = {
    id: 'SP-POLE-W04-012',
    streetName: '100ft Road',
    area: 'Indiranagar',
    ward: 'Ward 04',
    lat: 12.971600,
    lng: 77.594600,
    installationDate: '2023-01-15',
    condition: 'fair',
    lastMaintenanceDate: '2026-05-10',
    wattage: 90,
    fixtureType: 'LED Cobra'
  };

  const validRepair: RepairDetails = {
    completedAt: new Date().toISOString(),
    staffId: 'STAFF-01',
    staffName: 'Rajesh Kumar',
    enteredPoleId: 'SP-POLE-W04-012',
    repairLat: 12.971605, // ~1 meter away
    repairLng: 77.594605,
    afterPhotoUrl: '/after.jpg',
    notes: 'Driver replaced successfully',
    verificationStatus: 'pending'
  };

  const result = performMultiLayerVerification(complaint, pole, validRepair, 40);
  assert.equal(result.poleMatch, true);
  assert.equal(result.gpsPassed, true);
  assert.equal(result.photoProvided, true);
  assert.equal(result.recommendedAction, 'approve');
  assert.ok(result.overallScore >= 95);
});

test('detectDuplicates flags existing reports for the same pole or within 50m', () => {
  const existing: Complaint[] = [
    {
      id: 'SP-2026-0001',
      poleId: 'SP-POLE-W04-001',
      faultCategory: 'flickering',
      streetName: 'MG Road',
      area: 'Central',
      ward: 'Ward 01',
      lat: 12.9750,
      lng: 77.6000,
      description: 'Flickering light',
      photoUrl: '/img.jpg',
      status: 'submitted',
      priority: 'medium',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      slaDeadlineHours: 48,
      timeline: []
    }
  ];

  // Report with same pole ID
  const dupCheck1 = detectDuplicates(12.9780, 77.6050, 'SP-POLE-W04-001', existing, 50, 72);
  assert.equal(dupCheck1.isDuplicate, true);

  // Report nearby (within ~20m)
  const dupCheck2 = detectDuplicates(12.9751, 77.6001, 'UNKNOWN-POLE', existing, 50, 72);
  assert.equal(dupCheck2.isDuplicate, true);

  // Report far away and different pole
  const noDup = detectDuplicates(13.0000, 77.7000, 'SP-POLE-W12-050', existing, 50, 72);
  assert.equal(noDup.isDuplicate, false);
});

test('isComplaintOverdue correctly calculates SLA breaches', () => {
  const pastDate = new Date(Date.now() - 50 * 60 * 60 * 1000).toISOString(); // 50 hours ago
  const recentDate = new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(); // 5 hours ago

  const overdueComplaint: Complaint = {
    id: 'SP-2026-9999',
    poleId: 'SP-POLE-W04-001',
    faultCategory: 'broken_wiring',
    streetName: 'Brigade Road',
    area: 'Central',
    ward: 'Ward 01',
    lat: 12.9700,
    lng: 77.6000,
    description: 'Wire sparked',
    photoUrl: '/img.jpg',
    status: 'in_progress',
    priority: 'emergency',
    createdAt: pastDate,
    updatedAt: pastDate,
    slaDeadlineHours: 24, // 24h deadline, 50h elapsed => overdue
    timeline: []
  };

  const activeComplaint: Complaint = {
    ...overdueComplaint,
    createdAt: recentDate,
    updatedAt: recentDate
  };

  assert.equal(isComplaintOverdue(overdueComplaint), true);
  assert.equal(isComplaintOverdue(activeComplaint), false);
});
