import React, { useState } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Header } from './components/Header';
import { LandingPage } from './components/LandingPage';
import { ReportFaultModal } from './components/ReportFaultModal';
import { TrackComplaintView } from './components/TrackComplaintView';
import { LiveMapView } from './components/LiveMapView';
import { AdminDashboard } from './components/AdminDashboard';
import { StaffPortal } from './components/StaffPortal';
import { PoleRegistryView } from './components/PoleRegistryView';
import { NotificationsModal } from './components/NotificationsModal';

const AppContent: React.FC = () => {
  const { activeTab } = useApp();
  const [notificationsOpen, setNotificationsOpen] = useState(false);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      <Header onOpenNotifications={() => setNotificationsOpen(true)} />
      
      <main className="flex-1">
        {activeTab === 'home' && <LandingPage />}
        {activeTab === 'report' && <ReportFaultModal />}
        {activeTab === 'track' && <TrackComplaintView />}
        {activeTab === 'map' && <LiveMapView />}
        {activeTab === 'admin' && <AdminDashboard />}
        {activeTab === 'staff' && <StaffPortal />}
        {activeTab === 'registry' && <PoleRegistryView />}
      </main>

      <NotificationsModal
        isOpen={notificationsOpen}
        onClose={() => setNotificationsOpen(false)}
      />
    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}
