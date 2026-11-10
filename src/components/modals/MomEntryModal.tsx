import React, { useState, useEffect } from 'react';
import {
  X,
  FileText,
  Plus,
  Trash2,
  Calendar,
  CheckCircle2,
  ListTodo,
  GitFork,
  Clock,
  Sparkles,
  Building2,
  User,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { createRelativeDateString } from '../../utils/dateUtils';

interface ActionItemRow {
  id: string;
  task: string;
  owner: string;
  dueDate: string;
}

interface FollowUpMeetingRow {
  id: string;
  keyObjective: string;
  dateTime: string;
  time: string;
  isTbd: boolean;
  externalStakeholders?: string;
  stakeholdersText: string;
}

export const MomEntryModal: React.FC = () => {
  const { momEntryMeeting, closeMomModal, saveMomAndFollowUps, projects } = useApp();

  const [attendees, setAttendees] = useState<string>('');
  const [keyTopics, setKeyTopics] = useState<string>('');
  const [majorTakeaways, setMajorTakeaways] = useState<string>('');

  const [actionItems, setActionItems] = useState<ActionItemRow[]>([]);
  const [followUpMeetings, setFollowUpMeetings] = useState<FollowUpMeetingRow[]>([]);

  useEffect(() => {
    if (momEntryMeeting) {
      const project = projects.find((p) => p.id === momEntryMeeting.project_id);
      const leadName = project?.internal_lead || 'Internal Consultant';

      setAttendees(momEntryMeeting.stakeholders_text || '');
      setKeyTopics(momEntryMeeting.mom_data?.key_topics || '');
      setMajorTakeaways(momEntryMeeting.mom_data?.major_takeaways || '');

      // Seed an empty action item row for quick entry
      setActionItems([
        {
          id: `row-${Date.now()}-1`,
          task: '',
          owner: leadName,
          dueDate: createRelativeDateString(7),
        },
      ]);

      setFollowUpMeetings([]);
    }
  }, [momEntryMeeting, projects]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && momEntryMeeting) {
        closeMomModal();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [momEntryMeeting, closeMomModal]);

  if (!momEntryMeeting) return null;

  const project = projects.find((p) => p.id === momEntryMeeting.project_id);

  const addActionItemRow = () => {
    const leadName = project?.internal_lead || 'Internal Consultant';
    setActionItems((prev) => [
      ...prev,
      {
        id: `row-${Date.now()}-${prev.length + 1}`,
        task: '',
        owner: leadName,
        dueDate: createRelativeDateString(7),
      },
    ]);
  };

  const removeActionItemRow = (id: string) => {
    setActionItems((prev) => prev.filter((item) => item.id !== id));
  };

  const updateActionItemRow = (id: string, field: keyof ActionItemRow, value: string) => {
    setActionItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, [field]: value } : item))
    );
  };

  const addFollowUpRow = () => {
    const d = new Date();
    d.setDate(d.getDate() + 7);
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');

    setFollowUpMeetings((prev) => [
      ...prev,
      {
        id: `fu-${Date.now()}-${prev.length + 1}`,
        keyObjective: `Follow-up to: ${momEntryMeeting.key_objective}`,
        dateTime: `${yyyy}-${mm}-${dd}`,
        time: '14:00',
        isTbd: false,
        externalStakeholders: momEntryMeeting.external_stakeholders || '',
        stakeholdersText: momEntryMeeting.stakeholders_text,
      },
    ]);
  };

  const removeFollowUpRow = (id: string) => {
    setFollowUpMeetings((prev) => prev.filter((item) => item.id !== id));
  };

  const updateFollowUpRow = (id: string, field: keyof FollowUpMeetingRow, value: any) => {
    setFollowUpMeetings((prev) =>
      prev.map((item) => (item.id === id ? { ...item, [field]: value } : item))
    );
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();

    // Clean valid action items
    const validDeliverables = actionItems
      .filter((item) => item.task.trim().length > 0)
      .map((item) => ({
        task: item.task.trim(),
        owner: item.owner.trim() || project?.internal_lead || 'Internal Consultant',
        dueDate: item.dueDate || createRelativeDateString(7),
      }));

    // Clean valid follow-up meetings
    const validFollowUps = followUpMeetings
      .filter((fu) => fu.keyObjective.trim().length > 0)
      .map((fu) => {
        let dateTimeIso: string | null = null;
        if (!fu.isTbd && fu.dateTime) {
          const [y, m, d] = fu.dateTime.split('-').map(Number);
          const [hh, mm] = (fu.time || '14:00').split(':').map(Number);
          dateTimeIso = new Date(y, m - 1, d, hh, mm, 0).toISOString();
        }
        return {
          keyObjective: fu.keyObjective.trim(),
          dateTime: dateTimeIso,
          isTbd: fu.isTbd,
          externalStakeholders: fu.externalStakeholders?.trim() || undefined,
          stakeholdersText: fu.stakeholdersText.trim(),
        };
      });

    saveMomAndFollowUps(
      momEntryMeeting.id,
      {
        attendees: attendees.trim() || momEntryMeeting.stakeholders_text,
        key_topics: keyTopics.trim() || 'Key topics discussed during engagement session.',
        major_takeaways: majorTakeaways.trim() || 'Agreed on next operational milestones and deliverables.',
      },
      validDeliverables,
      validFollowUps
    );

    closeMomModal();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white rounded-xl shadow-2xl border border-slate-200 w-full max-w-3xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50/80">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-emerald-100 text-emerald-800 rounded-lg">
              <FileText className="w-5 h-5 text-emerald-600" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-slate-900">
                Record Minutes of Meeting (MOM)
              </h3>
              <p className="text-xs text-slate-500">
                Log takeaways, assign deliverables, and branch follow-up sessions
              </p>
            </div>
          </div>
          <button
            onClick={closeMomModal}
            className="p-1 rounded-md text-slate-400 hover:text-slate-600 hover:bg-slate-200/60 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSave} className="p-6 overflow-y-auto space-y-6 flex-1 text-xs">
          {/* Meeting Context Banner */}
          <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-lg space-y-1.5">
            <div className="text-[11px] font-semibold text-indigo-700 uppercase tracking-wider">
              {project?.name}
            </div>
            <div className="text-sm font-semibold text-slate-900">
              {momEntryMeeting.key_objective}
            </div>
            <div className="text-slate-500 text-[11px] flex flex-wrap items-center gap-x-2 gap-y-1">
              <span>Internal Lead: <strong className="text-slate-700">{project?.internal_lead}</strong></span>
              <span>·</span>
              <span>Region: {project?.region}</span>
              {momEntryMeeting.external_stakeholders && (
                <>
                  <span>·</span>
                  <span className="text-indigo-700 font-medium flex items-center gap-1">
                    <Building2 className="w-3 h-3 text-indigo-500 inline" />
                    <span>External: {momEntryMeeting.external_stakeholders}</span>
                  </span>
                </>
              )}
            </div>
          </div>

          {/* Attendees */}
          <div>
            <label className="block font-semibold text-slate-800 mb-1">
              Confirmed Attendees &amp; Key Participants <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Elena Rostova (Vanguard Lead), Viktor Krum (SVP Digital Banking), Hannah Schmidt (Lead Architect)"
              value={attendees}
              onChange={(e) => setAttendees(e.target.value)}
              className="w-full text-xs rounded-lg border border-slate-300 px-3 py-2 bg-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500 text-slate-900"
            />
          </div>

          {/* Key Topics */}
          <div>
            <label className="block font-semibold text-slate-800 mb-1">
              Key Topics Discussed <span className="text-rose-500">*</span>
            </label>
            <p className="text-[11px] text-slate-500 mb-1.5">
              Bullet points or structured outline of core agenda items examined
            </p>
            <textarea
              rows={4}
              required
              placeholder="1. Current monolithic mainframe dependency and batch cycle limits.&#10;2. Target event-driven microservices architecture blueprint.&#10;3. High-volume SEPA payment risk contingencies."
              value={keyTopics}
              onChange={(e) => setKeyTopics(e.target.value)}
              className="w-full text-xs rounded-lg border border-slate-300 p-3 bg-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500 text-slate-900 leading-relaxed font-sans"
            />
          </div>

          {/* Major Takeaways & Decisions */}
          <div>
            <label className="block font-semibold text-slate-800 mb-1">
              Major Takeaways &amp; Executive Decisions <span className="text-rose-500">*</span>
            </label>
            <p className="text-[11px] text-slate-500 mb-1.5">
              Decisions made, consensus reached, blockers identified, and milestone commitments
            </p>
            <textarea
              rows={4}
              required
              placeholder="• Executive consensus reached to decouple payment processing before branch accounts.&#10;• Security team agreed on dual-key customer encryption.&#10;• Agreed on weekly architecture checkpoints."
              value={majorTakeaways}
              onChange={(e) => setMajorTakeaways(e.target.value)}
              className="w-full text-xs rounded-lg border border-slate-300 p-3 bg-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500 text-slate-900 leading-relaxed font-sans"
            />
          </div>

          {/* Action Items Repeater Table */}
          <div className="border border-slate-200 rounded-lg p-4 bg-slate-50/50 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ListTodo className="w-4 h-4 text-indigo-600" />
                <span className="font-semibold text-slate-900 text-xs">
                  Assigned Deliverables &amp; Action Items
                </span>
                <span className="text-[11px] text-slate-500">
                  (Automatically populates Deliverables Tracker)
                </span>
              </div>
              <button
                type="button"
                onClick={addActionItemRow}
                className="flex items-center gap-1 px-2.5 py-1 text-xs font-semibold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 rounded-md border border-indigo-200 transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Task</span>
              </button>
            </div>

            {actionItems.length === 0 ? (
              <div className="p-3 bg-white border border-dashed border-slate-200 rounded-md text-center text-slate-400 text-xs">
                No immediate action items logged. Click &ldquo;+ Add Task&rdquo; to add assignments.
              </div>
            ) : (
              <div className="space-y-2">
                <div className="grid grid-cols-12 gap-2 text-[10px] font-semibold text-slate-500 uppercase tracking-wider px-1">
                  <div className="col-span-6">Task Description</div>
                  <div className="col-span-3">Owner / Consultant</div>
                  <div className="col-span-2">Due Date</div>
                  <div className="col-span-1 text-right">Remove</div>
                </div>

                {actionItems.map((item) => (
                  <div key={item.id} className="grid grid-cols-12 gap-2 items-center bg-white p-2 rounded-md border border-slate-200 shadow-2xs">
                    <div className="col-span-6">
                      <input
                        type="text"
                        placeholder="e.g. Synthesize SEPA Instant latency report"
                        value={item.task}
                        onChange={(e) => updateActionItemRow(item.id, 'task', e.target.value)}
                        className="w-full text-xs rounded border border-slate-200 px-2 py-1.5 focus:outline-hidden focus:ring-1 focus:ring-indigo-500 text-slate-900"
                      />
                    </div>
                    <div className="col-span-3">
                      <input
                        type="text"
                        placeholder="Owner name"
                        value={item.owner}
                        onChange={(e) => updateActionItemRow(item.id, 'owner', e.target.value)}
                        className="w-full text-xs rounded border border-slate-200 px-2 py-1.5 focus:outline-hidden focus:ring-1 focus:ring-indigo-500 text-slate-800"
                      />
                    </div>
                    <div className="col-span-2">
                      <input
                        type="date"
                        value={item.dueDate}
                        onChange={(e) => updateActionItemRow(item.id, 'dueDate', e.target.value)}
                        className="w-full text-xs rounded border border-slate-200 px-1.5 py-1.5 focus:outline-hidden focus:ring-1 focus:ring-indigo-500 text-slate-800"
                      />
                    </div>
                    <div className="col-span-1 text-right">
                      <button
                        type="button"
                        onClick={() => removeActionItemRow(item.id)}
                        className="p-1.5 text-slate-400 hover:text-rose-600 rounded hover:bg-rose-50 transition-colors"
                        title="Delete task"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Schedule Follow-up Meetings (1-to-Many Chaining) */}
          <div className="border border-slate-200 rounded-lg p-4 bg-indigo-50/30 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <GitFork className="w-4 h-4 text-indigo-600" />
                <div>
                  <span className="font-semibold text-slate-900 text-xs">
                    Schedule Follow-up Meetings
                  </span>
                  <span className="text-[11px] text-slate-500 ml-1.5">
                    (Branch 1-to-many follow-up sessions chained to this meeting)
                  </span>
                </div>
              </div>
              <button
                type="button"
                onClick={addFollowUpRow}
                className="flex items-center gap-1 px-2.5 py-1 text-xs font-semibold text-indigo-700 bg-white hover:bg-indigo-50 rounded-md border border-indigo-200 transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Follow-up Meeting</span>
              </button>
            </div>

            {followUpMeetings.length === 0 ? (
              <div className="p-3 bg-white/70 border border-dashed border-indigo-200 rounded-md text-center text-slate-500 text-xs">
                No follow-up meetings scheduled yet. Click &ldquo;+ Add Follow-up Meeting&rdquo; to branch next steps.
              </div>
            ) : (
              <div className="space-y-3">
                {followUpMeetings.map((fu, idx) => (
                  <div key={fu.id} className="p-3 bg-white rounded-lg border border-slate-200 shadow-2xs space-y-2.5">
                    <div className="flex items-center justify-between text-xs font-semibold text-slate-800">
                      <span>Follow-up Session #{idx + 1}</span>
                      <button
                        type="button"
                        onClick={() => removeFollowUpRow(fu.id)}
                        className="p-1 text-slate-400 hover:text-rose-600 transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <div>
                      <label className="block text-[10px] font-semibold text-slate-600 mb-1">
                        Objective
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. Follow-up: Reconciled SEPA Ledger Sandbox Walkthrough"
                        value={fu.keyObjective}
                        onChange={(e) => updateFollowUpRow(fu.id, 'keyObjective', e.target.value)}
                        className="w-full text-xs rounded border border-slate-200 px-2.5 py-1.5 bg-slate-50/50 focus:bg-white focus:ring-1 focus:ring-indigo-500 text-slate-900"
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 items-center">
                      <div>
                        <label className="flex items-center gap-2 cursor-pointer text-[11px] font-medium text-slate-700 mb-1">
                          <input
                            type="checkbox"
                            checked={fu.isTbd}
                            onChange={(e) => updateFollowUpRow(fu.id, 'isTbd', e.target.checked)}
                            className="rounded text-indigo-600 focus:ring-indigo-500 w-3.5 h-3.5 border-slate-300"
                          />
                          <span>Date TBD (Add to Awaiting Scheduling Backlog)</span>
                        </label>

                        {!fu.isTbd ? (
                          <div className="flex gap-2">
                            <input
                              type="date"
                              value={fu.dateTime}
                              onChange={(e) => updateFollowUpRow(fu.id, 'dateTime', e.target.value)}
                              className="text-xs rounded border border-slate-200 px-2 py-1 w-32 bg-white"
                            />
                            <input
                              type="time"
                              value={fu.time}
                              onChange={(e) => updateFollowUpRow(fu.id, 'time', e.target.value)}
                              className="text-xs rounded border border-slate-200 px-2 py-1 w-24 bg-white"
                            />
                          </div>
                        ) : (
                          <span className="text-[11px] text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                            Will track momentum age in TBD drawer
                          </span>
                        )}
                      </div>

                      <div className="space-y-1.5">
                        <label className="block text-[10px] font-semibold text-slate-600 mb-0.5">
                          External Stakeholders &amp; Team
                        </label>
                        <input
                          type="text"
                          placeholder="External Stakeholder(s) (Client/Partner)"
                          value={fu.externalStakeholders || ''}
                          onChange={(e) => updateFollowUpRow(fu.id, 'externalStakeholders', e.target.value)}
                          className="w-full text-xs rounded border border-indigo-200 bg-indigo-50/20 px-2.5 py-1.5 focus:bg-white focus:ring-1 focus:ring-indigo-500 text-slate-900"
                        />
                        <input
                          type="text"
                          placeholder="Internal Consultant / Team"
                          value={fu.stakeholdersText}
                          onChange={(e) => updateFollowUpRow(fu.id, 'stakeholdersText', e.target.value)}
                          className="w-full text-xs rounded border border-slate-200 px-2.5 py-1.5 bg-slate-50/50 focus:bg-white focus:ring-1 focus:ring-indigo-500 text-slate-800"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Modal Footer */}
          <div className="pt-3 border-t border-slate-200 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={closeMomModal}
              className="px-4 py-2 text-xs font-medium text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-xs transition-colors flex items-center gap-1.5 active:scale-[0.98]"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Save MOM &amp; Commit Next Steps</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
