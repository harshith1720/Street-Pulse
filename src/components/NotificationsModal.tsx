import React from 'react';
import { useApp } from '../context/AppContext';
import { Bell, CheckCheck, AlertCircle, Info, CheckCircle2, AlertTriangle, X } from 'lucide-react';

interface NotificationsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const NotificationsModal: React.FC<NotificationsModalProps> = ({ isOpen, onClose }) => {
  const { 
    notifications, 
    markNotificationRead, 
    markAllNotificationsRead, 
    setSelectedComplaintId, 
    setActiveTab 
  } = useApp();

  if (!isOpen) return null;

  const handleNotificationClick = (complaintId?: string, notifId?: string) => {
    if (notifId) markNotificationRead(notifId);
    if (complaintId) {
      setSelectedComplaintId(complaintId);
      setActiveTab('track');
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-150">
      <div 
        className="w-full max-w-lg bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/60">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-amber-400/10 text-amber-400 border border-amber-400/20">
              <Bell className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">Municipal Activity Feed</h3>
              <p className="text-xs text-slate-400">Live infrastructure alerts & status updates</p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <button
              onClick={markAllNotificationsRead}
              className="text-xs text-slate-400 hover:text-amber-400 flex items-center gap-1 transition-colors px-2 py-1 rounded"
              title="Mark all as read"
            >
              <CheckCheck className="w-3.5 h-3.5" />
              <span>Mark all read</span>
            </button>
            <button
              onClick={onClose}
              className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors"
              aria-label="Close notifications"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="overflow-y-auto divide-y divide-slate-800 p-2 space-y-1">
          {notifications.length === 0 ? (
            <div className="py-12 text-center text-slate-500 text-sm">
              No recent notifications.
            </div>
          ) : (
            notifications.map((n) => {
              const isUrgent = n.type === 'urgent';
              const isSuccess = n.type === 'success';
              const isWarning = n.type === 'warning';

              return (
                <div
                  key={n.id}
                  onClick={() => handleNotificationClick(n.complaintId, n.id)}
                  className={`p-3 rounded-xl transition-all cursor-pointer flex items-start gap-3 ${n.read ? 'bg-slate-900/60 hover:bg-slate-800/80 text-slate-300' : 'bg-slate-800/90 hover:bg-slate-800 text-white border-l-2 border-amber-400 shadow-sm'}`}
                >
                  <div className="mt-0.5 shrink-0">
                    {isUrgent && <AlertCircle className="w-4 h-4 text-rose-400" />}
                    {isWarning && <AlertTriangle className="w-4 h-4 text-amber-400" />}
                    {isSuccess && <CheckCircle2 className="w-4 h-4 text-emerald-400" />}
                    {!isUrgent && !isWarning && !isSuccess && <Info className="w-4 h-4 text-sky-400" />}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-xs font-semibold truncate text-slate-100">{n.title}</span>
                      <span className="text-[10px] font-mono text-slate-400 shrink-0">
                        {new Date(n.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 mt-0.5 line-clamp-2 leading-relaxed">
                      {n.message}
                    </p>
                    {n.complaintId && (
                      <span className="inline-block mt-1 text-[11px] font-mono text-amber-400/90 hover:underline">
                        View {n.complaintId} →
                      </span>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
