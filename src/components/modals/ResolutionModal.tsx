import React, { useState, useEffect } from 'react';
import { X, CheckCircle2, CalendarClock, Ban, Clock, AlertTriangle } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { formatDateTime } from '../../utils/dateUtils';

export const ResolutionModal: React.FC = () => {
  const {
    resolvingMeeting,
    closeResolutionModal,
    resolveMeetingStatus,
    openMomModal,
    projects,
  } = useApp();

  const [selectedAction, setSelectedAction] = useState<'MEETING_OVER' | 'RESCHEDULED' | 'CANCELLED' | null>(null);
  const [rescheduleDate, setRescheduleDate] = useState<string>('');
  const [rescheduleTime, setRescheduleTime] = useState<string>('14:00');
  const [isRescheduleTbd, setIsRescheduleTbd] = useState<boolean>(false);
  const [cancellationReason, setCancellationReason] = useState<string>('');

  useEffect(() => {
    if (resolvingMeeting) {
      setSelectedAction(null);
      setIsRescheduleTbd(false);
      setCancellationReason('');

      // Default reschedule date to +2 days
      const d = new Date();
      d.setDate(d.getDate() + 2);
      const yyyy = d.getFullYear();
      const mm = String(d.getMonth() + 1).padStart(2, '0');
      const dd = String(d.getDate()).padStart(2, '0');
      setRescheduleDate(`${yyyy}-${mm}-${dd}`);
      setRescheduleTime('14:00');
    }
  }, [resolvingMeeting]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && resolvingMeeting) {
        closeResolutionModal();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [resolvingMeeting, closeResolutionModal]);

  if (!resolvingMeeting) return null;

  const project = projects.find((p) => p.id === resolvingMeeting.project_id);

  const handleConfirm = () => {
    if (!selectedAction) return;

    if (selectedAction === 'MEETING_OVER') {
      resolveMeetingStatus(resolvingMeeting.id, 'MEETING_OVER');
      closeResolutionModal();
      // Immediately launch MOM entry modal
      openMomModal(resolvingMeeting);
    } else if (selectedAction === 'RESCHEDULED') {
      let newDateTimeIso: string | null = null;
      if (!isRescheduleTbd && rescheduleDate) {
        const [y, m, d] = rescheduleDate.split('-').map(Number);
        const [hh, mm] = (rescheduleTime || '14:00').split(':').map(Number);
        newDateTimeIso = new Date(y, m - 1, d, hh, mm, 0).toISOString();
      }

      resolveMeetingStatus(resolvingMeeting.id, 'RESCHEDULED', {
        newDateTime: newDateTimeIso,
        isTbd: isRescheduleTbd,
      });
      closeResolutionModal();
    } else if (selectedAction === 'CANCELLED') {
      resolveMeetingStatus(resolvingMeeting.id, 'CANCELLED', {
        cancellationReason: cancellationReason.trim() || 'Meeting cancelled by project team',
      });
      closeResolutionModal();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white rounded-xl shadow-2xl border border-slate-200 w-full max-w-lg overflow-hidden flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-amber-50/70">
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-amber-100 text-amber-800 rounded-lg">
              <AlertTriangle className="w-5 h-5 text-amber-600" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-slate-900">Resolve Meeting Status</h3>
              <p className="text-xs text-slate-500">Record actual session outcome and maintain audit momentum</p>
            </div>
          </div>
          <button
            onClick={closeResolutionModal}
            className="p-1 rounded-md text-slate-400 hover:text-slate-600 hover:bg-slate-200/60 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Meeting Details Summary Card */}
        <div className="p-6 space-y-4">
          <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-lg text-xs space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-indigo-700">{project?.name || 'Project Session'}</span>
              <span className="text-slate-500 font-mono tabular-nums">{formatDateTime(resolvingMeeting.date_time)}</span>
            </div>
            <div className="font-medium text-slate-800 text-sm">{resolvingMeeting.key_objective}</div>
            <div className="text-slate-500 text-[11px] truncate">
              Stakeholders: {resolvingMeeting.stakeholders_text}
            </div>
          </div>

          {/* Three Choice Cards */}
          <div className="space-y-2.5">
            <label className="block text-xs font-semibold text-slate-700">Select Resolution Outcome:</label>

            {/* Option 1: Meeting Over */}
            <div
              onClick={() => setSelectedAction('MEETING_OVER')}
              className={`p-3.5 rounded-lg border cursor-pointer transition-all flex items-start gap-3 ${
                selectedAction === 'MEETING_OVER'
                  ? 'border-emerald-500 bg-emerald-50/70 ring-1 ring-emerald-500/30'
                  : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50/60'
              }`}
            >
              <CheckCircle2
                className={`w-5 h-5 shrink-0 mt-0.5 ${
                  selectedAction === 'MEETING_OVER' ? 'text-emerald-600' : 'text-slate-400'
                }`}
              />
              <div className="flex-1">
                <div className="text-xs font-semibold text-slate-900">
                  Meeting Over (Conducted)
                </div>
                <div className="text-[11px] text-slate-500 mt-0.5">
                  Session finished successfully. Launches MOM entry to capture key takeaways, deliverables, and chained follow-ups.
                </div>
              </div>
            </div>

            {/* Option 2: Rescheduled */}
            <div
              onClick={() => setSelectedAction('RESCHEDULED')}
              className={`p-3.5 rounded-lg border cursor-pointer transition-all flex items-start gap-3 ${
                selectedAction === 'RESCHEDULED'
                  ? 'border-amber-500 bg-amber-50/70 ring-1 ring-amber-500/30'
                  : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50/60'
              }`}
            >
              <CalendarClock
                className={`w-5 h-5 shrink-0 mt-0.5 ${
                  selectedAction === 'RESCHEDULED' ? 'text-amber-600' : 'text-slate-400'
                }`}
              />
              <div className="flex-1">
                <div className="text-xs font-semibold text-slate-900">
                  Rescheduled
                </div>
                <div className="text-[11px] text-slate-500 mt-0.5">
                  Meeting postponed to a new confirmed slot or moved into the Awaiting Scheduling (TBD) backlog.
                </div>

                {/* Reschedule Inputs if chosen */}
                {selectedAction === 'RESCHEDULED' && (
                  <div className="mt-3 pt-3 border-t border-amber-200/70 space-y-2.5" onClick={(e) => e.stopPropagation()}>
                    <label className="flex items-center gap-2 text-xs font-medium text-slate-700 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={isRescheduleTbd}
                        onChange={(e) => setIsRescheduleTbd(e.target.checked)}
                        className="rounded text-amber-600 focus:ring-amber-500 w-3.5 h-3.5 border-slate-300"
                      />
                      <span>Date TBD (Do not set a date yet; monitor in TBD Backlog)</span>
                    </label>

                    {!isRescheduleTbd ? (
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="block text-[10px] font-medium text-slate-600 mb-1">New Date</label>
                          <input
                            type="date"
                            value={rescheduleDate}
                            onChange={(e) => setRescheduleDate(e.target.value)}
                            className="w-full text-xs rounded border border-slate-300 px-2.5 py-1.5 bg-white text-slate-800"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] font-medium text-slate-600 mb-1">New Time</label>
                          <input
                            type="time"
                            value={rescheduleTime}
                            onChange={(e) => setRescheduleTime(e.target.value)}
                            className="w-full text-xs rounded border border-slate-300 px-2.5 py-1.5 bg-white text-slate-800"
                          />
                        </div>
                      </div>
                    ) : (
                      <div className="p-2 bg-amber-100/60 rounded text-[11px] text-amber-900 flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 text-amber-700 shrink-0" />
                        <span>Will appear under &ldquo;Awaiting Scheduling (TBD)&rdquo; drawer with age counter.</span>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Option 3: Cancelled */}
            <div
              onClick={() => setSelectedAction('CANCELLED')}
              className={`p-3.5 rounded-lg border cursor-pointer transition-all flex items-start gap-3 ${
                selectedAction === 'CANCELLED'
                  ? 'border-rose-500 bg-rose-50/70 ring-1 ring-rose-500/30'
                  : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50/60'
              }`}
            >
              <Ban
                className={`w-5 h-5 shrink-0 mt-0.5 ${
                  selectedAction === 'CANCELLED' ? 'text-rose-600' : 'text-slate-400'
                }`}
              />
              <div className="flex-1">
                <div className="text-xs font-semibold text-slate-900">
                  Cancelled
                </div>
                <div className="text-[11px] text-slate-500 mt-0.5">
                  Session called off. Retained in engagement history with reason for audit trail.
                </div>

                {selectedAction === 'CANCELLED' && (
                  <div className="mt-3 pt-3 border-t border-rose-200/70" onClick={(e) => e.stopPropagation()}>
                    <label className="block text-[10px] font-medium text-slate-700 mb-1">
                      Cancellation Reason (Optional)
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Scope superseded by executive steering committee"
                      value={cancellationReason}
                      onChange={(e) => setCancellationReason(e.target.value)}
                      className="w-full text-xs rounded border border-slate-300 px-2.5 py-1.5 bg-white text-slate-800"
                    />
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex items-center justify-end gap-2.5">
          <button
            type="button"
            onClick={closeResolutionModal}
            className="px-4 py-2 text-xs font-medium text-slate-700 hover:bg-slate-200/60 rounded-lg transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            disabled={!selectedAction}
            onClick={handleConfirm}
            className={`px-4 py-2 text-xs font-semibold rounded-lg shadow-xs transition-colors flex items-center gap-1.5 ${
              selectedAction
                ? 'bg-slate-900 text-white hover:bg-slate-800 cursor-pointer'
                : 'bg-slate-200 text-slate-400 cursor-not-allowed'
            }`}
          >
            {selectedAction === 'MEETING_OVER' ? 'Proceed to MOM Entry →' : 'Confirm Resolution'}
          </button>
        </div>
      </div>
    </div>
  );
};
