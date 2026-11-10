import React, { useState, useEffect } from 'react';
import { X, CheckSquare, Check } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { createRelativeDateString } from '../../utils/dateUtils';

export const AddTaskModal: React.FC = () => {
  const {
    isAddTaskModalOpen,
    addTaskModalInitialProjectId,
    closeAddTaskModal,
    projects,
    meetings,
    addDeliverable,
  } = useApp();

  const [projectId, setProjectId] = useState<string>('');
  const [meetingId, setMeetingId] = useState<string>('');
  const [task, setTask] = useState<string>('');
  const [owner, setOwner] = useState<string>('');
  const [dueDate, setDueDate] = useState<string>('');

  useEffect(() => {
    if (isAddTaskModalOpen) {
      const defaultProjId =
        addTaskModalInitialProjectId || (projects.length > 0 ? projects[0].id : '');
      setProjectId(defaultProjId);
      setMeetingId('');
      setTask('');

      const proj = projects.find((p) => p.id === defaultProjId);
      setOwner(proj?.internal_lead || 'Internal Consultant');
      setDueDate(createRelativeDateString(5));
    }
  }, [isAddTaskModalOpen, addTaskModalInitialProjectId, projects]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isAddTaskModalOpen) {
        closeAddTaskModal();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isAddTaskModalOpen, closeAddTaskModal]);

  if (!isAddTaskModalOpen) return null;

  const projectMeetings = meetings.filter((m) => m.project_id === projectId);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!projectId || !task.trim()) return;

    addDeliverable({
      projectId,
      meetingId: meetingId || undefined,
      task: task.trim(),
      owner: owner.trim() || 'Internal Consultant',
      dueDate,
    });

    closeAddTaskModal();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white rounded-xl shadow-2xl border border-slate-200 w-full max-w-md overflow-hidden flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50/80">
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-indigo-100 text-indigo-700 rounded-lg">
              <CheckSquare className="w-5 h-5 text-indigo-600" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-slate-900">Add Deliverable / Action Item</h3>
              <p className="text-xs text-slate-500">Track key milestones and consultant obligations</p>
            </div>
          </div>
          <button
            onClick={closeAddTaskModal}
            className="p-1 rounded-md text-slate-400 hover:text-slate-600 hover:bg-slate-200/60 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Project <span className="text-rose-500">*</span>
            </label>
            <select
              value={projectId}
              onChange={(e) => {
                const nextId = e.target.value;
                setProjectId(nextId);
                const proj = projects.find((p) => p.id === nextId);
                if (proj) setOwner(proj.internal_lead);
              }}
              required
              className="w-full text-xs rounded-lg border border-slate-300 px-3 py-2 bg-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500 text-slate-800"
            >
              {projects.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Task Description <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Synthesize legacy system API dependency matrix"
              value={task}
              onChange={(e) => setTask(e.target.value)}
              className="w-full text-xs rounded-lg border border-slate-300 px-3 py-2 bg-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500 text-slate-900"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Owner / Assignee <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                placeholder="Consultant name"
                value={owner}
                onChange={(e) => setOwner(e.target.value)}
                className="w-full text-xs rounded-lg border border-slate-300 px-3 py-2 bg-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500 text-slate-900"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Due Date <span className="text-rose-500">*</span>
              </label>
              <input
                type="date"
                required
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="w-full text-xs rounded-lg border border-slate-300 px-3 py-2 bg-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500 text-slate-800"
              />
            </div>
          </div>

          {projectMeetings.length > 0 && (
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Linked Meeting (Optional)
              </label>
              <select
                value={meetingId}
                onChange={(e) => setMeetingId(e.target.value)}
                className="w-full text-xs rounded-lg border border-slate-300 px-3 py-2 bg-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500 text-slate-800"
              >
                <option value="">-- None (Project-Level Deliverable) --</option>
                {projectMeetings.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.key_objective}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Footer */}
          <div className="pt-3 border-t border-slate-200 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={closeAddTaskModal}
              className="px-4 py-2 text-xs font-medium text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-xs transition-colors flex items-center gap-1.5"
            >
              <Check className="w-4 h-4" />
              <span>Create Task</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
