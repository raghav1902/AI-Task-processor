import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Eye, EyeOff, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';

export default function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const resp = await fetch('http://localhost:5000/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });
      const data = await resp.json();
      if (resp.ok) {
        localStorage.setItem('token', data.accessToken);
        localStorage.setItem('username', data.username);
        toast.success(`Welcome back, ${data.username}!`);
        navigate('/dashboard');
      } else {
        toast.error(data.message || 'Login failed');
      }
    } catch (err) {
      toast.error('Network error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md bg-gray-800 p-8 rounded-xl shadow-lg border border-gray-700">
      <h2 className="text-3xl font-bold mb-6 text-center">Log In</h2>
      <form onSubmit={handleLogin} className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">Username</label>
          <input 
            type="text" required 
            className="w-full px-4 py-2 bg-gray-900 border border-gray-700 rounded focus:outline-none focus:border-primary transition"
            value={username} onChange={e => setUsername(e.target.value)} 
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Password</label>
          <div className="relative">
            <input 
              type={showPassword ? "text" : "password"} required 
              className="w-full px-4 py-2 bg-gray-900 border border-gray-700 rounded focus:outline-none focus:border-primary transition"
              value={password} onChange={e => setPassword(e.target.value)} 
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
        <div className="flex justify-end text-sm">
          <Link to="/forgot-password" className="text-primary hover:underline">Forgot password?</Link>
        </div>
        <button 
          disabled={loading}
          className="w-full py-2 bg-primary hover:bg-blue-600 rounded font-semibold transition flex justify-center items-center"
        >
          {loading ? <Loader2 className="animate-spin" size={20} /> : 'Log In'}
        </button>
      </form>
      <div className="mt-4 text-center text-sm text-gray-400">
        Don't have an account? <Link to="/register" className="text-primary hover:underline">Sign up</Link>
      </div>
    </div>
  );
}
