import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

const JobDetail = () => {
  const { jobId } = useParams();
  const navigate = useNavigate();
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [applying, setApplying] = useState(false);
  const [applied, setApplied] = useState(false);

  useEffect(() => {
    const fetchJob = async () => {
      const token = localStorage.getItem('token');
      if (!token) return navigate('/login');
      try {
        const res = await fetch(`/api/jobs/${jobId}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (!res.ok) throw new Error('Job not found');
        const data = await res.json();
        setJob(data.job);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchJob();
  }, [jobId, navigate]);

  const handleApply = async () => {
    const token = localStorage.getItem('token');
    setApplying(true);
    try {
      const res = await fetch(`/api/apply/${jobId}`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!res.ok) throw new Error('Application failed');
      setApplied(true);
    } catch (err) {
      setError(err.message);
    } finally {
      setApplying(false);
    }
  };

  if (loading) return <div className="p-8 text-center">Loading job details...</div>;
  if (error) return <div className="p-8 text-center text-red-600">{error}</div>;
  if (!job) return <div className="p-8 text-center">Job not found</div>;

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <h1 className="text-3xl font-bold mb-2">{job.title}</h1>
        <p className="text-lg text-gray-600 dark:text-gray-300 mb-4">{job.company_name}</p>
        <div className="flex flex-wrap gap-2 mb-4">
          <span className="px-2 py-1 bg-gray-200 dark:bg-gray-700 rounded text-sm">{job.job_type?.replace('_', ' ')}</span>
          <span className="px-2 py-1 bg-gray-200 dark:bg-gray-700 rounded text-sm">{job.location_city || 'Remote'}</span>
          {job.salary_range && <span className="px-2 py-1 bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 rounded text-sm">{job.salary_range}</span>}
        </div>
        <div className="prose dark:prose-invert max-w-none mb-6">
          <h3 className="text-xl font-semibold mb-2">Description</h3>
          <p className="whitespace-pre-wrap">{job.description}</p>
        </div>
        {applied ? (
          <div className="bg-green-100 dark:bg-green-900 p-4 rounded text-green-800 dark:text-green-200">You have already applied to this job.</div>
        ) : (
          <button
            onClick={handleApply}
            disabled={applying}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
          >
            {applying ? 'Applying...' : 'Apply Now'}
          </button>
        )}
      </div>
    </div>
  );
};

export default JobDetail;
