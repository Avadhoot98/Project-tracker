import React, { useState } from 'react';
import {
  CheckSquare,
  AlertCircle,
  Clock,
  Plus,
  Search,
  Filter,
  CheckCircle2,
  Trash2,
  Calendar,
  User,
  ArrowRight,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { getDeliverableStatus } from '../../utils/dateUtils';

export const DeliverablesTab: React.FC = () => {
  const {
    deliverables,
    projects,
    selectedProjectId,
    setSelectedProjectId,
    toggleDeliverable,
    deleteDeliverable,
    openAddTaskModal,
  } = useApp();

  const [selectedOwner, setSelectedOwner] = useState<string>('all');
  const [showCompleted, setShowCompleted] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>('');

  const now = new Date();

  // Distinct owners across deliverables
  const allOwners = Array.from(new Set(deliverables.map((d) => d.owner))).filter(Boolean);

  // Scope by selected project
  const scopedDeliverables = selectedProjectId
    ? deliverables.filter((d) => d.project_id === selectedProjectId)
    : deliverables;

  // Categorize for alerts
  const overdueTasks = scopedDeliverables.filter(
    (d) => getDeliverableStatus(d.due_date, d.is_completed, now) === 'OVERDUE'
  );
  const dueSoonTasks = scopedDeliverables.filter(
    (d) => getDeliverableStatus(d.due_date, d.is_completed, now) === 'DUE_SOON'
  );

  // Filtered deliverables list
  const filteredDeliverables = scopedDeliverables
    .filter((d) => {
      if (!showCompleted && d.is_completed) return false;
      if (selectedOwner !== 'all' && d.owner !== selectedOwner) return false;
      if (searchQuery.trim() !== '') {
        const query = searchQuery.toLowerCase();
        const project = projects.find((p) => p.id === d.project_id);
        const matches =
          d.task.toLowerCase().includes(query) ||
          d.owner.toLowerCase().includes(query) ||
          (project && project.name.toLowerCase().includes(query));
        if (!matches) return false;
      }
      return true;
    })
    .sort((a, b) => {
      // Uncompleted first, then sort by due date
      if (a.is_completed !== b.is_completed) {
        return a.is_completed ? 1 : -1;
      }
      return new Date(a.due_date).getTime() - new Date(b.due_date).getTime();
    });

  return (
    <div className="space-y-6 pb-12">
      {/* Tab Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-xl border border-slate-200/80 shadow-2xs">
        <div>
          <h1 className="text-lg font-bold text-slate-900 tracking-tight">Upcoming Deliverables &amp; Alerts</h1>
          <p className="text-xs text-slate-500 mt-1">
            Track consultant obligations, deadlines, and overdue action items from client checkpoints.
          </p>
        </div>

        <button
          onClick={() => openAddTaskModal(selectedProjectId || undefined)}
          className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-2xs transition-all active:scale-[0.98] self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Add Deliverable</span>
        </button>
      </div>

      {/* TOP ALERT BANNER (Overdue + Due within 48 hours) */}
      {(overdueTasks.length > 0 || dueSoonTasks.length > 0) && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Overdue Alert Card */}
          {overdueTasks.length > 0 && (
            <div className="p-4 bg-rose-50/80 border border-rose-300 rounded-xl space-y-2.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                  <span className="text-xs font-bold text-rose-900 uppercase tracking-wider">
                    Overdue Deliverables ({overdueTasks.length})
                  </span>
                </div>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-rose-200/80 text-rose-900 tabular-nums">
                  Immediate Action Required
                </span>
              </div>
              <p className="text-[11px] text-rose-800 leading-relaxed">
                The following action items have lapsed beyond their committed client deadline:
              </p>
              <div className="space-y-1.5">
                {overdueTasks.map((task) => (
                  <div
                    key={task.id}
                    className="p-2 bg-white/90 rounded-md border border-rose-200 flex items-center justify-between gap-2 text-xs"
                  >
                    <div className="truncate flex items-center gap-2 min-w-0">
                      <button
                        onClick={() => toggleDeliverable(task.id)}
                        className="text-slate-400 hover:text-emerald-600"
                        title="Mark Complete"
                      >
                        <CheckSquare className="w-4 h-4" />
                      </button>
                      <span className="font-medium text-slate-900 truncate">{task.task}</span>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <span className="text-[10px] text-slate-500">{task.owner}</span>
                      <span className="text-[10px] font-mono font-semibold text-rose-700 bg-rose-100 px-1.5 py-0.5 rounded">
                        Due {task.due_date}
                      </span>
                      <button
                        onClick={() => deleteDeliverable(task.id)}
                        className="p-1 text-slate-400 hover:text-rose-600 rounded hover:bg-rose-100 transition-colors cursor-pointer"
                        title="Delete task"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Due Soon (< 48 hours) Alert Card */}
          {dueSoonTasks.length > 0 && (
            <div className="p-4 bg-amber-50/80 border border-amber-300 rounded-xl space-y-2.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-amber-600 shrink-0" />
                  <span className="text-xs font-bold text-amber-900 uppercase tracking-wider">
                    Due Within 48 Hours ({dueSoonTasks.length})
                  </span>
                </div>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-200/80 text-amber-900 tabular-nums">
                  Approaching Cutoff
                </span>
              </div>
              <p className="text-[11px] text-amber-800 leading-relaxed">
                Action items scheduled for completion within the next 48 hours:
              </p>
              <div className="space-y-1.5">
                {dueSoonTasks.map((task) => (
                  <div
                    key={task.id}
                    className="p-2 bg-white/90 rounded-md border border-amber-200 flex items-center justify-between gap-2 text-xs"
                  >
                    <div className="truncate flex items-center gap-2 min-w-0">
                      <button
                        onClick={() => toggleDeliverable(task.id)}
                        className="text-slate-400 hover:text-emerald-600"
                        title="Mark Complete"
                      >
                        <CheckSquare className="w-4 h-4" />
                      </button>
                      <span className="font-medium text-slate-900 truncate">{task.task}</span>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <span className="text-[10px] text-slate-500">{task.owner}</span>
                      <span className="text-[10px] font-mono font-semibold text-amber-800 bg-amber-100 px-1.5 py-0.5 rounded">
                        Due {task.due_date}
                      </span>
                      <button
                        onClick={() => deleteDeliverable(task.id)}
                        className="p-1 text-slate-400 hover:text-amber-700 rounded hover:bg-amber-100 transition-colors cursor-pointer"
                        title="Delete task"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-2xs flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex flex-wrap items-center gap-3 flex-1 min-w-[280px]">
          {/* Search */}
          <div className="relative flex-1 min-w-[180px]">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Filter tasks, owners, or projects..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full text-xs rounded-lg border border-slate-200 pl-8 pr-3 py-1.5 bg-slate-50/50 focus:bg-white focus:outline-hidden focus:ring-1 focus:ring-indigo-500 text-slate-800"
            />
          </div>

          {/* Owner Filter */}
          <div className="flex items-center gap-1.5">
            <User className="w-3.5 h-3.5 text-slate-400" />
            <select
              value={selectedOwner}
              onChange={(e) => setSelectedOwner(e.target.value)}
              className="text-xs rounded-lg border border-slate-200 px-2.5 py-1.5 bg-white text-slate-700"
            >
              <option value="all">All Assignees</option>
              {allOwners.map((owner) => (
                <option key={owner} value={owner}>
                  {owner}
                </option>
              ))}
            </select>
          </div>

          {/* Project Filter */}
          <select
            value={selectedProjectId || ''}
            onChange={(e) => setSelectedProjectId(e.target.value ? e.target.value : null)}
            className="text-xs rounded-lg border border-slate-200 px-2.5 py-1.5 bg-white text-slate-700"
          >
            <option value="">All Projects</option>
            {projects.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>
        </div>

        {/* Toggle Show Completed */}
        <label className="flex items-center gap-2 cursor-pointer select-none text-slate-600 font-medium">
          <input
            type="checkbox"
            checked={showCompleted}
            onChange={(e) => setShowCompleted(e.target.checked)}
            className="rounded text-indigo-600 focus:ring-indigo-500 w-3.5 h-3.5 border-slate-300"
          />
          <span>Show Completed Tasks</span>
        </label>
      </div>

      {/* Main Deliverables Table / List */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-2xs">
        {filteredDeliverables.length === 0 ? (
          <div className="p-12 text-center space-y-3">
            <CheckSquare className="w-8 h-8 text-slate-300 mx-auto" />
            <div className="text-sm font-semibold text-slate-800">No matching deliverables found</div>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              Add a new deliverable or change the filter parameters to view other tasks.
            </p>
            <button
              onClick={() => openAddTaskModal(selectedProjectId || undefined)}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-2xs transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>Add Task</span>
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-200 text-[10px] font-semibold text-slate-500 uppercase tracking-wider">
                  <th className="py-3 px-4 w-10">Done</th>
                  <th className="py-3 px-4">Task Description</th>
                  <th className="py-3 px-4">Project</th>
                  <th className="py-3 px-4">Assignee</th>
                  <th className="py-3 px-4">Due Date</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredDeliverables.map((item) => {
                  const project = projects.find((p) => p.id === item.project_id);
                  const status = getDeliverableStatus(item.due_date, item.is_completed, now);

                  return (
                    <tr
                      key={item.id}
                      className={`hover:bg-slate-50/60 transition-colors ${
                        item.is_completed ? 'bg-slate-50/30' : ''
                      }`}
                    >
                      {/* Checkbox */}
                      <td className="py-3.5 px-4">
                        <button
                          onClick={() => toggleDeliverable(item.id)}
                          className={`w-5 h-5 rounded flex items-center justify-center transition-colors ${
                            item.is_completed
                              ? 'bg-emerald-600 text-white'
                              : 'border border-slate-300 hover:border-indigo-500 bg-white'
                          }`}
                          title={item.is_completed ? 'Mark Open' : 'Mark Completed'}
                        >
                          {item.is_completed && <CheckCircle2 className="w-3.5 h-3.5" />}
                        </button>
                      </td>

                      {/* Task Description */}
                      <td className="py-3.5 px-4 font-medium">
                        <span
                          className={`${
                            item.is_completed ? 'line-through text-slate-400' : 'text-slate-900'
                          }`}
                        >
                          {item.task}
                        </span>
                      </td>

                      {/* Project */}
                      <td className="py-3.5 px-4 text-indigo-700 font-semibold truncate max-w-[200px]">
                        {project?.name || 'Project'}
                      </td>

                      {/* Assignee / Owner */}
                      <td className="py-3.5 px-4 text-slate-700 whitespace-nowrap">
                        <div className="flex items-center gap-1.5">
                          <User className="w-3 h-3 text-slate-400" />
                          <span>{item.owner}</span>
                        </div>
                      </td>

                      {/* Due Date */}
                      <td className="py-3.5 px-4 text-slate-600 font-mono tabular-nums whitespace-nowrap">
                        {item.due_date}
                      </td>

                      {/* Status Indicator */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        {status === 'COMPLETED' ? (
                          <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded">
                            Done
                          </span>
                        ) : status === 'OVERDUE' ? (
                          <span className="text-[10px] font-semibold text-rose-700 bg-rose-50 border border-rose-200 px-2 py-0.5 rounded font-mono">
                            Overdue
                          </span>
                        ) : status === 'DUE_SOON' ? (
                          <span className="text-[10px] font-semibold text-amber-800 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded font-mono">
                            Due Soon (&lt;48h)
                          </span>
                        ) : (
                          <span className="text-[10px] font-medium text-slate-600 bg-slate-100 px-2 py-0.5 rounded">
                            Open
                          </span>
                        )}
                      </td>

                      {/* Delete */}
                      <td className="py-3.5 px-4 text-right">
                        <button
                          onClick={() => deleteDeliverable(item.id)}
                          className="p-1 text-slate-400 hover:text-rose-600 transition-colors cursor-pointer"
                          title="Delete task"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
