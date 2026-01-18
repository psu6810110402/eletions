import { motion } from 'framer-motion';
import { User, CheckCircle } from 'lucide-react';
import type { Election, Candidate } from '../types';

// Thai status translation
const getStatusText = (status: string): string => {
  switch (status) {
    case 'ONGOING': return 'กำลังดำเนินการ';
    case 'COMPLETED': return 'สิ้นสุดแล้ว';
    case 'DRAFT': return 'ฉบับร่าง';
    case 'CLOSED': return 'ปิดแล้ว';
    case 'UPCOMING': return 'กำลังจะมาถึง';
    default: return status;
  }
};

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
            {getStatusText(election.status)}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {election.candidates.map((candidate: Candidate) => (
          <motion.button
            key={candidate.id}
            whileHover={{ scale: 1.02, y: -4 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => onVote(election.id, candidate.id, false)}
            disabled={hasVoted || isVoting || election.status !== 'ONGOING'}
            className="relative group p-5 bg-gradient-to-br from-white/10 to-white/5 hover:from-white/15 hover:to-white/10 rounded-2xl border border-white/20 hover:border-purple-500/50 transition-all text-left disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-purple-500/20"
          >
            <div className="flex items-start space-x-4">
              {/* Candidate Image */}
              <div className="flex-shrink-0">
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-br from-purple-500 to-blue-600 rounded-full blur-md opacity-50 group-hover:opacity-75 transition-opacity"></div>
                  {candidate.image ? (
                    <img 
                      src={candidate.image} 
                      alt={candidate.name} 
                      className="relative w-20 h-20 rounded-full object-cover border-2 border-white/30 group-hover:border-purple-400 transition-colors bg-slate-700" 
                    />
                  ) : (
                    <div className="relative bg-gradient-to-br from-purple-500 to-blue-600 w-20 h-20 rounded-full flex items-center justify-center border-2 border-white/30">
                      <User className="w-10 h-10 text-white" />
                    </div>
                  )}
                </div>
              </div>

              {/* Candidate Info */}
              <div className="flex-1 min-w-0">
                <h4 className="text-lg font-bold text-white group-hover:text-purple-300 transition-colors mb-2">
                  {candidate.name}
                </h4>
                {candidate.policy && (
                  <div className="space-y-1">
                    <p className="text-xs font-medium text-purple-400 uppercase tracking-wide">นโยบาย</p>
                    <p className="text-sm text-slate-300 leading-relaxed">
                      {candidate.policy}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Vote indicator */}
            <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity">
              <span className="text-xs bg-purple-500/30 text-purple-300 px-2 py-1 rounded-full">
                คลิกเพื่อเลือก
              </span>
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
