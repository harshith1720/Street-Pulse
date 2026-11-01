import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { translations } from '../utils/i18n';
import { 
  Lightbulb, 
  Bell, 
  ShieldCheck, 
  Wrench, 
  User, 
  MapPin, 
  Search, 
  FilePlus2, 
  Globe2, 
  Menu, 
  X 
} from 'lucide-react';

interface HeaderProps {
  onOpenNotifications: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onOpenNotifications }) => {
  const { 
    currentRole, 
    setCurrentRole, 
    language, 
    setLanguage, 
    activeTab, 
    setActiveTab, 
    notifications,
    staff,
    activeStaffId,
    setActiveStaffId
  } = useApp();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [roleMenuOpen, setRoleMenuOpen] = useState(false);

  const t = translations[language];
  const unreadCount = notifications.filter(n => !n.read).length;

  const handleNavClick = (tab: string) => {
    setActiveTab(tab);
    setMobileMenuOpen(false);
  };

  return (
    <header className="sticky top-0 z-40 bg-slate-950/90 backdrop-blur-md border-b border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          
          {/* Zone 1: Brand Wordmark (Single text element wordmark with illumination mark) */}
          <button 
            onClick={() => handleNavClick('home')}
            className="flex items-center gap-2.5 text-left focus:outline-none group shrink-0"
            aria-label="StreetPulse Home"
          >
            <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-amber-400 to-amber-500 text-slate-950 flex items-center justify-center font-bold shadow-md shadow-amber-500/20 group-hover:scale-105 transition-transform">
              <Lightbulb className="w-5 h-5 fill-slate-950" />
            </div>
            <div className="flex flex-col">
              <span className="text-xl font-bold tracking-tight text-white flex items-center gap-1.5">
                StreetPulse
                <span className="text-[10px] font-mono tracking-widest uppercase bg-amber-400/10 text-amber-300 border border-amber-400/20 px-1.5 py-0.5 rounded">
                  BBMP GovTech
                </span>
              </span>
            </div>
          </button>

          {/* Zone 2: 4–5 Concise Single-Line Nav Links */}
          <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-300" aria-label="Main Navigation">
            <button
              onClick={() => handleNavClick('home')}
              className={`transition-colors whitespace-nowrap shrink-0 hover:text-white ${activeTab === 'home' ? 'text-amber-400 font-semibold border-b-2 border-amber-400 pb-0.5' : ''}`}
            >
              {t.home}
            </button>
            <button
              onClick={() => handleNavClick('report')}
              className={`transition-colors whitespace-nowrap shrink-0 hover:text-white flex items-center gap-1.5 ${activeTab === 'report' ? 'text-amber-400 font-semibold border-b-2 border-amber-400 pb-0.5' : ''}`}
            >
              <FilePlus2 className="w-4 h-4 text-amber-400" />
              {t.reportFault}
            </button>
            <button
              onClick={() => handleNavClick('track')}
              className={`transition-colors whitespace-nowrap shrink-0 hover:text-white flex items-center gap-1.5 ${activeTab === 'track' ? 'text-amber-400 font-semibold border-b-2 border-amber-400 pb-0.5' : ''}`}
            >
              <Search className="w-4 h-4 text-slate-400" />
              {t.trackComplaint}
            </button>
            <button
              onClick={() => handleNavClick('map')}
              className={`transition-colors whitespace-nowrap shrink-0 hover:text-white flex items-center gap-1.5 ${activeTab === 'map' ? 'text-amber-400 font-semibold border-b-2 border-amber-400 pb-0.5' : ''}`}
            >
              <MapPin className="w-4 h-4 text-emerald-400" />
              {t.liveMap}
            </button>
            <button
              onClick={() => handleNavClick('registry')}
              className={`transition-colors whitespace-nowrap shrink-0 hover:text-white ${activeTab === 'registry' ? 'text-amber-400 font-semibold border-b-2 border-amber-400 pb-0.5' : ''}`}
            >
              {t.polesRegistry}
            </button>

            {/* Role specific quick portal links */}
            {currentRole === 'admin' && (
              <button
                onClick={() => handleNavClick('admin')}
                className={`transition-colors whitespace-nowrap shrink-0 flex items-center gap-1.5 px-2.5 py-1 rounded bg-sky-950/60 border border-sky-700/60 text-sky-300 font-medium ${activeTab === 'admin' ? 'ring-1 ring-sky-400' : ''}`}
              >
                <ShieldCheck className="w-3.5 h-3.5 text-sky-400" />
                {t.adminDashboard}
              </button>
            )}

            {currentRole === 'staff' && (
              <button
                onClick={() => handleNavClick('staff')}
                className={`transition-colors whitespace-nowrap shrink-0 flex items-center gap-1.5 px-2.5 py-1 rounded bg-amber-950/60 border border-amber-700/60 text-amber-300 font-medium ${activeTab === 'staff' ? 'ring-1 ring-amber-400' : ''}`}
              >
                <Wrench className="w-3.5 h-3.5 text-amber-400" />
                {t.staffPortal}
              </button>
            )}
          </nav>

          {/* Zone 3: 1 Primary Action + Role Switcher & Utilities */}
          <div className="flex items-center gap-2.5 shrink-0">
            
            {/* Language Toggle (English / Kannada) */}
            <button
              onClick={() => setLanguage(language === 'en' ? 'kn' : 'en')}
              className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium text-slate-300 bg-slate-900 hover:bg-slate-800 border border-slate-700 rounded-lg transition-colors"
              title="Toggle English / Kannada (ಕನ್ನಡ)"
            >
              <Globe2 className="w-3.5 h-3.5 text-amber-400" />
              <span className="font-mono uppercase">{language === 'en' ? 'ಕನ್ನಡ' : 'ENG'}</span>
            </button>

            {/* Notifications Button */}
            <button
              onClick={onOpenNotifications}
              className="relative p-2 text-slate-300 hover:text-white bg-slate-900 hover:bg-slate-800 border border-slate-700 rounded-lg transition-colors"
              aria-label="View municipal notifications"
            >
              <Bell className="w-4 h-4" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-amber-400 text-slate-950 rounded-full text-[10px] font-bold flex items-center justify-center font-mono animate-pulse">
                  {unreadCount}
                </span>
              )}
            </button>

            {/* Portal / Role Switcher Menu */}
            <div className="relative">
              <button
                onClick={() => setRoleMenuOpen(!roleMenuOpen)}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg border transition-all text-slate-200 bg-slate-900 border-slate-700 hover:border-slate-500"
                aria-label="Select portal mode"
              >
                {currentRole === 'citizen' && <User className="w-3.5 h-3.5 text-emerald-400" />}
                {currentRole === 'admin' && <ShieldCheck className="w-3.5 h-3.5 text-sky-400" />}
                {currentRole === 'staff' && <Wrench className="w-3.5 h-3.5 text-amber-400" />}
                <span className="capitalize">{currentRole} Mode</span>
              </button>

              {roleMenuOpen && (
                <div 
                  className="absolute right-0 mt-2 w-64 bg-slate-900 border border-slate-700 rounded-xl shadow-2xl p-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150"
                  onClick={() => setRoleMenuOpen(false)}
                >
                  <div className="px-2 py-1.5 text-[11px] font-mono text-slate-400 uppercase tracking-wider border-b border-slate-800">
                    Switch Active Portal
                  </div>
                  
                  <button
                    onClick={() => {
                      setCurrentRole('citizen');
                      setActiveTab('report');
                    }}
                    className={`w-full flex items-center gap-2.5 px-3 py-2 text-xs rounded-lg text-left transition-colors ${currentRole === 'citizen' ? 'bg-amber-400/10 text-amber-300 font-semibold' : 'text-slate-300 hover:bg-slate-800'}`}
                  >
                    <User className="w-4 h-4 text-emerald-400" />
                    <div>
                      <div className="font-medium">Citizen Portal</div>
                      <div className="text-[11px] text-slate-400">Public report & tracking</div>
                    </div>
                  </button>

                  <button
                    onClick={() => {
                      setCurrentRole('admin');
                      setActiveTab('admin');
                    }}
                    className={`w-full flex items-center gap-2.5 px-3 py-2 text-xs rounded-lg text-left transition-colors ${currentRole === 'admin' ? 'bg-amber-400/10 text-amber-300 font-semibold' : 'text-slate-300 hover:bg-slate-800'}`}
                  >
                    <ShieldCheck className="w-4 h-4 text-sky-400" />
                    <div>
                      <div className="font-medium">Municipal Admin Portal</div>
                      <div className="text-[11px] text-slate-400">Triage, dispatch, verify</div>
                    </div>
                  </button>

                  <button
                    onClick={() => {
                      setCurrentRole('staff');
                      setActiveTab('staff');
                    }}
                    className={`w-full flex items-center gap-2.5 px-3 py-2 text-xs rounded-lg text-left transition-colors ${currentRole === 'staff' ? 'bg-amber-400/10 text-amber-300 font-semibold' : 'text-slate-300 hover:bg-slate-800'}`}
                  >
                    <Wrench className="w-4 h-4 text-amber-400" />
                    <div>
                      <div className="font-medium">Maintenance Field Crew</div>
                      <div className="text-[11px] text-slate-400">On-site repair evidence</div>
                    </div>
                  </button>

                  {currentRole === 'staff' && (
                    <div className="mt-2 pt-2 border-t border-slate-800">
                      <div className="px-2 text-[10px] text-slate-400 font-mono">Logged in technician:</div>
                      <select
                        value={activeStaffId}
                        onChange={(e) => setActiveStaffId(e.target.value)}
                        className="mt-1 w-full bg-slate-950 text-xs text-slate-200 border border-slate-700 rounded px-2 py-1"
                        onClick={(e) => e.stopPropagation()}
                      >
                        {staff.map(s => (
                          <option key={s.id} value={s.id}>
                            {s.name} ({s.wardAssigned})
                          </option>
                        ))}
                      </select>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Primary CTA Button */}
            <button
              onClick={() => handleNavClick(currentRole === 'admin' ? 'admin' : currentRole === 'staff' ? 'staff' : 'report')}
              className="hidden sm:inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-slate-950 bg-amber-400 hover:bg-amber-300 rounded-lg shadow-sm transition-all whitespace-nowrap shrink-0 hover:scale-[1.02] active:scale-[0.98]"
            >
              {currentRole === 'admin' ? 'Open Dashboard' : currentRole === 'staff' ? 'My Assigned Jobs' : t.reportFault}
            </button>

            {/* Mobile Hamburger Menu */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 text-slate-300 hover:text-white"
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>

        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-slate-900 border-b border-slate-800 px-4 pt-2 pb-4 space-y-1">
          <button
            onClick={() => handleNavClick('home')}
            className="w-full text-left px-3 py-2 rounded-lg text-sm font-medium text-slate-200 hover:bg-slate-800"
          >
            {t.home}
          </button>
          <button
            onClick={() => handleNavClick('report')}
            className="w-full text-left px-3 py-2 rounded-lg text-sm font-medium text-slate-200 hover:bg-slate-800 flex items-center gap-2"
          >
            <FilePlus2 className="w-4 h-4 text-amber-400" />
            {t.reportFault}
          </button>
          <button
            onClick={() => handleNavClick('track')}
            className="w-full text-left px-3 py-2 rounded-lg text-sm font-medium text-slate-200 hover:bg-slate-800 flex items-center gap-2"
          >
            <Search className="w-4 h-4 text-slate-400" />
            {t.trackComplaint}
          </button>
          <button
            onClick={() => handleNavClick('map')}
            className="w-full text-left px-3 py-2 rounded-lg text-sm font-medium text-slate-200 hover:bg-slate-800 flex items-center gap-2"
          >
            <MapPin className="w-4 h-4 text-emerald-400" />
            {t.liveMap}
          </button>
          <button
            onClick={() => handleNavClick('registry')}
            className="w-full text-left px-3 py-2 rounded-lg text-sm font-medium text-slate-200 hover:bg-slate-800"
          >
            {t.polesRegistry}
          </button>
          <button
            onClick={() => handleNavClick('admin')}
            className="w-full text-left px-3 py-2 rounded-lg text-sm font-medium text-sky-400 hover:bg-slate-800 flex items-center gap-2"
          >
            <ShieldCheck className="w-4 h-4" />
            {t.adminDashboard}
          </button>
          <button
            onClick={() => handleNavClick('staff')}
            className="w-full text-left px-3 py-2 rounded-lg text-sm font-medium text-amber-400 hover:bg-slate-800 flex items-center gap-2"
          >
            <Wrench className="w-4 h-4" />
            {t.staffPortal}
          </button>
        </div>
      )}
    </header>
  );
};
