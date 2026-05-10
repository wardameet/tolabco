import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';

const AdminPanel = () => {
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [verificationQueue, setVerificationQueue] = useState([]);
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('users');

  const fetchData = async () => {
    const token = localStorage.getItem('token');
    if (!token) return navigate('/login');
    try {
      const [usersRes, queueRes, statsRes] = await Promise.all([
        fetch('/api/admin/users', { headers: { 'Authorization': `Bearer ${token}` } }),
        fetch('/api/admin/verification-queue', { headers: { 'Authorization': `Bearer ${token}` } }),
        fetch('/api/admin/stats', { headers: { 'Authorization': `Bearer ${token}` } })
      ]);
      if (!usersRes.ok || !queueRes.ok || !statsRes.ok) {
        if (usersRes.status === 401 || queueRes.status === 401 || statsRes.status === 401) {
          localStorage.removeItem('token');
          navigate('/login');
          return;
        }
        throw new Error('Failed to fetch admin data');
      }
      const usersData = await usersRes.json();
      const queueData = await queueRes.json();
      const statsData = await statsRes.json();
      setUsers(usersData.users);
      setVerificationQueue(queueData.queue);
      setStats(statsData);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleVerify = async (studentId) => {
    const token = localStorage.getItem('token');
    try {
      const res = await fetch(`/api/admin/verify/${studentId}`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!res.ok) throw new Error('Verification failed');
      fetchData();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleReject = async (studentId) => {
    const token = localStorage.getItem('token');
    try {
      const res = await fetch(`/api/admin/reject/${studentId}`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ notes: 'Rejected by admin' })
      });
      if (!res.ok) throw new Error('Rejection failed');
      fetchData();
    } catch (err) {
      setError(err.message);
    }
  };

  if (loading) return <div className="p-8 text-center">Loading admin panel...</div>;

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">Admin Panel</h2>
      {error && <div className="text-red-600 mb-4">{error}</div>}
      <div className="flex space-x-4 border-b mb-4">
        <button onClick={() => setActiveTab('users')} className={`py-2 px-4 ${activeTab === 'users' ? 'border-b-2 border-blue-600 font-semibold' : ''}`}>Users</button>
        <button onClick={() => setActiveTab('verification')} className={`py-2 px-4 ${activeTab === 'verification' ? 'border-b-2 border-blue-600 font-semibold' : ''}`}>Verification Queue</button>
        <button onClick={() => setActiveTab('stats')} className={`py-2 px-4 ${activeTab === 'stats' ? 'border-b-2 border-blue-600 font-semibold' : ''}`}>Stats</button>
      </div>

      {activeTab === 'users' && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Role</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Active</th>
              </tr>
            </thead>
            <tbody>
              {users.map(user => (
                <tr key={user.id} className="border-t">
                  <td className="px-6 py-4">{user.email}</td>
                  <td className="px-6 py-4">{user.role}</td>
                  <td className="px-6 py-4">{user.is_active ? 'Yes' : 'No'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {activeTab === 'verification' && (
        <div className="space-y-4">
          {verificationQueue.length === 0 ? (
            <p>No pending verifications.</p>
          ) : (
            verificationQueue.map(req => (
              <div key={req.id} className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
                <p><strong>{req.full_name}</strong> ({req.email})</p>
                <div className="mt-2 space-x-2">
                  <button onClick={() => handleVerify(req.student_id)} className="px-3 py-1 bg-green-600 text-white rounded">Approve</button>
                  <button onClick={() => handleReject(req.student_id)} className="px-3 py-1 bg-red-600 text-white rounded">Reject</button>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {activeTab === 'stats' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
            <h3 className="text-lg font-semibold">Students</h3>
            <p className="text-3xl">{stats.students || 0}</p>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
            <h3 className="text-lg font-semibold">Employers</h3>
            <p className="text-3xl">{stats.employers || 0}</p>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
            <h3 className="text-lg font-semibold">Jobs</h3>
            <p className="text-3xl">{stats.jobs || 0}</p>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
            <h3 className="text-lg font-semibold">Applications</h3>
            <p className="text-3xl">{stats.applications || 0}</p>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
            <h3 className="text-lg font-semibold">Vouchers</h3>
            <p className="text-3xl">{stats.vouchers || 0}</p>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
            <h3 className="text-lg font-semibold">Verified Students</h3>
            <p className="text-3xl">{stats.verified_students || 0}</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminPanel;
