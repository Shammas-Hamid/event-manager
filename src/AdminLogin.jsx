import React, { useState } from 'react';
import { db } from './firebaseConfig'; // Adjust path if firebase.js is in another folder
import { collection, query, where, getDocs } from 'firebase/firestore';

export default function AdminLogin({ onLogin }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!username || !password) {
      setError('Please enter both username and password.');
      return;
    }

    setLoading(true);

    try {
      // Query the 'admins' collection in Firestore
      const adminsRef = collection(db, 'admins');
      const q = query(
        adminsRef,
        where('username', '==', username.trim()),
        where('password', '==', password)
      );

      const querySnapshot = await getDocs(q);

      if (!querySnapshot.empty) {
        const adminData = querySnapshot.docs[0].data();
        if (onLogin) {
          onLogin({ username: adminData.username, role: adminData.role || 'admin' });
        }
      } else {
        setError('Invalid username or password.');
      }
    } catch (err) {
      console.error('Firebase Auth Error:', err);
      setError('Could not connect to database. Please check your network or Firebase config.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-900 p-4 text-white">
      <div className="w-full max-w-md rounded-xl bg-slate-800/90 p-8 shadow-2xl backdrop-blur">
        <h2 className="mb-6 text-center text-2xl font-bold text-indigo-400">Admin Login</h2>

        {error && (
          <div className="mb-4 rounded bg-red-500/20 p-3 text-sm text-red-300">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-300">Username</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full rounded-lg bg-slate-700/50 p-2.5 text-white outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="Enter admin username"
              disabled={loading}
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-slate-300">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-lg bg-slate-700/50 p-2.5 text-white outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="••••••••"
              disabled={loading}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-indigo-600 py-2.5 font-semibold text-white transition-colors hover:bg-indigo-500 active:bg-indigo-700 disabled:opacity-50"
          >
            {loading ? 'Verifying...' : 'Log In'}
          </button>
        </form>
      </div>
    </div>
  );
}