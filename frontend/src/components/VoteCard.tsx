import { motion } from 'framer-motion';
import { User, CheckCircle } from 'lucide-react';
import type { Election, Candidate } from '../types';

interface VoteCardProps {
  election: Election;
  onVote: (electionId: number, candidateId: number | null, isVoteNo: boolean) => void;
  hasVoted?: boolean;
  isVoting?: boolean;
}

export const VoteCard: React.FC<VoteCardProps> = ({ election, onVote, hasVoted = false, isVoting = false }) => {
  return (
    <div className="bg-white/10 backdrop-blur-lg rounded-2xl shadow-xl border border-white/20 p-6 mb-6">
      <div className="mb-6">
        <div className="flex justify-between items-start">
          <div>
            <h3 className="text-xl font-bold text-white mb-2">{election.title}</h3>
            {/* <p className="text-slate-300 text-sm">{election.description}</p> */}
          </div>
          <span className={`px-3 py-1 rounded-full text-xs font-medium ${
            election.status === 'ONGOING' ? 'bg-green-500/20 text-green-400' :
            election.status === 'COMPLETED' ? 'bg-red-500/20 text-red-400' :
            'bg-yellow-500/20 text-yellow-400'
          }`}>
            {election.status}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {election.candidates.map((candidate: Candidate) => (
          <motion.button
            key={candidate.id}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => onVote(election.id, candidate.id, false)}
            disabled={hasVoted || isVoting || election.status !== 'ONGOING'}
            className="relative group p-4 bg-white/5 hover:bg-white/10 rounded-xl border border-white/10 transition-all text-left disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <div className="flex items-center space-x-4">
              <div className="bg-gradient-to-br from-purple-500 to-blue-600 p-3 rounded-full">
                {candidate.image ? (
                  <img src={candidate.image} alt={candidate.name} className="w-6 h-6 rounded-full object-cover" /> 
                ) : (
                  <User className="w-6 h-6 text-white" />
                )}
              </div>
              <div>
                <h4 className="font-bold text-white group-hover:text-blue-400 transition-colors">
                  {candidate.name}
                </h4>
                {candidate.policy && (
                  <p className="text-xs text-slate-400 mt-1">{candidate.policy}</p>
                )}
              </div>
            </div>
          </motion.button>
        ))}

        {/* Vote No Option */}
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => onVote(election.id, null, true)}
          disabled={hasVoted || isVoting || election.status !== 'ONGOING'}
          className="relative group p-4 bg-red-500/5 hover:bg-red-500/10 rounded-xl border border-red-500/20 transition-all text-left disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <div className="flex items-center space-x-4">
            <div className="bg-red-500/20 p-3 rounded-full">
              <User className="w-6 h-6 text-red-400" />
            </div>
            <div>
              <h4 className="font-bold text-red-400">ไม่ประสงค์ลงคะแนน</h4>
              <p className="text-xs text-red-400/60 mt-1">Vote No</p>
            </div>
          </div>
        </motion.button>
      </div>

      {hasVoted && (
        <div className="mt-4 flex items-center text-green-400 text-sm bg-green-500/10 p-3 rounded-lg">
          <CheckCircle className="w-4 h-4 mr-2" />
          คุณได้ลงคะแนนในการเลือกตั้งนี้แล้ว
        </div>
      )}
    </div>
  );
};
