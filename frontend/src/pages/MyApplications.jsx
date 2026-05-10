import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const MyApplications = () => {
  const navigate = useNavigate();
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0, pages: 1 });

  const fetchApplications = async (page = 1) => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(`/api/my-applications?page=${page}&limit=10`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!res.ok) {
        if (res.status === 401) navigate('/login');
        throw new Error('Failed to fetch applications');
      }
      const data = await res.json();
      setApplications(data.applications);
      setPagination(data.pagination);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApplications();
  }, []);

  if (loading) return <div className="p-8 text-center">Loading your applications...</div>;

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">My Applications</h2>
      {error && <div className="text-red-600 mb-4">{error}</div>}
      {applications.length === 0 ? (
        <div className="text-center py-8 text-gray-500 dark:text-gray-400">You haven't applied to any jobs yet.</div>
      ) : (
        <div className="space-y-4">
          {applications.map(app => (
            <div key={app.id} className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white">{app.title}</h3>
              <p className="text-gray-600 dark:text-gray-300">{app.company_name}</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">Status: {app.status}</p>
              <p className="text-xs text-gray-400">Applied on: {new Date(app.applied_at).toLocaleDateString()}</p>
            </div>
          ))}
        </div>
      )}
      {pagination.pages > 1 && (
        <div className="flex justify-center mt-8 space-x-2">
          <button onClick={() => fetchApplications(pagination.page - 1)} disabled={pagination.page === 1}>Previous</button>
          <span>Page {pagination.page} of {pagination.pages}</span>
          <button onClick={() => fetchApplications(pagination.page + 1)} disabled={pagination.page === pagination.pages}>Next</button>
        </div>
      )}
    </div>
  );
};
export default MyApplications;
