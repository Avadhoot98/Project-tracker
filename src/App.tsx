/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Menu, X } from 'lucide-react';
import { AppProvider, useApp } from './context/AppContext';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { RunwayTab } from './components/tabs/RunwayTab';
import { DeliverablesTab } from './components/tabs/DeliverablesTab';
import { EngagementThreadTab } from './components/tabs/EngagementThreadTab';
import { ProjectsTab } from './components/tabs/ProjectsTab';

// Modals
import { ScheduleMeetingModal } from './components/modals/ScheduleMeetingModal';
import { ResolutionModal } from './components/modals/ResolutionModal';
import { MomEntryModal } from './components/modals/MomEntryModal';
import { TbdSetDateModal } from './components/modals/TbdSetDateModal';
import { AddTaskModal } from './components/modals/AddTaskModal';
import { ProjectModal } from './components/modals/ProjectModal';
import { ManualCompletedMeetingModal } from './components/modals/ManualCompletedMeetingModal';
import { ClearThreadModal } from './components/modals/ClearThreadModal';

const AppContent: React.FC = () => {
  const { activeTab } = useApp();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-slate-50 text-slate-900 font-sans antialiased">
      {/* Desktop Sidebar */}
      <div className="hidden md:flex shrink-0">
        <Sidebar />
      </div>

      {/* Mobile Drawer Backdrop & Sidebar */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 flex md:hidden">
          <div
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs"
            onClick={() => setMobileMenuOpen(false)}
          />
          <div className="relative flex-1 flex flex-col max-w-xs w-full bg-slate-900 z-10 shadow-xl">
            <div className="absolute top-2 right-2">
              <button
                onClick={() => setMobileMenuOpen(false)}
                className="p-2 text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <Sidebar />
          </div>
        </div>
      )}

      {/* Main View Area */}
      <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden">
        {/* Mobile Header Toggle */}
        <div className="md:hidden flex items-center justify-between px-4 py-3 bg-slate-900 text-white border-b border-slate-800">
          <button
            onClick={() => setMobileMenuOpen(true)}
            className="p-1.5 rounded-lg bg-slate-800 text-slate-300 hover:text-white"
          >
            <Menu className="w-5 h-5" />
          </button>
          <span className="text-xs font-bold uppercase tracking-wider text-indigo-400">
            GBIU Subsidiary Banking
          </span>
          <div className="w-7" />
        </div>

        {/* Global Header */}
        <Header />

        {/* Main Viewport */}
        <main className="flex-1 overflow-y-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="max-w-7xl mx-auto">
            {activeTab === 'runway' && <RunwayTab />}
            {activeTab === 'deliverables' && <DeliverablesTab />}
            {activeTab === 'thread' && <EngagementThreadTab />}
            {activeTab === 'projects' && <ProjectsTab />}
          </div>
        </main>
      </div>

      {/* Global Modals */}
      <ScheduleMeetingModal />
      <ResolutionModal />
      <MomEntryModal />
      <TbdSetDateModal />
      <AddTaskModal />
      <ProjectModal />
      <ManualCompletedMeetingModal />
      <ClearThreadModal />
    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}
