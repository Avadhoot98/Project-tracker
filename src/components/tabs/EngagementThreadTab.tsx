import React, { useState } from 'react';
import {
  GitBranch,
  Calendar,
  CheckCircle2,
  CalendarClock,
  Ban,
  Clock,
  ChevronDown,
  ChevronUp,
  Search,
  Users,
  FileText,
  ListTodo,
  ExternalLink,
  ArrowRight,
  Filter,
  User,
  Globe,
  Briefcase,
  Sparkles,
  Trash2,
  Building2,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { Meeting } from '../../types';
import { formatDateTime, formatRelativeMeetingTime } from '../../utils/dateUtils';

export const EngagementThreadTab: React.FC = () => {
  const {
    meetings,
    projects,
    deliverables,
    selectedProjectId,
    setSelectedProjectId,
    openScheduleModal,
    openLogCompletedMeetingModal,
    openClearThreadConfirm,
    deleteMeeting,
    deleteDeliverable,
    openMomModal,
    openResolutionModal,
  } = useApp();

  const [leadFilter, setLeadFilter] = useState<string>('all');
  const [regionFilter, setRegionFilter] = useState<string>('all');
  const [lobFilter, setLobFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [expandedMomIds, setExpandedMomIds] = useState<Record<string, boolean>>({});

  const now = new Date();

  const toggleMomAccordion = (meetingId: string) => {
    setExpandedMomIds((prev) => ({
      ...prev,
      [meetingId]: !prev[meetingId],
    }));
  };

  // Distinct filter lists
  const allLeads = Array.from(new Set(projects.map((p) => p.internal_lead))).filter(Boolean);
  const allRegions = Array.from(new Set(projects.map((p) => p.region))).filter(Boolean);
  const allLobs = Array.from(new Set(projects.map((p) => p.lob))).filter(Boolean);

  // 1. Filter meetings
  const filteredMeetings = meetings.filter((m) => {
    const project = projects.find((p) => p.id === m.project_id);
    if (!project) return false;

    if (selectedProjectId && m.project_id !== selectedProjectId) return false;
    if (leadFilter !== 'all' && project.internal_lead !== leadFilter) return false;
    if (regionFilter !== 'all' && project.region !== regionFilter) return false;
    if (lobFilter !== 'all' && project.lob !== lobFilter) return false;

    if (searchQuery.trim() !== '') {
      const q = searchQuery.toLowerCase();
      const inObjective = m.key_objective.toLowerCase().includes(q);
      const inExternal = m.external_stakeholders?.toLowerCase().includes(q) || false;
      const inStakeholders = m.stakeholders_text.toLowerCase().includes(q);
      const inTopics = m.mom_data?.key_topics.toLowerCase().includes(q) || false;
      const inTakeaways = m.mom_data?.major_takeaways.toLowerCase().includes(q) || false;
      const inProject = project.name.toLowerCase().includes(q);

      if (!inObjective && !inExternal && !inStakeholders && !inTopics && !inTakeaways && !inProject) {
        return false;
      }
    }

    return true;
  });

  // Sort chronologically (future scheduled meetings descending or chronological)
  // For engagement thread: show timeline with Next Scheduled Meeting anchored on top, followed by chronological sequence
  const futureScheduled = filteredMeetings
    .filter((m) => m.status === 'SCHEDULED' && !m.is_tbd && m.date_time && new Date(m.date_time) >= now)
    .sort((a, b) => new Date(a.date_time!).getTime() - new Date(b.date_time!).getTime());

  const nextScheduledMeeting = futureScheduled.length > 0 ? futureScheduled[0] : null;

  // The rest of the timeline: all other meetings sorted chronologically by date/time (or created_at if TBD)
  const timelineEvents = [...filteredMeetings].sort((a, b) => {
    const timeA = new Date(a.date_time || a.tbd_since || a.created_at).getTime();
    const timeB = new Date(b.date_time || b.tbd_since || b.created_at).getTime();
    return timeB - timeA; // Most recent / upcoming first
  });

  const selectedProject = selectedProjectId ? projects.find((p) => p.id === selectedProjectId) : null;

  return (
    <div className="space-y-6 pb-12">
      {/* View Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-xl border border-slate-200/80 shadow-2xs">
        <div>
          <h1 className="text-lg font-bold text-slate-900 tracking-tight">Master Engagement Tracker</h1>
          <p className="text-xs text-slate-500 mt-1">
            Continuous chronological timeline of consulting checkpoints, MOM decisions, and rescheduling trails.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 self-start sm:self-auto">
          <button
            onClick={() => openLogCompletedMeetingModal(selectedProjectId || undefined)}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-2xs transition-all active:scale-[0.98]"
            title="Manually log historic or completed session notes, takeaways, and tasks"
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>Log Completed Meeting</span>
          </button>

          <button
            onClick={() => openScheduleModal(selectedProjectId || undefined)}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-2xs transition-all active:scale-[0.98]"
          >
            <Calendar className="w-4 h-4" />
            <span>New Checkpoint</span>
          </button>

          {timelineEvents.length > 0 && (
            <button
              onClick={() => openClearThreadConfirm(selectedProjectId)}
              className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-rose-700 hover:text-white bg-rose-50 hover:bg-rose-600 rounded-lg border border-rose-200 hover:border-rose-600 transition-all active:scale-[0.98]"
              title={selectedProjectId ? "Delete all records for this project" : "Delete all records from engagement thread"}
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Clear Records</span>
            </button>
          )}
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-2xs space-y-3 text-xs">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {/* Project Selector */}
          <div>
            <label className="block text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-1">
              Select Project Scope
            </label>
            <select
              value={selectedProjectId || 'all'}
              onChange={(e) => setSelectedProjectId(e.target.value === 'all' ? null : e.target.value)}
              className="w-full text-xs rounded-lg border border-slate-200 px-2.5 py-1.5 bg-white text-slate-800 font-medium"
            >
              <option value="all">All Projects (Aggregate Thread)</option>
              {projects.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
          </div>

          {/* Lead Filter */}
          <div>
            <label className="block text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-1">
              Internal Lead
            </label>
            <select
              value={leadFilter}
              onChange={(e) => setLeadFilter(e.target.value)}
              className="w-full text-xs rounded-lg border border-slate-200 px-2.5 py-1.5 bg-white text-slate-700"
            >
              <option value="all">All Leads</option>
              {allLeads.map((lead) => (
                <option key={lead} value={lead}>
                  {lead}
                </option>
              ))}
            </select>
          </div>

          {/* Region Filter */}
          <div>
            <label className="block text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-1">
              Region
            </label>
            <select
              value={regionFilter}
              onChange={(e) => setRegionFilter(e.target.value)}
              className="w-full text-xs rounded-lg border border-slate-200 px-2.5 py-1.5 bg-white text-slate-700"
            >
              <option value="all">All Regions</option>
              {allRegions.map((region) => (
                <option key={region} value={region}>
                  {region}
                </option>
              ))}
            </select>
          </div>

          {/* LOB Filter */}
          <div>
            <label className="block text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-1">
              Line of Business
            </label>
            <select
              value={lobFilter}
              onChange={(e) => setLobFilter(e.target.value)}
              className="w-full text-xs rounded-lg border border-slate-200 px-2.5 py-1.5 bg-white text-slate-700"
            >
              <option value="all">All LOBs</option>
              {allLobs.map((lob) => (
                <option key={lob} value={lob}>
                  {lob}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Free text search */}
        <div className="relative pt-1">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search within MOM topics, takeaways, objectives, stakeholders..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full text-xs rounded-lg border border-slate-200 pl-8 pr-3 py-1.5 bg-slate-50/50 focus:bg-white focus:outline-hidden focus:ring-1 focus:ring-indigo-500 text-slate-800"
          />
        </div>
      </div>

      {/* HIGHLIGHTED TOP NODE: Next Scheduled Meeting Anchor */}
      {nextScheduledMeeting && (
        <div className="bg-gradient-to-r from-indigo-900 to-slate-900 text-white rounded-xl p-5 shadow-sm border border-indigo-700/60 relative overflow-hidden">
          <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
            <Calendar className="w-40 h-40" />
          </div>

          <div className="relative z-10 space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold uppercase tracking-widest bg-indigo-500/30 border border-indigo-400/40 px-2 py-0.5 rounded text-indigo-200">
                  Next Scheduled Checkpoint
                </span>
                <span className="text-xs text-indigo-200 font-mono">
                  {formatRelativeMeetingTime(nextScheduledMeeting.date_time, now)}
                </span>
              </div>

              {/* Prep Readiness Badge */}
              {nextScheduledMeeting.is_prep_ready ? (
                <span className="text-[11px] font-semibold text-emerald-300 bg-emerald-950/80 border border-emerald-500/50 px-2.5 py-0.5 rounded flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                  <span>Materials Ready</span>
                </span>
              ) : (
                <span className="text-[11px] font-semibold text-amber-300 bg-amber-950/80 border border-amber-500/50 px-2.5 py-0.5 rounded flex items-center gap-1">
                  <Clock className="w-3 h-3 text-amber-400" />
                  <span>Prep Needed</span>
                </span>
              )}
            </div>

            <div>
              {/* Project title */}
              <div className="text-xs font-medium text-indigo-300">
                {projects.find((p) => p.id === nextScheduledMeeting.project_id)?.name}
              </div>
              <h2 className="text-base font-bold text-white mt-0.5 leading-snug">
                {nextScheduledMeeting.key_objective}
              </h2>
            </div>

            <div className="space-y-1">
              {nextScheduledMeeting.external_stakeholders && (
                <div className="text-xs text-indigo-100 flex items-center gap-2">
                  <Building2 className="w-3.5 h-3.5 text-indigo-300 shrink-0" />
                  <span className="truncate">
                    <strong className="font-semibold text-white">External Stakeholders:</strong> {nextScheduledMeeting.external_stakeholders}
                  </span>
                </div>
              )}
              <div className="text-xs text-slate-300 flex items-center gap-2">
                <Users className="w-3.5 h-3.5 text-indigo-300 shrink-0" />
                <span className="truncate">
                  <strong className="font-medium text-indigo-200">Internal Team:</strong> {nextScheduledMeeting.stakeholders_text}
                </span>
              </div>
            </div>

            <div className="pt-2 border-t border-indigo-800/60 flex items-center justify-between text-xs">
              <span className="text-slate-400 font-mono text-[11px]">
                {formatDateTime(nextScheduledMeeting.date_time)}
              </span>

              <div className="flex items-center gap-2">
                {nextScheduledMeeting.shared_drive_url && (
                  <a
                    href={nextScheduledMeeting.shared_drive_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-indigo-200 hover:text-white underline flex items-center gap-1 mr-2"
                  >
                    <ExternalLink className="w-3 h-3" />
                    <span>Pre-Read Deck</span>
                  </a>
                )}
                <button
                  onClick={() => deleteMeeting(nextScheduledMeeting.id)}
                  className="p-1 text-indigo-300 hover:text-rose-400 hover:bg-white/10 rounded transition-colors cursor-pointer"
                  title="Delete scheduled meeting"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>

                <button
                  onClick={() => openResolutionModal(nextScheduledMeeting)}
                  className="px-3 py-1 bg-white/10 hover:bg-white/20 text-white font-medium rounded-md text-xs transition-colors"
                >
                  Update Status
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* CONTINUOUS VERTICAL TIMELINE */}
      <div className="bg-white rounded-xl border border-slate-200/90 p-6 shadow-2xs">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-800 uppercase tracking-wider">
            <GitBranch className="w-4 h-4 text-indigo-600" />
            <span>Chronological Engagement Thread</span>
          </div>
          <span className="text-xs text-slate-500 font-mono tabular-nums">
            {timelineEvents.length} Recorded Event{timelineEvents.length > 1 ? 's' : ''}
          </span>
        </div>

        {timelineEvents.length === 0 ? (
          <div className="py-12 text-center text-xs text-slate-500 space-y-3">
            <div className="font-medium text-slate-700">No meeting checkpoints or MOM records found in this engagement thread.</div>
            <p className="text-slate-400 max-w-sm mx-auto">
              You can manually log completed meetings with takeaways or schedule upcoming checkpoints.
            </p>
            <div className="flex items-center justify-center gap-2 pt-2">
              <button
                onClick={() => openLogCompletedMeetingModal(selectedProjectId || undefined)}
                className="px-3 py-1.5 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-2xs"
              >
                Log Completed Meeting
              </button>
              <button
                onClick={() => openScheduleModal(selectedProjectId || undefined)}
                className="px-3 py-1.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-2xs"
              >
                Schedule Checkpoint
              </button>
            </div>
          </div>
        ) : (
          <div className="relative mt-6 pl-6 sm:pl-8 space-y-8 before:absolute before:left-[11px] sm:before:left-[15px] before:top-2 before:bottom-2 before:w-[2px] before:bg-slate-200">
            {timelineEvents.map((meeting) => {
              const project = projects.find((p) => p.id === meeting.project_id);
              const isExpanded = !!expandedMomIds[meeting.id];

              // Deliverables associated with this meeting
              const meetingDeliverables = deliverables.filter((d) => d.meeting_id === meeting.id);

              return (
                <div key={meeting.id} className="relative group">
                  {/* Timeline Node Icon Indicator */}
                  <div
                    className={`absolute -left-[30px] sm:-left-[34px] top-1.5 w-6 h-6 rounded-full border-2 bg-white flex items-center justify-center ${
                      meeting.status === 'MEETING_OVER'
                        ? 'border-emerald-500 text-emerald-600 shadow-2xs'
                        : meeting.status === 'RESCHEDULED'
                        ? 'border-amber-500 text-amber-600'
                        : meeting.status === 'CANCELLED'
                        ? 'border-rose-500 text-rose-600'
                        : 'border-indigo-600 text-indigo-600'
                    }`}
                  >
                    {meeting.status === 'MEETING_OVER' ? (
                      <CheckCircle2 className="w-3.5 h-3.5" />
                    ) : meeting.status === 'RESCHEDULED' ? (
                      <CalendarClock className="w-3.5 h-3.5" />
                    ) : meeting.status === 'CANCELLED' ? (
                      <Ban className="w-3.5 h-3.5" />
                    ) : (
                      <Calendar className="w-3.5 h-3.5" />
                    )}
                  </div>

                  {/* Card Content */}
                  <div
                    className={`rounded-xl border p-4.5 transition-all text-xs space-y-3 ${
                      meeting.status === 'MEETING_OVER'
                        ? 'bg-white border-slate-200 hover:border-slate-300 shadow-2xs'
                        : meeting.status === 'RESCHEDULED'
                        ? 'bg-amber-50/30 border-amber-200/80'
                        : meeting.status === 'CANCELLED'
                        ? 'bg-rose-50/30 border-rose-200/80'
                        : 'bg-white border-indigo-200/80 shadow-2xs'
                    }`}
                  >
                    {/* Event Header */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-slate-100">
                      <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                        <span className="font-bold text-indigo-700 text-xs">{project?.name}</span>
                        <div className="flex items-center gap-1.5 text-[11px] text-slate-500">
                          <span aria-hidden="true">·</span>
                          <span>{project?.internal_lead}</span>
                          <span aria-hidden="true">·</span>
                          <span>{project?.region}</span>
                        </div>
                      </div>

                      {/* Status and Date Label + Delete Record Button */}
                      <div className="flex items-center gap-2">
                        {meeting.status === 'MEETING_OVER' && (
                          <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded">
                            Meeting Over (MOM Captured)
                          </span>
                        )}
                        {meeting.status === 'RESCHEDULED' && (
                          <span className="text-[10px] font-semibold text-amber-800 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded">
                            Rescheduled
                          </span>
                        )}
                        {meeting.status === 'CANCELLED' && (
                          <span className="text-[10px] font-semibold text-rose-700 bg-rose-50 border border-rose-200 px-2 py-0.5 rounded">
                            Cancelled
                          </span>
                        )}
                        {meeting.status === 'SCHEDULED' && (
                          <span className="text-[10px] font-semibold text-indigo-700 bg-indigo-50 border border-indigo-200 px-2 py-0.5 rounded">
                            Scheduled
                          </span>
                        )}

                        <span className="text-[11px] font-mono text-slate-600 tabular-nums">
                          {formatDateTime(meeting.date_time || meeting.tbd_since)}
                        </span>

                        <button
                          onClick={() => deleteMeeting(meeting.id)}
                          className="p-1 text-slate-400 hover:text-rose-600 rounded hover:bg-rose-50 transition-colors ml-1 cursor-pointer"
                          title="Delete this record from thread"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    {/* Objective */}
                    <div>
                      <h3 className="text-sm font-semibold text-slate-900 leading-snug">
                        {meeting.key_objective}
                      </h3>
                      <div className="space-y-1 mt-1.5">
                        {meeting.external_stakeholders && (
                          <div className="text-[11px] text-slate-800 flex items-start gap-1.5">
                            <Building2 className="w-3.5 h-3.5 text-indigo-600 shrink-0 mt-0.5" />
                            <span className="leading-snug">
                              <strong className="font-semibold text-slate-900">External:</strong> {meeting.external_stakeholders}
                            </span>
                          </div>
                        )}
                        {meeting.stakeholders_text && (
                          <div className="text-[11px] text-slate-600 flex items-start gap-1.5">
                            <Users className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
                            <span className="leading-snug">
                              <strong className="font-medium text-slate-700">Team:</strong> {meeting.stakeholders_text}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Rescheduled Node Details */}
                    {meeting.status === 'RESCHEDULED' && (
                      <div className="p-3 bg-amber-100/40 rounded-lg border border-amber-200/70 text-xs text-amber-900 space-y-1">
                        <div className="font-semibold flex items-center gap-1.5">
                          <CalendarClock className="w-3.5 h-3.5 text-amber-700" />
                          <span>
                            {meeting.rescheduled_from
                              ? `Rescheduled from ${formatDateTime(meeting.rescheduled_from)} → ${
                                  meeting.is_tbd ? 'Date TBD (In Backlog)' : formatDateTime(meeting.date_time)
                                }`
                              : `Session moved to ${meeting.is_tbd ? 'Date TBD' : formatDateTime(meeting.date_time)}`}
                          </span>
                        </div>
                        {meeting.is_tbd && (
                          <div className="text-[11px] text-amber-800">
                            Currently stored in the Awaiting Scheduling (TBD) drawer.
                          </div>
                        )}
                      </div>
                    )}

                    {/* Cancelled Node Details */}
                    {meeting.status === 'CANCELLED' && (
                      <div className="p-3 bg-rose-100/40 rounded-lg border border-rose-200/70 text-xs text-rose-900 space-y-1">
                        <div className="font-semibold flex items-center gap-1.5">
                          <Ban className="w-3.5 h-3.5 text-rose-600" />
                          <span>Session Cancelled</span>
                        </div>
                        {meeting.cancellation_reason && (
                          <p className="text-[11px] text-rose-800 leading-relaxed italic">
                            Reason: &ldquo;{meeting.cancellation_reason}&rdquo;
                          </p>
                        )}
                      </div>
                    )}

                    {/* Parent Chained Meeting Link if follow-up */}
                    {meeting.parent_meeting_id && (
                      <div className="text-[11px] text-indigo-700 bg-indigo-50/80 px-2.5 py-1 rounded border border-indigo-200/60 inline-flex items-center gap-1.5">
                        <GitBranch className="w-3 h-3 text-indigo-600" />
                        <span>Chained follow-up from previous session</span>
                      </div>
                    )}

                    {/* Expandable MOM Accordion (For MEETING_OVER) */}
                    {meeting.status === 'MEETING_OVER' && meeting.mom_data && (
                      <div className="pt-1">
                        <button
                          onClick={() => toggleMomAccordion(meeting.id)}
                          className="flex items-center gap-1.5 text-xs font-semibold text-emerald-800 hover:text-emerald-900 bg-emerald-50 hover:bg-emerald-100/80 px-3 py-1.5 rounded-lg border border-emerald-200 transition-colors"
                        >
                          <FileText className="w-3.5 h-3.5" />
                          <span>
                            {isExpanded ? 'Hide Minutes of Meeting (MOM)' : 'View Minutes of Meeting (MOM)'}
                          </span>
                          {isExpanded ? (
                            <ChevronUp className="w-3.5 h-3.5 ml-1" />
                          ) : (
                            <ChevronDown className="w-3.5 h-3.5 ml-1" />
                          )}
                        </button>

                        {isExpanded && (
                          <div className="mt-3 p-4 bg-slate-50 border border-slate-200 rounded-lg space-y-3.5 animate-in fade-in duration-150">
                            {/* Key Topics */}
                            <div>
                              <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                                Key Topics Covered
                              </div>
                              <div className="text-xs text-slate-800 whitespace-pre-line leading-relaxed bg-white p-2.5 rounded border border-slate-200/80">
                                {meeting.mom_data.key_topics}
                              </div>
                            </div>

                            {/* Major Takeaways */}
                            <div>
                              <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                                Major Takeaways &amp; Decisions
                              </div>
                              <div className="text-xs text-slate-800 whitespace-pre-line leading-relaxed bg-white p-2.5 rounded border border-slate-200/80">
                                {meeting.mom_data.major_takeaways}
                              </div>
                            </div>

                            {/* Action Items generated in this session */}
                            {meetingDeliverables.length > 0 && (
                              <div>
                                <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1 flex items-center gap-1.5">
                                  <ListTodo className="w-3.5 h-3.5 text-indigo-600" />
                                  <span>Deliverables Assigned During This Session</span>
                                </div>
                                <div className="space-y-1.5">
                                  {meetingDeliverables.map((deliv) => (
                                    <div
                                      key={deliv.id}
                                      className="p-2 bg-white rounded border border-slate-200 flex items-center justify-between text-xs"
                                    >
                                      <span
                                        className={
                                          deliv.is_completed ? 'line-through text-slate-400' : 'text-slate-800 font-medium'
                                        }
                                      >
                                        {deliv.task}
                                      </span>
                                      <div className="flex items-center gap-2 text-[10px] text-slate-500 font-mono">
                                        <span>Owner: {deliv.owner}</span>
                                        <span>· Due {deliv.due_date}</span>
                                        <button
                                          onClick={() => deleteDeliverable(deliv.id)}
                                          className="p-1 text-slate-400 hover:text-rose-600 rounded hover:bg-rose-50 transition-colors ml-1 cursor-pointer"
                                          title="Delete deliverable"
                                        >
                                          <Trash2 className="w-3 h-3" />
                                        </button>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    )}
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
