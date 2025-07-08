// models/org.ts
export interface Org {
  id: string;
  org_name: string;
  country_code: string;
  website?: string;
  contact?: string;
  email?: string;
  type_of_work: string;
  mission_statement?: string;
  years_active?: string;
  notable_success?: string;
  capacity?: string;
  cta_notes?: string;
  logo?: string;
  tags?: string[];
  approval_status: 'pending' | 'approved' | 'rejected' | 'under_review';
}
