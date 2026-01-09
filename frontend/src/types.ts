// Basic Entities
export interface User {
  id: number;
  username: string;
  role: 'ADMIN' | 'VOTER';
  userType?: string;
}

export interface Candidate {
  id: number;
  name: string;
  image?: string;
  policy?: string;
}

export interface Election {
  id: number;
  title: string;
  status: 'DRAFT' | 'ONGOING' | 'CLOSED' | 'COMPLETED';
  startDate?: string;
  endDate?: string;
  candidates: Candidate[];
}

export interface Vote {
  id: number;
  userId: number;
  electionId: number;
  candidateId: number | null; // null represents "Vote No"
  timestamp: string;
}

export interface VotePayload {
  electionId: number;
  candidateId: number | null;
  isVoteNo: boolean;
}

// API Responses
export interface AuthResponse {
  access_token: string;
  user: User;
}

export interface CandidateStats extends Candidate {
  votes: number;
  percentage: number;
}

export interface ElectionStats {
  id: number;
  title: string;
  status: string;
  totalVotes: number;
  voteNoCount: number;
  candidateStats: CandidateStats[];
  startDate?: string;
  endDate?: string;
}
