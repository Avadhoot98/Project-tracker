import React, { useState, useEffect } from 'react';
import { X, Calendar, Link2, Check, Clock, User, Globe, Briefcase, Building2 } from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const ScheduleMeetingModal: React.FC = () => {
  const {
    isScheduleModalOpen,
    scheduleModalInitialProjectId,
    closeScheduleModal,
    projects,
    scheduleMeeting,
  } = useApp();

  const [projectId, setProjectId] = useState<string>('');
  const [keyObjective, setKeyObjective] = useState<string>('');
  const [externalStakeholders, setExternalStakeholders] = useState<string>('');
  const [stakeholdersText, setStakeholdersText] = useState<string>('');
  const [dateStr, setDateStr] = useState<string>('');
  const [timeStr, setTimeStr] = useState<string>('10:00');
  const [isTbd, setIsTbd] = useState<boolean>(false);
  const [sharedDriveUrl, setSharedDriveUrl] = useState<string>('');
  const [isPrepReady, setIsPrepReady] = useState<boolean>(false);

  // Initialize defaults when opened
  useEffect(() => {
    if (isScheduleModalOpen) {
      const defaultProjId =
        scheduleModalInitialProjectId || (projects.length > 0 ? projects[0].id : '');
      setProjectId(defaultProjId);
      setKeyObjective('');
      setExternalStakeholders('');
      setStakeholdersText('');
      setSharedDriveUrl('');
      setIsPrepReady(false);
      setIsTbd(false);

      // Default date to tomorrow
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      const yyyy = tomorrow.getFullYear();
      const mm = String(tomorrow.getMonth() + 1).padStart(2, '0');
      const dd = String(tomorrow.getDate()).padStart(2, '0');
      setDateStr(`${yyyy}-${mm}-${dd}`);
      setTimeStr('10:00');
    }
  }, [isScheduleModalOpen, scheduleModalInitialProjectId, projects]);

  // Handle ESC key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isScheduleModalOpen) {
        closeScheduleModal();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isScheduleModalOpen, closeScheduleModal]);

  if (!isScheduleModalOpen) return null;

  const selectedProject = projects.find((p) => p.id === projectId);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!projectId || !keyObjective.trim()) return;

    let dateTimeIso: string | null = null;
    if (!isTbd && dateStr) {
      const [y, m, d] = dateStr.split('-').map(Number);
      const [hh, mm] = (timeStr || '10:00').split(':').map(Number);
      const targetDate = new Date(y, m - 1, d, hh, mm, 0);
      dateTimeIso = targetDate.toISOString();
    }

    scheduleMeeting({
      projectId,
      dateTime: dateTimeIso,
      keyObjective: keyObjective.trim(),
      externalStakeholders: externalStakeholders.trim() || undefined,
      stakeholdersText: stakeholdersText.trim() || 'Internal Team Alignment',
      sharedDriveUrl: sharedDriveUrl.trim() || undefined,
      isPrepReady,
      isTbd,
    });

    closeScheduleModal();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white rounded-xl shadow-2xl border border-slate-200 w-full max-w-xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50/70">
          <div>
            <h3 className="text-base font-semibold text-slate-900">Schedule Consulting Meeting</h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Create a scheduled session or place directly in the Awaiting Scheduling backlog
            </p>
          </div>
          <button
            onClick={closeScheduleModal}
            className="p-1 rounded-md text-slate-400 hover:text-slate-600 hover:bg-slate-200/60 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-5 flex-1">
          {/* Project Selection with Auto-Fill Details */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Project Engagement <span className="text-rose-500">*</span>
            </label>
            <select
              value={projectId}
              onChange={(e) => setProjectId(e.target.value)}
              required
              className="w-full text-xs rounded-lg border border-slate-300 px-3 py-2 bg-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-slate-800 font-medium"
            >
              {projects.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>

            {/* Auto-filled Project Metadata Readout */}
            {selectedProject && (
              <div className="mt-2 p-2.5 bg-slate-50 border border-slate-200/70 rounded-lg text-xs text-slate-600 flex flex-wrap items-center gap-x-4 gap-y-1">
                <div className="flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5 text-slate-400" />
                  <span>Lead: <strong className="font-semibold text-slate-800">{selectedProject.internal_lead}</strong></span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Briefcase className="w-3.5 h-3.5 text-slate-400" />
                  <span>LOB: <strong className="font-semibold text-slate-800">{selectedProject.lob}</strong></span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Globe className="w-3.5 h-3.5 text-slate-400" />
                  <span>Region: <strong className="font-semibold text-slate-800">{selectedProject.region}</strong></span>
                </div>
              </div>
            )}
          </div>

          {/* Key Objective */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Key Objective / Discussion Scope <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Architecture Sign-off on Real-Time Payments Ledger"
              value={keyObjective}
              onChange={(e) => setKeyObjective(e.target.value)}
              className="w-full text-xs rounded-lg border border-slate-300 px-3 py-2 bg-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-slate-900"
            />
          </div>

          {/* Separate External Stakeholders field */}
          <div>
            <label className="block text-xs font-semibold text-slate-800 mb-1 flex items-center gap-1.5">
              <Building2 className="w-3.5 h-3.5 text-indigo-600" />
              <span>External Stakeholder(s) (Client / Counterparty / Regulatory)</span>
            </label>
            <p className="text-[11px] text-slate-500 mb-1.5">
              External counterparties, client leadership, or partners being engaged (e.g. Viktor Krum (SVP Digital Banking), Hannah Schmidt (Chief Architect))
            </p>
            <input
              type="text"
              placeholder="e.g. Sarah Chen (VP Global Logistics), David Zhao (Procurement Director)"
              value={externalStakeholders}
              onChange={(e) => setExternalStakeholders(e.target.value)}
              className="w-full text-xs rounded-lg border border-indigo-200 bg-indigo-50/20 px-3 py-2 focus:outline-hidden focus:ring-2 focus:ring-indigo-500 text-slate-900"
            />
          </div>

          {/* Internal Consulting Team / Stakeholders */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1.5">
              <User className="w-3.5 h-3.5 text-slate-500" />
              <span>Internal Consulting Stakeholders &amp; Team</span>
            </label>
            <p className="text-[11px] text-slate-500 mb-1.5">
              Internal consultants and leads attending this checkpoint
            </p>
            <input
              type="text"
              placeholder={selectedProject ? `${selectedProject.internal_lead} (GBIU Lead), Transformation Team` : "Internal consulting team"}
              value={stakeholdersText}
              onChange={(e) => setStakeholdersText(e.target.value)}
              className="w-full text-xs rounded-lg border border-slate-300 px-3 py-2 bg-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-slate-900"
            />
          </div>

          {/* Date & Time OR TBD Toggle */}
          <div className="p-3.5 rounded-lg border border-slate-200 bg-slate-50/50 space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-slate-800 flex items-center gap-1.5">
                <Calendar className="w-4 h-4 text-slate-500" />
                <span>Scheduling Mode</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer text-xs font-medium text-slate-700">
                <input
                  type="checkbox"
                  checked={isTbd}
                  onChange={(e) => setIsTbd(e.target.checked)}
                  className="rounded text-indigo-600 focus:ring-indigo-500 w-3.5 h-3.5 border-slate-300"
                />
                <span>Date TBD (Add to Awaiting Scheduling Backlog)</span>
              </label>
            </div>

            {!isTbd ? (
              <div className="grid grid-cols-2 gap-3 pt-1">
                <div>
                  <label className="block text-[11px] font-medium text-slate-600 mb-1">
                    Meeting Date
                  </label>
                  <input
                    type="date"
                    required={!isTbd}
                    value={dateStr}
                    onChange={(e) => setDateStr(e.target.value)}
                    className="w-full text-xs rounded-lg border border-slate-300 px-3 py-2 bg-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500 text-slate-800"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-medium text-slate-600 mb-1">
                    Start Time
                  </label>
                  <input
                    type="time"
                    required={!isTbd}
                    value={timeStr}
                    onChange={(e) => setTimeStr(e.target.value)}
                    className="w-full text-xs rounded-lg border border-slate-300 px-3 py-2 bg-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500 text-slate-800"
                  />
                </div>
              </div>
            ) : (
              <div className="text-xs text-amber-800 bg-amber-50 p-2.5 rounded-md border border-amber-200 flex items-start gap-2">
                <Clock className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <span>
                  This meeting will be placed in the <strong>Awaiting Scheduling (TBD)</strong> drawer with momentum aging tracking until confirmed.
                </span>
              </div>
            )}
          </div>

          {/* Shared Drive Pre-Read Link */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1.5">
              <Link2 className="w-3.5 h-3.5 text-slate-400" />
              <span>Shared Drive URL / Pre-Read Deck (Optional)</span>
            </label>
            <input
              type="url"
              placeholder="https://drive.google.com/drive/folders/..."
              value={sharedDriveUrl}
              onChange={(e) => setSharedDriveUrl(e.target.value)}
              className="w-full text-xs rounded-lg border border-slate-300 px-3 py-2 bg-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-slate-900 font-mono text-[11px]"
            />
          </div>

          {/* Prep Readiness Toggle */}
          <div className="pt-1">
            <label className="flex items-center gap-2.5 cursor-pointer">
              <input
                type="checkbox"
                checked={isPrepReady}
                onChange={(e) => setIsPrepReady(e.target.checked)}
                className="rounded text-emerald-600 focus:ring-emerald-500 w-4 h-4 border-slate-300"
              />
              <span className="text-xs font-medium text-slate-800">
                Materials &amp; Pre-Read Ready for Stakeholders
              </span>
            </label>
          </div>

          {/* Modal Footer */}
          <div className="pt-4 border-t border-slate-200 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={closeScheduleModal}
              className="px-4 py-2 text-xs font-medium text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-xs transition-colors flex items-center gap-1.5"
            >
              <Check className="w-4 h-4" />
              <span>Schedule Meeting</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
