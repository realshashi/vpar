import React, { useState } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { Shield, PlusCircle } from 'lucide-react';

const AdminPanel = () => {
  const { publicKey } = useWallet();
  const [formData, setFormData] = useState({
    teamA: '',
    teamB: '',
    startTime: '',
    oddsA: '',
    oddsB: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!publicKey) return;

    try {
      // TODO: Implement contract interaction
      console.log('Creating event:', formData);
      
      // Reset form
      setFormData({
        teamA: '',
        teamB: '',
        startTime: '',
        oddsA: '',
        oddsB: '',
      });
    } catch (error) {
      console.error('Error creating event:', error);
    }
  };

  if (!publicKey) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <div className="text-center">
          <Shield className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-700">Admin Access Required</h2>
          <p className="text-gray-500 mt-2">Please connect your admin wallet to access this panel</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Admin Panel</h1>
        <div className="flex items-center space-x-2 text-sm text-gray-500">
          <Shield className="w-4 h-4" />
          <span>Admin: {publicKey.toString().slice(0, 4)}...{publicKey.toString().slice(-4)}</span>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-md p-8">
        <div className="flex items-center space-x-3 mb-6">
          <PlusCircle className="w-6 h-6 text-indigo-600" />
          <h2 className="text-xl font-semibold">Create New Event</h2>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="teamA" className="block text-sm font-medium text-gray-700 mb-1">
                Team A
              </label>
              <input
                type="text"
                id="teamA"
                value={formData.teamA}
                onChange={(e) => setFormData({ ...formData, teamA: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                required
              />
            </div>

            <div>
              <label htmlFor="teamB" className="block text-sm font-medium text-gray-700 mb-1">
                Team B
              </label>
              <input
                type="text"
                id="teamB"
                value={formData.teamB}
                onChange={(e) => setFormData({ ...formData, teamB: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                required
              />
            </div>

            <div>
              <label htmlFor="startTime" className="block text-sm font-medium text-gray-700 mb-1">
                Start Time
              </label>
              <input
                type="datetime-local"
                id="startTime"
                value={formData.startTime}
                onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="oddsA" className="block text-sm font-medium text-gray-700 mb-1">
                  Odds Team A
                </label>
                <input
                  type="number"
                  id="oddsA"
                  value={formData.oddsA}
                  onChange={(e) => setFormData({ ...formData, oddsA: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                  step="0.01"
                  min="1"
                  required
                />
              </div>

              <div>
                <label htmlFor="oddsB" className="block text-sm font-medium text-gray-700 mb-1">
                  Odds Team B
                </label>
                <input
                  type="number"
                  id="oddsB"
                  value={formData.oddsB}
                  onChange={(e) => setFormData({ ...formData, oddsB: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                  step="0.01"
                  min="1"
                  required
                />
              </div>
            </div>
          </div>

          <button
            type="submit"
            className="w-full bg-indigo-600 text-white py-3 px-6 rounded-md font-semibold
              hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2
              transition-colors"
          >
            Create Event
          </button>
        </form>
      </div>
    </div>
  );
};

export default AdminPanel;