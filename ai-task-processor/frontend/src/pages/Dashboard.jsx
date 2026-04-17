import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { LogOut, Plus, RefreshCw, CheckCircle, XCircle, Clock, Search, Filter, LayoutDashboard, Sparkles, Terminal, ChevronRight, Zap } from 'lucide-react';
import toast from 'react-hot-toast';

export default function Dashboard() {
  const [tasks, setTasks] = useState([]);
  const [title, setTitle] = useState('');
  const [inputText, setInputText] = useState('');
  const [operation, setOperation] = useState('uppercase');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const navigate = useNavigate();
  const username = localStorage.getItem('username');

  // --- API URL SETUP (Render Compatibility) ---
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

  useEffect(() => {
    fetchTasks();
    const interval = setInterval(fetchTasks, 3000);
    return () => clearInterval(interval);
  }, []);

  const fetchTasks = async () => {
    try {
      const resp = await fetch(`${API_BASE_URL}/tasks`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        }
      });

      if (resp.status === 401) {
        handleLogout();
        return;
      }

      const data = await resp.json();
      if (resp.ok && data.data) {
        setTasks(data.data.tasks || []);
      }
    } catch (err) {
      console.error("Fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTask = async (e) => {
    e.preventDefault();
    if (!title || !inputText) return toast.error("Please fill all fields");
    setSubmitting(true);

    try {
      const resp = await fetch(`${API_BASE_URL}/tasks`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ title, inputText, operation })
      });

      const data = await resp.json();
      if (resp.ok) {
        toast.success('Task submitted successfully');
        setTitle('');
        setInputText('');
        fetchTasks();
      } else {
        toast.error(data.message || 'Failed to create task');
      }
    } catch (err) {
      toast.error('Network Error - Check Backend Connection');
    } finally {
      setSubmitting(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('username');
    navigate('/login');
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'success': return <span className="flex items-center text-xs font-medium text-emerald-400 bg-emerald-400/10 border border-emerald-400/20 px-2.5 py-1 rounded-full shadow-[0_0_12px_rgba(52,211,153,0.1)] backdrop-blur-sm"><CheckCircle size={14} className="mr-1.5" /> Success</span>;
      case 'failed': return <span className="flex items-center text-xs font-medium text-rose-400 bg-rose-400/10 border border-rose-400/20 px-2.5 py-1 rounded-full shadow-[0_0_12px_rgba(251,113,133,0.1)] backdrop-blur-sm"><XCircle size={14} className="mr-1.5" /> Failed</span>;
      case 'running': return <span className="flex items-center text-xs font-medium text-blue-400 bg-blue-400/10 border border-blue-400/20 px-2.5 py-1 rounded-full shadow-[0_0_12px_rgba(96,165,250,0.1)] backdrop-blur-sm"><RefreshCw size={14} className="mr-1.5 animate-spin" /> Processing</span>;
      default: return <span className="flex items-center text-xs font-medium text-amber-400 bg-amber-400/10 border border-amber-400/20 px-2.5 py-1 rounded-full shadow-[0_0_12px_rgba(251,191,36,0.1)] backdrop-blur-sm"><Clock size={14} className="mr-1.5" /> Pending</span>;
    }
  };

  return (
    <div className="min-h-screen bg-[#0b0c10] text-[#c5c6c7] relative overflow-hidden font-['Outfit']">
      {/* Background Gradients */}
      <div className="fixed top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-blue-600/10 blur-[120px] pointer-events-none" />
      <div className="fixed bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-purple-600/10 blur-[120px] pointer-events-none" />

      <div className="w-full max-w-7xl px-4 sm:px-6 lg:px-8 pb-12 mx-auto pt-8 relative z-10">
        <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-10 pb-6 border-b border-white/[0.06] gap-4">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-2xl border border-white/5 backdrop-blur-md shadow-lg shadow-blue-500/5">
              <LayoutDashboard className="text-blue-400" size={28} />
            </div>
            <div>
              <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400 tracking-tight">AI Task Processor</h1>
              <p className="text-sm text-gray-500 mt-1 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.5)]"></span>
                Welcome back, <span className="font-medium text-gray-300">{username || 'User'}</span>
              </p>
            </div>
          </div>
          <button 
            onClick={handleLogout} 
            className="flex items-center text-sm font-medium text-gray-400 hover:text-rose-400 transition-all duration-300 px-5 py-2.5 rounded-xl bg-white/[0.02] hover:bg-rose-500/10 border border-white/[0.05] hover:border-rose-500/30 group shadow-sm"
          >
            <LogOut size={16} className="mr-2 group-hover:-translate-x-1 transition-transform" /> Logout
          </button>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Create Task Form */}
          <div className="lg:col-span-4">
            <div className="bg-white/[0.02] backdrop-blur-2xl p-7 rounded-3xl border border-white/[0.05] shadow-[0_8px_32px_rgba(0,0,0,0.4)] sticky top-8 group hover:border-white/[0.08] transition-all duration-500 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 rounded-bl-[100px] pointer-events-none transition-transform duration-700 group-hover:scale-110"></div>
              
              <div className="flex items-center mb-6 relative z-10">
                <div className="p-2.5 bg-blue-500/10 rounded-xl mr-3 group-hover:scale-110 transition-transform duration-300 shadow-inner">
                  <Sparkles size={18} className="text-blue-400" />
                </div>
                <h2 className="text-xl font-semibold text-white tracking-wide">New Operation</h2>
              </div>

              <form onSubmit={handleCreateTask} className="space-y-6 relative z-10">
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-gray-400/80 uppercase tracking-wider ml-1">Task Title <span className="text-rose-500">*</span></label>
                  <input
                    type="text" required
                    className="w-full px-4 py-3 bg-black/40 border border-white/[0.05] rounded-xl focus:border-blue-500/50 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all duration-300 text-gray-200 placeholder-gray-600 font-medium shadow-inner"
                    placeholder="e.g. Clean up log data"
                    value={title} onChange={e => setTitle(e.target.value)}
                  />
                </div>
                
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-gray-400/80 uppercase tracking-wider ml-1">Input Payload <span className="text-rose-500">*</span></label>
                  <div className="relative group/textarea">
                    <textarea
                      required rows="5"
                      className="w-full px-4 py-4 bg-black/40 border border-white/[0.05] rounded-xl focus:border-blue-500/50 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all duration-300 resize-none text-gray-300 placeholder-gray-600 font-mono text-sm shadow-inner"
                      placeholder="Paste your raw text or data here..."
                      value={inputText} onChange={e => setInputText(e.target.value)}
                    ></textarea>
                    <Terminal size={14} className="absolute right-3 top-3 text-gray-600 group-focus-within/textarea:text-blue-400 transition-colors duration-300" />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-semibold text-gray-400/80 uppercase tracking-wider ml-1">AI Operation <span className="text-rose-500">*</span></label>
                  <div className="relative">
                    <select
                      className="w-full px-4 py-3.5 rounded-xl bg-black/40 border border-white/[0.05] focus:border-blue-500/50 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all duration-300 text-gray-200 font-medium appearance-none cursor-pointer shadow-inner"
                      value={operation} onChange={e => setOperation(e.target.value)}
                    >
                      <option value="uppercase">Uppercase</option>
                      <option value="lowercase">Lowercase</option>
                      <option value="reverse string">Reverse String</option>
                      <option value="word count">Word Count</option>
                      <option value="base64 encode">Base64 Encode</option>
                      <option value="base64 decode">Base64 Decode</option>
                      <option value="character count">Character Count</option>
                      <option value="capitalize words">Capitalize Words</option>
                      <option value="remove whitespace">Remove Whitespace</option>
                    </select>
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
                      <ChevronRight size={16} className="text-gray-500 rotate-90" />
                    </div>
                  </div>
                </div>

                <button 
                  disabled={submitting} 
                  className="w-full mt-4 relative group/btn overflow-hidden rounded-xl font-semibold text-white shadow-[0_0_20px_rgba(59,130,246,0.2)] disabled:opacity-70 disabled:cursor-not-allowed hover:shadow-[0_0_25px_rgba(59,130,246,0.4)] transition-all duration-300"
                >
                  <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-blue-600 to-indigo-600 group-hover/btn:scale-[1.02] transition-transform duration-300"></div>
                  <div className="absolute top-0 -inset-full h-full w-1/2 z-5 block transform -skew-x-12 bg-gradient-to-r from-transparent to-white opacity-20 group-hover/btn:animate-shine"></div>
                  <div className="relative px-4 py-4 flex justify-center items-center gap-2">
                    {submitting ? (
                      <><RefreshCw size={18} className="animate-spin" /> Processing Data...</>
                    ) : (
                      <><Zap size={18} className="group-hover/btn:rotate-12 group-hover/btn:scale-110 transition-transform duration-300" /> Execute Pipeline</>
                    )}
                  </div>
                </button>
              </form>
            </div>
          </div>

          {/* Task History */}
          <div className="lg:col-span-8 flex flex-col space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white/[0.02] backdrop-blur-xl p-5 rounded-3xl border border-white/[0.05] shadow-lg relative overflow-hidden">
              <div className="absolute -top-10 -left-10 w-32 h-32 bg-purple-500/10 rounded-full blur-[40px] pointer-events-none"></div>

              <div className="flex items-center gap-3 px-2 relative z-10">
                <div className="w-1.5 h-7 rounded-full bg-gradient-to-b from-blue-400 to-purple-500 shadow-[0_0_10px_rgba(59,130,246,0.5)]"></div>
                <h2 className="text-xl font-semibold text-white tracking-wide">Execution Logs</h2>
                <span className="ml-2 px-2.5 py-1 rounded-lg bg-white/[0.05] text-xs font-semibold text-gray-300 border border-white/[0.05] shadow-inner">{tasks.length} Total</span>
              </div>
              
              <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto relative z-10">
                <div className="relative flex-[1_1_auto] sm:w-[220px] md:w-[280px] group/search">
                  <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within/search:text-blue-400 transition-colors" />
                  <input
                    type="text"
                    placeholder="Search logs by title..."
                    className="w-full bg-black/40 border border-white/[0.05] text-sm rounded-xl pl-10 pr-4 py-2.5 focus:outline-none focus:border-blue-500/50 focus:ring-4 focus:ring-blue-500/10 text-gray-200 transition-all placeholder-gray-500 placeholder:font-light shadow-inner"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
                <div className="relative group/filter flex-[1_1_auto] sm:flex-none">
                  <Filter size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within/filter:text-blue-400 transition-colors pointer-events-none" />
                  <select
                    className="w-full sm:w-auto appearance-none bg-black/40 border border-white/[0.05] text-sm rounded-xl pl-9 pr-10 py-2.5 focus:outline-none focus:border-blue-500/50 focus:ring-4 focus:ring-blue-500/10 text-gray-200 transition-all cursor-pointer font-medium shadow-inner"
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                  >
                    <option value="all">All Status</option>
                    <option value="success">Success</option>
                    <option value="pending">Pending</option>
                    <option value="running">Running</option>
                    <option value="failed">Failed</option>
                  </select>
                  <ChevronRight size={14} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-500 rotate-90 pointer-events-none" />
                </div>
              </div>
            </div>

            <div className="space-y-5">
              {loading ? (
                <div className="flex flex-col items-center justify-center py-24 text-gray-500 space-y-4">
                  <div className="p-4 bg-white/[0.02] rounded-2xl shadow-inner border border-white/[0.02]">
                    <RefreshCw size={28} className="animate-spin text-blue-500/70" />
                  </div>
                  <p className="text-sm font-medium tracking-wide animate-pulse mt-2 text-gray-400">Syncing with worker nodes...</p>
                </div>
              ) : tasks.length === 0 ? (
                <div className="flex flex-col items-center justify-center p-20 rounded-3xl border border-dashed border-gray-700/50 bg-white/[0.01] text-center relative overflow-hidden group/empty hover:bg-white/[0.02] hover:border-gray-600/50 transition-all duration-700">
                  <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(59,130,246,0.06)_0%,transparent_70%)] opacity-0 group-hover/empty:opacity-100 transition-opacity duration-1000"></div>
                  <div className="w-20 h-20 mb-6 rounded-3xl bg-black/40 flex items-center justify-center border border-white/[0.05] shadow-inner group-hover/empty:scale-110 transition-transform duration-700 relative z-10 group-hover/empty:shadow-[0_0_30px_rgba(59,130,246,0.15)]">
                    <Terminal size={28} className="text-gray-500 group-hover/empty:text-blue-400 transition-colors duration-500" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-300 mb-2 relative z-10">No execution logs</h3>
                  <p className="text-sm text-gray-500 max-w-sm relative z-10">Your workflow engine is waiting. Trigger a new operation from the command panel.</p>
                </div>
              ) : (
                tasks
                  .filter(t => filterStatus === 'all' || t.status === filterStatus)
                  .filter(t => t.title.toLowerCase().includes(searchQuery.toLowerCase()))
                  .map((task, index) => (
                    <div 
                      key={task._id} 
                      className="bg-white/[0.02] rounded-3xl border border-white/[0.05] p-6 shadow-xl backdrop-blur-sm transition-all duration-300 hover:border-white/[0.1] hover:bg-white/[0.03] hover:shadow-[0_8px_30px_rgba(0,0,0,0.5)] group/card"
                      style={{ animationDelay: `${index * 50}ms`, animationFillMode: 'both' }}
                    >
                      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-5 pb-5 border-b border-white/[0.05]">
                        <div>
                          <div className="flex items-center gap-3">
                            <h3 className="font-semibold text-lg text-white group-hover/card:text-blue-100 transition-colors">
                              {task.title}
                            </h3>
                            <span className="flex items-center gap-1.5 text-[10px] font-bold text-blue-300/80 uppercase tracking-widest bg-blue-500/10 px-2.5 py-1 rounded-md border border-blue-500/20">
                              <Zap size={10} /> {task.operation}
                            </span>
                          </div>
                          <p className="text-xs text-gray-500 mt-2 font-medium flex items-center gap-1.5">
                            <Clock size={12} className="text-gray-600" />
                            {new Date(task.createdAt).toLocaleString(undefined, {
                              year: 'numeric', month: 'short', day: 'numeric', 
                              hour: '2-digit', minute:'2-digit', second:'2-digit'
                            })}
                          </p>
                        </div>
                        <div className="self-start sm:self-auto">
                          {getStatusBadge(task.status)}
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 relative">
                        <div className="absolute left-1/2 top-4 bottom-4 w-px bg-white/[0.05] hidden md:block"></div>
                        
                        <div className="group/io">
                          <p className="text-[11px] font-bold text-gray-500 mb-2.5 uppercase tracking-widest flex items-center gap-2">
                            <span className="w-1.5 h-1.5 rounded-full bg-gray-600 group-hover/io:bg-blue-400 transition-colors"></span>
                            Raw Input
                          </p>
                          <div className="text-sm bg-black/40 p-4 rounded-2xl border border-white/[0.05] text-gray-300 break-words font-mono shadow-inner leading-relaxed group-hover/io:border-white/[0.08] transition-colors relative overflow-hidden">
                            <div className="absolute top-0 right-0 p-2 opacity-0 group-hover/io:opacity-100 transition-opacity">
                               <Terminal size={12} className="text-gray-600" />
                            </div>
                            {task.inputText}
                          </div>
                        </div>
                        
                        <div className="group/io">
                          <p className="text-[11px] font-bold text-gray-500 mb-2.5 uppercase tracking-widest flex items-center gap-2">
                            <span className="w-1.5 h-1.5 rounded-full bg-gray-600 group-hover/io:bg-purple-400 transition-colors"></span>
                            Processor Output
                          </p>
                          <div className={`text-sm bg-black/40 p-4 rounded-2xl border border-white/[0.05] text-gray-300 break-words font-mono shadow-inner leading-relaxed min-h-[46px] group-hover/io:border-white/[0.08] transition-colors relative overflow-hidden ${task.status === 'failed' ? 'text-rose-300/80' : ''}`}>
                            {task.result ? (
                               task.result
                            ) : (
                              <div className="flex items-center gap-2 text-gray-500 italic">
                                {task.status === 'failed' ? (
                                  <span className="text-rose-400/70">Execution aborted.</span>
                                ) : (
                                  <><span className="w-1 h-1 rounded-full bg-blue-500 animate-bounce"></span><span className="w-1 h-1 rounded-full bg-blue-500 animate-bounce" style={{animationDelay: '0.1s'}}></span><span className="w-1 h-1 rounded-full bg-blue-500 animate-bounce" style={{animationDelay: '0.2s'}}></span> computing result...</>
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
              )}
            </div>
          </div>
        </div>
      </div>
      
      {/* Add global tailwind utilities for custom animations we need */}
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes shine {
          100% { left: 125%; }
        }
        .animate-shine {
          animation: shine 1.5s ease-out infinite;
        }
      `}} />
    </div>
  );
}