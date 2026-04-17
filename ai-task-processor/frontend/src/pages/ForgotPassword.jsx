import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';

export default function ForgotPassword() {
  const [username, setUsername] = useState('');
  const [loading, setLoading] = useState(false);
  const [resetToken, setResetToken] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const resp = await fetch('http://localhost:5000/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username })
      });
      const data = await resp.json();
      if (resp.ok) {
        toast.success('Reset link generated!');
        // Mocking email receipt by displaying token directly here for testing
        setResetToken(data.resetToken);
      } else {
        toast.error(data.message || 'Verification failed');
      }
    } catch (err) {
      toast.error('Network error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md bg-gray-800 p-8 rounded-xl shadow-lg border border-gray-700">
      <h2 className="text-2xl font-bold mb-4 text-center">Forgot Password</h2>
      
      {!resetToken ? (
        <form onSubmit={handleSubmit} className="space-y-4">
          <p className="text-sm text-gray-400 mb-4 text-center">
            Enter your username and we will generate a secure reset link.
          </p>
          <div>
            <label className="block text-sm font-medium mb-1">Username</label>
            <input 
              type="text" required 
              className="w-full px-4 py-2 bg-gray-900 border border-gray-700 rounded focus:outline-none focus:border-primary transition"
              value={username} onChange={e => setUsername(e.target.value)} 
            />
          </div>
          <button 
            disabled={loading}
            className="w-full py-2 mt-4 bg-primary hover:bg-blue-600 rounded font-semibold transition flex justify-center items-center"
          >
            {loading ? <Loader2 className="animate-spin" size={20} /> : 'Send Reset Link'}
          </button>
        </form>
      ) : (
        <div className="text-center space-y-4">
          <div className="p-4 bg-gray-900 border border-gray-700 rounded text-sm break-all font-mono text-gray-300">
            {resetToken}
          </div>
          <p className="text-xs text-yellow-500 font-semibold">
            [MOCK EMAIL]: Please copy the securely generated token above.
          </p>
          <Link to={`/reset-password/${resetToken}`}>
            <button className="w-full py-2 bg-success hover:bg-green-600 rounded font-semibold transition mt-4">
              Proceed to Reset Password
            </button>
          </Link>
        </div>
      )}

      <div className="mt-6 text-center text-sm text-gray-400">
        Remembered your password? <Link to="/login" className="text-primary hover:underline">Log in</Link>
      </div>
    </div>
  );
}
