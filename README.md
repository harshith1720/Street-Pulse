# StreetPulse – Smart Streetlight Fault Reporting, Monitoring, Maintenance & Verification Platform

> **Brighter Streets. Safer Communities.**  
> A production-grade municipal infrastructure management and citizen grievance redressal platform.

---

## 1. Overview & Key Capabilities

StreetPulse modernizes urban public lighting infrastructure by bridging citizens, municipal control rooms, and field maintenance teams with a closed-loop verification pipeline:

- **Zero-Barrier Citizen Reporting**: Geotagged fault reporting without requiring account creation. Upload or snap luminaire photographs with automatic GPS capture.
- **Smart Duplicate Detection**: Real-time warning if a fault was already reported for the same pole or within 50 meters in the last 72 hours.
- **Public Complaint Tracking**: Real-time status milestones (`Submitted` → `Under Review` → `Assigned` → `In Progress` → `Awaiting Verification` → `Resolved` / `Reopened`).
- **3-Layer Repair Verification Engine**:
  1. *Layer 1 (Physical Pole ID)*: Cross-matches entered pole barcodes against the GIS registry.
  2. *Layer 2 (GPS Telemetry Gate)*: Geodesic Haversine calculation ensures technician repairs occurred within 40m of the pole.
  3. *Layer 3 (Photographic Audit)*: Side-by-side Before & After photographic verification before administrative sign-off.
- **Citizen Confirmation Loop**: If a citizen reports the streetlight is still not working after closure, the complaint is automatically reopened with an emergency alert sent to the municipal authority.
- **Interactive Leaflet GIS Map**: Full OpenStreetMap integration displaying faults with color-coded status markers (Red: Pending, Orange: In Progress, Green: Resolved, Purple: Awaiting Verification).
- **Authority Admin Dashboard**: Recharts visual analytics, SLA breach alerts, staff workload dispatching, and CSV grievance export.
- **Maintenance Field Crew Terminal**: On-site workflow to accept jobs, navigate, log parts used, and transmit repair proof.
- **Pole Registry & Printable QR Codes**: Every streetlight pole has a dedicated QR code linking directly to the reporting form.
- **Dual-Language Ready**: Instant toggle between English and Kannada (ಕನ್ನಡ).

---

## 2. Technology Stack

- **Frontend**: React 19, TypeScript, Vite
- **Styling**: Tailwind CSS v4 with custom dark municipal theme
- **Mapping & GIS**: Leaflet 1.9 with OpenStreetMap (CartoDB tiles)
- **Charts & Data Viz**: Recharts
- **Icons**: Lucide React
- **Database**: Supabase PostgreSQL with Row Level Security (RLS) policies (`supabase_schema.sql`)
- **Testing**: Node.js built-in test runner (`node:test`) and `tsx`

---

## 3. Database Schema & Supabase Setup

The complete production SQL schema is available in `supabase_schema.sql`.

### To provision your Supabase instance:
1. Create a project at [supabase.com](https://supabase.com).
2. Open the **SQL Editor** in your Supabase Dashboard.
3. Paste the contents of `supabase_schema.sql` and run the script.
4. Copy your project URL and anon public key from **Project Settings → API**.
5. Create a `.env` file from `.env.example`:
   ```bash
   VITE_SUPABASE_URL="https://your-project.supabase.co"
   VITE_SUPABASE_ANON_KEY="your-anon-public-key"
   ```

*Note: StreetPulse includes seamless local state persistence with preloaded BBMP Bengaluru sample data so it runs out-of-the-box in local and preview environments.*

---

## 4. Role Accounts & Demo Setup

Switch roles at any time using the **Role Switcher** in the top navigation bar:

1. **Citizen Portal (`citizen`)**:
   - Report faults anonymously with GPS & photo upload.
   - Track complaints using ID: `SP-2026-1042` or `SP-2026-1038`.
   - Submit citizen confirmation feedback.

2. **Authority Admin (`admin`)**:
   - Access full municipal overview, charts, SLA monitors, and triage.
   - Inspect the **Smart Verification Queue** to review before-and-after photos and approve/reject repairs.
   - Register new poles and generate QR codes.

3. **Maintenance Crew (`staff`)**:
   - Switch between technician profiles (e.g. *Rajesh Kumar* or *Anita Sharma*).
   - Accept jobs, lock GPS, upload after-repair proof, and submit for verification.

---

## 5. Running Tests

Unit tests verify geodesic distance formulas, multi-layer verification scoring, duplicate detection, and SLA calculations:

```bash
npx --yes tsx --test src/utils/verification.test.ts
```

---

## 6. Deployment to Vercel

```bash
npm run build
```
Deploy the generated `dist/` directory or connect your GitHub repository to Vercel with framework preset `Vite`. Set `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` in Vercel Environment Variables.
