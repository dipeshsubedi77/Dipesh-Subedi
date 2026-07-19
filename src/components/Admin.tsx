import React, { useState, useEffect } from 'react';
import { ArrowLeft, Loader2, Save, Trash2, Plus } from 'lucide-react';

interface AdminProps {
  onBack: () => void;
  profile: any;
  onUpdateProfile: (updated: any) => void;
}

const Admin: React.FC<AdminProps> = ({ onBack, profile, onUpdateProfile }) => {
  const [password, setPassword] = useState('');
  const [token, setToken] = useState<string | null>(null);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async () => {
    setIsLoading(true);
    setError('');
    try {
      const response = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      });
      const data = await response.json();
      if (response.ok) {
        setToken(data.token);
      } else {
        setError(data.error || 'Login failed');
      }
    } catch (e) {
      console.error("Login fetch error:", e);
      setError('An error occurred during login');
    }
    setIsLoading(false);
  };

  if (!token) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-6">
        <h2 className="text-2xl font-bold mb-4">Admin Login</h2>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Enter Admin Password"
          className="p-2 border rounded mb-4 w-64"
        />
        <button
          onClick={handleLogin}
          disabled={isLoading}
          className="px-4 py-2 bg-neutral-900 text-white rounded hover:bg-neutral-800"
        >
          {isLoading ? <Loader2 className="animate-spin" /> : 'Login'}
        </button>
        {error && <p className="text-red-500 mt-2">{error}</p>}
      </div>
    );
  }

  return (
    <div className="p-6">
      <button onClick={onBack} className="flex items-center gap-2 text-neutral-500 mb-6">
        <ArrowLeft size={16} /> Back to Home
      </button>
      <h1 className="text-3xl font-bold mb-6">Admin Panel</h1>
      <p>Welcome to the admin panel. You are logged in.</p>
      {/* Add profile/project management UI here */}
      <div className="mt-6 p-4 border rounded">
        <h3 className="font-bold">Profile Management (Placeholder)</h3>
        <p>Currently logged in with token.</p>
      </div>
    </div>
  );
};

export default Admin;
