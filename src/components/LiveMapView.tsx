import React, { useEffect, useRef, useState } from 'react';
import { useApp } from '../context/AppContext';
import { Complaint, ComplaintStatus, FaultCategory } from '../types';
import { formatFaultCategory, formatStatusLabel } from '../utils/verification';
import { 
  MapPin, 
  Filter, 
  Search, 
  Crosshair, 
  Eye, 
  Clock, 
  ShieldCheck, 
  Layers, 
  AlertCircle 
} from 'lucide-react';
import L from 'leaflet';

export const LiveMapView: React.FC = () => {
  const { complaints, setSelectedComplaintId, setActiveTab } = useApp();
  
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersLayerRef = useRef<L.LayerGroup | null>(null);

  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMarkerComplaint, setSelectedMarkerComplaint] = useState<Complaint | null>(null);

  // Filter complaints based on user controls
  const filteredComplaints = complaints.filter(c => {
    if (statusFilter !== 'all') {
      if (statusFilter === 'pending' && c.status !== 'submitted' && c.status !== 'under_review') return false;
      if (statusFilter === 'in_progress' && c.status !== 'assigned' && c.status !== 'in_progress') return false;
      if (statusFilter === 'awaiting_verification' && c.status !== 'awaiting_verification' && c.status !== 'repair_completed') return false;
      if (statusFilter === 'resolved' && c.status !== 'resolved') return false;
    }
    if (categoryFilter !== 'all' && c.faultCategory !== categoryFilter) {
      return false;
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const match = c.id.toLowerCase().includes(q) ||
                    c.streetName.toLowerCase().includes(q) ||
                    c.area.toLowerCase().includes(q) ||
                    c.ward.toLowerCase().includes(q) ||
                    (c.poleId && c.poleId.toLowerCase().includes(q));
      if (!match) return false;
    }
    return true;
  });

  // Initialize Leaflet map
  useEffect(() => {
    if (!mapContainerRef.current) return;
    if (mapInstanceRef.current) return; // already initialized

    // Center on Bengaluru municipal coordinates
    const map = L.map(mapContainerRef.current, {
      center: [12.9716, 77.6200],
      zoom: 13,
      zoomControl: true
    });

    // Public standard OpenStreetMap tiles (no API key required)
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      maxZoom: 19
    }).addTo(map);

    const markersLayer = L.layerGroup().addTo(map);
    markersLayerRef.current = markersLayer;
    mapInstanceRef.current = map;

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  // Update markers when filtered complaints change
  useEffect(() => {
    if (!mapInstanceRef.current || !markersLayerRef.current) return;

    markersLayerRef.current.clearLayers();

    filteredComplaints.forEach((c) => {
      // Determine marker color according to prompt specification:
      // Red: Pending (submitted / under_review)
      // Orange: In Progress (assigned / in_progress)
      // Green: Resolved
      // Purple: Awaiting Verification (repair_completed / awaiting_verification)
      let color = '#ef4444'; // Red (Pending)
      if (c.status === 'assigned' || c.status === 'in_progress' || c.status === 'reopened') {
        color = '#f59e0b'; // Orange
      } else if (c.status === 'awaiting_verification' || c.status === 'repair_completed') {
        color = '#a855f7'; // Purple
      } else if (c.status === 'resolved') {
        color = '#10b981'; // Green
      }

      // Create distinctive SVG circle marker with pulsing core
      const customIcon = L.divIcon({
        className: 'custom-map-pin',
        html: `
          <div style="
            background-color: ${color};
            width: 20px;
            height: 20px;
            border-radius: 50%;
            border: 3px solid #0f172a;
            box-shadow: 0 0 12px ${color}88;
            cursor: pointer;
            transition: transform 0.2s ease;
          "></div>
        `,
        iconSize: [20, 20],
        iconAnchor: [10, 10]
      });

      const marker = L.marker([c.lat, c.lng], { icon: customIcon });

      // Leaflet Popup with Complaint Details (protecting private contact data)
      const popupHtml = `
        <div style="padding: 12px; width: 220px; font-family: 'Plus Jakarta Sans', sans-serif;">
          <div style="font-size: 10px; font-family: monospace; color: #94a3b8; text-transform: uppercase;">${c.ward}</div>
          <div style="font-size: 14px; font-weight: bold; color: #f8fafc; margin-top: 2px;">${c.id}</div>
          <div style="font-size: 11px; color: ${color}; font-weight: 600; margin-top: 2px;">${formatStatusLabel(c.status)}</div>
          <div style="font-size: 11px; color: #cbd5e1; margin-top: 4px;"><b>Type:</b> ${formatFaultCategory(c.faultCategory)}</div>
          <div style="font-size: 11px; color: #94a3b8; margin-top: 2px;"><b>Area:</b> ${c.area}</div>
          <div style="font-size: 10px; color: #64748b; margin-top: 4px;">Logged: ${new Date(c.createdAt).toLocaleDateString()}</div>
        </div>
      `;

      marker.bindPopup(popupHtml);
      marker.on('click', () => {
        setSelectedMarkerComplaint(c);
      });

      markersLayerRef.current?.addLayer(marker);
    });

    // If there are complaints and map exists, fit bounds gently
    if (filteredComplaints.length > 0 && mapInstanceRef.current) {
      const bounds = L.latLngBounds(filteredComplaints.map(c => [c.lat, c.lng]));
      mapInstanceRef.current.fitBounds(bounds, { padding: [50, 50], maxZoom: 15 });
    }
  }, [filteredComplaints]);

  const handleLocateUser = () => {
    if (!navigator.geolocation || !mapInstanceRef.current) return;
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        mapInstanceRef.current?.setView([pos.coords.latitude, pos.coords.longitude], 15);
      },
      (err) => {
        console.warn('Geolocation error:', err);
      }
    );
  };

  return (
    <div className="max-w-7xl mx-auto my-6 px-4 sm:px-6 lg:px-8 space-y-4">
      
      {/* Top Filter & Search Bar */}
      <div className="p-4 sm:p-5 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
        
        {/* Title */}
        <div>
          <div className="text-xs font-mono text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
            <MapPin className="w-3.5 h-3.5" />
            <span>Interactive Municipal GIS Infrastructure Map</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-white mt-0.5">
            Live Streetlight Outage Map
          </h2>
        </div>

        {/* Search input */}
        <div className="flex-1 max-w-sm">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search area, street or pole..."
              className="w-full bg-slate-950 text-white placeholder-slate-600 pl-9 pr-3 py-2 rounded-xl border border-slate-800 text-xs focus:outline-none focus:border-amber-400"
            />
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-2">
          
          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-slate-950 text-slate-200 text-xs px-3 py-2 rounded-xl border border-slate-800 focus:outline-none focus:border-amber-400"
          >
            <option value="all">All Statuses ({complaints.length})</option>
            <option value="pending">Pending Outages</option>
            <option value="in_progress">In Progress / Assigned</option>
            <option value="awaiting_verification">Awaiting Verification</option>
            <option value="resolved">Resolved</option>
          </select>

          {/* Fault Category Filter */}
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="bg-slate-950 text-slate-200 text-xs px-3 py-2 rounded-xl border border-slate-800 focus:outline-none focus:border-amber-400"
          >
            <option value="all">All Fault Types</option>
            <option value="light_not_working">Light Not Working</option>
            <option value="flickering">Flickering</option>
            <option value="damaged_pole">Damaged Pole</option>
            <option value="broken_wiring">Broken Wiring</option>
            <option value="dim_illumination">Dim Illumination</option>
          </select>

          {/* Center Location */}
          <button
            onClick={handleLocateUser}
            className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl border border-slate-700 transition-colors"
            title="Center on my GPS location"
          >
            <Crosshair className="w-4 h-4 text-amber-400" />
          </button>
        </div>

      </div>

      {/* Main Map Canvas + Detail Drawer Split */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
        
        {/* Leaflet Map Surface */}
        <div className="lg:col-span-3 h-[600px] rounded-2xl overflow-hidden border border-slate-800 shadow-2xl relative">
          <div ref={mapContainerRef} className="w-full h-full" />
          
          {/* Floating Map Legend (Prompt requirement: Red=Pending, Orange=In Progress, Green=Resolved, Purple=Awaiting Verification) */}
          <div className="absolute bottom-4 left-4 z-20 p-3 rounded-xl bg-slate-950/90 border border-slate-800 backdrop-blur-md shadow-xl text-xs space-y-1.5">
            <div className="font-mono text-[10px] text-slate-400 uppercase tracking-wider mb-1">
              Marker Status Legend
            </div>
            <div className="flex items-center gap-2 text-slate-300">
              <span className="w-3 h-3 rounded-full bg-rose-500 shadow-sm shadow-rose-500/50" />
              <span>Pending Attention ({complaints.filter(c => c.status === 'submitted' || c.status === 'under_review').length})</span>
            </div>
            <div className="flex items-center gap-2 text-slate-300">
              <span className="w-3 h-3 rounded-full bg-amber-500 shadow-sm shadow-amber-500/50" />
              <span>In Progress / Dispatched ({complaints.filter(c => c.status === 'assigned' || c.status === 'in_progress').length})</span>
            </div>
            <div className="flex items-center gap-2 text-slate-300">
              <span className="w-3 h-3 rounded-full bg-purple-500 shadow-sm shadow-purple-500/50" />
              <span>Awaiting Verification ({complaints.filter(c => c.status === 'awaiting_verification' || c.status === 'repair_completed').length})</span>
            </div>
            <div className="flex items-center gap-2 text-slate-300">
              <span className="w-3 h-3 rounded-full bg-emerald-500 shadow-sm shadow-emerald-500/50" />
              <span>Verified Resolved ({complaints.filter(c => c.status === 'resolved').length})</span>
            </div>
          </div>
        </div>

        {/* Selected Complaint Inspector Drawer */}
        <div className="lg:col-span-1 h-[600px] rounded-2xl bg-slate-900 border border-slate-800 shadow-2xl p-5 flex flex-col justify-between overflow-y-auto">
          {selectedMarkerComplaint ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <span className="text-xs font-mono text-slate-400">PIN DETAILS</span>
                <span className="text-xs font-mono font-bold text-amber-400">{selectedMarkerComplaint.id}</span>
              </div>

              {/* Photo */}
              <div className="aspect-[4/3] rounded-xl overflow-hidden bg-slate-950 border border-slate-800 relative">
                <img
                  src={selectedMarkerComplaint.repairDetails?.afterPhotoUrl || selectedMarkerComplaint.photoUrl}
                  alt="Streetlight pin preview"
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute top-2 right-2 px-2 py-0.5 rounded text-[10px] font-mono font-semibold bg-slate-950/80 text-white border border-slate-700">
                  {selectedMarkerComplaint.repairDetails?.afterPhotoUrl ? 'Repaired' : 'Reported'}
                </div>
              </div>

              <div>
                <div className="text-sm font-bold text-white">
                  {formatFaultCategory(selectedMarkerComplaint.faultCategory)}
                </div>
                <div className="text-xs text-slate-400 mt-1">
                  {selectedMarkerComplaint.streetName}, {selectedMarkerComplaint.area}
                </div>
              </div>

              <div className="space-y-2 text-xs border-t border-slate-800 pt-3">
                <div className="flex justify-between">
                  <span className="text-slate-500">Status</span>
                  <span className="font-semibold text-slate-200">{formatStatusLabel(selectedMarkerComplaint.status)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Ward</span>
                  <span className="font-semibold text-slate-200">{selectedMarkerComplaint.ward}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Pole ID</span>
                  <span className="font-mono text-slate-200">{selectedMarkerComplaint.poleId || 'Untagged'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Priority</span>
                  <span className="font-mono uppercase text-amber-400">{selectedMarkerComplaint.priority}</span>
                </div>
              </div>

              <p className="text-xs text-slate-400 italic bg-slate-950 p-3 rounded-lg border border-slate-800">
                "{selectedMarkerComplaint.description}"
              </p>

              <button
                onClick={() => {
                  setSelectedComplaintId(selectedMarkerComplaint.id);
                  setActiveTab('track');
                }}
                className="w-full py-2.5 bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-xs rounded-xl transition-all shadow-md flex items-center justify-center gap-1.5"
              >
                <Eye className="w-4 h-4" />
                <span>Open Full Complaint View</span>
              </button>
            </div>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-center p-4 text-slate-500">
              <MapPin className="w-10 h-10 mb-3 text-slate-600" />
              <div className="text-xs font-semibold text-slate-300">Select a Map Pin</div>
              <p className="text-[11px] text-slate-500 mt-1">
                Click on any colored streetlight marker on the GIS map to view fault diagnosis and inspection records.
              </p>
            </div>
          )}
        </div>

      </div>

    </div>
  );
};
