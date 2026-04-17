import React, { useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { Eye, EyeOff, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';

export default function ResetPassword() {
  const { token } = useParams();
  const [newPassword, setNewPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleReset = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const resp = await fetch('http://localhost:5000/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, newPassword })
      });
      const data = await resp.json();
      if (resp.ok) {
        toast.success('Password completely reset!');
        navigate('/login');
      } else {
        toast.error(data.message || 'Operation failed');
      }
    } catch (err) {
      toast.error('Network error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md bg-gray-800 p-8 rounded-xl shadow-lg border border-gray-700">
      <h2 className="text-2xl font-bold mb-4 text-center">Reset Password</h2>
      <form onSubmit={handleReset} className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">New Password</label>
          <div className="relative">
            <input 
              type={showPassword ? "text" : "password"} required minLength="6"
              className="w-full px-4 py-2 bg-gray-900 border border-gray-700 rounded focus:outline-none focus:border-primary transition"
              value={newPassword} onChange={e => setNewPassword(e.target.value)} 
            />
            <button 
              type="button" 
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-2.5 text-gray-400 hover:text-white"
            >
              {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          </div>
        </div>
        <button 
          disabled={loading}
          className="w-full py-2 mt-4 bg-primary hover:bg-blue-600 rounded font-semibold transition flex justify-center items-center"
        >
          {loading ? <Loader2 className="animate-spin" size={20} /> : 'Save New Password'}
        </button>
      </form>
    </div>
  );
}
