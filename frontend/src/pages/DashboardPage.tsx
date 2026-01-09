import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { LogOut, Users, BarChart3, Loader2 } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import api from '../api/client';
import { isAxiosError } from 'axios';
import type { Election, VotePayload, Vote } from '../types';
import { VoteCard } from '../components/VoteCard';

export const DashboardPage = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [elections, setElections] = useState<Election[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [votingMap, setVotingMap] = useState<Record<number, boolean>>({});
  const [votedMap, setVotedMap] = useState<Record<number, boolean>>({});

  useEffect(() => {
    fetchElections();
    fetchMyVotes();
  }, []);

  const fetchElections = async () => {
    try {
      setError(null);
      const response = await api.get<Election[]>('/elections');
      console.log('API Response:', response);
      setElections(response.data);

    } catch (error: unknown) {
      console.error('Failed to fetch elections:', error);
      if (isAxiosError(error) && error.response) {
         setError(`Error ${error.response.status}: ${JSON.stringify(error.response.data)}`);
      } else if (isAxiosError(error) && error.request) {
         setError('ไม่ได้รับรหัสตอบกลับจาก Server (Network Error)');
      } else {
         setError(error instanceof Error ? error.message : 'เกิดข้อผิดพลาดในการโหลดข้อมูล');
      }
    } finally {
      setLoading(false);
    }
  };

  const fetchMyVotes = async () => {
    try {
      const response = await api.get<Vote[]>('/votes/my-votes');
      const voted = response.data.reduce((acc: Record<number, boolean>, vote) => {
        acc[vote.electionId] = true;
        return acc;
      }, {});
      setVotedMap(voted);
    } catch (error) {
      console.error('Failed to fetch my votes:', error);
    }
  };

  const handleVote = async (electionId: number, candidateId: number | null, isVoteNo: boolean) => {
    if (!confirm('ยืนยันการลงคะแนน? การลงคะแนนไม่สามารถแก้ไขได้')) return;

    setVotingMap(prev => ({ ...prev, [electionId]: true }));
    try {
      const payload: VotePayload = {
        electionId,
        candidateId,
        isVoteNo
      };
      await api.post('/votes', payload);
      setVotedMap(prev => ({ ...prev, [electionId]: true }));
      alert('ลงคะแนนสำเร็จ!');
      fetchElections();
    } catch (error) {
      const message = isAxiosError(error) ? error.response?.data?.message : 'การลงคะแนนล้มเหลว';
      alert(message);
    } finally {
      setVotingMap(prev => ({ ...prev, [electionId]: false }));
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <nav className="bg-white/10 backdrop-blur-lg border-b border-white/20 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <div className="bg-gradient-to-br from-purple-500 to-blue-600 p-2 rounded-lg">
                <BarChart3 className="w-6 h-6 text-white" />
              </div>
              <h1 className="text-xl font-bold text-white">ระบบเลือกตั้งออนไลน์</h1>
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center space-x-2 px-4 py-2 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded-lg transition"
            >
              <LogOut className="w-4 h-4" />
              <span>ออกจากระบบ</span>
            </button>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="bg-white/10 backdrop-blur-lg rounded-2xl shadow-2xl border border-white/20 p-8 mb-8">
            <div className="flex items-center space-x-4 mb-4">
              <div className="bg-gradient-to-br from-purple-500 to-blue-600 p-3 rounded-xl">
                <Users className="w-8 h-8 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white">
                  ยินดีต้อนรับ, {user?.username}!
                </h2>
                <p className="text-slate-300">
                  สิทธิ์การใช้งาน: {user?.role === 'ADMIN' ? 'ผู้ดูแลระบบ' : 'ผู้ลงคะแนน'}
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <h3 className="text-2xl font-bold text-white mb-4">🗳️ รายการเลือกตั้ง</h3>
            
            {loading ? (
              <div className="flex justify-center p-12">
                <Loader2 className="w-12 h-12 text-purple-500 animate-spin" />
              </div>
            ) : error ? (
              <div className="bg-red-500/10 border border-red-500/30 p-6 rounded-2xl text-center">
                 <p className="text-red-400 text-lg font-semibold mb-2">เกิดข้อผิดพลาด</p>
                 <p className="text-red-300 font-mono text-sm mb-4">{error}</p>
                 <button 
                   onClick={() => { setLoading(true); fetchElections(); }}
                   className="px-4 py-2 bg-red-500/20 hover:bg-red-500/30 text-red-300 rounded-lg transition"
                 >
                   ลองใหม่
                 </button>
              </div>
            ) : elections.length === 0 ? (
              <div className="bg-white/5 rounded-2xl p-8 text-center border border-white/10">
                <p className="text-slate-400">ไม่มีการเลือกตั้งในขณะนี้ (0 รายการ)</p>
              </div>
            ) : (
              elections.map((election) => (
                <VoteCard
                  key={election.id}
                  election={election}
                  onVote={handleVote}
                  hasVoted={votedMap[election.id]}
                  isVoting={votingMap[election.id]}
                />
              ))
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
};
