import { Link } from "react-router-dom";
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const Jobs = () => {
  const navigate = useNavigate();
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [applying, setApplying] = useState({});
  const [applyMessage, setApplyMessage] = useState('');
  const [filters, setFilters] = useState({
    search: '',
    job_type: '',
    location_city: ''
  });
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    pages: 1
  });

  const fetchJobs = async (page = 1) => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page,
        limit: pagination.limit,
        ...(filters.search && { search: filters.search }),
        ...(filters.job_type && { job_type: filters.job_type }),
        ...(filters.location_city && { location_city: filters.location_city })
      });
      const res = await fetch(`/api/jobs?${params}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!res.ok) {
        if (res.status === 401) navigate('/login');
        throw new Error('Failed to fetch jobs');
      }
      const data = await res.json();
      setJobs(data.jobs);
      setPagination(data.pagination);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJobs(1);
  }, [filters]);

  const handleFilterChange = (e) => {
    setFilters({ ...filters, [e.target.name]: e.target.value });
    setPagination({ ...pagination, page: 1 });
  };

  const handleApply = async (jobId) => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    if (user.role !== 'student') {
      setApplyMessage('Only students can apply to jobs.');
      setTimeout(() => setApplyMessage(''), 3000);
      return;
    }
    setApplying({ ...applying, [jobId]: true });
    try {
      const res = await fetch(`/api/apply/${jobId}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Application failed');
      }
      setApplyMessage('Application submitted!');
      setTimeout(() => setApplyMessage(''), 3000);
    } catch (err) {
      setApplyMessage(err.message);
      setTimeout(() => setApplyMessage(''), 3000);
    } finally {
      setApplying({ ...applying, [jobId]: false });
    }
  };

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= pagination.pages) {
      fetchJobs(newPage);
      setPagination({ ...pagination, page: newPage });
    }
  };

  if (loading && jobs.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="text-center">Loading jobs...</div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">Available Jobs</h2>
      
      {applyMessage && (
        <div className="mb-4 p-2 rounded bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200">
          {applyMessage}
        </div>
      )}

      {/* Filters */}
      <div className="mb-6 grid grid-cols-1 sm:grid-cols-3 gap-4">
        <input
          type="text"
          name="search"
          placeholder="Search by title..."
          value={filters.search}
          onChange={handleFilterChange}
          className="px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
        />
        <select
          name="job_type"
          value={filters.job_type}
          onChange={handleFilterChange}
          className="px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
        >
          <option value="">All types</option>
          <option value="part_time">Part-time</option>
          <option value="summer">Summer job</option>
          <option value="internship">Internship</option>
          <option value="training">Training</option>
        </select>
        <input
          type="text"
          name="location_city"
          placeholder="City (e.g., Cairo)"
          value={filters.location_city}
          onChange={handleFilterChange}
          className="px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
        />
      </div>

      {error && (
        <div className="bg-red-50 dark:bg-red-900/50 p-4 rounded-md mb-4">
          <p className="text-red-800 dark:text-red-200">{error}</p>
        </div>
      )}

      {jobs.length === 0 && !loading ? (
        <div className="text-center py-8 text-gray-500 dark:text-gray-400">No jobs found.</div>
      ) : (
        <div className="space-y-4">
          {jobs.map(job => (
            <div key={job.id} className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
              <Link to={`/job/${job.id}`} className="text-xl font-semibold text-blue-600 dark:text-blue-400 hover:underline">{job.title}</Link>
              <p className="text-gray-600 dark:text-gray-300 mt-1">{job.company_name}</p>
              <p className="text-gray-500 dark:text-gray-400 text-sm mt-2">
                {job.location_city || 'Remote'} • {job.job_type?.replace('_', ' ') || 'Not specified'}
              </p>
              {job.salary_range && (
                <p className="text-sm text-green-600 dark:text-green-400 mt-1">💰 {job.salary_range}</p>
              )}
              <p className="text-gray-700 dark:text-gray-300 mt-3 line-clamp-2">{job.description}</p>
              <button
                onClick={() => handleApply(job.id)}
                disabled={applying[job.id]}
                className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition text-sm disabled:opacity-50"
              >
                {applying[job.id] ? 'Applying...' : 'Apply Now'}
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Pagination */}
      {pagination.pages > 1 && (
        <div className="flex justify-center mt-8 space-x-2">
          <button
            onClick={() => handlePageChange(pagination.page - 1)}
            disabled={pagination.page === 1}
            className="px-3 py-1 border rounded disabled:opacity-50"
          >
            Previous
          </button>
          <span className="px-3 py-1">
            Page {pagination.page} of {pagination.pages}
          </span>
          <button
            onClick={() => handlePageChange(pagination.page + 1)}
            disabled={pagination.page === pagination.pages}
            className="px-3 py-1 border rounded disabled:opacity-50"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
};

export default Jobs;
