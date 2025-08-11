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
  // Optional custom banner to override scraped metadata image
  banner?: string;
  // Optional social links
  instagram?: string;
  twitter?: string; // Shown as X in UI
  facebook?: string;
  tiktok?: string;
  linkedin?: string;
  youtube?: string;
  tags?: string[];
  approval_status: 'pending' | 'approved' | 'rejected' | 'under_review';
  created_at?: string;
  updated_at?: string;
  created_by?: string;
  updated_by?: string;
}
