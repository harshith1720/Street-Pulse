import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  Complaint, 
  StreetlightPole, 
  StaffMember, 
  AppNotification, 
  ComplaintStatus, 
  PriorityLevel, 
  RepairDetails, 
  CitizenFeedback 
} from '../types';
import { 
  INITIAL_COMPLAINTS, 
  INITIAL_POLES, 
  INITIAL_STAFF, 
  INITIAL_NOTIFICATIONS 
} from '../lib/mockData';
import { supabase, isSupabaseConfigured } from '../lib/supabase';

export type UserRole = 'citizen' | 'admin' | 'staff';
export type AppLanguage = 'en' | 'kn';

interface AppContextType {
  complaints: Complaint[];
  poles: StreetlightPole[];
  staff: StaffMember[];
  notifications: AppNotification[];
  currentRole: UserRole;
  setCurrentRole: (role: UserRole) => void;
  activeStaffId: string;
  setActiveStaffId: (id: string) => void;
  language: AppLanguage;
  setLanguage: (lang: AppLanguage) => void;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  selectedComplaintId: string | null;
  setSelectedComplaintId: (id: string | null) => void;
  submitComplaint: (data: Omit<Complaint, 'id' | 'createdAt' | 'updatedAt' | 'timeline' | 'status'>) => Promise<string>;
  updateComplaintStatus: (id: string, status: ComplaintStatus, updatedBy: string, notes?: string) => void;
  assignStaff: (complaintId: string, staffId: string) => void;
  updatePriority: (complaintId: string, priority: PriorityLevel) => void;
  submitRepairWork: (complaintId: string, repair: Omit<RepairDetails, 'completedAt' | 'verificationStatus'>) => void;
  verifyRepair: (
    complaintId: string, 
    decision: 'approved' | 'rejected' | 'additional_evidence_requested', 
    verifierName: string, 
    notes?: string
  ) => void;
  submitCitizenFeedback: (
    complaintId: string, 
    status: CitizenFeedback['status'], 
    comments?: string, 
    rating?: number
  ) => void;
  addPole: (pole: StreetlightPole) => void;
  markNotificationRead: (id: string) => void;
  markAllNotificationsRead: () => void;
  resetToDemoData: () => void;
  exportComplaintsCsv: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const STORAGE_KEYS = {
  COMPLAINTS: 'streetpulse_complaints_v1',
  POLES: 'streetpulse_poles_v1',
  STAFF: 'streetpulse_staff_v1',
  NOTIFICATIONS: 'streetpulse_notifications_v1',
  LANGUAGE: 'streetpulse_lang_v1',
  ROLE: 'streetpulse_role_v1'
};

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [complaints, setComplaints] = useState<Complaint[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.COMPLAINTS);
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { console.error(e); }
    }
    return INITIAL_COMPLAINTS;
  });

  const [poles, setPoles] = useState<StreetlightPole[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.POLES);
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { console.error(e); }
    }
    return INITIAL_POLES;
  });

  const [staff, setStaff] = useState<StaffMember[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.STAFF);
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { console.error(e); }
    }
    return INITIAL_STAFF;
  });

  const [notifications, setNotifications] = useState<AppNotification[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.NOTIFICATIONS);
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { console.error(e); }
    }
    return INITIAL_NOTIFICATIONS;
  });

  const [currentRole, setCurrentRole] = useState<UserRole>(() => {
    return (localStorage.getItem(STORAGE_KEYS.ROLE) as UserRole) || 'citizen';
  });

  const [activeStaffId, setActiveStaffId] = useState<string>('STAFF-01');

  const [language, setLanguage] = useState<AppLanguage>(() => {
    return (localStorage.getItem(STORAGE_KEYS.LANGUAGE) as AppLanguage) || 'en';
  });

  const [activeTab, setActiveTab] = useState<string>('home');
  const [selectedComplaintId, setSelectedComplaintId] = useState<string | null>(null);

  // 1. Fetch complaints from Supabase on mount (if available)
  useEffect(() => {
    async function fetchSupabaseComplaints() {
      if (isSupabaseConfigured && supabase) {
        const { data, error } = await supabase
          .from('Report')
          .select('*')
          .order('created_at', { ascending: false });

        if (!error && data && data.length > 0) {
          // Map database schema fields to frontend Complaint objects
          const mappedComplaints: Complaint[] = data.map((item: any) => ({
            id: item.id?.toString() || `SP-${Date.now()}`,
            poleId: item.pole_id || item.location || 'N/A',
            faultCategory: item.fault_category || 'Streetlight Dark',
            streetName: item.street_name || item.location || 'Main Road',
            area: item.area || 'Ward Area',
            ward: item.ward || 'Ward 1',
            lat: item.lat || 12.9716,
            lng: item.lng || 77.5946,
            status: item.status || 'submitted',
            priority: item.priority || 'medium',
            description: item.description || item.title || '',
            createdAt: item.created_at || new Date().toISOString(),
            updatedAt: item.updated_at || item.created_at || new Date().toISOString(),
            timeline: item.timeline || []
          }));
          setComplaints(mappedComplaints);
        }
      }
    }
    fetchSupabaseComplaints();
  }, []);

  // Synchronize state to localStorage as local fallback
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.COMPLAINTS, JSON.stringify(complaints));
  }, [complaints]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.POLES, JSON.stringify(poles));
  }, [poles]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.STAFF, JSON.stringify(staff));
  }, [staff]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(notifications));
  }, [notifications]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.LANGUAGE, language);
  }, [language]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.ROLE, currentRole);
  }, [currentRole]);

  // Submit complaint (Inserts to Supabase & syncs local state)
  const submitComplaint = async (
    data: Omit<Complaint, 'id' | 'createdAt' | 'updatedAt' | 'timeline' | 'status'>
  ): Promise<string> => {
    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    const newId = `SP-2026-${randomSuffix}`;
    const now = new Date().toISOString();

    const newComplaint: Complaint = {
      ...data,
      id: newId,
      status: 'submitted',
      createdAt: now,
      updatedAt: now,
      timeline: [
        {
          status: 'submitted',
          timestamp: now,
          updatedBy: data.citizenName ? `Citizen (${data.citizenName})` : 'Citizen (Anonymous)',
          notes: 'Initial fault report registered with GPS telemetry and photographic evidence.'
        }
      ]
    };

    // Push to Supabase if configured
    if (isSupabaseConfigured && supabase) {
      const { error } = await supabase.from('Report').insert([
        {
          title: data.description || `Fault on ${data.streetName}`,
          description: data.description,
          status: 'submitted',
          location: `${data.streetName}, ${data.area}`
        }
      ]);
      if (error) {
        console.error('Supabase sync error:', error.message);
      }
    }

    setComplaints(prev => [newComplaint, ...prev]);

    // Push notification for Control Room
    const newNotification: AppNotification = {
      id: `NOTIF-${Date.now()}`,
      title: 'New Complaint Submitted',
      message: `${newComplaint.id} registered at ${newComplaint.streetName}, ${newComplaint.ward}.`,
      timestamp: now,
      type: newComplaint.priority === 'emergency' ? 'urgent' : 'info',
      complaintId: newId,
      read: false
    };
    setNotifications(prev => [newNotification, ...prev]);

    return newId;
  };

  const updateComplaintStatus = (id: string, status: ComplaintStatus, updatedBy: string, notes?: string) => {
    const now = new Date().toISOString();
    setComplaints(prev =>
      prev.map(item => {
        if (item.id === id) {
          return {
            ...item,
            status,
            updatedAt: now,
            timeline: [
              ...item.timeline,
              { status, timestamp: now, updatedBy, notes }
            ]
          };
        }
        return item;
      })
    );
  };

  const assignStaff = (complaintId: string, staffId: string) => {
    const assignedStaffMember = staff.find(s => s.id === staffId);
    if (!assignedStaffMember) return;

    const now = new Date().toISOString();
    setComplaints(prev =>
      prev.map(c => {
        if (c.id === complaintId) {
          return {
            ...c,
            assignedStaffId: staffId,
            assignedStaffName: assignedStaffMember.name,
            status: 'assigned',
            updatedAt: now,
            timeline: [
              ...c.timeline,
              {
                status: 'assigned',
                timestamp: now,
                updatedBy: 'Control Room Admin',
                notes: `Job assigned to ${assignedStaffMember.name} (${assignedStaffMember.role.replace('_', ' ')}).`
              }
            ]
          };
        }
        return c;
      })
    );

    setStaff(prev =>
      prev.map(s => (s.id === staffId ? { ...s, activeJobsCount: s.activeJobsCount + 1 } : s))
    );

    const newNotification: AppNotification = {
      id: `NOTIF-${Date.now()}`,
      title: 'Complaint Dispatched',
      message: `${complaintId} assigned to ${assignedStaffMember.name}.`,
      timestamp: now,
      type: 'info',
      complaintId,
      read: false
    };
    setNotifications(prev => [newNotification, ...prev]);
  };

  const updatePriority = (complaintId: string, priority: PriorityLevel) => {
    const now = new Date().toISOString();
    const slaHours = priority === 'emergency' ? 24 : priority === 'high' ? 36 : priority === 'medium' ? 48 : 72;

    setComplaints(prev =>
      prev.map(c => {
        if (c.id === complaintId) {
          return {
            ...c,
            priority,
            slaDeadlineHours: slaHours,
            updatedAt: now,
            timeline: [
              ...c.timeline,
              {
                status: c.status,
                timestamp: now,
                updatedBy: 'Admin',
                notes: `Priority updated to ${priority.toUpperCase()} (${slaHours}h SLA).`
              }
            ]
          };
        }
        return c;
      })
    );
  };

  const submitRepairWork = (
    complaintId: string,
    repair: Omit<RepairDetails, 'completedAt' | 'verificationStatus'>
  ) => {
    const now = new Date().toISOString();
    const fullRepairDetails: RepairDetails = {
      ...repair,
      completedAt: now,
      verificationStatus: 'pending'
    };

    setComplaints(prev =>
      prev.map(c => {
        if (c.id === complaintId) {
          return {
            ...c,
            status: 'awaiting_verification',
            updatedAt: now,
            repairDetails: fullRepairDetails,
            timeline: [
              ...c.timeline,
              {
                status: 'repair_completed',
                timestamp: now,
                updatedBy: repair.staffName,
                notes: `Technician finished on-site repair. Pole: ${repair.enteredPoleId}. Note: ${repair.notes}`
              },
              {
                status: 'awaiting_verification',
                timestamp: now,
                updatedBy: 'System Automation',
                notes: 'Dispatched to Municipal Inspection queue for multi-layer verification.'
              }
            ]
          };
        }
        return c;
      })
    );

    const newNotification: AppNotification = {
      id: `NOTIF-${Date.now()}`,
      title: 'Repair Awaiting Verification',
      message: `Technician ${repair.staffName} submitted repair evidence for ${complaintId}.`,
      timestamp: now,
      type: 'info',
      complaintId,
      read: false
    };
    setNotifications(prev => [newNotification, ...prev]);
  };

  const verifyRepair = (
    complaintId: string,
    decision: 'approved' | 'rejected' | 'additional_evidence_requested',
    verifierName: string,
    notes?: string
  ) => {
    const now = new Date().toISOString();

    setComplaints(prev =>
      prev.map(c => {
        if (c.id === complaintId) {
          const updatedRepair: RepairDetails | undefined = c.repairDetails
            ? {
                ...c.repairDetails,
                verificationStatus: decision,
                verificationNotes: notes || '',
                verifiedAt: now,
                verifiedBy: verifierName
              }
            : undefined;

          let newStatus: ComplaintStatus = 'awaiting_verification';
          let timelineNote = '';

          if (decision === 'approved') {
            newStatus = 'resolved';
            timelineNote = `Verification APPROVED by ${verifierName}. Repair validated against pole ID and GPS standards. Complaint officially marked RESOLVED.`;
          } else if (decision === 'rejected') {
            newStatus = 'in_progress';
            timelineNote = `Verification REJECTED by ${verifierName}: ${notes || 'Evidence insufficient'}. Reassigned for correction.`;
          } else {
            newStatus = 'awaiting_verification';
            timelineNote = `Additional evidence requested by ${verifierName}: ${notes || 'Please resubmit clearer photo'}.`;
          }

          return {
            ...c,
            status: newStatus,
            updatedAt: now,
            repairDetails: updatedRepair,
            timeline: [
              ...c.timeline,
              {
                status: newStatus,
                timestamp: now,
                updatedBy: verifierName,
                notes: timelineNote
              }
            ]
          };
        }
        return c;
      })
    );

    if (decision === 'approved') {
      const complaint = complaints.find(c => c.id === complaintId);
      if (complaint?.assignedStaffId) {
        setStaff(prev =>
          prev.map(s =>
            s.id === complaint.assignedStaffId
              ? {
                  ...s,
                  activeJobsCount: Math.max(0, s.activeJobsCount - 1),
                  completedJobsCount: s.completedJobsCount + 1
                }
              : s
          )
        );
      }
    }

    const newNotification: AppNotification = {
      id: `NOTIF-${Date.now()}`,
      title: decision === 'approved' ? 'Repair Approved & Resolved' : 'Repair Verification Update',
      message: `Inspection outcome for ${complaintId}: ${decision.toUpperCase()} by ${verifierName}.`,
      timestamp: now,
      type: decision === 'approved' ? 'success' : 'warning',
      complaintId,
      read: false
    };
    setNotifications(prev => [newNotification, ...prev]);
  };

  const submitCitizenFeedback = (
    complaintId: string,
    status: CitizenFeedback['status'],
    comments?: string,
    rating?: number
  ) => {
    const now = new Date().toISOString();
    const feedback: CitizenFeedback = {
      submittedAt: now,
      status,
      comments,
      rating
    };

    setComplaints(prev =>
      prev.map(c => {
        if (c.id === complaintId) {
          const isReopen = status === 'still_not_working';
          const newStatus: ComplaintStatus = isReopen ? 'reopened' : c.status;

          const timelineItem = {
            status: newStatus,
            timestamp: now,
            updatedBy: 'Citizen Feedback',
            notes: isReopen
              ? `CITIZEN REPORTED ISSUE UNRESOLVED: "${comments || 'Light still dark'}". Escalated & Reopened for inspection.`
              : `Citizen confirmed resolution (${status}). Rating: ${rating ?? 5}/5. Note: ${comments || 'None'}`
          };

          return {
            ...c,
            status: newStatus,
            updatedAt: now,
            citizenFeedback: feedback,
            timeline: [...c.timeline, timelineItem]
          };
        }
        return c;
      })
    );

    if (status === 'still_not_working') {
      const urgentNotification: AppNotification = {
        id: `NOTIF-${Date.now()}`,
        title: 'REOPENED: Citizen Reported Fault Unresolved',
        message: `Citizen reported streetlight ${complaintId} is still not working. Immediate escalation needed.`,
        timestamp: now,
        type: 'urgent',
        complaintId,
        read: false
      };
      setNotifications(prev => [urgentNotification, ...prev]);
    } else {
      const successNotification: AppNotification = {
        id: `NOTIF-${Date.now()}`,
        title: 'Citizen Confirmed Resolution',
        message: `Positive citizen confirmation received for ${complaintId}.`,
        timestamp: now,
        type: 'success',
        complaintId,
        read: false
      };
      setNotifications(prev => [successNotification, ...prev]);
    }
  };

  const addPole = (pole: StreetlightPole) => {
    setPoles(prev => [pole, ...prev]);
  };

  const markNotificationRead = (id: string) => {
    setNotifications(prev => prev.map(n => (n.id === id ? { ...n, read: true } : n)));
  };

  const markAllNotificationsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  const resetToDemoData = () => {
    localStorage.removeItem(STORAGE_KEYS.COMPLAINTS);
    localStorage.removeItem(STORAGE_KEYS.POLES);
    localStorage.removeItem(STORAGE_KEYS.STAFF);
    localStorage.removeItem(STORAGE_KEYS.NOTIFICATIONS);
    setComplaints(INITIAL_COMPLAINTS);
    setPoles(INITIAL_POLES);
    setStaff(INITIAL_STAFF);
    setNotifications(INITIAL_NOTIFICATIONS);
  };

  const exportComplaintsCsv = () => {
    const headers = [
      'Complaint ID',
      'Pole ID',
      'Category',
      'Street Name',
      'Area',
      'Ward',
      'Latitude',
      'Longitude',
      'Status',
      'Priority',
      'Assigned Staff',
      'Created At',
      'Updated At',
      'Citizen Name',
      'Citizen Phone'
    ];

    const rows = complaints.map(c => [
      c.id,
      c.poleId || 'N/A',
      c.faultCategory,
      `"${c.streetName.replace(/"/g, '""')}"`,
      `"${c.area.replace(/"/g, '""')}"`,
      c.ward,
      c.lat,
      c.lng,
      c.status,
      c.priority,
      c.assignedStaffName || 'Unassigned',
      c.createdAt,
      c.updatedAt,
      `"${(c.citizenName || 'Anonymous').replace(/"/g, '""')}"`,
      c.citizenPhone || 'N/A'
    ]);

    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map(e => e.join(','))].join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `streetpulse_complaints_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <AppContext.Provider
      value={{
        complaints,
        poles,
        staff,
        notifications,
        currentRole,
        setCurrentRole,
        activeStaffId,
        setActiveStaffId,
        language,
        setLanguage,
        activeTab,
        setActiveTab,
        selectedComplaintId,
        setSelectedComplaintId,
        submitComplaint,
        updateComplaintStatus,
        assignStaff,
        updatePriority,
        submitRepairWork,
        verifyRepair,
        submitCitizenFeedback,
        addPole,
        markNotificationRead,
        markAllNotificationsRead,
        resetToDemoData,
        exportComplaintsCsv
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};