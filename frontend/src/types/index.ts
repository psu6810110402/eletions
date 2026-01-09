export interface Candidate {
  id: number;
  name: string;
  section?: string | null; // Motto or description
  voteCount?: number;
}

export type ElectionStatus = 'UPCOMING' | 'ONGOING' | 'COMPLETED';

export interface Election {
  id: number;
  title: string;
  description?: string;
  status: ElectionStatus;
  candidates: Candidate[];
}

export interface VotePayload {
  electionId: number;
  candidateId?: number | null; // null for "Vote No"
  isVoteNo: boolean;
}
