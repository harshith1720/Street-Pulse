import { StreetlightPole, StaffMember, Complaint, AppNotification } from '../types';

export const INITIAL_POLES: StreetlightPole[] = [
  {
    id: 'SP-POLE-W04-012',
    streetName: '100 Feet Road, 12th Main Junction',
    area: 'Indiranagar',
    ward: 'Ward 04',
    lat: 12.971891,
    lng: 77.641151,
    installationDate: '2023-04-12',
    condition: 'fair',
    lastMaintenanceDate: '2026-08-10',
    wattage: 90,
    fixtureType: 'Philips Smart City LED 90W'
  },
  {
    id: 'SP-POLE-W04-013',
    streetName: '100 Feet Road, 8th Cross',
    area: 'Indiranagar',
    ward: 'Ward 04',
    lat: 12.973412,
    lng: 77.641420,
    installationDate: '2023-04-12',
    condition: 'good',
    lastMaintenanceDate: '2026-09-14',
    wattage: 90,
    fixtureType: 'Philips Smart City LED 90W'
  },
  {
    id: 'SP-POLE-W04-018',
    streetName: 'CMH Road, Near Metro Station',
    area: 'Indiranagar',
    ward: 'Ward 04',
    lat: 12.978201,
    lng: 77.638541,
    installationDate: '2022-11-20',
    condition: 'damaged',
    lastMaintenanceDate: '2026-06-02',
    wattage: 120,
    fixtureType: 'Bajaj Luminary High-Mast'
  },
  {
    id: 'SP-POLE-W12-005',
    streetName: '80 Feet Road, 4th Block',
    area: 'Koramangala',
    ward: 'Ward 12',
    lat: 12.935210,
    lng: 77.624530,
    installationDate: '2024-01-10',
    condition: 'good',
    lastMaintenanceDate: '2026-10-01',
    wattage: 100,
    fixtureType: 'Havells SmartLED Matrix'
  },
  {
    id: 'SP-POLE-W12-009',
    streetName: 'Sony World Signal, 100ft Inner Ring',
    area: 'Koramangala',
    ward: 'Ward 12',
    lat: 12.934120,
    lng: 77.627890,
    installationDate: '2023-08-19',
    condition: 'fair',
    lastMaintenanceDate: '2026-07-22',
    wattage: 120,
    fixtureType: 'Havells SmartLED Matrix'
  },
  {
    id: 'SP-POLE-W01-044',
    streetName: 'Mahatma Gandhi Road, Brigade Crossing',
    area: 'Central Business District',
    ward: 'Ward 01',
    lat: 12.974510,
    lng: 77.608920,
    installationDate: '2024-05-15',
    condition: 'excellent',
    lastMaintenanceDate: '2026-10-18',
    wattage: 150,
    fixtureType: 'Crompton Solarium 150W'
  },
  {
    id: 'SP-POLE-W01-049',
    streetName: 'Residency Road, Mayo Hall Intersection',
    area: 'Central Business District',
    ward: 'Ward 01',
    lat: 12.971200,
    lng: 77.611400,
    installationDate: '2023-02-11',
    condition: 'damaged',
    lastMaintenanceDate: '2026-04-10',
    wattage: 90,
    fixtureType: 'Philips Urban LED'
  },
  {
    id: 'SP-POLE-W08-022',
    streetName: 'Sampige Road, 7th Cross',
    area: 'Malleshwaram',
    ward: 'Ward 08',
    lat: 13.003120,
    lng: 77.570140,
    installationDate: '2022-09-08',
    condition: 'good',
    lastMaintenanceDate: '2026-09-05',
    wattage: 90,
    fixtureType: 'Crompton Solarium 90W'
  }
];

export const INITIAL_STAFF: StaffMember[] = [
  {
    id: 'STAFF-01',
    name: 'Rajesh Kumar',
    role: 'senior_electrician',
    phone: '+91 98450 12384',
    email: 'rajesh.kumar@streetpulse.gov',
    wardAssigned: 'Ward 04',
    activeJobsCount: 2,
    completedJobsCount: 47,
    status: 'active'
  },
  {
    id: 'STAFF-02',
    name: 'Anita Sharma',
    role: 'technician',
    phone: '+91 94481 99201',
    email: 'anita.sharma@streetpulse.gov',
    wardAssigned: 'Ward 12',
    activeJobsCount: 1,
    completedJobsCount: 38,
    status: 'active'
  },
  {
    id: 'STAFF-03',
    name: 'Mohammad Farooq',
    role: 'lineman',
    phone: '+91 98860 44319',
    email: 'm.farooq@streetpulse.gov',
    wardAssigned: 'Ward 01',
    activeJobsCount: 1,
    completedJobsCount: 52,
    status: 'active'
  },
  {
    id: 'STAFF-04',
    name: 'Suresh Gowda',
    role: 'supervisor',
    phone: '+91 97401 55621',
    email: 'suresh.gowda@streetpulse.gov',
    wardAssigned: 'Ward 08',
    activeJobsCount: 0,
    completedJobsCount: 65,
    status: 'active'
  }
];

export const INITIAL_COMPLAINTS: Complaint[] = [
  {
    id: 'SP-2026-1042',
    poleId: 'SP-POLE-W04-012',
    faultCategory: 'light_not_working',
    streetName: '100 Feet Road, 12th Main',
    area: 'Indiranagar',
    ward: 'Ward 04',
    lat: 12.971891,
    lng: 77.641151,
    description: 'Streetlight has been unlit for 3 days. Pedestrian crossing is dark and unsafe at night.',
    photoUrl: '/src/assets/images/fault_broken_light_1793539263427.jpg',
    citizenName: 'Prashanth Rao',
    citizenPhone: '+91 98800 11223',
    citizenEmail: 'prashanth.r@example.com',
    status: 'awaiting_verification',
    priority: 'high',
    assignedStaffId: 'STAFF-01',
    assignedStaffName: 'Rajesh Kumar',
    createdAt: '2026-10-30T18:45:00.000Z',
    updatedAt: '2026-11-01T04:30:00.000Z',
    slaDeadlineHours: 48,
    timeline: [
      {
        status: 'submitted',
        timestamp: '2026-10-30T18:45:00.000Z',
        updatedBy: 'Citizen (Portal)',
        notes: 'Complaint submitted with GPS coordinates and photo.'
      },
      {
        status: 'under_review',
        timestamp: '2026-10-31T09:10:00.000Z',
        updatedBy: 'Municipal Control Room',
        notes: 'Verified location against pole registry SP-POLE-W04-012.'
      },
      {
        status: 'assigned',
        timestamp: '2026-10-31T10:00:00.000Z',
        updatedBy: 'Control Room Admin',
        notes: 'Dispatched to Senior Electrician Rajesh Kumar (Ward 04 crew).'
      },
      {
        status: 'in_progress',
        timestamp: '2026-11-01T02:15:00.000Z',
        updatedBy: 'Rajesh Kumar',
        notes: 'Technician on-site. Investigating faulty SMPS driver.'
      },
      {
        status: 'awaiting_verification',
        timestamp: '2026-11-01T04:30:00.000Z',
        updatedBy: 'Rajesh Kumar',
        notes: 'Replaced 90W driver and waterproof fuse holder. Luminaire operational. Evidence submitted.'
      }
    ],
    repairDetails: {
      completedAt: '2026-11-01T04:30:00.000Z',
      staffId: 'STAFF-01',
      staffName: 'Rajesh Kumar',
      enteredPoleId: 'SP-POLE-W04-012',
      repairLat: 12.971895,
      repairLng: 77.641154,
      beforePhotoUrl: '/src/assets/images/fault_broken_light_1793539263427.jpg',
      afterPhotoUrl: '/src/assets/images/repaired_light_proof_1793539262370.jpg',
      notes: 'Installed new OEM surge arrester and LED driver module. Tested lux output at 48 lux on road surface.',
      sparePartsUsed: ['90W LED Constant Current Driver', '10kV Surge Protection Module'],
      verificationStatus: 'pending'
    }
  },
  {
    id: 'SP-2026-1038',
    poleId: 'SP-POLE-W01-049',
    faultCategory: 'broken_wiring',
    streetName: 'Residency Road, Mayo Hall Intersection',
    area: 'Central Business District',
    ward: 'Ward 01',
    lat: 12.971200,
    lng: 77.611400,
    description: 'Underground cable joint exposed near curb after pavement digging. Urgent shock hazard for pedestrians during rain.',
    photoUrl: '/src/assets/images/fault_broken_light_1793539263427.jpg',
    citizenName: 'Deepa Hegde',
    citizenPhone: '+91 94480 55123',
    citizenEmail: 'deepa.h@example.com',
    status: 'in_progress',
    priority: 'emergency',
    assignedStaffId: 'STAFF-03',
    assignedStaffName: 'Mohammad Farooq',
    createdAt: '2026-10-31T07:15:00.000Z',
    updatedAt: '2026-10-31T11:00:00.000Z',
    slaDeadlineHours: 24,
    timeline: [
      {
        status: 'submitted',
        timestamp: '2026-10-31T07:15:00.000Z',
        updatedBy: 'Citizen (Portal)',
        notes: 'Emergency safety alert received.'
      },
      {
        status: 'assigned',
        timestamp: '2026-10-31T07:30:00.000Z',
        updatedBy: 'Super Admin',
        notes: 'Priority elevated to EMERGENCY. Dispatched Lineman Farooq.'
      },
      {
        status: 'in_progress',
        timestamp: '2026-10-31T08:00:00.000Z',
        updatedBy: 'Mohammad Farooq',
        notes: 'Cordoned area with safety tape. Isolating local MCB box.'
      }
    ]
  },
  {
    id: 'SP-2026-1025',
    poleId: 'SP-POLE-W12-009',
    faultCategory: 'flickering',
    streetName: 'Sony World Signal, 100ft Inner Ring',
    area: 'Koramangala',
    ward: 'Ward 12',
    lat: 12.934120,
    lng: 77.627890,
    description: 'Rapid flickering light causing severe glare and visual disturbance to drivers at night.',
    photoUrl: '/src/assets/images/fault_broken_light_1793539263427.jpg',
    citizenName: 'Naveen Kumar',
    citizenPhone: '+91 98450 67120',
    status: 'resolved',
    priority: 'medium',
    assignedStaffId: 'STAFF-02',
    assignedStaffName: 'Anita Sharma',
    createdAt: '2026-10-27T14:20:00.000Z',
    updatedAt: '2026-10-29T16:00:00.000Z',
    slaDeadlineHours: 48,
    timeline: [
      {
        status: 'submitted',
        timestamp: '2026-10-27T14:20:00.000Z',
        updatedBy: 'Citizen (Portal)'
      },
      {
        status: 'assigned',
        timestamp: '2026-10-28T09:00:00.000Z',
        updatedBy: 'Control Room Admin'
      },
      {
        status: 'in_progress',
        timestamp: '2026-10-28T14:00:00.000Z',
        updatedBy: 'Anita Sharma'
      },
      {
        status: 'repair_completed',
        timestamp: '2026-10-28T17:30:00.000Z',
        updatedBy: 'Anita Sharma'
      },
      {
        status: 'resolved',
        timestamp: '2026-10-29T10:00:00.000Z',
        updatedBy: 'Municipal Inspector K. Reddy',
        notes: 'Verified via photo inspection and lux check. Approved.'
      }
    ],
    repairDetails: {
      completedAt: '2026-10-28T17:30:00.000Z',
      staffId: 'STAFF-02',
      staffName: 'Anita Sharma',
      enteredPoleId: 'SP-POLE-W12-009',
      repairLat: 12.934122,
      repairLng: 77.627891,
      afterPhotoUrl: '/src/assets/images/repaired_light_proof_1793539262370.jpg',
      notes: 'Loose neutral terminal tightened and power supply capacitor bank replaced.',
      verificationStatus: 'approved',
      verificationNotes: 'Ground inspection confirmed stable non-flickering operation.',
      verifiedAt: '2026-10-29T10:00:00.000Z',
      verifiedBy: 'Municipal Inspector K. Reddy'
    },
    citizenFeedback: {
      submittedAt: '2026-10-29T16:00:00.000Z',
      status: 'fixed_successfully',
      comments: 'Repaired quickly, light is clear now. Thank you!',
      rating: 5
    }
  },
  {
    id: 'SP-2026-1011',
    poleId: 'SP-POLE-W04-018',
    faultCategory: 'damaged_pole',
    streetName: 'CMH Road, Near Metro Station',
    area: 'Indiranagar',
    ward: 'Ward 04',
    lat: 12.978201,
    lng: 77.638541,
    description: 'Vehicle hit the base of the pole. Pole is tilted approximately 15 degrees towards pedestrian walkway.',
    photoUrl: '/src/assets/images/fault_broken_light_1793539263427.jpg',
    citizenName: 'Vikram Joshi',
    citizenPhone: '+91 97410 88200',
    status: 'assigned',
    priority: 'emergency',
    assignedStaffId: 'STAFF-01',
    assignedStaffName: 'Rajesh Kumar',
    createdAt: '2026-10-31T15:20:00.000Z',
    updatedAt: '2026-11-01T01:00:00.000Z',
    slaDeadlineHours: 24,
    timeline: [
      {
        status: 'submitted',
        timestamp: '2026-10-31T15:20:00.000Z',
        updatedBy: 'Citizen (Portal)'
      },
      {
        status: 'under_review',
        timestamp: '2026-10-31T16:00:00.000Z',
        updatedBy: 'Control Room'
      },
      {
        status: 'assigned',
        timestamp: '2026-11-01T01:00:00.000Z',
        updatedBy: 'Control Room Admin',
        notes: 'Heavy vehicle crane dispatched for structural realigning.'
      }
    ]
  },
  {
    id: 'SP-2026-0995',
    poleId: 'SP-POLE-W08-022',
    faultCategory: 'dim_illumination',
    streetName: 'Sampige Road, 7th Cross',
    area: 'Malleshwaram',
    ward: 'Ward 08',
    lat: 13.003120,
    lng: 77.570140,
    description: 'Light has become very dim, less than 20% normal brightness. Dark street corner.',
    photoUrl: '/src/assets/images/fault_broken_light_1793539263427.jpg',
    citizenName: 'Sumanth K.',
    citizenPhone: '+91 98801 34110',
    status: 'submitted',
    priority: 'low',
    createdAt: '2026-11-01T03:10:00.000Z',
    updatedAt: '2026-11-01T03:10:00.000Z',
    slaDeadlineHours: 72,
    timeline: [
      {
        status: 'submitted',
        timestamp: '2026-11-01T03:10:00.000Z',
        updatedBy: 'Citizen (Portal)',
        notes: 'Complaint queued for ward team review.'
      }
    ]
  }
];

export const INITIAL_NOTIFICATIONS: AppNotification[] = [
  {
    id: 'NOTIF-01',
    title: 'New Emergency Complaint',
    message: 'Exposed broken wiring reported at Residency Road (SP-2026-1038). 24h SLA active.',
    timestamp: '2026-10-31T07:15:00.000Z',
    type: 'urgent',
    complaintId: 'SP-2026-1038',
    read: false
  },
  {
    id: 'NOTIF-02',
    title: 'Repair Awaiting Verification',
    message: 'Technician Rajesh Kumar uploaded after-repair evidence for SP-2026-1042.',
    timestamp: '2026-11-01T04:30:00.000Z',
    type: 'info',
    complaintId: 'SP-2026-1042',
    read: false
  },
  {
    id: 'NOTIF-03',
    title: 'Citizen Confirmed Resolution',
    message: 'Citizen submitted 5-star feedback confirming fixed streetlight on SP-2026-1025.',
    timestamp: '2026-10-29T16:00:00.000Z',
    type: 'success',
    complaintId: 'SP-2026-1025',
    read: true
  }
];
