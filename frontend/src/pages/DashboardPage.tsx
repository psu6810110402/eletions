import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { LogOut, Users, BarChart3, Loader2, AlertTriangle, X, Plus, Edit2, Trash2, Download } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import api from '../api/client';
import { isAxiosError } from 'axios';
import type { Election, VotePayload, Vote } from '../types';
import { VoteCard } from '../components/VoteCard';

interface PendingVote {
  electionId: number;
  candidateId: number | null;
  isVoteNo: boolean;
}

export const DashboardPage = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [elections, setElections] = useState<Election[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [votingMap, setVotingMap] = useState<Record<number, boolean>>({});
  const [votedMap, setVotedMap] = useState<Record<number, boolean>>({});
  const [confirmDialog, setConfirmDialog] = useState<PendingVote | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<number | null>(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    fetchElections();
    fetchMyVotes();
  }, []);


  // Load Elections
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
  // load Vote History USER
  const fetchMyVotes = async () => {
    try {
      const response = await api.get<Vote[]>('/votes/my-votes');
      // Create Map of voted elections
      const voted = response.data.reduce((acc: Record<number, boolean>, vote) => {
        acc[vote.electionId] = true;
        return acc;
      }, {});
      setVotedMap(voted);
    } catch (error) {
      console.error('Failed to fetch my votes:', error);
    }
  };

  const handleVote = (electionId: number, candidateId: number | null, isVoteNo: boolean) => {
    // Show confirmation dialog instead of using native confirm()
    setConfirmDialog({ electionId, candidateId, isVoteNo });
  };

  const confirmVote = async () => {
    if (!confirmDialog) return;
    
    const { electionId, candidateId, isVoteNo } = confirmDialog;
    setConfirmDialog(null);
    
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

  // Admin Functions
  const handleCreateElection = () => {
    const title = prompt('กรุณากรอกชื่อการเลือกตั้ง:');
    if (title) {
      api.post('/elections', { title, status: 'DRAFT' })
        .then(() => {
          alert('สร้างการเลือกตั้งสำเร็จ!');
          fetchElections();
        })
        .catch((err) => {
          alert('เกิดข้อผิดพลาด: ' + (err.response?.data?.message || err.message));
        });
    }
  };

  const handleEditElection = (electionId: number, currentTitle: string) => {
    const newTitle = prompt('แก้ไขชื่อการเลือกตั้ง:', currentTitle);
    if (newTitle && newTitle !== currentTitle) {
      api.patch(`/elections/${electionId}`, { title: newTitle })
        .then(() => {
          alert('แก้ไขสำเร็จ!');
          fetchElections();
        })
        .catch((err) => {
          alert('เกิดข้อผิดพลาด: ' + (err.response?.data?.message || err.message));
        });
    }
  };

  const handleDeleteElection = async () => {
    if (!deleteConfirm) return;
    setDeleting(true);
    try {
      await api.delete(`/elections/${deleteConfirm}`);
      alert('ลบการเลือกตั้งสำเร็จ!');
      fetchElections();
    } catch (err) {
      const message = isAxiosError(err) ? err.response?.data?.message : 'การลบล้มเหลว';
      alert(message);
    } finally {
      setDeleting(false);
      setDeleteConfirm(null);
    }
  };

  const handleExportCSV = async (electionId: number) => {
    try {
      const response = await api.get(`/stats/${electionId}/export`, {
        responseType: 'blob'
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `election-${electionId}-results.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      const message = isAxiosError(err) ? err.response?.data?.message : 'การส่งออกล้มเหลว';
      alert(message);
    }
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
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-2xl font-bold text-white">🗳️ รายการเลือกตั้ง</h3>
              {user?.role === 'ADMIN' && (
                <button
                  onClick={handleCreateElection}
                  className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white rounded-lg transition font-semibold"
                >
                  <Plus className="w-4 h-4" />
                  <span>สร้างการเลือกตั้ง</span>
                </button>
              )}
            </div>
            
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
                <div key={election.id} className="relative">
                  {/* Admin Controls */}
                  {user?.role === 'ADMIN' && (
                    <div className="absolute top-4 right-4 flex space-x-2 z-10">
                      <button
                        onClick={() => handleEditElection(election.id, election.title)}
                        className="p-2 bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 rounded-lg transition"
                        title="แก้ไข"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => setDeleteConfirm(election.id)}
                        className="p-2 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded-lg transition"
                        title="ลบ"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleExportCSV(election.id)}
                        className="p-2 bg-green-500/20 hover:bg-green-500/30 text-green-400 rounded-lg transition"
                        title="ส่งออก CSV"
                      >
                        <Download className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                  <VoteCard
                    election={election}
                    onVote={handleVote}
                    hasVoted={votedMap[election.id]}
                    isVoting={votingMap[election.id]}
                  />
                </div>
              ))
            )}
          </div>
        </motion.div>
      </div>

      {/* Confirmation Dialog */}
      {confirmDialog && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-slate-800 border border-white/20 rounded-2xl p-6 max-w-md mx-4 shadow-2xl"
          >
            <div className="flex items-center space-x-3 mb-4">
              <div className="bg-yellow-500/20 p-3 rounded-full">
                <AlertTriangle className="w-6 h-6 text-yellow-400" />
              </div>
              <h3 className="text-xl font-bold text-white">ยืนยันการลงคะแนน</h3>
            </div>
            <p className="text-slate-300 mb-6">
              {confirmDialog.isVoteNo 
                ? 'คุณต้องการไม่ประสงค์ลงคะแนนใช่หรือไม่?' 
                : 'คุณต้องการลงคะแนนให้ผู้สมัครนี้ใช่หรือไม่?'}
              <br />
              <span className="text-yellow-400 text-sm mt-2 block">
                ⚠️ การลงคะแนนไม่สามารถแก้ไขได้
              </span>
            </p>
            <div className="flex space-x-3">
              <button
                onClick={() => setConfirmDialog(null)}
                className="flex-1 px-4 py-3 bg-slate-700 hover:bg-slate-600 text-white rounded-xl transition flex items-center justify-center space-x-2"
              >
                <X className="w-4 h-4" />
                <span>ยกเลิก</span>
              </button>
              <button
                onClick={confirmVote}
                className="flex-1 px-4 py-3 bg-gradient-to-r from-purple-500 to-blue-600 hover:from-purple-600 hover:to-blue-700 text-white rounded-xl transition font-semibold"
              >
                ✓ ยืนยัน
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      {deleteConfirm && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-slate-800 border border-white/20 rounded-2xl p-6 max-w-md mx-4 shadow-2xl"
          >
            <div className="flex items-center space-x-3 mb-4">
              <div className="bg-red-500/20 p-3 rounded-full">
                <Trash2 className="w-6 h-6 text-red-400" />
              </div>
              <h3 className="text-xl font-bold text-white">ยืนยันการลบ</h3>
            </div>
            <p className="text-slate-300 mb-6">
              คุณต้องการลบการเลือกตั้งนี้ใช่หรือไม่?
              <br />
              <span className="text-red-400 text-sm mt-2 block">
                ⚠️ การลบไม่สามารถกู้คืนได้
              </span>
            </p>
            <div className="flex space-x-3">
              <button
                onClick={() => setDeleteConfirm(null)}
                disabled={deleting}
                className="flex-1 px-4 py-3 bg-slate-700 hover:bg-slate-600 text-white rounded-xl transition flex items-center justify-center space-x-2"
              >
                <X className="w-4 h-4" />
                <span>ยกเลิก</span>
              </button>
              <button
                onClick={handleDeleteElection}
                disabled={deleting}
                className="flex-1 px-4 py-3 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white rounded-xl transition font-semibold flex items-center justify-center space-x-2"
              >
                {deleting ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Trash2 className="w-4 h-4" />
                )}
                <span>{deleting ? 'กำลังลบ...' : 'ลบ'}</span>
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};
