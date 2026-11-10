import React, { createContext, useContext, useState, useEffect } from 'react';
import { Project, Meeting, Deliverable, ActiveTab, MeetingStatus, MomData } from '../types';
import { getInitialSeedData } from '../data/seedData';

interface AppContextType {
  projects: Project[];
  meetings: Meeting[];
  deliverables: Deliverable[];
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  selectedProjectId: string | null;
  setSelectedProjectId: (id: string | null) => void;

  // Project Actions
  addProject: (data: { name: string; internal_lead: string; region: Project['region']; lob: string }) => Project;
  updateProject: (id: string, updates: Partial<Project>) => void;
  deleteProject: (id: string) => void;

  // Meeting Actions
  scheduleMeeting: (data: {
    projectId: string;
    dateTime: string | null;
    keyObjective: string;
    stakeholdersText: string;
    externalStakeholders?: string;
    sharedDriveUrl?: string;
    isPrepReady?: boolean;
    isTbd?: boolean;
    parentMeetingId?: string;
  }) => Meeting;
  updateMeetingPrepReadiness: (meetingId: string, isPrepReady: boolean) => void;
  resolveMeetingStatus: (
    meetingId: string,
    status: MeetingStatus,
    payload?: { newDateTime?: string | null; isTbd?: boolean; cancellationReason?: string }
  ) => void;
  confirmTbdDate: (meetingId: string, newDateTime: string) => void;
  saveMomAndFollowUps: (
    meetingId: string,
    momData: MomData,
    newDeliverables: Array<{ task: string; owner: string; dueDate: string }>,
    followUpMeetings: Array<{ keyObjective: string; dateTime: string | null; isTbd: boolean; stakeholdersText: string; externalStakeholders?: string }>
  ) => void;
  deleteMeeting: (meetingId: string) => void;
  clearThreadRecords: (projectId?: string | null) => void;
  addCompletedMeetingRecord: (data: {
    projectId: string;
    dateTime: string;
    keyObjective: string;
    attendees: string;
    externalStakeholders?: string;
    sharedDriveUrl?: string;
    momData: MomData;
    deliverables: Array<{ task: string; owner: string; dueDate: string }>;
    followUps: Array<{ keyObjective: string; dateTime: string | null; isTbd: boolean; stakeholdersText: string; externalStakeholders?: string }>;
  }) => Meeting;

  // Deliverable Actions
  addDeliverable: (data: { projectId: string; meetingId?: string; task: string; owner: string; dueDate: string }) => Deliverable;
  toggleDeliverable: (id: string) => void;
  deleteDeliverable: (id: string) => void;

  // Reset helper
  resetToSeedData: () => void;

  // Global Modals State & Triggers
  isScheduleModalOpen: boolean;
  scheduleModalInitialProjectId?: string;
  openScheduleModal: (initialProjectId?: string) => void;
  closeScheduleModal: () => void;

  isLogCompletedMeetingModalOpen: boolean;
  logCompletedMeetingInitialProjectId?: string;
  openLogCompletedMeetingModal: (initialProjectId?: string) => void;
  closeLogCompletedMeetingModal: () => void;

  isClearThreadConfirmOpen: boolean;
  clearThreadTargetProjectId: string | null;
  openClearThreadConfirm: (projectId?: string | null) => void;
  closeClearThreadConfirm: () => void;

  resolvingMeeting: Meeting | null;
  openResolutionModal: (meeting: Meeting) => void;
  closeResolutionModal: () => void;

  momEntryMeeting: Meeting | null;
  openMomModal: (meeting: Meeting) => void;
  closeMomModal: () => void;

  tbdSettingMeeting: Meeting | null;
  openTbdSetDateModal: (meeting: Meeting) => void;
  closeTbdSetDateModal: () => void;

  isAddTaskModalOpen: boolean;
  addTaskModalInitialProjectId?: string;
  openAddTaskModal: (initialProjectId?: string) => void;
  closeAddTaskModal: () => void;

  isAddProjectModalOpen: boolean;
  openAddProjectModal: () => void;
  closeAddProjectModal: () => void;

  editingProject: Project | null;
  openEditProjectModal: (project: Project) => void;
  closeEditProjectModal: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const STORAGE_KEYS = {
  PROJECTS: 'vanguard_tracker_projects_v2',
  MEETINGS: 'vanguard_tracker_meetings_v2',
  DELIVERABLES: 'vanguard_tracker_deliverables_v2',
};

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [projects, setProjects] = useState<Project[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.PROJECTS);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error('Failed reading projects from localStorage', e);
    }
    return getInitialSeedData().projects;
  });

  const [meetings, setMeetings] = useState<Meeting[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.MEETINGS);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error('Failed reading meetings from localStorage', e);
    }
    return getInitialSeedData().meetings;
  });

  const [deliverables, setDeliverables] = useState<Deliverable[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.DELIVERABLES);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error('Failed reading deliverables from localStorage', e);
    }
    return getInitialSeedData().deliverables;
  });

  const [activeTab, setActiveTab] = useState<ActiveTab>('runway');
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);

  // Modal states
  const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false);
  const [scheduleModalInitialProjectId, setScheduleModalInitialProjectId] = useState<string | undefined>(undefined);

  const [isLogCompletedMeetingModalOpen, setIsLogCompletedMeetingModalOpen] = useState(false);
  const [logCompletedMeetingInitialProjectId, setLogCompletedMeetingInitialProjectId] = useState<string | undefined>(undefined);

  const [isClearThreadConfirmOpen, setIsClearThreadConfirmOpen] = useState(false);
  const [clearThreadTargetProjectId, setClearThreadTargetProjectId] = useState<string | null>(null);

  const [resolvingMeeting, setResolvingMeeting] = useState<Meeting | null>(null);
  const [momEntryMeeting, setMomEntryMeeting] = useState<Meeting | null>(null);
  const [tbdSettingMeeting, setTbdSettingMeeting] = useState<Meeting | null>(null);

  const [isAddTaskModalOpen, setIsAddTaskModalOpen] = useState(false);
  const [addTaskModalInitialProjectId, setAddTaskModalInitialProjectId] = useState<string | undefined>(undefined);

  const [isAddProjectModalOpen, setIsAddProjectModalOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);

  // Sync with localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.PROJECTS, JSON.stringify(projects));
    } catch (e) {
      console.error('Error saving projects to localStorage', e);
    }
  }, [projects]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.MEETINGS, JSON.stringify(meetings));
    } catch (e) {
      console.error('Error saving meetings to localStorage', e);
    }
  }, [meetings]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.DELIVERABLES, JSON.stringify(deliverables));
    } catch (e) {
      console.error('Error saving deliverables to localStorage', e);
    }
  }, [deliverables]);

  const addProject = (data: { name: string; internal_lead: string; region: Project['region']; lob: string }) => {
    const newProject: Project = {
      id: `proj-${Date.now()}`,
      name: data.name,
      internal_lead: data.internal_lead,
      region: data.region,
      lob: data.lob,
      created_at: new Date().toISOString(),
    };
    setProjects((prev) => [newProject, ...prev]);
    return newProject;
  };

  const updateProject = (id: string, updates: Partial<Project>) => {
    setProjects((prev) => prev.map((p) => (p.id === id ? { ...p, ...updates } : p)));
  };

  const deleteProject = (id: string) => {
    setProjects((prev) => prev.filter((p) => p.id !== id));
    // Clean up or keep associated data
    setMeetings((prev) => prev.filter((m) => m.project_id !== id));
    setDeliverables((prev) => prev.filter((d) => d.project_id !== id));
    if (selectedProjectId === id) setSelectedProjectId(null);
  };

  const scheduleMeeting = (data: {
    projectId: string;
    dateTime: string | null;
    keyObjective: string;
    stakeholdersText: string;
    externalStakeholders?: string;
    sharedDriveUrl?: string;
    isPrepReady?: boolean;
    isTbd?: boolean;
    parentMeetingId?: string;
  }) => {
    const isTbd = !!data.isTbd || !data.dateTime;
    const nowIso = new Date().toISOString();
    const newMeeting: Meeting = {
      id: `meet-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      project_id: data.projectId,
      date_time: isTbd ? null : data.dateTime,
      key_objective: data.keyObjective,
      stakeholders_text: data.stakeholdersText,
      external_stakeholders: data.externalStakeholders?.trim() || undefined,
      shared_drive_url: data.sharedDriveUrl || undefined,
      is_prep_ready: data.isPrepReady ?? false,
      status: isTbd ? 'RESCHEDULED' : 'SCHEDULED',
      is_tbd: isTbd,
      tbd_since: isTbd ? nowIso : undefined,
      parent_meeting_id: data.parentMeetingId,
      created_at: nowIso,
    };

    setMeetings((prev) => [newMeeting, ...prev]);
    return newMeeting;
  };

  const updateMeetingPrepReadiness = (meetingId: string, isPrepReady: boolean) => {
    setMeetings((prev) =>
      prev.map((m) => (m.id === meetingId ? { ...m, is_prep_ready: isPrepReady } : m))
    );
  };

  const resolveMeetingStatus = (
    meetingId: string,
    status: MeetingStatus,
    payload?: { newDateTime?: string | null; isTbd?: boolean; cancellationReason?: string }
  ) => {
    const nowIso = new Date().toISOString();
    setMeetings((prev) =>
      prev.map((m) => {
        if (m.id !== meetingId) return m;

        if (status === 'MEETING_OVER') {
          return {
            ...m,
            status: 'MEETING_OVER',
          };
        }

        if (status === 'RESCHEDULED') {
          const isTbd = payload?.isTbd ?? false;
          return {
            ...m,
            status: 'RESCHEDULED',
            is_tbd: isTbd,
            date_time: isTbd ? null : payload?.newDateTime || null,
            tbd_since: isTbd ? nowIso : undefined,
            rescheduled_from: m.date_time || undefined,
          };
        }

        if (status === 'CANCELLED') {
          return {
            ...m,
            status: 'CANCELLED',
            cancellation_reason: payload?.cancellationReason,
          };
        }

        return m;
      })
    );
  };

  const confirmTbdDate = (meetingId: string, newDateTime: string) => {
    setMeetings((prev) =>
      prev.map((m) => {
        if (m.id !== meetingId) return m;
        return {
          ...m,
          status: 'SCHEDULED',
          is_tbd: false,
          date_time: newDateTime,
          tbd_since: undefined,
        };
      })
    );
  };

  const saveMomAndFollowUps = (
    meetingId: string,
    momData: MomData,
    newDeliverablesList: Array<{ task: string; owner: string; dueDate: string }>,
    followUpMeetingsList: Array<{ keyObjective: string; dateTime: string | null; isTbd: boolean; stakeholdersText: string }>
  ) => {
    const targetMeeting = meetings.find((m) => m.id === meetingId);
    if (!targetMeeting) return;

    // 1. Update meeting to MEETING_OVER with MOM
    setMeetings((prev) =>
      prev.map((m) =>
        m.id === meetingId
          ? {
              ...m,
              status: 'MEETING_OVER',
              mom_data: momData,
            }
          : m
      )
    );

    // 2. Add Deliverables
    if (newDeliverablesList.length > 0) {
      const createdDeliverables: Deliverable[] = newDeliverablesList.map((item, idx) => ({
        id: `deliv-${Date.now()}-${idx}`,
        project_id: targetMeeting.project_id,
        meeting_id: meetingId,
        task: item.task,
        owner: item.owner,
        due_date: item.dueDate,
        is_completed: false,
        created_at: new Date().toISOString(),
      }));
      setDeliverables((prev) => [...createdDeliverables, ...prev]);
    }

    // 3. Create Follow-up Meetings chained via parent_meeting_id
    if (followUpMeetingsList.length > 0) {
      const nowIso = new Date().toISOString();
      const createdMeetings: Meeting[] = followUpMeetingsList.map((f, idx) => {
        const isTbd = f.isTbd || !f.dateTime;
        return {
          id: `meet-followup-${Date.now()}-${idx}`,
          project_id: targetMeeting.project_id,
          parent_meeting_id: meetingId,
          date_time: isTbd ? null : f.dateTime,
          key_objective: f.keyObjective,
          stakeholders_text: f.stakeholdersText || targetMeeting.stakeholders_text,
          external_stakeholders: f.externalStakeholders?.trim() || targetMeeting.external_stakeholders,
          shared_drive_url: targetMeeting.shared_drive_url,
          is_prep_ready: false,
          status: isTbd ? 'RESCHEDULED' : 'SCHEDULED',
          is_tbd: isTbd,
          tbd_since: isTbd ? nowIso : undefined,
          created_at: nowIso,
        };
      });
      setMeetings((prev) => [...createdMeetings, ...prev]);
    }
  };

  const deleteMeeting = (meetingId: string) => {
    setMeetings((prev) => prev.filter((m) => m.id !== meetingId));
    setDeliverables((prev) => prev.filter((d) => d.meeting_id !== meetingId));
  };

  const clearThreadRecords = (projectId?: string | null) => {
    if (projectId) {
      const meetingIdsToDelete = new Set(meetings.filter((m) => m.project_id === projectId).map((m) => m.id));
      setMeetings((prev) => prev.filter((m) => m.project_id !== projectId));
      setDeliverables((prev) =>
        prev.filter((d) => d.project_id !== projectId && (!d.meeting_id || !meetingIdsToDelete.has(d.meeting_id)))
      );
    } else {
      setMeetings([]);
      setDeliverables([]);
    }
  };

  const addCompletedMeetingRecord = (data: {
    projectId: string;
    dateTime: string;
    keyObjective: string;
    attendees: string;
    externalStakeholders?: string;
    sharedDriveUrl?: string;
    momData: MomData;
    deliverables: Array<{ task: string; owner: string; dueDate: string }>;
    followUps: Array<{ keyObjective: string; dateTime: string | null; isTbd: boolean; stakeholdersText: string; externalStakeholders?: string }>;
  }) => {
    const meetingId = `meet-completed-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
    const nowIso = new Date().toISOString();

    const newMeeting: Meeting = {
      id: meetingId,
      project_id: data.projectId,
      date_time: data.dateTime,
      key_objective: data.keyObjective,
      stakeholders_text: data.attendees,
      external_stakeholders: data.externalStakeholders?.trim() || undefined,
      shared_drive_url: data.sharedDriveUrl || undefined,
      is_prep_ready: true,
      status: 'MEETING_OVER',
      is_tbd: false,
      mom_data: data.momData,
      created_at: nowIso,
    };

    setMeetings((prev) => [newMeeting, ...prev]);

    // Add deliverables
    if (data.deliverables.length > 0) {
      const createdDeliverables: Deliverable[] = data.deliverables.map((item, idx) => ({
        id: `deliv-${Date.now()}-${idx}`,
        project_id: data.projectId,
        meeting_id: meetingId,
        task: item.task,
        owner: item.owner,
        due_date: item.dueDate,
        is_completed: false,
        created_at: nowIso,
      }));
      setDeliverables((prev) => [...createdDeliverables, ...prev]);
    }

    // Add follow-ups
    if (data.followUps.length > 0) {
      const createdMeetings: Meeting[] = data.followUps.map((f, idx) => {
        const isTbd = f.isTbd || !f.dateTime;
        return {
          id: `meet-followup-${Date.now()}-${idx}`,
          project_id: data.projectId,
          parent_meeting_id: meetingId,
          date_time: isTbd ? null : f.dateTime,
          key_objective: f.keyObjective,
          stakeholders_text: f.stakeholdersText || data.attendees,
          shared_drive_url: data.sharedDriveUrl,
          is_prep_ready: false,
          status: isTbd ? 'RESCHEDULED' : 'SCHEDULED',
          is_tbd: isTbd,
          tbd_since: isTbd ? nowIso : undefined,
          created_at: nowIso,
        };
      });
      setMeetings((prev) => [...createdMeetings, ...prev]);
    }

    return newMeeting;
  };

  const addDeliverable = (data: {
    projectId: string;
    meetingId?: string;
    task: string;
    owner: string;
    dueDate: string;
  }) => {
    const newDeliverable: Deliverable = {
      id: `deliv-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      project_id: data.projectId,
      meeting_id: data.meetingId,
      task: data.task,
      owner: data.owner,
      due_date: data.dueDate,
      is_completed: false,
      created_at: new Date().toISOString(),
    };
    setDeliverables((prev) => [newDeliverable, ...prev]);
    return newDeliverable;
  };

  const toggleDeliverable = (id: string) => {
    setDeliverables((prev) =>
      prev.map((d) => (d.id === id ? { ...d, is_completed: !d.is_completed } : d))
    );
  };

  const deleteDeliverable = (id: string) => {
    setDeliverables((prev) => prev.filter((d) => d.id !== id));
  };

  const resetToSeedData = () => {
    const seed = getInitialSeedData();
    setProjects(seed.projects);
    setMeetings(seed.meetings);
    setDeliverables(seed.deliverables);
    setSelectedProjectId(null);
  };

  return (
    <AppContext.Provider
      value={{
        projects,
        meetings,
        deliverables,
        activeTab,
        setActiveTab,
        selectedProjectId,
        setSelectedProjectId,
        addProject,
        updateProject,
        deleteProject,
        scheduleMeeting,
        updateMeetingPrepReadiness,
        resolveMeetingStatus,
        confirmTbdDate,
        saveMomAndFollowUps,
        deleteMeeting,
        clearThreadRecords,
        addCompletedMeetingRecord,
        addDeliverable,
        toggleDeliverable,
        deleteDeliverable,
        resetToSeedData,

        // Modals
        isScheduleModalOpen,
        scheduleModalInitialProjectId,
        openScheduleModal: (initProj) => {
          setScheduleModalInitialProjectId(initProj);
          setIsScheduleModalOpen(true);
        },
        closeScheduleModal: () => {
          setIsScheduleModalOpen(false);
          setScheduleModalInitialProjectId(undefined);
        },

        isLogCompletedMeetingModalOpen,
        logCompletedMeetingInitialProjectId,
        openLogCompletedMeetingModal: (initProj) => {
          setLogCompletedMeetingInitialProjectId(initProj);
          setIsLogCompletedMeetingModalOpen(true);
        },
        closeLogCompletedMeetingModal: () => {
          setIsLogCompletedMeetingModalOpen(false);
          setLogCompletedMeetingInitialProjectId(undefined);
        },

        isClearThreadConfirmOpen,
        clearThreadTargetProjectId,
        openClearThreadConfirm: (targetProj) => {
          setClearThreadTargetProjectId(targetProj ?? null);
          setIsClearThreadConfirmOpen(true);
        },
        closeClearThreadConfirm: () => {
          setIsClearThreadConfirmOpen(false);
          setClearThreadTargetProjectId(null);
        },

        resolvingMeeting,
        openResolutionModal: (meeting) => setResolvingMeeting(meeting),
        closeResolutionModal: () => setResolvingMeeting(null),

        momEntryMeeting,
        openMomModal: (meeting) => setMomEntryMeeting(meeting),
        closeMomModal: () => setMomEntryMeeting(null),

        tbdSettingMeeting,
        openTbdSetDateModal: (meeting) => setTbdSettingMeeting(meeting),
        closeTbdSetDateModal: () => setTbdSettingMeeting(null),

        isAddTaskModalOpen,
        addTaskModalInitialProjectId,
        openAddTaskModal: (initProj) => {
          setAddTaskModalInitialProjectId(initProj);
          setIsAddTaskModalOpen(true);
        },
        closeAddTaskModal: () => {
          setIsAddTaskModalOpen(false);
          setAddTaskModalInitialProjectId(undefined);
        },

        isAddProjectModalOpen,
        openAddProjectModal: () => setIsAddProjectModalOpen(true),
        closeAddProjectModal: () => setIsAddProjectModalOpen(false),

        editingProject,
        openEditProjectModal: (proj) => setEditingProject(proj),
        closeEditProjectModal: () => setEditingProject(null),
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export function useApp(): AppContextType {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}
