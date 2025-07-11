import { Org } from './org';

export interface OrgWithScore extends Org {
  alignment_score: number | null; // from the view
  created_by_name?: string;
  updated_by_name?: string;
}
