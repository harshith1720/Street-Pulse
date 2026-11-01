import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { StreetlightPole } from '../types';
import { 
  Hash, 
  Search, 
  QrCode, 
  MapPin, 
  Lightbulb, 
  Calendar, 
  ShieldCheck, 
  X, 
  ArrowRight,
  Filter
} from 'lucide-react';

export const PoleRegistryView: React.FC = () => {
  const { poles, setActiveTab } = useApp();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [wardFilter, setWardFilter] = useState('all');
  const [selectedPoleForQr, setSelectedPoleForQr] = useState<StreetlightPole | null>(null);

  const filteredPoles = poles.filter(p => {
    if (wardFilter !== 'all' && p.ward !== wardFilter) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const match = p.id.toLowerCase().includes(q) ||
                    p.streetName.toLowerCase().includes(q) ||
                    p.area.toLowerCase().includes(q) ||
                    p.ward.toLowerCase().includes(q);
      if (!match) return false;
    }
    return true;
  });

  return (
    <div className="max-w-7xl mx-auto my-6 px-4 sm:px-6 lg:px-8 space-y-6">
      
      {/* Top Banner */}
      <div className="p-6 sm:p-8 rounded-3xl bg-slate-900 border border-slate-800 shadow-2xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="text-xs font-mono text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
            <Lightbulb className="w-4 h-4" />
            <span>Public GIS Asset Directory</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white mt-1">
            Streetlight Pole Registry & QR Barcodes
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-2xl">
            Every municipal luminaire is assigned an indelible barcode identifier. Scanning or clicking any pole below generates a direct fault report with coordinates and fixture metadata prefilled.
          </p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex-1 min-w-[240px]">
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-2.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by Pole ID, street or locality..."
              className="w-full bg-slate-950 text-white placeholder-slate-600 pl-8 pr-3 py-2 rounded-xl border border-slate-800 focus:outline-none focus:border-amber-400"
            />
          </div>
        </div>

        <div className="flex items-center gap-2">
          <select
            value={wardFilter}
            onChange={(e) => setWardFilter(e.target.value)}
            className="bg-slate-950 text-slate-200 px-3 py-2 rounded-xl border border-slate-800 focus:outline-none"
          >
            <option value="all">All Wards ({poles.length} Poles)</option>
            <option value="Ward 01">Ward 01 – CBD</option>
            <option value="Ward 04">Ward 04 – Indiranagar</option>
            <option value="Ward 08">Ward 08 – Malleshwaram</option>
            <option value="Ward 12">Ward 12 – Koramangala</option>
          </select>
        </div>
      </div>

      {/* Poles Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {filteredPoles.map((pole) => (
          <div 
            key={pole.id}
            className="p-5 rounded-2xl bg-slate-900 border border-slate-800 hover:border-slate-700 transition-all flex flex-col justify-between space-y-4"
          >
            <div>
              <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                <span className="text-xs font-mono font-bold text-amber-400">{pole.id}</span>
                <span className={`text-[10px] font-mono px-2 py-0.5 rounded capitalize ${pole.condition === 'excellent' || pole.condition === 'good' ? 'bg-emerald-950 text-emerald-300' : 'bg-amber-950 text-amber-300'}`}>
                  {pole.condition}
                </span>
              </div>

              <div className="mt-3">
                <h4 className="text-sm font-semibold text-white line-clamp-1">{pole.streetName}</h4>
                <div className="text-xs text-slate-400 mt-0.5">{pole.area} · {pole.ward}</div>
              </div>

              <div className="mt-3 space-y-1.5 text-xs text-slate-400 pt-2 border-t border-slate-800/80">
                <div className="flex justify-between">
                  <span className="text-slate-500">Fixture</span>
                  <span className="text-slate-300 truncate max-w-[140px]">{pole.fixtureType}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Wattage</span>
                  <span className="font-mono text-slate-300">{pole.wattage}W LED</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Coordinates</span>
                  <span className="font-mono text-[11px] text-amber-400/90">{pole.lat.toFixed(4)}°, {pole.lng.toFixed(4)}°</span>
                </div>
              </div>
            </div>

            <div className="pt-2 border-t border-slate-800 flex items-center justify-between gap-2">
              <button
                onClick={() => setSelectedPoleForQr(pole)}
                className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-mono rounded-lg border border-slate-700 flex items-center gap-1.5 transition-colors"
              >
                <QrCode className="w-3.5 h-3.5 text-amber-400" />
                <span>QR Badge</span>
              </button>

              <button
                onClick={() => {
                  setActiveTab('report');
                }}
                className="px-3 py-1.5 bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-xs rounded-lg shadow-sm transition-all flex items-center gap-1"
              >
                <span>Report Fault</span>
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* QR Code Modal */}
      {selectedPoleForQr && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="w-full max-w-sm bg-slate-900 border border-slate-700 rounded-3xl p-6 shadow-2xl text-center space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <span className="text-xs font-mono text-amber-400 font-bold">MUNICIPAL SMART TAG</span>
              <button 
                onClick={() => setSelectedPoleForQr(null)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* High-visibility QR code preview */}
            <div className="bg-white p-4 rounded-2xl inline-block shadow-xl">
              <div className="w-44 h-44 bg-slate-950 text-white flex flex-col items-center justify-center p-3 rounded-lg border-4 border-slate-900">
                <QrCode className="w-32 h-32 text-amber-400" />
                <span className="text-[9px] font-mono text-slate-300 mt-1">BBMP SMART POLE TAG</span>
              </div>
            </div>

            <div>
              <div className="text-base font-extrabold font-mono text-white">{selectedPoleForQr.id}</div>
              <div className="text-xs text-slate-400 mt-0.5">{selectedPoleForQr.streetName}</div>
              <div className="text-[11px] font-mono text-slate-500 mt-1">
                {selectedPoleForQr.lat.toFixed(5)}° N, {selectedPoleForQr.lng.toFixed(5)}° E
              </div>
            </div>

            <div className="pt-2">
              <button
                onClick={() => {
                  setSelectedPoleForQr(null);
                  setActiveTab('report');
                }}
                className="w-full py-2.5 bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-xs rounded-xl shadow-md transition-all flex items-center justify-center gap-1.5"
              >
                <span>Report Fault for this Pole</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
