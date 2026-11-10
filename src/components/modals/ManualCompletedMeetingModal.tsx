import React, { useState, useEffect } from 'react';
import {
  X,
  CheckCircle2,
  Calendar,
  Clock,
  Plus,
  Trash2,
  FileText,
  ListTodo,
  GitFork,
  Link2,
  Users,
  User,
  Briefcase,
  Globe,
  Building2,
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

export const ManualCompletedMeetingModal: React.FC = () => {
  const {
    isLogCompletedMeetingModalOpen,
    logCompletedMeetingInitialProjectId,
    closeLogCompletedMeetingModal,
    projects,
    addCompletedMeetingRecord,
  } = useApp();

  const [projectId, setProjectId] = useState<string>('');
  const [meetingDate, setMeetingDate] = useState<string>('');
  const [meetingTime, setMeetingTime] = useState<string>('11:00');
  const [keyObjective, setKeyObjective] = useState<string>('');
  const [externalStakeholders, setExternalStakeholders] = useState<string>('');
  const [attendees, setAttendees] = useState<string>('');
  const [sharedDriveUrl, setSharedDriveUrl] = useState<string>('');
  const [keyTopics, setKeyTopics] = useState<string>('');
  const [majorTakeaways, setMajorTakeaways] = useState<string>('');

  const [actionItems, setActionItems] = useState<ActionItemRow[]>([]);
  const [followUpMeetings, setFollowUpMeetings] = useState<FollowUpMeetingRow[]>([]);

  useEffect(() => {
    if (isLogCompletedMeetingModalOpen) {
      const defaultProjId =
        logCompletedMeetingInitialProjectId || (projects.length > 0 ? projects[0].id : '');
      setProjectId(defaultProjId);

      const proj = projects.find((p) => p.id === defaultProjId);
      const leadName = proj?.internal_lead || 'Internal Consultant';

      // Default meeting date to yesterday or today
      const d = new Date();
      d.setDate(d.getDate() - 1);
      const yyyy = d.getFullYear();
      const mm = String(d.getMonth() + 1).padStart(2, '0');
      const dd = String(d.getDate()).padStart(2, '0');
      setMeetingDate(`${yyyy}-${mm}-${dd}`);
      setMeetingTime('14:00');

      setKeyObjective('');
      setExternalStakeholders('');
      setAttendees(`${leadName} (GBIU Lead)`);
      setSharedDriveUrl('');
      setKeyTopics('');
      setMajorTakeaways('');

      setActionItems([
        {
          id: `deliv-${Date.now()}-1`,
          task: '',
          owner: leadName,
          dueDate: createRelativeDateString(5),
        },
      ]);
      setFollowUpMeetings([]);
    }
  }, [isLogCompletedMeetingModalOpen, logCompletedMeetingInitialProjectId, projects]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isLogCompletedMeetingModalOpen) {
        closeLogCompletedMeetingModal();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isLogCompletedMeetingModalOpen, closeLogCompletedMeetingModal]);

  if (!isLogCompletedMeetingModalOpen) return null;

  const selectedProject = projects.find((p) => p.id === projectId);

  const addActionItemRow = () => {
    const leadName = selectedProject?.internal_lead || 'Internal Consultant';
    setActionItems((prev) => [
      ...prev,
      {
        id: `deliv-${Date.now()}-${prev.length + 1}`,
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
        keyObjective: `Follow-up to: ${keyObjective.trim() || 'Engagement Session'}`,
        dateTime: `${yyyy}-${mm}-${dd}`,
        time: '14:00',
        isTbd: false,
        externalStakeholders: externalStakeholders.trim(),
        stakeholdersText: attendees.trim(),
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!projectId || !keyObjective.trim() || !meetingDate) return;

    const [y, m, d] = meetingDate.split('-').map(Number);
    const [hh, mm] = (meetingTime || '14:00').split(':').map(Number);
    const targetDateTime = new Date(y, m - 1, d, hh, mm, 0).toISOString();

    const validDeliverables = actionItems
      .filter((item) => item.task.trim().length > 0)
      .map((item) => ({
        task: item.task.trim(),
        owner: item.owner.trim() || selectedProject?.internal_lead || 'Internal Consultant',
        dueDate: item.dueDate || createRelativeDateString(7),
      }));

    const validFollowUps = followUpMeetings
      .filter((fu) => fu.keyObjective.trim().length > 0)
      .map((fu) => {
        let dateTimeIso: string | null = null;
        if (!fu.isTbd && fu.dateTime) {
          const [fy, fm, fd] = fu.dateTime.split('-').map(Number);
          const [fhh, fmm] = (fu.time || '14:00').split(':').map(Number);
          dateTimeIso = new Date(fy, fm - 1, fd, fhh, fmm, 0).toISOString();
        }
        return {
          keyObjective: fu.keyObjective.trim(),
          dateTime: dateTimeIso,
          isTbd: fu.isTbd,
          externalStakeholders: fu.externalStakeholders?.trim() || undefined,
          stakeholdersText: fu.stakeholdersText.trim() || attendees.trim(),
        };
      });

    addCompletedMeetingRecord({
      projectId,
      dateTime: targetDateTime,
      keyObjective: keyObjective.trim(),
      externalStakeholders: externalStakeholders.trim() || undefined,
      attendees: attendees.trim() || 'Internal Engagement Team',
      sharedDriveUrl: sharedDriveUrl.trim() || undefined,
      momData: {
        attendees: [
          externalStakeholders.trim() ? `External: ${externalStakeholders.trim()}` : null,
          `Internal: ${attendees.trim() || 'Internal Engagement Team'}`
        ].filter(Boolean).join(' | '),
        key_topics: keyTopics.trim() || 'Key topics discussed and documented.',
        major_takeaways: majorTakeaways.trim() || 'Agreed on key findings and milestones.',
      },
      deliverables: validDeliverables,
      followUps: validFollowUps,
    });

    closeLogCompletedMeetingModal();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white rounded-xl shadow-2xl border border-slate-200 w-full max-w-3xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-emerald-50/70">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-emerald-100 text-emerald-800 rounded-lg">
              <CheckCircle2 className="w-5 h-5 text-emerald-600" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-slate-900">
                Log Completed Meeting &amp; Update Engagement Thread
              </h3>
              <p className="text-xs text-slate-500">
                Record a conducted meeting session directly into the project timeline with MOM takeaways
              </p>
            </div>
          </div>
          <button
            onClick={closeLogCompletedMeetingModal}
            className="p-1 rounded-md text-slate-400 hover:text-slate-600 hover:bg-slate-200/60 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-5 flex-1 text-xs">
          {/* Project Selection with Auto-Fill Details */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Project Engagement <span className="text-rose-500">*</span>
            </label>
            <select
              value={projectId}
              onChange={(e) => setProjectId(e.target.value)}
              required
              className="w-full text-xs rounded-lg border border-slate-300 px-3 py-2 bg-white focus:outline-hidden focus:ring-2 focus:ring-emerald-500 text-slate-800 font-medium"
            >
              {projects.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>

            {/* Auto-filled Project Metadata */}
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

          {/* Meeting Date & Time (When it occurred) */}
          <div className="grid grid-cols-2 gap-3 p-3 bg-slate-50 border border-slate-200 rounded-lg">
            <div>
              <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                Session Conducted Date <span className="text-rose-500">*</span>
              </label>
              <input
                type="date"
                required
                value={meetingDate}
                onChange={(e) => setMeetingDate(e.target.value)}
                className="w-full text-xs rounded-lg border border-slate-300 px-3 py-2 bg-white text-slate-800 focus:ring-2 focus:ring-emerald-500"
              />
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                Session Time <span className="text-rose-500">*</span>
              </label>
              <input
                type="time"
                required
                value={meetingTime}
                onChange={(e) => setMeetingTime(e.target.value)}
                className="w-full text-xs rounded-lg border border-slate-300 px-3 py-2 bg-white text-slate-800 focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </div>

          {/* Key Objective */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Key Objective / Discussion Scope <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Regulatory Capital Assessment & Stress Testing Framework Alignment"
              value={keyObjective}
              onChange={(e) => setKeyObjective(e.target.value)}
              className="w-full text-xs rounded-lg border border-slate-300 px-3 py-2 bg-white focus:outline-hidden focus:ring-2 focus:ring-emerald-500 text-slate-900"
            />
          </div>

          {/* External Stakeholders Field */}
          <div>
            <label className="block text-xs font-semibold text-slate-800 mb-1 flex items-center gap-1.5">
              <Building2 className="w-3.5 h-3.5 text-emerald-600" />
              <span>External Stakeholder(s) (Client / Counterparty / Regulatory)</span>
            </label>
            <p className="text-[11px] text-slate-500 mb-1.5">
              Client leads, counterparties, or external executives who participated in this session
            </p>
            <input
              type="text"
              placeholder="e.g. Viktor Krum (SVP Digital Banking), Hannah Schmidt (Lead Enterprise Architect)"
              value={externalStakeholders}
              onChange={(e) => setExternalStakeholders(e.target.value)}
              className="w-full text-xs rounded-lg border border-emerald-200 bg-emerald-50/20 px-3 py-2 focus:outline-hidden focus:ring-2 focus:ring-emerald-500 text-slate-900"
            />
          </div>

          {/* Internal Consulting Attendees */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1.5">
              <User className="w-3.5 h-3.5 text-slate-500" />
              <span>Internal Consulting Team Attendees <span className="text-rose-500">*</span></span>
            </label>
            <p className="text-[11px] text-slate-500 mb-1.5">
              Internal consultants, engagement leads, and analysts present
            </p>
            <input
              type="text"
              required
              placeholder={selectedProject ? `${selectedProject.internal_lead} (GBIU Lead), Engagement Guild` : "Internal consultants"}
              value={attendees}
              onChange={(e) => setAttendees(e.target.value)}
              className="w-full text-xs rounded-lg border border-slate-300 px-3 py-2 bg-white focus:outline-hidden focus:ring-2 focus:ring-emerald-500 text-slate-900"
            />
          </div>

          {/* Shared Drive Pre-Read / Deck */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1.5">
              <Link2 className="w-3.5 h-3.5 text-slate-400" />
              <span>Shared Drive URL / Minutes Slide Deck (Optional)</span>
            </label>
            <input
              type="url"
              placeholder="https://drive.google.com/drive/folders/..."
              value={sharedDriveUrl}
              onChange={(e) => setSharedDriveUrl(e.target.value)}
              className="w-full text-xs rounded-lg border border-slate-300 px-3 py-2 bg-white focus:outline-hidden focus:ring-2 focus:ring-emerald-500 text-slate-900 font-mono text-[11px]"
            />
          </div>

          {/* Key Topics Discussed */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Key Topics Discussed <span className="text-rose-500">*</span>
            </label>
            <textarea
              rows={3}
              required
              placeholder="1. Capital adequacy ratios under severe macroeconomic scenarios.&#10;2. Cross-border liquidity pooling arrangements across EMEA branches.&#10;3. Supervisory reporting milestones."
              value={keyTopics}
              onChange={(e) => setKeyTopics(e.target.value)}
              className="w-full text-xs rounded-lg border border-slate-300 p-3 bg-white focus:outline-hidden focus:ring-2 focus:ring-emerald-500 text-slate-900 leading-relaxed font-sans"
            />
          </div>

          {/* Major Takeaways & Decisions */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Major Takeaways &amp; Executive Decisions <span className="text-rose-500">*</span>
            </label>
            <textarea
              rows={3}
              required
              placeholder="• Risk committee approved standard methodology for credit portfolio modeling.&#10;• Target deadline established for submission to central bank.&#10;• Assigned follow-up session on collateral management."
              value={majorTakeaways}
              onChange={(e) => setMajorTakeaways(e.target.value)}
              className="w-full text-xs rounded-lg border border-slate-300 p-3 bg-white focus:outline-hidden focus:ring-2 focus:ring-emerald-500 text-slate-900 leading-relaxed font-sans"
            />
          </div>

          {/* Action Items Repeater Table */}
          <div className="border border-slate-200 rounded-lg p-4 bg-slate-50/50 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ListTodo className="w-4 h-4 text-emerald-600" />
                <span className="font-semibold text-slate-900 text-xs">
                  Assigned Deliverables &amp; Action Items
                </span>
                <span className="text-[11px] text-slate-500">
                  (Added to Deliverables Tracker)
                </span>
              </div>
              <button
                type="button"
                onClick={addActionItemRow}
                className="flex items-center gap-1 px-2.5 py-1 text-xs font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 rounded-md border border-emerald-200 transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Task</span>
              </button>
            </div>

            {actionItems.length === 0 ? (
              <div className="p-3 bg-white border border-dashed border-slate-200 rounded-md text-center text-slate-400 text-xs">
                No immediate deliverables assigned in this session.
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
                        placeholder="Task description"
                        value={item.task}
                        onChange={(e) => updateActionItemRow(item.id, 'task', e.target.value)}
                        className="w-full text-xs rounded border border-slate-200 px-2 py-1.5 focus:ring-1 focus:ring-emerald-500 text-slate-900"
                      />
                    </div>
                    <div className="col-span-3">
                      <input
                        type="text"
                        placeholder="Owner name"
                        value={item.owner}
                        onChange={(e) => updateActionItemRow(item.id, 'owner', e.target.value)}
                        className="w-full text-xs rounded border border-slate-200 px-2 py-1.5 focus:ring-1 focus:ring-emerald-500 text-slate-800"
                      />
                    </div>
                    <div className="col-span-2">
                      <input
                        type="date"
                        value={item.dueDate}
                        onChange={(e) => updateActionItemRow(item.id, 'dueDate', e.target.value)}
                        className="w-full text-xs rounded border border-slate-200 px-1.5 py-1.5 focus:ring-1 focus:ring-emerald-500 text-slate-800"
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

          {/* Follow-up Meetings Repeater */}
          <div className="border border-slate-200 rounded-lg p-4 bg-emerald-50/20 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <GitFork className="w-4 h-4 text-emerald-600" />
                <span className="font-semibold text-slate-900 text-xs">
                  Schedule Follow-up Meetings
                </span>
                <span className="text-[11px] text-slate-500">
                  (Branch future sessions linked to this meeting)
                </span>
              </div>
              <button
                type="button"
                onClick={addFollowUpRow}
                className="flex items-center gap-1 px-2.5 py-1 text-xs font-semibold text-emerald-700 bg-white hover:bg-emerald-50 rounded-md border border-emerald-200 transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Follow-up</span>
              </button>
            </div>

            {followUpMeetings.length === 0 ? (
              <div className="p-3 bg-white/70 border border-dashed border-emerald-200 rounded-md text-center text-slate-500 text-xs">
                No follow-up sessions chained yet.
              </div>
            ) : (
              <div className="space-y-3">
                {followUpMeetings.map((fu, idx) => (
                  <div key={fu.id} className="p-3 bg-white rounded-lg border border-slate-200 shadow-2xs space-y-2">
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
                      <input
                        type="text"
                        placeholder="Objective for follow-up session"
                        value={fu.keyObjective}
                        onChange={(e) => updateFollowUpRow(fu.id, 'keyObjective', e.target.value)}
                        className="w-full text-xs rounded border border-slate-200 px-2.5 py-1.5 focus:ring-1 focus:ring-emerald-500 text-slate-900"
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 items-start">
                      <div>
                        <label className="flex items-center gap-2 cursor-pointer text-[11px] font-medium text-slate-700 mb-1">
                          <input
                            type="checkbox"
                            checked={fu.isTbd}
                            onChange={(e) => updateFollowUpRow(fu.id, 'isTbd', e.target.checked)}
                            className="rounded text-emerald-600 focus:ring-emerald-500 w-3.5 h-3.5 border-slate-300"
                          />
                          <span>Date TBD (Add to TBD Backlog)</span>
                        </label>
                        {!fu.isTbd && (
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
                        )}
                      </div>

                      <div className="space-y-1.5">
                        <input
                          type="text"
                          placeholder="External Stakeholder(s) (Client/Partner)"
                          value={fu.externalStakeholders || ''}
                          onChange={(e) => updateFollowUpRow(fu.id, 'externalStakeholders', e.target.value)}
                          className="w-full text-xs rounded border border-emerald-200 bg-emerald-50/20 px-2.5 py-1.5 focus:ring-1 focus:ring-emerald-500 text-slate-900"
                        />
                        <input
                          type="text"
                          placeholder="Internal Consultant / Team"
                          value={fu.stakeholdersText}
                          onChange={(e) => updateFollowUpRow(fu.id, 'stakeholdersText', e.target.value)}
                          className="w-full text-xs rounded border border-slate-200 px-2.5 py-1.5 focus:ring-1 focus:ring-emerald-500 text-slate-800"
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
              onClick={closeLogCompletedMeetingModal}
              className="px-4 py-2 text-xs font-medium text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-xs transition-colors flex items-center gap-1.5 active:scale-[0.98]"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Log Record to Thread</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
