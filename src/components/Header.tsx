import React from 'react';
import { Calendar, Plus, CheckSquare } from 'lucide-react';
import { useApp } from '../context/AppContext';

export const Header: React.FC = () => {
  const { activeTab, selectedProjectId, projects, openScheduleModal, openAddTaskModal } = useApp();

  const getTabTitle = () => {
    switch (activeTab) {
      case 'runway':
        return '7-Day Meeting Runway';
      case 'deliverables':
        return 'Upcoming Deliverables & Alerts';
      case 'thread':
        return 'Master Engagement Tracker';
      case 'projects':
        return 'Project Directory';
    }
  };

  const selectedProject = selectedProjectId ? projects.find((p) => p.id === selectedProjectId) : null;

  return (
    <header className="h-16 px-6 bg-white border-b border-slate-200 flex items-center justify-between gap-6 shrink-0 sticky top-0 z-20 shadow-xs">
      {/* Zone 1: Contextual Breadcrumb Trail */}
      <div className="flex items-center gap-2 text-xs min-w-0">
        <span className="font-semibold text-slate-800 shrink-0">GBIU Subsidiary Banking</span>
        <span className="text-slate-400 shrink-0">/</span>
        <span className="text-slate-600 font-medium truncate">{getTabTitle()}</span>
        {selectedProject && (
          <>
            <span className="text-slate-400 shrink-0">/</span>
            <span className="font-semibold text-indigo-700 bg-indigo-50 border border-indigo-200/80 px-2 py-0.5 rounded text-[11px] truncate max-w-xs">
              {selectedProject.name}
            </span>
          </>
        )}
      </div>

      {/* Zone 2: Date context + Primary Actions */}
      <div className="flex items-center gap-3 shrink-0">
        <div className="hidden lg:flex items-center gap-1.5 text-xs text-slate-600 border border-slate-200 bg-slate-50 px-2.5 py-1.5 rounded-md font-mono tabular-nums">
          <Calendar className="w-3.5 h-3.5 text-slate-500" />
          <span>
            {new Date().toLocaleDateString('en-US', {
              weekday: 'short',
              month: 'short',
              day: 'numeric',
              year: 'numeric',
            })}
          </span>
        </div>

        <button
          onClick={() => openAddTaskModal(selectedProjectId || undefined)}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 bg-white border border-slate-300 hover:bg-slate-50 rounded-lg transition-colors whitespace-nowrap active:scale-[0.98]"
        >
          <CheckSquare className="w-3.5 h-3.5 text-slate-500" />
          <span>Add Task</span>
        </button>

        <button
          onClick={() => openScheduleModal(selectedProjectId || undefined)}
          className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-xs transition-colors whitespace-nowrap active:scale-[0.98]"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Schedule Meeting</span>
        </button>
      </div>
    </header>
  );
};
