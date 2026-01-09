import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { LogOut, LayoutDashboard, RefreshCcw, Vote, Users } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import api from '../api/client';
import { StatsChart } from '../components/StatsChart';
import { isAxiosError } from 'axios';
import type { Election, ElectionStats } from '../types';

export const AdminDashboardPage = () => {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState<ElectionStats[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Create Election Form State
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newElection, setNewElection] = useState({
    title: '',
    startDate: '',
    endDate: '',
    candidates: [{ name: '', policy: '', image: '' }, { name: '', policy: '', image: '' }], // Init with 2
  });

  useEffect(() => {
    fetchStats();
    // Auto-refresh every 10 seconds for real-time feel
    const interval = setInterval(fetchStats, 10000);
    return () => clearInterval(interval);
  }, []);


  const fetchStats = async () => {
    try {
      // 1. Fetch all elections
      const electionsRes = await api.get<Election[]>('/elections');
      const elections = electionsRes.data;

      // 2. Fetch stats for each election
      const statsPromises = elections.map(async (election) => {
        const title = election.title; // Keep title from list
        try {
          // Backend might require specific endpoint for stats, assuming /stats/:id
          const statsRes = await api.get(`/stats/${election.id}`);
          // Backend returns { electionTitle, totalVotes, voteNoCount, candidateStats }
          return { 
             ...statsRes.data, 
             title, 
             id: election.id, 
             status: election.status,
             startDate: election.startDate,
             endDate: election.endDate
          };
        } catch (err) {
          console.error(`Failed to fetch stats for election ${election.id}`, err);
          return null;
        }
      });

      const results = await Promise.all(statsPromises);
      setStats(results.filter(Boolean) as ElectionStats[]);
    } catch (error) {
      console.error('Failed to fetch admin stats', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if(!window.confirm('คุณแน่ใจหรือไม่ที่จะลบการเลือกตั้งนี้? ข้อมูลทั้งหมดจะหายไป')) return;
    try {
      await api.delete(`/elections/${id}`);
      fetchStats();
    } catch (error) {
      const message = isAxiosError(error) ? error.response?.data?.message : 'Unknown error';
      alert('ลบไม่สำเร็จ: ' + message);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/elections', newElection);
      setShowCreateModal(false);
      setNewElection({
        title: '',
        startDate: '',
        endDate: '',
        candidates: [{ name: '', policy: '', image: '' }, { name: '', policy: '', image: '' }],
      });
      fetchStats();
    } catch (error) {
      const message = isAxiosError(error) ? error.response?.data?.message : 'Unknown error';
      alert('สร้างไม่สำเร็จ: ' + message);
    }
  }

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const addCandidateField = () => {
    setNewElection(prev => ({
      ...prev,
      candidates: [...prev.candidates, { name: '', policy: '', image: '' }]
    }));
  }

  const updateCandidate = (index: number, field: string, value: string) => {
    const updated = [...newElection.candidates];
    updated[index] = { ...updated[index], [field]: value };
    setNewElection(prev => ({ ...prev, candidates: updated }));
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 pb-20">
      {/* Navigation */}
      <nav className="bg-white/10 backdrop-blur-lg border-b border-white/20 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <div className="bg-gradient-to-br from-purple-500 to-blue-600 p-2 rounded-lg">
                <LayoutDashboard className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-white">ผู้ดูแลระบบ</h1>
                <p className="text-xs text-slate-400">Admin Dashboard</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
               <button 
                onClick={() => fetchStats()}
                className="p-2 text-slate-400 hover:text-white transition"
                title="Refresh Data"
               >
                 <RefreshCcw className="w-5 h-5" />
               </button>
               <button
                onClick={() => setShowCreateModal(true)}
                className="flex items-center space-x-2 px-4 py-2 bg-green-500/80 hover:bg-green-600 text-white rounded-lg transition shadow-lg shadow-green-500/20"
              >
                <span>+ สร้างการเลือกตั้ง</span>
              </button>
              <button
                onClick={handleLogout}
                className="flex items-center space-x-2 px-4 py-2 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded-lg transition"
              >
                <LogOut className="w-4 h-4" />
                <span>ออกจากระบบ</span>
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
          </div>
        ) : (
          <motion.div
             initial={{ opacity: 0, y: 20 }}
             animate={{ opacity: 1, y: 0 }}
             transition={{ duration: 0.5 }}
          >
          <div className="flex items-center justify-between mb-8">
             <h2 className="text-2xl font-bold text-white">ภาพรวมการเลือกตั้ง</h2>
             <span className="text-slate-400 text-sm">ข้อมูลอัปเดตอัตโนมัติทุก 10 วินาที</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
             {/* Summary Cards (Aggregate) */}
             <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20">
                <div className="flex justify-between items-start mb-4">
                  <div className="bg-blue-500/20 p-3 rounded-lg">
                    <Vote className="w-6 h-6 text-blue-400" />
                  </div>
                </div>
                <h3 className="text-slate-400 text-sm font-medium">การเลือกตั้งทั้งหมด</h3>
                <p className="text-3xl font-bold text-white mt-2">{stats.length}</p>
             </div>
             
             <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20">
                <div className="flex justify-between items-start mb-4">
                  <div className="bg-green-500/20 p-3 rounded-lg">
                    <Users className="w-6 h-6 text-green-400" />
                  </div>
                </div>
                <h3 className="text-slate-400 text-sm font-medium">จำนวนผู้มาใช้สิทธิ์รวม</h3>
                <p className="text-3xl font-bold text-white mt-2">
                  {stats.reduce((sum, s) => sum + s.totalVotes, 0)}
                </p>
             </div>
          </div>

          {/* Detailed Charts per Election */}
          {stats.map((electionStats) => {
             // Prepare Data for Chart
             const chartData = [
                ...electionStats.candidateStats.map((c, i) => ({
                   name: c.name,
                   value: Number(c.votes),
                   color: ['#8884d8', '#82ca9d', '#ffc658', '#0088FE'][i % 4]
                })),
                { name: 'ไม่ประสงค์ลงคะแนน', value: Number(electionStats.voteNoCount), color: '#ef4444' }
             ];

             return (
               <div key={electionStats.id} className="relative bg-white/5 rounded-3xl p-8 border border-white/10 mb-8 group">
                 {/* Delete Button */}
                 <button 
                    onClick={() => handleDelete(electionStats.id)}
                    className="absolute top-4 right-4 p-2 bg-red-500/20 text-red-400 rounded-lg opacity-0 group-hover:opacity-100 transition hover:bg-red-500 hover:text-white"
                 >
                    ลบ
                 </button>

                 <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
                    <div>
                      <h3 className="text-xl font-bold text-white mb-2">{electionStats.title}</h3>
                      <div className="flex items-center space-x-4 text-sm">
                         <span className="text-slate-400">สถานะ: <span className="text-green-400">{electionStats.status}</span></span>
                         <span className="text-slate-400">ผู้มาใช้สิทธิ์: <span className="text-white font-bold">{electionStats.totalVotes}</span></span>
                         {electionStats.endDate && <span className="text-slate-500 text-xs">(จบ: {new Date(electionStats.endDate).toLocaleString()})</span>}
                      </div>
                    </div>
                 </div>

                 <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    <div className="bg-slate-900/50 rounded-2xl p-4">
                       <h4 className="text-white text-sm font-semibold mb-4 text-center">ผลคะแนน (กราฟแท่ง)</h4>
                       <StatsChart data={chartData} type="bar" />
                    </div>
                    <div className="bg-slate-900/50 rounded-2xl p-4">
                       <h4 className="text-white text-sm font-semibold mb-4 text-center">สัดส่วนคะแนน (Chart Pie)</h4>
                       <StatsChart data={chartData} type="pie" />
                    </div>
                 </div>
               </div>
             );
          })}

          </motion.div>
        )}
      </div>

      {/* Create Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
           <motion.div 
             initial={{ opacity: 0, scale: 0.9 }}
             animate={{ opacity: 1, scale: 1 }}
             className="bg-slate-900 border border-white/20 rounded-2xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto"
           >
              <h2 className="text-2xl font-bold text-white mb-6">สร้างการเลือกตั้งใหม่</h2>
              <form onSubmit={handleCreate} className="space-y-6">
                 <div>
                    <label className="block text-slate-400 mb-2">หัวข้อการเลือกตั้ง</label>
                    <input 
                      required
                      value={newElection.title}
                      onChange={e => setNewElection({...newElection, title: e.target.value})}
                      className="w-full bg-slate-800 border border-slate-700 rounded-lg p-3 text-white"
                      placeholder="เช่น เลือกประธานรุ่น 65"
                    />
                 </div>
                 <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-slate-400 mb-2">วันเริ่มโหวต</label>
                      <input 
                        type="datetime-local"
                        className="w-full bg-slate-800 border border-slate-700 rounded-lg p-3 text-white"
                        onChange={e => setNewElection({...newElection, startDate: e.target.value})}
                      />
                    </div>
                    <div>
                      <label className="block text-slate-400 mb-2">วันปิดโหวต</label>
                      <input 
                        type="datetime-local"
                        className="w-full bg-slate-800 border border-slate-700 rounded-lg p-3 text-white"
                        onChange={e => setNewElection({...newElection, endDate: e.target.value})}
                      />
                    </div>
                 </div>

                 <div>
                    <div className="flex justify-between items-center mb-4">
                       <label className="block text-slate-400">ผู้สมัคร (Candidates)</label>
                       <button type="button" onClick={addCandidateField} className="text-sm text-green-400 hover:text-green-300">+ เพิ่มผู้สมัคร</button>
                    </div>
                    <div className="space-y-4">
                       {newElection.candidates.map((c, i) => (
                          <div key={i} className="p-4 bg-slate-800/50 rounded-lg border border-slate-700">
                             <div className="flex justify-between mb-2">
                                <span className="text-sm text-slate-500">ผู้สมัครคนที่ {i+1}</span>
                             </div>
                             <div className="grid grid-cols-1 gap-3">
                                <input 
                                   placeholder="ชื่อ-นามสกุล"
                                   value={c.name}
                                   onChange={e => updateCandidate(i, 'name', e.target.value)}
                                   className="w-full bg-slate-900 border border-slate-700 rounded p-2 text-white text-sm"
                                   required
                                />
                                <input 
                                   placeholder="นโยบาย (สั้นๆ)"
                                   value={c.policy}
                                   onChange={e => updateCandidate(i, 'policy', e.target.value)}
                                   className="w-full bg-slate-900 border border-slate-700 rounded p-2 text-white text-sm"
                                />
                                <input 
                                   placeholder="URL รูปภาพ (Optional)"
                                   value={c.image}
                                   onChange={e => updateCandidate(i, 'image', e.target.value)}
                                   className="w-full bg-slate-900 border border-slate-700 rounded p-2 text-white text-sm"
                                />
                             </div>
                          </div>
                       ))}
                    </div>
                 </div>

                 <div className="flex space-x-3 pt-4">
                    <button 
                      type="button"
                      onClick={() => setShowCreateModal(false)}
                      className="flex-1 bg-slate-700 hover:bg-slate-600 text-white py-3 rounded-lg transition"
                    >
                      ยกเลิก
                    </button>
                    <button 
                      type="submit"
                      className="flex-1 bg-green-600 hover:bg-green-500 text-white py-3 rounded-lg transition font-bold"
                    >
                      สร้างการเลือกตั้ง
                    </button>
                 </div>
              </form>
           </motion.div>
        </div>
      )}

    </div>
  );
};
