export type Region = string;

export type LOB = string;

export interface Project {
  id: string;
  name: string;
  internal_lead: string;
  region: Region;
  lob: string;
  created_at: string;
}

export type MeetingStatus = 'SCHEDULED' | 'MEETING_OVER' | 'RESCHEDULED' | 'CANCELLED';

export interface MomData {
  attendees: string;
  key_topics: string;
  major_takeaways: string;
}

export interface Meeting {
  id: string;
  project_id: string;
  date_time: string | null; // ISO string, null if is_tbd is true
  key_objective: string;
  stakeholders_text: string;
  external_stakeholders?: string;
  shared_drive_url?: string;
  is_prep_ready: boolean;
  status: MeetingStatus;
  is_tbd: boolean;
  tbd_since?: string; // ISO string
  cancellation_reason?: string;
  mom_data?: MomData;
  parent_meeting_id?: string;
  rescheduled_from?: string; // original ISO date
  created_at: string;
}

export interface Deliverable {
  id: string;
  project_id: string;
  meeting_id?: string;
  task: string;
  owner: string;
  due_date: string; // YYYY-MM-DD
  is_completed: boolean;
  created_at: string;
}

export type ActiveTab = 'runway' | 'deliverables' | 'thread' | 'projects';
