import React, { useEffect } from 'react';
import { X, Trash2, AlertTriangle } from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const ClearThreadModal: React.FC = () => {
  const {
    isClearThreadConfirmOpen,
    clearThreadTargetProjectId,
    closeClearThreadConfirm,
    clearThreadRecords,
    projects,
    meetings,
    deliverables,
  } = useApp();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isClearThreadConfirmOpen) {
        closeClearThreadConfirm();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isClearThreadConfirmOpen, closeClearThreadConfirm]);

  if (!isClearThreadConfirmOpen) return null;

  const targetProject = clearThreadTargetProjectId
    ? projects.find((p) => p.id === clearThreadTargetProjectId)
    : null;

  const affectedMeetings = clearThreadTargetProjectId
    ? meetings.filter((m) => m.project_id === clearThreadTargetProjectId)
    : meetings;

  const affectedDeliverables = clearThreadTargetProjectId
    ? deliverables.filter((d) => d.project_id === clearThreadTargetProjectId)
    : deliverables;

  const handleConfirm = () => {
    clearThreadRecords(clearThreadTargetProjectId);
    closeClearThreadConfirm();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white rounded-xl shadow-2xl border border-rose-200 w-full max-w-md overflow-hidden flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 border-b border-rose-100 flex items-center justify-between bg-rose-50/80">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-rose-100 text-rose-700 rounded-lg">
              <Trash2 className="w-5 h-5 text-rose-600" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-slate-900">
                {targetProject ? 'Clear Project Thread Records' : 'Clear All Engagement Records'}
              </h3>
              <p className="text-xs text-slate-500">Irreversible deletion of meeting checkpoints &amp; action items</p>
            </div>
          </div>
          <button
            onClick={closeClearThreadConfirm}
            className="p-1 rounded-md text-slate-400 hover:text-slate-600 hover:bg-slate-200/60 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4 text-xs">
          <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg text-rose-900 space-y-1.5">
            <div className="font-semibold flex items-center gap-1.5 text-rose-800">
              <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>Warning: Permanent Data Removal</span>
            </div>
            <p className="text-[11px] leading-relaxed text-rose-800/90">
              {targetProject ? (
                <>
                  You are about to delete all records from the engagement thread for{' '}
                  <strong className="font-semibold text-rose-950">{targetProject.name}</strong>.
                </>
              ) : (
                'You are about to delete all meetings, minutes, and action items across ALL projects.'
              )}
            </p>
          </div>

          <div className="space-y-2 p-3 bg-slate-50 rounded-lg border border-slate-200 text-slate-700">
            <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
              Records to be purged:
            </div>
            <div className="flex items-center justify-between font-mono text-xs">
              <span>Meeting checkpoints &amp; MOM records:</span>
              <span className="font-bold text-rose-600">{affectedMeetings.length}</span>
            </div>
            <div className="flex items-center justify-between font-mono text-xs">
              <span>Associated action items / deliverables:</span>
              <span className="font-bold text-rose-600">{affectedDeliverables.length}</span>
            </div>
          </div>

          <p className="text-slate-500 text-[11px]">
            Tip: You can restore sample data at any time via the &ldquo;Reset Demo Seed Data&rdquo; button in the sidebar.
          </p>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex items-center justify-end gap-2.5">
          <button
            type="button"
            onClick={closeClearThreadConfirm}
            className="px-4 py-2 text-xs font-medium text-slate-700 hover:bg-slate-200/60 rounded-lg transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            className="px-4 py-2 text-xs font-semibold text-white bg-rose-600 hover:bg-rose-700 rounded-lg shadow-xs transition-colors flex items-center gap-1.5 active:scale-[0.98]"
          >
            <Trash2 className="w-4 h-4" />
            <span>Delete All Records</span>
          </button>
        </div>
      </div>
    </div>
  );
};
