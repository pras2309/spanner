export interface User {
  id: string;
  email: string;
  name: string;
  is_active: boolean;
  roles: string[];
  created_at: string;
}

export interface UserBrief {
  id: string;
  name: string;
  email: string;
  roles: string[];
}

export interface Role {
  id: number;
  name: string;
  description: string;
}

export interface Permission {
  id: number;
  module: string;
  action: string;
  description: string;
}

export interface Segment {
  id: string;
  name: string;
  description: string;
  status: 'active' | 'archived';
  created_by: string;
  created_at: string;
  updated_at: string;
  offerings: Offering[];
}

export interface SegmentCreate {
  name: string;
  description?: string;
  offering_ids?: string[];
  new_offerings?: { name: string; description?: string }[];
}

export interface SegmentUpdate {
  name?: string;
  description?: string;
  offering_ids?: string[];
  new_offerings?: { name: string; description?: string }[];
}

export interface Offering {
  id: string;
  name: string;
  description: string;
  status: 'active' | 'inactive';
}

export interface Assignment {
  id: string;
  entity_type: string;
  entity_id: string;
  assigned_to: UserBrief;
  assigned_by: UserBrief;
  is_active: boolean;
  created_at: string;
}

export interface AssignmentCreate {
  entity_type: string;
  entity_id: string;
  assigned_to: string;
}

export interface Company {
  id: string;
  name: string;
  website?: string;
  industry?: string;
  status: 'pending' | 'approved' | 'rejected';
  segment_id: string;
  created_by: string;
  created_at: string;
}

export interface Contact {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  company_id: string;
  status: 'uploaded' | 'approved' | 'assigned_to_sdr' | 'meeting_scheduled';
  assigned_sdr_id?: string;
}

export interface UploadBatch {
  id: string;
  entity_type: 'company' | 'contact';
  file_name: string;
  status: 'processing' | 'completed' | 'failed';
  total_rows: number;
  created_at: string;
}

export interface AuditLog {
  id: string;
  actor_id: string;
  action: string;
  entity_type: string;
  entity_id: string;
  created_at: string;
}
