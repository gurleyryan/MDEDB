import { Org } from './org';

export interface OrgWithScore extends Org {
  alignment_score: number | null; // from the view
}
