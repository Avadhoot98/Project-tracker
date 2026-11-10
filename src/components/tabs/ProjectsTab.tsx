import React, { useState } from 'react';
import {
  FolderKanban,
  Plus,
  Edit2,
  Trash2,
  Search,
  Calendar,
  Clock,
  CheckSquare,
  Users,
  Globe,
  Briefcase,
  ArrowRight,
  ExternalLink,
  X,
  AlertTriangle,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { Project } from '../../types';

export const ProjectsTab: React.FC = () => {
  const {
    projects,
    meetings,
    deliverables,
    openAddProjectModal,
    openEditProjectModal,
    deleteProject,
    setSelectedProjectId,
    setActiveTab,
  } = useApp();

  const [searchQuery, setSearchQuery] = useState<string>('');
  const [projectToDelete, setProjectToDelete] = useState<Project | null>(null);

  const filteredProjects = projects.filter((p) => {
    if (searchQuery.trim() === '') return true;
    const q = searchQuery.toLowerCase();
    return (
      p.name.toLowerCase().includes(q) ||
      p.internal_lead.toLowerCase().includes(q) ||
      p.lob.toLowerCase().includes(q) ||
      p.region.toLowerCase().includes(q)
    );
  });

  const handleSelectProject = (projectId: string, tab: 'runway' | 'thread') => {
    setSelectedProjectId(projectId);
    setActiveTab(tab);
  };

  return (
    <div className="space-y-6 pb-12">
      {/* View Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-xl border border-slate-200/80 shadow-2xs">
        <div>
          <h1 className="text-lg font-bold text-slate-900 tracking-tight">Project Directory &amp; Governance</h1>
          <p className="text-xs text-slate-500 mt-1">
            Manage active consulting advisory accounts, assigned engagement leads, and operational health.
          </p>
        </div>

        <button
          onClick={openAddProjectModal}
          className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-2xs transition-all active:scale-[0.98] self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>New Engagement</span>
        </button>
      </div>

      {/* Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-2xs flex items-center justify-between gap-3 text-xs">
        <div className="relative flex-1 max-w-md">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search projects by name, lead, LOB, or region..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full text-xs rounded-lg border border-slate-200 pl-8 pr-3 py-1.5 bg-slate-50/50 focus:bg-white focus:outline-hidden focus:ring-1 focus:ring-indigo-500 text-slate-800"
          />
        </div>

        <div className="text-xs text-slate-500 font-mono tabular-nums">
          {filteredProjects.length} Active Engagement{filteredProjects.length !== 1 ? 's' : ''}
        </div>
      </div>

      {/* Projects Grid / Cards */}
      {filteredProjects.length === 0 ? (
        <div className="bg-white rounded-xl border border-dashed border-slate-300 p-12 text-center space-y-3">
          <FolderKanban className="w-8 h-8 text-slate-400 mx-auto" />
          <div className="text-sm font-semibold text-slate-800">No consulting projects found</div>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Create a new engagement to begin tracking meetings, deliverables, and momentum.
          </p>
          <button
            onClick={openAddProjectModal}
            className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-2xs transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Create Engagement</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {filteredProjects.map((project) => {
            const projectMeetings = meetings.filter((m) => m.project_id === project.id);
            const activeScheduled = projectMeetings.filter((m) => m.status === 'SCHEDULED' && !m.is_tbd);
            const tbdCount = projectMeetings.filter((m) => m.is_tbd);
            const completedMeetings = projectMeetings.filter((m) => m.status === 'MEETING_OVER');

            const projectDeliverables = deliverables.filter((d) => d.project_id === project.id);
            const openDeliverables = projectDeliverables.filter((d) => !d.is_completed);

            return (
              <div
                key={project.id}
                className="bg-white rounded-xl border border-slate-200/90 hover:border-slate-300 p-5 shadow-2xs transition-all space-y-4 flex flex-col justify-between"
              >
                <div className="space-y-3">
                  {/* Top Bar */}
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h3 className="text-sm font-bold text-slate-900 tracking-tight leading-snug">
                        {project.name}
                      </h3>
                      <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-slate-500 mt-1">
                        <span className="flex items-center gap-1 font-medium text-slate-700">
                          <Users className="w-3.5 h-3.5 text-slate-400" />
                          <span>Lead: {project.internal_lead}</span>
                        </span>
                        <span aria-hidden="true">·</span>
                        <span className="flex items-center gap-1">
                          <Briefcase className="w-3.5 h-3.5 text-slate-400" />
                          <span>{project.lob}</span>
                        </span>
                        <span aria-hidden="true">·</span>
                        <span className="flex items-center gap-1">
                          <Globe className="w-3.5 h-3.5 text-slate-400" />
                          <span>{project.region}</span>
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        onClick={() => openEditProjectModal(project)}
                        className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-slate-100 rounded-md transition-colors"
                        title="Edit Project"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => setProjectToDelete(project)}
                        className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-md transition-colors cursor-pointer"
                        title="Delete Project"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Quantitative Metrics Grid */}
                  <div className="grid grid-cols-4 gap-2 pt-2 border-t border-slate-100 text-center">
                    <div className="p-2 bg-slate-50 rounded-lg border border-slate-100">
                      <div className="text-xs font-bold text-slate-900 font-mono tabular-nums">
                        {activeScheduled.length}
                      </div>
                      <div className="text-[10px] text-slate-500 font-medium mt-0.5">Scheduled</div>
                    </div>
                    <div className="p-2 bg-amber-50/50 rounded-lg border border-amber-100">
                      <div className="text-xs font-bold text-amber-800 font-mono tabular-nums">
                        {tbdCount.length}
                      </div>
                      <div className="text-[10px] text-amber-700 font-medium mt-0.5">TBD Backlog</div>
                    </div>
                    <div className="p-2 bg-slate-50 rounded-lg border border-slate-100">
                      <div className="text-xs font-bold text-slate-900 font-mono tabular-nums">
                        {openDeliverables.length}
                      </div>
                      <div className="text-[10px] text-slate-500 font-medium mt-0.5">Open Tasks</div>
                    </div>
                    <div className="p-2 bg-emerald-50/50 rounded-lg border border-emerald-100">
                      <div className="text-xs font-bold text-emerald-800 font-mono tabular-nums">
                        {completedMeetings.length}
                      </div>
                      <div className="text-[10px] text-emerald-700 font-medium mt-0.5">MOMs Logged</div>
                    </div>
                  </div>
                </div>

                {/* Footer Quick Links */}
                <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2 text-xs">
                  <button
                    onClick={() => handleSelectProject(project.id, 'runway')}
                    className="text-indigo-600 hover:text-indigo-700 font-semibold flex items-center gap-1 transition-colors"
                  >
                    <span>View 7-Day Runway</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>

                  <button
                    onClick={() => handleSelectProject(project.id, 'thread')}
                    className="text-slate-600 hover:text-slate-900 font-medium flex items-center gap-1 transition-colors"
                  >
                    <span>Timeline History</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* In-App Delete Project Confirmation Dialog */}
      {projectToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white rounded-xl shadow-2xl border border-rose-200 w-full max-w-md overflow-hidden flex flex-col">
            <div className="px-6 py-4 border-b border-rose-100 flex items-center justify-between bg-rose-50/80">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-rose-100 text-rose-700 rounded-lg">
                  <Trash2 className="w-5 h-5 text-rose-600" />
                </div>
                <div>
                  <h3 className="text-base font-semibold text-slate-900">Delete Engagement</h3>
                  <p className="text-xs text-slate-500">Remove project and associated meetings</p>
                </div>
              </div>
              <button
                onClick={() => setProjectToDelete(null)}
                className="p-1 rounded-md text-slate-400 hover:text-slate-600 hover:bg-slate-200/60 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-3 text-xs">
              <p className="text-slate-700 leading-relaxed text-sm">
                Are you sure you want to delete <strong className="font-semibold text-slate-900">{projectToDelete.name}</strong>?
              </p>
              <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg text-rose-900 text-[11px] leading-relaxed flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                <span>
                  This will permanently delete this engagement along with all scheduled &amp; past meetings, minutes, and assigned action items.
                </span>
              </div>
            </div>

            <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex items-center justify-end gap-2.5">
              <button
                type="button"
                onClick={() => setProjectToDelete(null)}
                className="px-4 py-2 text-xs font-medium text-slate-700 hover:bg-slate-200/60 rounded-lg transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  deleteProject(projectToDelete.id);
                  setProjectToDelete(null);
                }}
                className="px-4 py-2 text-xs font-semibold text-white bg-rose-600 hover:bg-rose-700 rounded-lg shadow-xs transition-colors flex items-center gap-1.5 active:scale-[0.98] cursor-pointer"
              >
                <Trash2 className="w-4 h-4" />
                <span>Yes, Delete Engagement</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
