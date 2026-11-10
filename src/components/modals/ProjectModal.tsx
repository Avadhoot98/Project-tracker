import React, { useState, useEffect } from 'react';
import { X, FolderKanban, Check } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { Region } from '../../types';

export const ProjectModal: React.FC = () => {
  const {
    isAddProjectModalOpen,
    closeAddProjectModal,
    editingProject,
    closeEditProjectModal,
    addProject,
    updateProject,
  } = useApp();

  const isOpen = isAddProjectModalOpen || !!editingProject;
  const isEditing = !!editingProject;

  const [name, setName] = useState<string>('');
  const [internalLead, setInternalLead] = useState<string>('');
  const [region, setRegion] = useState<Region>('Global');
  const [lob, setLob] = useState<string>('Supply Chain');

  useEffect(() => {
    if (editingProject) {
      setName(editingProject.name);
      setInternalLead(editingProject.internal_lead);
      setRegion(editingProject.region);
      setLob(editingProject.lob);
    } else if (isAddProjectModalOpen) {
      setName('');
      setInternalLead('');
      setRegion('Global');
      setLob('Supply Chain');
    }
  }, [editingProject, isAddProjectModalOpen]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        handleClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  if (!isOpen) return null;

  const handleClose = () => {
    if (isEditing) {
      closeEditProjectModal();
    } else {
      closeAddProjectModal();
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !internalLead.trim()) return;

    if (isEditing && editingProject) {
      updateProject(editingProject.id, {
        name: name.trim(),
        internal_lead: internalLead.trim(),
        region,
        lob: lob.trim(),
      });
    } else {
      addProject({
        name: name.trim(),
        internal_lead: internalLead.trim(),
        region,
        lob: lob.trim(),
      });
    }

    handleClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white rounded-xl shadow-2xl border border-slate-200 w-full max-w-md overflow-hidden flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50/80">
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-indigo-100 text-indigo-700 rounded-lg">
              <FolderKanban className="w-5 h-5 text-indigo-600" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-slate-900">
                {isEditing ? 'Edit Consulting Project' : 'New Consulting Engagement'}
              </h3>
              <p className="text-xs text-slate-500">
                Configure advisory engagement attributes and leadership
              </p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="p-1 rounded-md text-slate-400 hover:text-slate-600 hover:bg-slate-200/60 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Project Name <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Project Orion: Commercial Lending Cloud Re-platforming"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full text-xs rounded-lg border border-slate-300 px-3 py-2 bg-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500 text-slate-900"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Internal Lead Consultant <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Marcus Vance"
              value={internalLead}
              onChange={(e) => setInternalLead(e.target.value)}
              className="w-full text-xs rounded-lg border border-slate-300 px-3 py-2 bg-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500 text-slate-900"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Region <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                list="region-suggestions"
                placeholder="e.g. EMEA, APAC, Global"
                value={region}
                onChange={(e) => setRegion(e.target.value)}
                className="w-full text-xs rounded-lg border border-slate-300 px-3 py-2 bg-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500 text-slate-900"
              />
              <datalist id="region-suggestions">
                <option value="Global" />
                <option value="EMEA" />
                <option value="APAC" />
                <option value="North America" />
                <option value="LATAM" />
                <option value="UK & Ireland" />
              </datalist>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Line of Business (LOB) <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                list="lob-suggestions"
                placeholder="e.g. Retail Banking, Corporate"
                value={lob}
                onChange={(e) => setLob(e.target.value)}
                className="w-full text-xs rounded-lg border border-slate-300 px-3 py-2 bg-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500 text-slate-900"
              />
              <datalist id="lob-suggestions">
                <option value="Retail Banking" />
                <option value="Corporate & Investment Banking" />
                <option value="Wealth Management" />
                <option value="Treasury & Capital Markets" />
                <option value="Supply Chain" />
                <option value="Enterprise Tech" />
                <option value="LOB Agnostic" />
              </datalist>
            </div>
          </div>

          {/* Footer */}
          <div className="pt-3 border-t border-slate-200 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={handleClose}
              className="px-4 py-2 text-xs font-medium text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-xs transition-colors flex items-center gap-1.5"
            >
              <Check className="w-4 h-4" />
              <span>{isEditing ? 'Save Changes' : 'Create Project'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
