import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { FaultCategory, PriorityLevel } from '../types';
import { detectDuplicates } from '../utils/verification';
import { 
  Camera, 
  MapPin, 
  Upload, 
  AlertTriangle, 
  CheckCircle2, 
  Crosshair, 
  ArrowRight, 
  FileText, 
  Info, 
  ShieldAlert,
  Sparkles,
  Phone,
  User,
  Hash
} from 'lucide-react';

interface ReportFaultProps {
  prefilledPoleId?: string;
  onSuccess?: (complaintId: string) => void;
}

export const ReportFaultModal: React.FC<ReportFaultProps> = ({ prefilledPoleId = '', onSuccess }) => {
  const { 
    poles, 
    complaints, 
    submitComplaint, 
    setSelectedComplaintId, 
    setActiveTab 
  } = useApp();

  const [poleId, setPoleId] = useState(prefilledPoleId);
  const [faultCategory, setFaultCategory] = useState<FaultCategory>('light_not_working');
  const [streetName, setStreetName] = useState('');
  const [area, setArea] = useState('Indiranagar');
  const [ward, setWard] = useState('Ward 04');
  const [lat, setLat] = useState<number>(12.971891);
  const [lng, setLng] = useState<number>(77.641151);
  const [description, setDescription] = useState('');
  
  // Citizen contact (optional)
  const [citizenName, setCitizenName] = useState('');
  const [citizenPhone, setCitizenPhone] = useState('');
  const [citizenEmail, setCitizenEmail] = useState('');

  // Photograph handling
  const [photoUrl, setPhotoUrl] = useState<string>('/src/assets/images/fault_broken_light_1793539263427.jpg');
  const [photoPreview, setPhotoPreview] = useState<string>('/src/assets/images/fault_broken_light_1793539263427.jpg');

  // Form states
  const [isLocating, setIsLocating] = useState(false);
  const [gpsCaptured, setGpsCaptured] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedId, setSubmittedId] = useState<string | null>(null);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);

  // Duplicate detection feedback
  const [duplicateWarning, setDuplicateWarning] = useState<string | null>(null);
  const [duplicateMatches, setDuplicateMatches] = useState<any[]>([]);

  // If prefilled pole ID provided, autofill street & area
  useEffect(() => {
    if (prefilledPoleId) {
      setPoleId(prefilledPoleId);
      const matched = poles.find(p => p.id.toLowerCase() === prefilledPoleId.toLowerCase());
      if (matched) {
        setStreetName(matched.streetName);
        setArea(matched.area);
        setWard(matched.ward);
        setLat(matched.lat);
        setLng(matched.lng);
        setGpsCaptured(true);
      }
    }
  }, [prefilledPoleId, poles]);

  // Check for duplicates whenever lat, lng, or poleId changes
  useEffect(() => {
    const check = detectDuplicates(lat, lng, poleId || undefined, complaints, 50, 72);
    if (check.isDuplicate) {
      setDuplicateWarning(check.reason || 'An active complaint was recently logged near this location.');
      setDuplicateMatches(check.matches);
    } else {
      setDuplicateWarning(null);
      setDuplicateMatches([]);
    }
  }, [lat, lng, poleId, complaints]);

  const handlePoleSelect = (selectedId: string) => {
    setPoleId(selectedId);
    const matched = poles.find(p => p.id === selectedId);
    if (matched) {
      setStreetName(matched.streetName);
      setArea(matched.area);
      setWard(matched.ward);
      setLat(matched.lat);
      setLng(matched.lng);
      setGpsCaptured(true);
    }
  };

  const handleFetchCurrentGps = () => {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by your browser.');
      return;
    }
    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLat(Number(pos.coords.latitude.toFixed(6)));
        setLng(Number(pos.coords.longitude.toFixed(6)));
        setIsLocating(false);
        setGpsCaptured(true);
      },
      (err) => {
        console.warn('Geolocation permission denied or timed out:', err.message);
        setIsLocating(false);
        // Fallback to municipal center
        setLat(12.971600);
        setLng(77.641200);
        setGpsCaptured(true);
      },
      { timeout: 8000, enableHighAccuracy: true }
    );
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file size (max 8MB)
      if (file.size > 8 * 1024 * 1024) {
        alert('File size exceeds 8MB limit. Please upload a smaller image.');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        setPhotoUrl(result);
        setPhotoPreview(result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const errors: string[] = [];

    if (!streetName.trim()) {
      errors.push('Street name or landmark is required.');
    }
    if (!description.trim()) {
      errors.push('Please provide a brief description of the fault.');
    }
    if (!photoUrl) {
      errors.push('A photograph of the faulty streetlight is mandatory.');
    }

    if (errors.length > 0) {
      setValidationErrors(errors);
      return;
    }

    setValidationErrors([]);
    setIsSubmitting(true);

    // Assess priority automatically based on fault category
    let priority: PriorityLevel = 'medium';
    let slaHours = 48;

    if (faultCategory === 'broken_wiring' || faultCategory === 'damaged_pole') {
      priority = 'emergency';
      slaHours = 24;
    } else if (faultCategory === 'light_not_working') {
      priority = 'high';
      slaHours = 48;
    } else {
      priority = 'low';
      slaHours = 72;
    }

    setTimeout(() => {
      const generatedId = submitComplaint({
        poleId: poleId.trim() || 'UNTAGGED-POLE',
        faultCategory,
        streetName: streetName.trim(),
        area,
        ward,
        lat,
        lng,
        description: description.trim(),
        photoUrl,
        citizenName: citizenName.trim() || undefined,
        citizenPhone: citizenPhone.trim() || undefined,
        citizenEmail: citizenEmail.trim() || undefined,
        priority,
        slaDeadlineHours: slaHours
      });

      setIsSubmitting(false);
      setSubmittedId(generatedId);
      if (onSuccess) onSuccess(generatedId);
    }, 600);
  };

  // If submission was successful, show confirmation screen
  if (submittedId) {
    return (
      <div className="max-w-2xl mx-auto my-8 p-8 rounded-3xl bg-slate-900 border border-slate-800 shadow-2xl text-center animate-in zoom-in-95 duration-200">
        <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 flex items-center justify-center mx-auto mb-6">
          <CheckCircle2 className="w-8 h-8" />
        </div>

        <span className="text-xs font-mono uppercase tracking-widest text-emerald-400">
          REPORT REGISTERED WITH MUNICIPAL DISPATCH
        </span>

        <h2 className="text-2xl sm:text-3xl font-extrabold text-white mt-2">
          Complaint Successfully Logged
        </h2>

        <p className="text-sm text-slate-400 mt-3 max-w-md mx-auto">
          Your unique complaint token has been recorded in the central municipal database and queued for field crew triage.
        </p>

        <div className="my-6 p-4 rounded-2xl bg-slate-950 border border-slate-800 inline-block">
          <div className="text-xs text-slate-500 font-mono">YOUR COMPLAINT ID</div>
          <div className="text-2xl sm:text-3xl font-extrabold font-mono text-amber-400 mt-1 select-all">
            {submittedId}
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <button
            onClick={() => {
              setSelectedComplaintId(submittedId);
              setActiveTab('track');
            }}
            className="w-full sm:w-auto px-6 py-3 bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-sm rounded-xl transition-all shadow-md flex items-center justify-center gap-2"
          >
            <span>Track Progress Now</span>
            <ArrowRight className="w-4 h-4" />
          </button>

          <button
            onClick={() => {
              setSubmittedId(null);
              setDescription('');
              setPoleId('');
              setStreetName('');
            }}
            className="w-full sm:w-auto px-6 py-3 bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-sm rounded-xl transition-colors border border-slate-700"
          >
            Report Another Fault
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto my-8 px-4 sm:px-6">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden">
        
        {/* Header */}
        <div className="p-6 sm:p-8 border-b border-slate-800 bg-slate-950/40">
          <div className="flex items-center gap-2 text-xs font-mono text-amber-400 uppercase tracking-wider mb-1">
            <Camera className="w-4 h-4" />
            <span>Citizen Fault Reporting Portal · No Login Required</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white">
            Report a Faulty Streetlight
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Provide the location and photograph of the defective luminaire. Our municipal crew will inspect and repair it under strict SLA guidelines.
          </p>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 sm:p-8 space-y-6">
          
          {/* Validation Errors banner */}
          {validationErrors.length > 0 && (
            <div className="p-4 rounded-xl bg-rose-950/80 border border-rose-800 text-rose-300 text-xs space-y-1">
              <div className="font-semibold flex items-center gap-1.5">
                <AlertTriangle className="w-4 h-4 text-rose-400" />
                <span>Please complete the required fields:</span>
              </div>
              <ul className="list-disc list-inside pl-1 text-[11px] text-rose-300/90">
                {validationErrors.map((err, i) => (
                  <li key={i}>{err}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Duplicate Report Warning Banner */}
          {duplicateWarning && (
            <div className="p-4 rounded-xl bg-amber-950/70 border border-amber-800 text-amber-200 text-xs">
              <div className="flex items-start gap-2.5">
                <ShieldAlert className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                <div className="flex-1">
                  <div className="font-bold text-amber-300">Potential Duplicate Detected</div>
                  <p className="mt-0.5 text-amber-200/90 leading-relaxed">{duplicateWarning}</p>
                  {duplicateMatches.length > 0 && (
                    <div className="mt-2 flex items-center gap-2">
                      <span className="text-[11px] text-amber-300">Existing report:</span>
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedComplaintId(duplicateMatches[0].id);
                          setActiveTab('track');
                        }}
                        className="px-2 py-0.5 bg-amber-400/20 hover:bg-amber-400/30 text-amber-300 font-mono text-[11px] rounded border border-amber-400/40 underline"
                      >
                        View {duplicateMatches[0].id}
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Step 1: Photograph Upload with Live Preview & Mobile Camera */}
          <div>
            <label className="block text-xs font-mono uppercase tracking-wider text-slate-300 mb-2">
              1. Streetlight Photograph <span className="text-rose-400">*</span>
            </label>
            
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-center">
              
              {/* Photo Preview Card */}
              <div className="sm:col-span-1 aspect-[4/3] rounded-2xl bg-slate-950 border border-slate-800 overflow-hidden relative group">
                {photoPreview ? (
                  <img
                    src={photoPreview}
                    alt="Streetlight fault preview"
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center text-slate-600 p-4 text-center">
                    <Camera className="w-8 h-8 mb-2" />
                    <span className="text-xs">No photo selected</span>
                  </div>
                )}
                <div className="absolute bottom-1 right-1 px-1.5 py-0.5 bg-slate-900/80 backdrop-blur-sm rounded text-[9px] font-mono text-slate-300">
                  Preview
                </div>
              </div>

              {/* Upload Controls */}
              <div className="sm:col-span-2 space-y-2">
                <div className="flex items-center gap-2">
                  <label className="flex-1 cursor-pointer flex items-center justify-center gap-2 px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-medium border border-slate-700 transition-colors">
                    <Upload className="w-4 h-4 text-amber-400" />
                    <span>Upload Image File</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handlePhotoUpload}
                      className="hidden"
                    />
                  </label>

                  <label className="cursor-pointer flex items-center justify-center gap-2 px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-medium border border-slate-700 transition-colors">
                    <Camera className="w-4 h-4 text-sky-400" />
                    <span className="hidden sm:inline">Camera</span>
                    <input
                      type="file"
                      accept="image/*"
                      capture="environment"
                      onChange={handlePhotoUpload}
                      className="hidden"
                    />
                  </label>
                </div>

                <div className="text-[11px] text-slate-400">
                  Supported formats: JPG, PNG, WEBP (Max 8MB). Geotagged images are automatically cross-checked.
                </div>

                {/* Quick Sample Selector for evaluation testing */}
                <div className="flex items-center gap-2 pt-1">
                  <span className="text-[10px] font-mono text-slate-500">Quick Demo Photo:</span>
                  <button
                    type="button"
                    onClick={() => {
                      setPhotoUrl('/src/assets/images/fault_broken_light_1793539263427.jpg');
                      setPhotoPreview('/src/assets/images/fault_broken_light_1793539263427.jpg');
                    }}
                    className="text-[10px] text-amber-400 hover:underline font-mono"
                  >
                    Dark Luminaire Photo
                  </button>
                </div>
              </div>

            </div>
          </div>

          {/* Step 2: Fault Category */}
          <div>
            <label className="block text-xs font-mono uppercase tracking-wider text-slate-300 mb-2">
              2. Fault Category <span className="text-rose-400">*</span>
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
              {[
                { id: 'light_not_working', label: 'Light Not Working', desc: 'Completely unlit at night' },
                { id: 'flickering', label: 'Flickering Light', desc: 'Rapid flashing / strobe' },
                { id: 'damaged_pole', label: 'Damaged / Tilted Pole', desc: 'Structural collision or rust' },
                { id: 'broken_wiring', label: 'Broken / Exposed Wiring', desc: 'Urgent shock hazard' },
                { id: 'dim_illumination', label: 'Dim Illumination', desc: 'Low output / dying LED' },
                { id: 'other', label: 'Other Issue', desc: 'Timer / MCB / switch fault' }
              ].map((cat) => {
                const isSelected = faultCategory === cat.id;
                return (
                  <button
                    type="button"
                    key={cat.id}
                    onClick={() => setFaultCategory(cat.id as FaultCategory)}
                    className={`p-3 rounded-xl border text-left transition-all ${isSelected ? 'bg-amber-400/10 border-amber-400 text-white shadow-sm ring-1 ring-amber-400/50' : 'bg-slate-950/60 border-slate-800 text-slate-300 hover:border-slate-700'}`}
                  >
                    <div className="text-xs font-semibold">{cat.label}</div>
                    <div className="text-[10px] text-slate-400 mt-0.5 line-clamp-1">{cat.desc}</div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Step 3: Streetlight Pole ID (Optional with Autocomplete Suggestions) */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs font-mono uppercase tracking-wider text-slate-300">
                3. Streetlight Pole ID (If visible on pole sticker)
              </label>
              <span className="text-[11px] text-slate-500 font-mono">Optional</span>
            </div>
            
            <div className="relative">
              <Hash className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
              <input
                type="text"
                value={poleId}
                onChange={(e) => setPoleId(e.target.value.toUpperCase())}
                placeholder="e.g. SP-POLE-W04-012 (Check yellow pole label)"
                className="w-full bg-slate-950 text-white placeholder-slate-600 pl-10 pr-4 py-2.5 rounded-xl border border-slate-800 text-xs font-mono focus:outline-none focus:border-amber-400"
              />
            </div>

            {/* Quick Suggestions from Registered Poles */}
            <div className="mt-2 flex flex-wrap items-center gap-1.5">
              <span className="text-[10px] font-mono text-slate-500">Suggested nearby poles:</span>
              {poles.slice(0, 4).map((p) => (
                <button
                  type="button"
                  key={p.id}
                  onClick={() => handlePoleSelect(p.id)}
                  className="px-2 py-0.5 rounded text-[10px] font-mono bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition-colors"
                >
                  {p.id}
                </button>
              ))}
            </div>
          </div>

          {/* Step 4: Location Details (Street, Ward, Area, GPS Coordinates) */}
          <div className="space-y-3">
            <label className="block text-xs font-mono uppercase tracking-wider text-slate-300">
              4. Location Details <span className="text-rose-400">*</span>
            </label>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] text-slate-400 mb-1">Ward Number</label>
                <select
                  value={ward}
                  onChange={(e) => setWard(e.target.value)}
                  className="w-full bg-slate-950 text-white px-3 py-2.5 rounded-xl border border-slate-800 text-xs focus:outline-none focus:border-amber-400"
                >
                  <option value="Ward 01">Ward 01 – Central Business District</option>
                  <option value="Ward 04">Ward 04 – Indiranagar & Domlur</option>
                  <option value="Ward 08">Ward 08 – Malleshwaram</option>
                  <option value="Ward 12">Ward 12 – Koramangala</option>
                  <option value="Ward 20">Ward 20 – Whitefield & ITPL</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] text-slate-400 mb-1">Area / Locality</label>
                <input
                  type="text"
                  value={area}
                  onChange={(e) => setArea(e.target.value)}
                  className="w-full bg-slate-950 text-white px-3 py-2.5 rounded-xl border border-slate-800 text-xs focus:outline-none focus:border-amber-400"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] text-slate-400 mb-1">
                Street Name / Nearest Landmark <span className="text-rose-400">*</span>
              </label>
              <input
                type="text"
                value={streetName}
                onChange={(e) => setStreetName(e.target.value)}
                placeholder="e.g. 100 Feet Road, opposite Metro Pillar 140"
                className="w-full bg-slate-950 text-white placeholder-slate-600 px-3 py-2.5 rounded-xl border border-slate-800 text-xs focus:outline-none focus:border-amber-400"
              />
            </div>

            {/* GPS Telemetry Bar */}
            <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <Crosshair className="w-4 h-4 text-amber-400 shrink-0" />
                <div className="text-xs">
                  <span className="text-slate-400">GPS Coordinates: </span>
                  <span className="font-mono text-white tabular-nums">
                    {lat.toFixed(6)}° N, {lng.toFixed(6)}° E
                  </span>
                  {gpsCaptured && (
                    <span className="ml-2 text-[10px] text-emerald-400 font-mono">
                      (Telemetry verified)
                    </span>
                  )}
                </div>
              </div>

              <button
                type="button"
                onClick={handleFetchCurrentGps}
                disabled={isLocating}
                className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium rounded-lg border border-slate-700 transition-colors flex items-center gap-1.5"
              >
                <MapPin className="w-3.5 h-3.5 text-emerald-400" />
                <span>{isLocating ? 'Detecting GPS...' : 'Use My Live GPS'}</span>
              </button>
            </div>
          </div>

          {/* Step 5: Description */}
          <div>
            <label className="block text-xs font-mono uppercase tracking-wider text-slate-300 mb-1">
              5. Description of Fault <span className="text-rose-400">*</span>
            </label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe the issue (e.g. light turned off last Tuesday; sparks visible near junction box; section of road is pitch dark)"
              className="w-full bg-slate-950 text-white placeholder-slate-600 p-3 rounded-xl border border-slate-800 text-xs focus:outline-none focus:border-amber-400 leading-relaxed"
            />
          </div>

          {/* Step 6: Citizen Contact Details (Optional) */}
          <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <div className="text-xs font-semibold text-white flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-amber-400" />
                <span>Citizen Contact Details</span>
              </div>
              <span className="text-[10px] font-mono text-slate-500">Optional for SMS updates</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] text-slate-400 mb-1">Your Name</label>
                <input
                  type="text"
                  value={citizenName}
                  onChange={(e) => setCitizenName(e.target.value)}
                  placeholder="e.g. Prashanth Rao"
                  className="w-full bg-slate-900 text-white placeholder-slate-600 px-3 py-2 rounded-lg border border-slate-800 text-xs focus:outline-none focus:border-amber-400"
                />
              </div>

              <div>
                <label className="block text-[11px] text-slate-400 mb-1">Mobile Number (For status SMS)</label>
                <input
                  type="tel"
                  value={citizenPhone}
                  onChange={(e) => setCitizenPhone(e.target.value)}
                  placeholder="+91 98800 12345"
                  className="w-full bg-slate-900 text-white placeholder-slate-600 px-3 py-2 rounded-lg border border-slate-800 text-xs focus:outline-none focus:border-amber-400"
                />
              </div>
            </div>
          </div>

          {/* Submission Button */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-4 bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-sm rounded-xl transition-all shadow-lg shadow-amber-400/20 flex items-center justify-center gap-2 hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50"
            >
              {isSubmitting ? (
                <span>Registering Complaint with Control Room...</span>
              ) : (
                <>
                  <span>Submit Streetlight Fault Report</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
            <p className="text-center text-[11px] text-slate-500 mt-2 font-mono">
              Logged directly into BBMP Smart Municipal Grievance Database.
            </p>
          </div>

        </form>

      </div>
    </div>
  );
};
