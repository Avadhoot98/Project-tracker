import { Project, Meeting, Deliverable } from '../types';
import { createRelativeDateString, createRelativeIsoDate } from '../utils/dateUtils';

export function getInitialSeedData(): {
  projects: Project[];
  meetings: Meeting[];
  deliverables: Deliverable[];
} {
  const now = new Date();

  const projects: Project[] = [
    {
      id: 'proj-1',
      name: 'Project Polaris: Global Supply Chain Resiliency',
      internal_lead: 'Marcus Vance',
      region: 'Global',
      lob: 'Supply Chain',
      created_at: new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: 'proj-2',
      name: 'Apex NextGen: Retail Core Banking Modernization',
      internal_lead: 'Elena Rostova',
      region: 'EMEA',
      lob: 'Retail Banking',
      created_at: new Date(now.getTime() - 45 * 24 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: 'proj-3',
      name: 'Falcon Cloud Infrastructure & FinOps Transformation',
      internal_lead: 'Devon Miller',
      region: 'North America',
      lob: 'Enterprise Tech',
      created_at: new Date(now.getTime() - 20 * 24 * 60 * 60 * 1000).toISOString(),
    },
  ];

  const meetings: Meeting[] = [
    // 1. Scheduled in the past -> Needs Status Update (Action Required)
    {
      id: 'meet-1',
      project_id: 'proj-1',
      date_time: new Date(now.getTime() - 3 * 60 * 60 * 1000).toISOString(), // 3 hours ago today
      key_objective: 'Tier-1 Supplier Vulnerability Scorecard & Near-Shoring Strategy Review',
      external_stakeholders: 'Sarah Chen (VP Global Logistics), David Zhao (Procurement Director), Amanda Price (Risk Head)',
      stakeholders_text: 'Marcus Vance (Engagement Lead), GBIU Supply Chain Advisory Team',
      shared_drive_url: 'https://drive.google.com/drive/folders/sample-polaris-deck',
      is_prep_ready: true,
      status: 'SCHEDULED',
      is_tbd: false,
      created_at: new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    },

    // 2. Scheduled Tomorrow (Runway) -> Prep Needed
    {
      id: 'meet-2',
      project_id: 'proj-2',
      date_time: createRelativeIsoDate(1, 10, 30, now), // Tomorrow 10:30 AM
      key_objective: 'Real-Time Transaction Ledger Architecture Sign-off with Enterprise Security',
      external_stakeholders: 'Viktor Krum (Chief Enterprise Architect), Hannah Schmidt (Director Infosec), Lars Møller (Head of Payments)',
      stakeholders_text: 'Elena Rostova (GBIU Banking Lead), Core Transformation Guild',
      shared_drive_url: 'https://drive.google.com/drive/folders/sample-apex-arch',
      is_prep_ready: false, // Prep Needed
      status: 'SCHEDULED',
      is_tbd: false,
      created_at: new Date(now.getTime() - 4 * 24 * 60 * 60 * 1000).toISOString(),
    },

    // 3. Scheduled in 3 days (Runway) -> Materials Ready
    {
      id: 'meet-3',
      project_id: 'proj-3',
      date_time: createRelativeIsoDate(3, 14, 0, now), // In 3 days 2:00 PM
      key_objective: 'Kubernetes Cluster Right-Sizing & Multi-Cloud Egress Cost Model Walkthrough',
      external_stakeholders: 'Rachel Green (VP Cloud Infrastructure), Priya Patel (FinOps Lead)',
      stakeholders_text: 'Devon Miller (GBIU Infrastructure Lead), Architecture CoE',
      shared_drive_url: 'https://drive.google.com/drive/folders/sample-finops-model',
      is_prep_ready: true, // Materials Ready
      status: 'SCHEDULED',
      is_tbd: false,
      created_at: new Date(now.getTime() - 6 * 24 * 60 * 60 * 1000).toISOString(),
    },

    // 4. Scheduled in 5 days (Runway)
    {
      id: 'meet-4',
      project_id: 'proj-1',
      date_time: createRelativeIsoDate(5, 11, 0, now),
      key_objective: 'Customs Clearance Automation Feasibility & Port Labor Union Contingency Review',
      external_stakeholders: 'Carlos Santana (Head of Maritime Operations), Priya Nair (Trade Compliance Counsel)',
      stakeholders_text: 'Marcus Vance (Engagement Lead)',
      is_prep_ready: false,
      status: 'SCHEDULED',
      is_tbd: false,
      created_at: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    },

    // 5. TBD Backlog meeting with Momentum Alert (> 5 working days ago, e.g. 9 calendar days ago)
    {
      id: 'meet-5',
      project_id: 'proj-1',
      date_time: null,
      key_objective: 'Cross-Border Warehouse Consolidation & Automated Freight Dispatch Steering Committee',
      external_stakeholders: 'Robert Lang (SVP Global Supply), Brenda Fox (CFO Logistics)',
      stakeholders_text: 'Marcus Vance (GBIU Lead), Logistics Advisory',
      shared_drive_url: 'https://drive.google.com/drive/folders/sample-tbd-warehouse',
      is_prep_ready: false,
      status: 'RESCHEDULED',
      is_tbd: true,
      tbd_since: new Date(now.getTime() - 10 * 24 * 60 * 60 * 1000).toISOString(), // ~7 working days ago
      rescheduled_from: new Date(now.getTime() - 11 * 24 * 60 * 60 * 1000).toISOString(),
      created_at: new Date(now.getTime() - 15 * 24 * 60 * 60 * 1000).toISOString(),
    },

    // 6. TBD Backlog meeting recent (2 days ago)
    {
      id: 'meet-6',
      project_id: 'proj-2',
      date_time: null,
      key_objective: 'Regulatory Open Banking PSD3 Compliance & Customer Consent Architecture',
      external_stakeholders: 'Claire Delacroix (Compliance Officer), Simon Peter (Head of Retail APIs)',
      stakeholders_text: 'Elena Rostova (GBIU Lead)',
      is_prep_ready: false,
      status: 'RESCHEDULED',
      is_tbd: true,
      tbd_since: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000).toISOString(), // 2 days ago
      rescheduled_from: new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000).toISOString(),
      created_at: new Date(now.getTime() - 8 * 24 * 60 * 60 * 1000).toISOString(),
    },

    // 7. Completed Meeting (Meeting Over) with rich MOM data
    {
      id: 'meet-7',
      project_id: 'proj-2',
      date_time: new Date(now.getTime() - 6 * 24 * 60 * 60 * 1000).toISOString(),
      key_objective: 'Phase 1 Core Banking Discovery Workshop & Migration Blueprint Baseline',
      external_stakeholders: 'Viktor Krum (SVP Digital Banking), Hannah Schmidt (Enterprise Architect)',
      stakeholders_text: 'Elena Rostova (GBIU Lead), Liam Evans (Program Director)',
      shared_drive_url: 'https://drive.google.com/drive/folders/sample-apex-kickoff',
      is_prep_ready: true,
      status: 'MEETING_OVER',
      is_tbd: false,
      mom_data: {
        attendees: 'Elena Rostova (GBIU Lead), Viktor Krum (SVP Digital Banking), Hannah Schmidt (Enterprise Architect), Liam Evans (Program Director)',
        key_topics: '1. Current monolithic mainframe dependency and synchronous batch latency limits.\n2. Target microservices architecture on private cloud with event-driven Kafka messaging.\n3. Risk mitigation around 24/7 high-volume SEPA instant payment processing.\n4. Dual-run ledger reconciliation window proposed for 6 months.',
        major_takeaways: '• Executive consensus reached to decouple payment processing before branch retail accounts.\n• Security review required for customer data encryption keys at rest in transit.\n• Agreed to establish weekly architecture review board every Thursday.\n• Next milestone: Finalize cutover simulation sequence diagram.',
      },
      created_at: new Date(now.getTime() - 10 * 24 * 60 * 60 * 1000).toISOString(),
    },

    // 8. Cancelled Meeting
    {
      id: 'meet-8',
      project_id: 'proj-3',
      date_time: new Date(now.getTime() - 9 * 24 * 60 * 60 * 1000).toISOString(),
      key_objective: 'Legacy Database Licensing Audit & Cloud Native Postgres Migration Proposal',
      external_stakeholders: 'Arthur Pendelton (Director Database Ops), Greg Vance (Chief Procurement)',
      stakeholders_text: 'Devon Miller (GBIU Lead)',
      is_prep_ready: true,
      status: 'CANCELLED',
      is_tbd: false,
      cancellation_reason: 'Postponed due to unexpected Oracle commercial contract extension signed by interim leadership; pivoting scope to container cost attribution.',
      created_at: new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000).toISOString(),
    },
  ];

  const deliverables: Deliverable[] = [
    // 1. Overdue Deliverable (Red alert)
    {
      id: 'deliv-1',
      project_id: 'proj-1',
      meeting_id: 'meet-1',
      task: 'Finalize supplier risk scoring rubric & matrix for APAC critical parts',
      owner: 'Marcus Vance',
      due_date: createRelativeDateString(-2, now), // 2 days ago
      is_completed: false,
      created_at: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    },

    // 2. Due Soon (< 48 hours) (Amber alert)
    {
      id: 'deliv-2',
      project_id: 'proj-2',
      meeting_id: 'meet-7',
      task: 'Deliver draft Core Banking ledger dual-run cutover sequence diagram',
      owner: 'Elena Rostova',
      due_date: createRelativeDateString(1, now), // Tomorrow
      is_completed: false,
      created_at: new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    },

    // 3. Open (In 4 days)
    {
      id: 'deliv-3',
      project_id: 'proj-3',
      meeting_id: 'meet-3',
      task: 'Complete AWS vs Azure multi-cloud network egress fee benchmark model',
      owner: 'Devon Miller',
      due_date: createRelativeDateString(4, now),
      is_completed: false,
      created_at: new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    },

    // 4. Open (In 7 days)
    {
      id: 'deliv-4',
      project_id: 'proj-1',
      meeting_id: 'meet-4',
      task: 'Synthesize maritime customs automation legal requirements across 4 jurisdictions',
      owner: 'Marcus Vance',
      due_date: createRelativeDateString(7, now),
      is_completed: false,
      created_at: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    },

    // 5. Completed Task
    {
      id: 'deliv-5',
      project_id: 'proj-2',
      meeting_id: 'meet-7',
      task: 'Publish baseline technical assessment report on legacy mainframe dependencies',
      owner: 'Elena Rostova',
      due_date: createRelativeDateString(-4, now),
      is_completed: true,
      created_at: new Date(now.getTime() - 10 * 24 * 60 * 60 * 1000).toISOString(),
    },
  ];

  return { projects, meetings, deliverables };
}
