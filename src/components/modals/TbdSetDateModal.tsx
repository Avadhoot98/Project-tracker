import React, { useState, useEffect } from 'react';
import { X, Calendar, Check, Clock, AlertTriangle } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { countWorkingDaysElapsed, isStalledMomentum } from '../../utils/dateUtils';

export const TbdSetDateModal: React.FC = () => {
  const { tbdSettingMeeting, closeTbdSetDateModal, confirmTbdDate, projects } = useApp();

  const [dateStr, setDateStr] = useState<string>('');
  const [timeStr, setTimeStr] = useState<string>('11:00');

  useEffect(() => {
    if (tbdSettingMeeting) {
      // Default to tomorrow or next business day
      const d = new Date();
      d.setDate(d.getDate() + 1);
      const yyyy = d.getFullYear();
      const mm = String(d.getMonth() + 1).padStart(2, '0');
      const dd = String(d.getDate()).padStart(2, '0');
      setDateStr(`${yyyy}-${mm}-${dd}`);
      setTimeStr('11:00');
    }
  }, [tbdSettingMeeting]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && tbdSettingMeeting) {
        closeTbdSetDateModal();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [tbdSettingMeeting, closeTbdSetDateModal]);

  if (!tbdSettingMeeting) return null;

  const project = projects.find((p) => p.id === tbdSettingMeeting.project_id);
  const workingDaysInTbd = countWorkingDaysElapsed(tbdSettingMeeting.tbd_since);
  const isStalled = isStalledMomentum(tbdSettingMeeting.tbd_since, 5);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!dateStr) return;

    const [y, m, d] = dateStr.split('-').map(Number);
    const [hh, mm] = (timeStr || '11:00').split(':').map(Number);
    const targetDate = new Date(y, m - 1, d, hh, mm, 0);

    confirmTbdDate(tbdSettingMeeting.id, targetDate.toISOString());
    closeTbdSetDateModal();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white rounded-xl shadow-2xl border border-slate-200 w-full max-w-md overflow-hidden flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50/80">
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-indigo-100 text-indigo-700 rounded-lg">
              <Calendar className="w-5 h-5 text-indigo-600" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-slate-900">Confirm &amp; Set Meeting Date</h3>
              <p className="text-xs text-slate-500">Restore session from TBD backlog into active Runway</p>
            </div>
          </div>
          <button
            onClick={closeTbdSetDateModal}
            className="p-1 rounded-md text-slate-400 hover:text-slate-600 hover:bg-slate-200/60 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
          {/* Context Card */}
          <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-lg space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-indigo-700">{project?.name}</span>
              <span className="text-[11px] text-slate-500 flex items-center gap-1 font-mono">
                <Clock className="w-3.5 h-3.5 text-slate-400" />
                <span>In TBD for {workingDaysInTbd} working days</span>
              </span>
            </div>
            <div className="font-medium text-slate-900 text-sm">{tbdSettingMeeting.key_objective}</div>
            <div className="text-slate-500 text-[11px]">
              Stakeholders: {tbdSettingMeeting.stakeholders_text}
            </div>

            {isStalled && (
              <div className="p-2 bg-amber-50 border border-amber-200 rounded text-amber-800 text-[11px] flex items-center gap-1.5 font-medium">
                <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                <span>Momentum Alert: Reconnect with stakeholder prior to session.</span>
              </div>
            )}
          </div>

          {/* Date and Time Inputs */}
          <div className="grid grid-cols-2 gap-3 pt-1">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Confirmed Date <span className="text-rose-500">*</span>
              </label>
              <input
                type="date"
                required
                value={dateStr}
                onChange={(e) => setDateStr(e.target.value)}
                className="w-full text-xs rounded-lg border border-slate-300 px-3 py-2 bg-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500 text-slate-800"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Confirmed Time <span className="text-rose-500">*</span>
              </label>
              <input
                type="time"
                required
                value={timeStr}
                onChange={(e) => setTimeStr(e.target.value)}
                className="w-full text-xs rounded-lg border border-slate-300 px-3 py-2 bg-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500 text-slate-800"
              />
            </div>
          </div>

          {/* Modal Footer */}
          <div className="pt-3 border-t border-slate-200 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={closeTbdSetDateModal}
              className="px-4 py-2 text-xs font-medium text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-xs transition-colors flex items-center gap-1.5"
            >
              <Check className="w-4 h-4" />
              <span>Confirm &amp; Move to Runway</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
