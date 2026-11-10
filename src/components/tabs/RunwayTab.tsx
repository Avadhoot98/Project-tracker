import React, { useState } from 'react';
import {
  Calendar,
  Clock,
  ChevronDown,
  ChevronUp,
  AlertTriangle,
  ExternalLink,
  CheckCircle2,
  CalendarPlus,
  Search,
  Filter,
  Users,
  Briefcase,
  Globe,
  Sparkles,
  ArrowRight,
  ShieldAlert,
  Trash2,
  Building2,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { Meeting } from '../../types';
import {
  isWithinWorkingDaysRunway,
  countWorkingDaysElapsed,
  isStalledMomentum,
  needsStatusUpdate,
  formatDateTime,
  formatRelativeMeetingTime,
} from '../../utils/dateUtils';

export const RunwayTab: React.FC = () => {
  const {
    meetings,
    projects,
    selectedProjectId,
    setSelectedProjectId,
    updateMeetingPrepReadiness,
    openResolutionModal,
    openTbdSetDateModal,
    openScheduleModal,
    deleteMeeting,
  } = useApp();

  const [isTbdDrawerOpen, setIsTbdDrawerOpen] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [prepFilter, setPrepFilter] = useState<'all' | 'ready' | 'needed'>('all');

  const now = new Date();

  // Filter meetings by project if selected
  const scopedMeetings = selectedProjectId
    ? meetings.filter((m) => m.project_id === selectedProjectId)
    : meetings;

  // 1. TBD Backlog Meetings
  const tbdMeetings = scopedMeetings.filter((m) => m.is_tbd);

  // 2. Action Required Meetings (Scheduled in the past, awaiting resolution)
  const pastActionRequiredMeetings = scopedMeetings.filter((m) => needsStatusUpdate(m, now));

  // 3. Active Runway Meetings (SCHEDULED within next 7 working days)
  const runwayScheduledMeetings = scopedMeetings
    .filter(
      (m) =>
        m.status === 'SCHEDULED' &&
        !m.is_tbd &&
        m.date_time &&
        isWithinWorkingDaysRunway(m.date_time, 7, now)
    )
    .sort((a, b) => new Date(a.date_time!).getTime() - new Date(b.date_time!).getTime());

  // Search filter applied to runway meetings
  const filteredRunwayMeetings = runwayScheduledMeetings.filter((m) => {
    const project = projects.find((p) => p.id === m.project_id);
    const matchesSearch =
      searchQuery.trim() === '' ||
      m.key_objective.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (m.external_stakeholders && m.external_stakeholders.toLowerCase().includes(searchQuery.toLowerCase())) ||
      m.stakeholders_text.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (project && project.name.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesPrep =
      prepFilter === 'all' ||
      (prepFilter === 'ready' && m.is_prep_ready) ||
      (prepFilter === 'needed' && !m.is_prep_ready);

    return matchesSearch && matchesPrep;
  });

  return (
    <div className="space-y-6 pb-12">
      {/* View Header with 7-Working-Day Scope Indicator */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-xl border border-slate-200/80 shadow-2xs">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-lg font-bold text-slate-900 tracking-tight">7-Day Meeting Runway</h1>
            <span className="text-[11px] font-semibold text-indigo-700 bg-indigo-50 border border-indigo-200 px-2 py-0.5 rounded">
              Active Working Week
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Focus hub for consulting checkpoints occurring over the next 7 working days (Mon–Fri).
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => openScheduleModal(selectedProjectId || undefined)}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-2xs transition-all active:scale-[0.98]"
          >
            <CalendarPlus className="w-4 h-4" />
            <span>Schedule Meeting</span>
          </button>
        </div>
      </div>

      {/* TOP SECTION: "Awaiting Scheduling (TBD)" Collapsible Drawer */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-2xs transition-all">
        <div
          onClick={() => setIsTbdDrawerOpen(!isTbdDrawerOpen)}
          className="px-5 py-3.5 bg-slate-50/80 border-b border-slate-200 flex items-center justify-between cursor-pointer hover:bg-slate-100/70 transition-colors select-none"
        >
          <div className="flex items-center gap-3">
            <div className="p-1.5 bg-amber-100 text-amber-800 rounded-md">
              <Clock className="w-4 h-4 text-amber-600" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                  Awaiting Scheduling (TBD)
                </span>
                <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 border border-amber-200 tabular-nums">
                  {tbdMeetings.length}
                </span>
              </div>
              <p className="text-[11px] text-slate-500">
                Rescheduled sessions awaiting confirmed stakeholder calendars. Tracked for stalled momentum.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-medium text-slate-500 hidden sm:inline">
              {isTbdDrawerOpen ? 'Collapse Drawer' : 'Expand Drawer'}
            </span>
            {isTbdDrawerOpen ? (
              <ChevronUp className="w-4 h-4 text-slate-500" />
            ) : (
              <ChevronDown className="w-4 h-4 text-slate-500" />
            )}
          </div>
        </div>

        {isTbdDrawerOpen && (
          <div className="p-5 bg-slate-50/40">
            {tbdMeetings.length === 0 ? (
              <div className="text-center py-6 text-xs text-slate-500 bg-white rounded-lg border border-dashed border-slate-200">
                No meetings currently in the TBD backlog. All consulting sessions have confirmed dates!
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {tbdMeetings.map((meeting) => {
                  const project = projects.find((p) => p.id === meeting.project_id);
                  const daysInTbd = countWorkingDaysElapsed(meeting.tbd_since, now);
                  const isStalled = isStalledMomentum(meeting.tbd_since, 5, now);

                  return (
                    <div
                      key={meeting.id}
                      className="bg-white rounded-lg border border-slate-200 p-4 shadow-2xs hover:border-slate-300 transition-all flex flex-col justify-between space-y-3"
                    >
                      <div className="space-y-2">
                        {/* Top row: Project name & Age Counter */}
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <span className="text-[11px] font-bold text-indigo-700 tracking-tight">
                              {project?.name || 'Project'}
                            </span>
                            <div className="text-[11px] text-slate-500 flex items-center gap-1.5 mt-0.5">
                              <span>{project?.internal_lead}</span>
                              <span aria-hidden="true">·</span>
                              <span>{project?.lob}</span>
                              <span aria-hidden="true">·</span>
                              <span>{project?.region}</span>
                            </div>
                          </div>

                          <span className="text-[11px] font-mono font-medium text-slate-600 bg-slate-100 px-2 py-0.5 rounded shrink-0 tabular-nums">
                            In TBD for {daysInTbd}d
                          </span>
                        </div>

                        {/* Momentum Alert Badge if stalled (> 5 working days) */}
                        {isStalled && (
                          <div className="flex items-center gap-1.5 p-2 bg-amber-50 border border-amber-200/80 rounded-md text-amber-800 text-[11px] font-semibold">
                            <AlertTriangle className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                            <span>Momentum Alert: Reconnect with stakeholder</span>
                          </div>
                        )}

                        {/* Objective */}
                        <h4 className="text-xs font-semibold text-slate-900 leading-snug">
                          {meeting.key_objective}
                        </h4>

                        {/* Stakeholders: External and Internal */}
                        <div className="space-y-1">
                          {meeting.external_stakeholders && (
                            <div className="text-[11px] text-slate-700 flex items-start gap-1.5">
                              <Building2 className="w-3.5 h-3.5 text-indigo-500 shrink-0 mt-0.5" />
                              <span className="line-clamp-2">
                                <strong className="font-semibold text-slate-800">External:</strong> {meeting.external_stakeholders}
                              </span>
                            </div>
                          )}
                          <div className="text-[11px] text-slate-600 flex items-start gap-1.5">
                            <Users className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
                            <span className="line-clamp-2">
                              <strong className="font-medium text-slate-700">Team:</strong> {meeting.stakeholders_text}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Footer CTA */}
                      <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-2">
                        {meeting.shared_drive_url ? (
                          <a
                            href={meeting.shared_drive_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-[11px] text-slate-500 hover:text-indigo-600 flex items-center gap-1"
                          >
                            <ExternalLink className="w-3 h-3" />
                            <span>Pre-Read Deck</span>
                          </a>
                        ) : (
                          <span className="text-[11px] text-slate-400">No pre-read deck</span>
                        )}

                        <div className="flex items-center gap-1.5">
                          <button
                            onClick={() => deleteMeeting(meeting.id)}
                            className="p-1.5 text-slate-400 hover:text-rose-600 rounded-md hover:bg-rose-50 transition-colors cursor-pointer"
                            title="Delete this TBD record"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>

                          <button
                            onClick={() => openTbdSetDateModal(meeting)}
                            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 rounded-md border border-indigo-200/80 transition-all active:scale-[0.98]"
                          >
                            <Calendar className="w-3.5 h-3.5" />
                            <span>Confirm / Set Date</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>

      {/* SECTION: Past Scheduled Meetings Needing Status Resolution */}
      {pastActionRequiredMeetings.length > 0 && (
        <div className="p-4 bg-amber-50/70 border border-amber-300 rounded-xl space-y-3">
          <div className="flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 text-amber-700 shrink-0" />
            <h2 className="text-xs font-bold text-amber-900 uppercase tracking-wider">
              Action Required: {pastActionRequiredMeetings.length} Scheduled Session{pastActionRequiredMeetings.length > 1 ? 's' : ''} Past Due
            </h2>
          </div>
          <p className="text-[11px] text-amber-800">
            These meetings were scheduled in the past but have not had their outcomes recorded. Please mark them as Meeting Over, Rescheduled, or Cancelled to keep the engagement audit accurate.
          </p>

          <div className="space-y-2">
            {pastActionRequiredMeetings.map((meeting) => {
              const project = projects.find((p) => p.id === meeting.project_id);
              return (
                <div
                  key={meeting.id}
                  className="bg-white p-3.5 rounded-lg border border-amber-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-2xs"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 text-xs">
                      <span className="font-semibold text-slate-900">{project?.name}</span>
                      <span className="text-amber-700 bg-amber-100 px-1.5 py-0.5 rounded text-[10px] font-bold font-mono">
                        {formatDateTime(meeting.date_time)}
                      </span>
                    </div>
                    <div className="text-xs font-medium text-slate-800">{meeting.key_objective}</div>
                    <div className="text-[11px] text-slate-500 space-y-0.5">
                      {meeting.external_stakeholders && (
                        <div className="text-slate-700 truncate">
                          <strong className="font-semibold text-slate-800">External:</strong> {meeting.external_stakeholders}
                        </div>
                      )}
                      <div className="truncate">
                        <strong className="font-medium text-slate-600">Team:</strong> {meeting.stakeholders_text}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 self-start sm:self-center">
                    <button
                      onClick={() => deleteMeeting(meeting.id)}
                      className="p-1.5 text-slate-400 hover:text-rose-600 rounded-md hover:bg-rose-50 transition-colors cursor-pointer"
                      title="Delete this record"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>

                    <button
                      onClick={() => openResolutionModal(meeting)}
                      className="px-3.5 py-1.5 text-xs font-semibold text-white bg-amber-600 hover:bg-amber-700 rounded-md shadow-2xs transition-all flex items-center gap-1.5 whitespace-nowrap active:scale-[0.98]"
                    >
                      <span>Update Status</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* MAIN SECTION: Active 7-Working-Day Runway List */}
      <div className="space-y-4">
        {/* Filters and Search Bar */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search meetings by objective, stakeholder, or project..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full text-xs rounded-lg border border-slate-200 pl-9 pr-3 py-2 bg-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500 text-slate-800 shadow-2xs"
            />
          </div>

          {/* Interactive segmented filter tabs */}
          <div className="flex items-center gap-1 p-1 bg-slate-200/60 rounded-lg text-xs self-start sm:self-auto">
            <button
              onClick={() => setPrepFilter('all')}
              className={`px-3 py-1.5 font-medium rounded-md transition-all whitespace-nowrap ${
                prepFilter === 'all'
                  ? 'bg-white text-slate-900 shadow-2xs font-semibold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              All ({runwayScheduledMeetings.length})
            </button>
            <button
              onClick={() => setPrepFilter('needed')}
              className={`px-3 py-1.5 font-medium rounded-md transition-all whitespace-nowrap ${
                prepFilter === 'needed'
                  ? 'bg-white text-amber-800 shadow-2xs font-semibold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Prep Needed ({runwayScheduledMeetings.filter((m) => !m.is_prep_ready).length})
            </button>
            <button
              onClick={() => setPrepFilter('ready')}
              className={`px-3 py-1.5 font-medium rounded-md transition-all whitespace-nowrap ${
                prepFilter === 'ready'
                  ? 'bg-white text-emerald-800 shadow-2xs font-semibold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Materials Ready ({runwayScheduledMeetings.filter((m) => m.is_prep_ready).length})
            </button>
          </div>
        </div>

        {/* Meeting Cards List */}
        {filteredRunwayMeetings.length === 0 ? (
          <div className="bg-white rounded-xl border border-dashed border-slate-300 p-12 text-center space-y-3">
            <Calendar className="w-8 h-8 text-slate-400 mx-auto" />
            <div className="text-sm font-semibold text-slate-800">
              No meetings scheduled in this 7-working-day window
            </div>
            <p className="text-xs text-slate-500 max-w-md mx-auto">
              Schedule a new consulting session or confirm dates for sessions currently awaiting scheduling in the TBD drawer.
            </p>
            <button
              onClick={() => openScheduleModal(selectedProjectId || undefined)}
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-2xs transition-colors"
            >
              <CalendarPlus className="w-4 h-4" />
              <span>Schedule Session</span>
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredRunwayMeetings.map((meeting) => {
              const project = projects.find((p) => p.id === meeting.project_id);
              const relativeTime = formatRelativeMeetingTime(meeting.date_time, now);
              const isPast = new Date(meeting.date_time!).getTime() < now.getTime();

              return (
                <div
                  key={meeting.id}
                  className="bg-white rounded-xl border border-slate-200/90 hover:border-slate-300 p-5 shadow-2xs transition-all space-y-3.5"
                >
                  {/* Top Bar of Card */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pb-2 border-b border-slate-100">
                    <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1">
                      {/* Project Name */}
                      <span className="text-xs font-bold text-indigo-700 tracking-tight">
                        {project?.name}
                      </span>

                      {/* Clean Unboxed Metadata with Typographic Separators */}
                      <div className="flex items-center gap-1.5 text-[11px] text-slate-500">
                        <span aria-hidden="true">·</span>
                        <span>{project?.internal_lead}</span>
                        <span aria-hidden="true">·</span>
                        <span>{project?.lob}</span>
                        <span aria-hidden="true">·</span>
                        <span>{project?.region}</span>
                      </div>
                    </div>

                    {/* Date/Time badge + Countdown */}
                    <div className="flex items-center gap-2">
                      <div className="text-xs font-mono font-medium text-slate-700 bg-slate-100 px-2.5 py-1 rounded-md flex items-center gap-1.5 tabular-nums">
                        <Clock className="w-3.5 h-3.5 text-slate-500" />
                        <span>{relativeTime}</span>
                      </div>
                    </div>
                  </div>

                  {/* Objective & Stakeholders */}
                  <div className="space-y-1.5">
                    <h3 className="text-sm font-semibold text-slate-900 leading-snug">
                      {meeting.key_objective}
                    </h3>
                    <div className="space-y-1">
                      {meeting.external_stakeholders && (
                        <div className="text-xs text-slate-800 flex items-start gap-1.5">
                          <Building2 className="w-3.5 h-3.5 text-indigo-600 shrink-0 mt-0.5" />
                          <span className="leading-relaxed">
                            <strong className="font-semibold text-slate-900">External Stakeholder(s):</strong> {meeting.external_stakeholders}
                          </span>
                        </div>
                      )}
                      <div className="text-xs text-slate-600 flex items-start gap-1.5">
                        <Users className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
                        <span className="leading-relaxed">
                          <strong className="font-medium text-slate-700">Internal Team:</strong> {meeting.stakeholders_text}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Actions & Controls Bar */}
                  <div className="pt-2 flex flex-wrap items-center justify-between gap-3 text-xs">
                    <div className="flex items-center gap-4">
                      {/* Interactive Prep Readiness Toggle */}
                      <label className="flex items-center gap-2 cursor-pointer select-none group">
                        <input
                          type="checkbox"
                          checked={meeting.is_prep_ready}
                          onChange={(e) => updateMeetingPrepReadiness(meeting.id, e.target.checked)}
                          className="rounded text-emerald-600 focus:ring-emerald-500 w-4 h-4 border-slate-300"
                        />
                        {meeting.is_prep_ready ? (
                          <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                            <span>Materials Ready</span>
                          </span>
                        ) : (
                          <span className="text-[11px] font-semibold text-amber-800 bg-amber-50 px-2 py-0.5 rounded border border-amber-200/80 flex items-center gap-1">
                            <Clock className="w-3 h-3 text-amber-600" />
                            <span>Prep Needed</span>
                          </span>
                        )}
                      </label>

                      {/* Shared Drive Button */}
                      {meeting.shared_drive_url ? (
                        <a
                          href={meeting.shared_drive_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-[11px] font-medium text-slate-600 hover:text-indigo-600 hover:underline transition-colors"
                        >
                          <ExternalLink className="w-3 h-3" />
                          <span>Pre-Read Deck</span>
                        </a>
                      ) : (
                        <span className="text-[11px] text-slate-400">No pre-read deck link</span>
                      )}
                    </div>

                    {/* Update Status CTA and Delete */}
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => deleteMeeting(meeting.id)}
                        className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition-colors cursor-pointer"
                        title="Delete meeting entry"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>

                      <button
                        onClick={() => openResolutionModal(meeting)}
                        className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all flex items-center gap-1.5 ${
                          isPast
                            ? 'bg-amber-600 text-white hover:bg-amber-700 shadow-2xs'
                            : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                        }`}
                      >
                        <span>Update Status</span>
                        {isPast && <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />}
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
