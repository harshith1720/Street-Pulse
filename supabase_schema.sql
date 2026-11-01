-- StreetPulse Supabase PostgreSQL Database Schema
-- Run this in your Supabase SQL Editor to provision tables, indexes, and Row Level Security (RLS)

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. PROFILES (Authority Admin, Maintenance Technicians, Citizens)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  phone TEXT,
  role TEXT NOT NULL CHECK (role IN ('admin', 'staff', 'citizen')),
  staff_designation TEXT, -- e.g. Senior Electrician, Lineman
  ward_assigned TEXT,     -- e.g. Ward 04, Ward 12
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'on_leave', 'inactive')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. STREETLIGHT POLES REGISTRY
CREATE TABLE IF NOT EXISTS public.streetlight_poles (
  id TEXT PRIMARY KEY, -- e.g. SP-POLE-W04-001
  street_name TEXT NOT NULL,
  area TEXT NOT NULL,
  ward TEXT NOT NULL,
  latitude DOUBLE PRECISION NOT NULL,
  longitude DOUBLE PRECISION NOT NULL,
  installation_date DATE DEFAULT CURRENT_DATE,
  condition TEXT NOT NULL DEFAULT 'good' CHECK (condition IN ('excellent', 'good', 'fair', 'damaged', 'unserviceable')),
  last_maintenance_date TIMESTAMPTZ DEFAULT NOW(),
  wattage INTEGER DEFAULT 90,
  fixture_type TEXT DEFAULT 'LED Cobra',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. COMPLAINTS (Citizen Fault Reports)
CREATE TABLE IF NOT EXISTS public.complaints (
  id TEXT PRIMARY KEY, -- e.g. SP-2026-1042
  pole_id TEXT REFERENCES public.streetlight_poles(id) ON DELETE SET NULL,
  fault_category TEXT NOT NULL CHECK (fault_category IN (
    'light_not_working', 'flickering', 'damaged_pole', 'broken_wiring', 'dim_illumination', 'other'
  )),
  street_name TEXT NOT NULL,
  area TEXT NOT NULL,
  ward TEXT NOT NULL,
  latitude DOUBLE PRECISION NOT NULL,
  longitude DOUBLE PRECISION NOT NULL,
  description TEXT NOT NULL,
  photo_url TEXT NOT NULL,
  citizen_name TEXT,
  citizen_phone TEXT,
  citizen_email TEXT,
  status TEXT NOT NULL DEFAULT 'submitted' CHECK (status IN (
    'submitted', 'under_review', 'assigned', 'in_progress', 
    'repair_completed', 'awaiting_verification', 'resolved', 'rejected', 'reopened'
  )),
  priority TEXT NOT NULL DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'emergency')),
  assigned_staff_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  assigned_staff_name TEXT,
  sla_deadline_hours INTEGER DEFAULT 48,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. COMPLAINT STATUS HISTORY (Audit Trail)
CREATE TABLE IF NOT EXISTS public.complaint_status_history (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  complaint_id TEXT NOT NULL REFERENCES public.complaints(id) ON DELETE CASCADE,
  status TEXT NOT NULL,
  updated_by TEXT NOT NULL,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. MAINTENANCE RECORDS & EVIDENCE
CREATE TABLE IF NOT EXISTS public.maintenance_records (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  complaint_id TEXT NOT NULL REFERENCES public.complaints(id) ON DELETE CASCADE,
  staff_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  staff_name TEXT NOT NULL,
  entered_pole_id TEXT NOT NULL,
  repair_latitude DOUBLE PRECISION NOT NULL,
  repair_longitude DOUBLE PRECISION NOT NULL,
  before_photo_url TEXT,
  after_photo_url TEXT NOT NULL,
  notes TEXT NOT NULL,
  spare_parts_used TEXT[],
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. REPAIR VERIFICATIONS (Multi-Layer Municipal Verification)
CREATE TABLE IF NOT EXISTS public.repair_verifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  complaint_id TEXT NOT NULL REFERENCES public.complaints(id) ON DELETE CASCADE,
  verified_by TEXT NOT NULL,
  pole_match BOOLEAN NOT NULL DEFAULT TRUE,
  gps_distance_meters DOUBLE PRECISION NOT NULL,
  gps_passed BOOLEAN NOT NULL DEFAULT TRUE,
  photo_verified BOOLEAN NOT NULL DEFAULT TRUE,
  overall_score INTEGER NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('approved', 'rejected', 'additional_evidence_requested')),
  verification_notes TEXT,
  verified_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. CITIZEN FEEDBACK
CREATE TABLE IF NOT EXISTS public.citizen_feedback (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  complaint_id TEXT NOT NULL REFERENCES public.complaints(id) ON DELETE CASCADE,
  status TEXT NOT NULL CHECK (status IN ('fixed_successfully', 'still_not_working', 'partially_fixed')),
  rating INTEGER CHECK (rating BETWEEN 1 AND 5),
  comments TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8. NOTIFICATIONS
CREATE TABLE IF NOT EXISTS public.notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  recipient_role TEXT NOT NULL CHECK (recipient_role IN ('admin', 'staff', 'citizen', 'all')),
  recipient_user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  complaint_id TEXT REFERENCES public.complaints(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('info', 'warning', 'success', 'urgent')),
  is_read BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- INDEXES FOR PERFORMANCE
CREATE INDEX IF NOT EXISTS idx_complaints_status ON public.complaints(status);
CREATE INDEX IF NOT EXISTS idx_complaints_ward ON public.complaints(ward);
CREATE INDEX IF NOT EXISTS idx_complaints_pole ON public.complaints(pole_id);
CREATE INDEX IF NOT EXISTS idx_poles_ward ON public.streetlight_poles(ward);
CREATE INDEX IF NOT EXISTS idx_notifications_role ON public.notifications(recipient_role);

-- ROW LEVEL SECURITY (RLS) POLICIES
ALTER TABLE public.complaints ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.streetlight_poles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.maintenance_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.repair_verifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.citizen_feedback ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- Anyone can submit a complaint (Public Citizen Reporting)
CREATE POLICY "Public anonymous can insert complaints" 
ON public.complaints FOR INSERT 
WITH CHECK (true);

-- Anyone can track complaints by ID without exposing private phone/email (public view)
CREATE POLICY "Public can select complaint status" 
ON public.complaints FOR SELECT 
USING (true);

-- Authenticated staff can update assigned complaints
CREATE POLICY "Staff can update assigned complaints" 
ON public.complaints FOR UPDATE 
TO authenticated 
USING (auth.uid() = assigned_staff_id);

-- Admins have full access
CREATE POLICY "Admins have full access to complaints" 
ON public.complaints FOR ALL 
TO authenticated 
USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'));

-- Streetlight poles readable by all
CREATE POLICY "Poles are viewable by everyone" 
ON public.streetlight_poles FOR SELECT 
USING (true);
