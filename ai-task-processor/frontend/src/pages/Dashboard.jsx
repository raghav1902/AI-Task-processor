import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { LogOut, Plus, RefreshCw, CheckCircle, XCircle, Clock } from 'lucide-react';
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
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:10000/api';

  // Load tasks on mount and poll every 3 seconds
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
      case 'success': return <span className="flex items-center text-xs font-semibold text-green-400 bg-green-900/40 px-2 py-1 rounded"><CheckCircle size={14} className="mr-1" /> Success</span>;
      case 'failed': return <span className="flex items-center text-xs font-semibold text-red-400 bg-red-900/40 px-2 py-1 rounded"><XCircle size={14} className="mr-1" /> Failed</span>;
      case 'running': return <span className="flex items-center text-xs font-semibold text-blue-400 bg-blue-900/40 px-2 py-1 rounded"><RefreshCw size={14} className="mr-1 animate-spin" /> Running</span>;
      default: return <span className="flex items-center text-xs font-semibold text-yellow-400 bg-yellow-900/40 px-2 py-1 rounded"><Clock size={14} className="mr-1" /> Pending</span>;
    }
  };

  return (
    <div className="w-full max-w-5xl px-4 pb-12 mx-auto mt-10 text-white">
      <header className="flex justify-between items-center mb-8 border-b border-gray-800 pb-4">
        <div>
          <h1 className="text-3xl font-bold">Venture Builders Platform</h1>
          <p className="text-gray-400">Welcome, {username || 'User'}</p>
        </div>
        <button onClick={handleLogout} className="flex items-center text-gray-400 hover:text-white transition px-4 py-2 border border-gray-700 rounded bg-gray-800 hover:bg-gray-700">
          <LogOut size={18} className="mr-2" /> Logout
        </button>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-1">
          <div className="bg-gray-800 p-6 rounded-xl border border-gray-700 shadow-lg sticky top-6">
            <h2 className="text-xl font-bold mb-4 flex items-center text-blue-400"><Plus size={20} className="mr-2" /> New Task</h2>
            <form onSubmit={handleCreateTask} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1 text-gray-300">Task Title</label>
                <input
                  type="text" required
                  className="w-full px-3 py-2 bg-gray-900 border border-gray-700 rounded focus:border-blue-500 focus:outline-none transition"
                  value={title} onChange={e => setTitle(e.target.value)}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1 text-gray-300">Payload</label>
                <textarea
                  required rows="4"
                  className="w-full px-3 py-2 bg-gray-900 border border-gray-700 rounded focus:border-blue-500 focus:outline-none transition resize-none"
                  value={inputText} onChange={e => setInputText(e.target.value)}
                ></textarea>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1 text-gray-300">Operation</label>
                <select
                  className="w-full px-3 py-2 bg-gray-900 border border-gray-700 rounded focus:border-blue-500 focus:outline-none transition text-white"
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
              </div>
              <button disabled={submitting} className="w-full bg-blue-600 hover:bg-blue-500 font-semibold py-2 rounded transition flex justify-center items-center">
                {submitting ? <RefreshCw size={20} className="animate-spin" /> : 'Run Operation'}
              </button>
            </form>
          </div>
        </div>

        <div className="md:col-span-2 space-y-4">
          <div className="flex justify-between items-center border-b border-gray-800 pb-2 mb-4">
            <h2 className="text-xl font-bold text-gray-300">Task History</h2>
            <div className="flex space-x-2">
              <input
                type="text"
                placeholder="Search tasks..."
                className="bg-gray-900 border border-gray-700 text-sm rounded px-3 py-1 focus:outline-none focus:border-blue-500 text-gray-300 transition"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <select
                className="bg-gray-900 border border-gray-700 text-sm rounded px-3 py-1 focus:outline-none focus:border-blue-500 text-gray-300 transition"
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
              >
                <option value="all">All Status</option>
                <option value="success">Success</option>
                <option value="pending">Pending</option>
                <option value="running">Running</option>
                <option value="failed">Failed</option>
              </select>
            </div>
          </div>

          {loading ? (
            <div className="text-center py-10">Loading tasks...</div>
          ) : tasks.length === 0 ? (
            <div className="bg-gray-800 p-12 rounded-xl border border-gray-700 text-center text-gray-500">
              No tasks found. Create one to get started!
            </div>
          ) : (
            tasks
              .filter(t => filterStatus === 'all' || t.status === filterStatus)
              .filter(t => t.title.toLowerCase().includes(searchQuery.toLowerCase()))
              .map(task => (
                <div key={task._id} className="bg-gray-800 rounded-xl border border-gray-700 p-5 shadow-sm transition hover:border-gray-600">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h3 className="font-bold text-lg text-white">
                        {task.title}
                        <span className="text-xs font-normal text-gray-400 bg-gray-700 px-2 py-0.5 rounded ml-2">{task.operation}</span>
                      </h3>
                      <p className="text-xs text-gray-500 mt-1">{new Date(task.createdAt).toLocaleString()}</p>
                    </div>
                    {getStatusBadge(task.status)}
                  </div>

                  <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-xs font-semibold text-gray-400 mb-1 uppercase">Input</p>
                      <div className="text-sm bg-gray-900 p-3 rounded border border-gray-800 text-gray-300 break-words font-mono">
                        {task.inputText}
                      </div>
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-gray-400 mb-1 uppercase">Output</p>
                      <div className="text-sm bg-gray-900 p-3 rounded border border-gray-800 text-gray-300 break-words font-mono min-h-[46px]">
                        {task.result || <span className="text-gray-600 italic">processing...</span>}
                      </div>
                    </div>
                  </div>
                </div>
              ))
          )}
        </div>
      </div>
    </div>
  );
}