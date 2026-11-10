import React from 'react';
import {
  CalendarDays,
  CheckSquare,
  GitBranch,
  FolderKanban,
  RotateCcw,
  Plus,
  AlertCircle,
  Clock,
  Sparkles,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { ActiveTab } from '../types';
import { needsStatusUpdate, isStalledMomentum, getDeliverableStatus } from '../utils/dateUtils';

export const Sidebar: React.FC = () => {
  const {
    activeTab,
    setActiveTab,
    projects,
    meetings,
    deliverables,
    selectedProjectId,
    setSelectedProjectId,
    openScheduleModal,
    resetToSeedData,
  } = useApp();

  const [showResetConfirm, setShowResetConfirm] = React.useState(false);

  // Calculate badge counts
  const now = new Date();

  // Pending actions or TBD in runway
  const tbdMeetings = meetings.filter((m) => m.is_tbd);
  const actionRequiredMeetings = meetings.filter((m) => needsStatusUpdate(m, now));
  const runwayAlertCount = actionRequiredMeetings.length + tbdMeetings.length;

  // Stalled momentum count
  const stalledCount = tbdMeetings.filter((m) => isStalledMomentum(m.tbd_since, 5, now)).length;

  // Deliverables alert count (overdue + due soon)
  const overdueDeliverables = deliverables.filter(
    (d) => getDeliverableStatus(d.due_date, d.is_completed, now) === 'OVERDUE'
  );
  const dueSoonDeliverables = deliverables.filter(
    (d) => getDeliverableStatus(d.due_date, d.is_completed, now) === 'DUE_SOON'
  );
  const deliverableAlertCount = overdueDeliverables.length + dueSoonDeliverables.length;

  const navItems: Array<{
    id: ActiveTab;
    label: string;
    icon: React.ComponentType<{ className?: string }>;
    alertCount?: number;
    alertVariant?: 'amber' | 'rose' | 'slate';
  }> = [
    {
      id: 'runway',
      label: '7-Day Runway',
      icon: CalendarDays,
      alertCount: runwayAlertCount,
      alertVariant: actionRequiredMeetings.length > 0 ? 'rose' : 'amber',
    },
    {
      id: 'deliverables',
      label: 'Deliverables & Alerts',
      icon: CheckSquare,
      alertCount: deliverableAlertCount,
      alertVariant: overdueDeliverables.length > 0 ? 'rose' : 'amber',
    },
    {
      id: 'thread',
      label: 'Engagement Thread',
      icon: GitBranch,
    },
    {
      id: 'projects',
      label: 'Project Directory',
      icon: FolderKanban,
      alertCount: projects.length,
      alertVariant: 'slate',
    },
  ];

  return (
    <aside className="w-64 bg-slate-900 text-slate-200 flex flex-col shrink-0 h-screen border-r border-slate-800 select-none">
      {/* Brand Header */}
      <div className="p-5 border-b border-slate-800/80">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white font-bold text-sm shadow-sm shadow-indigo-500/20">
            G
          </div>
          <div>
            <div className="text-sm font-bold tracking-tight text-white flex items-center gap-1.5">
              <span>GBIU</span>
              <span className="text-[10px] font-semibold text-indigo-400 uppercase tracking-widest bg-indigo-950/80 px-1.5 py-0.5 rounded border border-indigo-800/60">
                Subsidiary Banking
              </span>
            </div>
            <div className="text-[11px] text-slate-400 font-medium">Engagement &amp; Meeting Tracker</div>
          </div>
        </div>

        {/* Primary CTA */}
        <button
          onClick={() => openScheduleModal()}
          className="mt-4 w-full flex items-center justify-center gap-2 px-3.5 py-2.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 rounded-lg shadow-sm transition-all active:scale-[0.98]"
        >
          <Plus className="w-4 h-4" />
          <span>Schedule Meeting</span>
        </button>
      </div>

      {/* Main Navigation */}
      <div className="px-3 py-4 flex-1 overflow-y-auto space-y-6">
        <div>
          <div className="px-3 pb-2 text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
            Operations
          </div>
          <nav className="space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-xs font-medium transition-all ${
                    isActive
                      ? 'bg-indigo-600/20 text-white font-semibold border border-indigo-500/30'
                      : 'text-slate-300 hover:bg-slate-800/70 hover:text-white'
                  }`}
                >
                  <div className="flex items-center gap-2.5 truncate">
                    <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-indigo-400' : 'text-slate-400'}`} />
                    <span className="truncate">{item.label}</span>
                  </div>

                  {item.alertCount !== undefined && item.alertCount > 0 && (
                    <span
                      className={`text-[10px] font-bold px-1.5 py-0.5 rounded tabular-nums shrink-0 ${
                        item.alertVariant === 'rose'
                          ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                          : item.alertVariant === 'amber'
                          ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                          : 'bg-slate-800 text-slate-300'
                      }`}
                    >
                      {item.alertCount}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Global Focus Project Filter */}
        <div>
          <div className="px-3 pb-2 flex items-center justify-between text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
            <span>Portfolio Scope</span>
            {selectedProjectId && (
              <button
                onClick={() => setSelectedProjectId(null)}
                className="text-[10px] text-indigo-400 hover:text-indigo-300 lowercase font-normal"
              >
                clear
              </button>
            )}
          </div>
          <div className="space-y-1">
            <button
              onClick={() => setSelectedProjectId(null)}
              className={`w-full text-left px-3 py-2 rounded-lg text-xs transition-all flex items-center justify-between ${
                selectedProjectId === null
                  ? 'bg-slate-800/80 text-white font-medium'
                  : 'text-slate-400 hover:bg-slate-800/40 hover:text-slate-200'
              }`}
            >
              <span>All Projects</span>
              <span className="text-[11px] text-slate-500 tabular-nums">{projects.length}</span>
            </button>
            {projects.map((proj) => {
              const isSelected = selectedProjectId === proj.id;
              const projMeetings = meetings.filter((m) => m.project_id === proj.id);
              return (
                <button
                  key={proj.id}
                  onClick={() => setSelectedProjectId(proj.id)}
                  className={`w-full text-left px-3 py-2 rounded-lg text-xs transition-all flex items-center justify-between group ${
                    isSelected
                      ? 'bg-slate-800/90 text-indigo-300 font-medium'
                      : 'text-slate-400 hover:bg-slate-800/40 hover:text-slate-200'
                  }`}
                >
                  <span className="truncate pr-2" title={proj.name}>
                    {proj.name}
                  </span>
                  <span className="text-[10px] text-slate-500 tabular-nums shrink-0">
                    {projMeetings.length}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Momentum Warning Banner in Sidebar if Stalled */}
        {stalledCount > 0 && (
          <div className="p-3 bg-amber-950/40 border border-amber-800/50 rounded-lg text-xs">
            <div className="flex items-center gap-1.5 font-semibold text-amber-300">
              <Clock className="w-3.5 h-3.5 text-amber-400 shrink-0" />
              <span>Momentum Alert</span>
            </div>
            <p className="mt-1 text-[11px] text-amber-200/80 leading-relaxed">
              {stalledCount} meeting{stalledCount > 1 ? 's' : ''} in TBD for &gt; 5 working days. Reconnect with stakeholders.
            </p>
            <button
              onClick={() => setActiveTab('runway')}
              className="mt-2 text-[11px] font-semibold text-amber-300 hover:text-amber-200 underline decoration-amber-400/40"
            >
              View TBD Drawer →
            </button>
          </div>
        )}
      </div>

      {/* Footer Utilities */}
      <div className="p-4 border-t border-slate-800 text-xs text-slate-400 space-y-2">
        <div className="flex items-center justify-between text-[11px]">
          <span className="text-slate-500">Active Pipeline</span>
          <span className="text-slate-300 tabular-nums font-mono">
            {meetings.filter((m) => m.status === 'SCHEDULED').length} Scheduled
          </span>
        </div>
        {!showResetConfirm ? (
          <button
            onClick={() => setShowResetConfirm(true)}
            className="w-full flex items-center justify-center gap-1.5 px-2.5 py-1.5 rounded-md bg-slate-800/60 hover:bg-slate-800 text-slate-300 hover:text-white text-[11px] font-medium transition-colors border border-slate-700/50 cursor-pointer"
            title="Restore original seed projects, meetings and deliverables"
          >
            <RotateCcw className="w-3 h-3 text-slate-400" />
            <span>Reset Demo Seed Data</span>
          </button>
        ) : (
          <div className="space-y-1 p-1 bg-slate-800/80 rounded-md border border-slate-700">
            <div className="text-[10px] text-amber-300 text-center font-medium">Reset to sample seed data?</div>
            <div className="flex gap-1.5">
              <button
                onClick={() => {
                  resetToSeedData();
                  setShowResetConfirm(false);
                }}
                className="flex-1 px-2 py-1 bg-amber-600 hover:bg-amber-500 text-white rounded text-[10px] font-semibold transition-colors cursor-pointer"
              >
                Confirm
              </button>
              <button
                onClick={() => setShowResetConfirm(false)}
                className="flex-1 px-2 py-1 bg-slate-700 hover:bg-slate-600 text-slate-300 rounded text-[10px] transition-colors cursor-pointer"
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>
    </aside>
  );
};
